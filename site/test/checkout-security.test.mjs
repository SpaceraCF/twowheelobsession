import assert from "node:assert/strict"
import { test } from "node:test"
import { fileURLToPath } from "node:url"
import { createLoader } from "./helpers/load-ts.mjs"

const root = fileURLToPath(new URL("..", import.meta.url))
const secret = "offline-test-secret-never-a-real-credential"
const orderId = "TESTORDER123456789"
const body = () => ({
  customer: { name: "Alice Rider", email: "alice@example.test", phone: "0400000000" },
  shippingMethod: "au-flat",
  shippingAddress: { addressLine1: "1 Test Street", suburb: "Gosford", state: "NSW", postcode: "2250" },
  lineItems: [{ sku: "ABC-123", name: "Untrusted label", qty: 2, unitPrice: 0.01 }],
})
const request = (data) => new Request("https://example.test/api/checkout", {
  method: "POST", body: JSON.stringify(data), headers: { "content-type": "application/json" },
})

function fixture() {
  const calls = { captures: 0, writes: [], created: null, orderOverride: {}, captureOverride: {}, quoteUnavailable: false }
  const load = createLoader(root, {
    "next/server": { NextResponse: Response },
    "@payload-config": { default: {} },
    payload: { getPayload: async () => ({ create: async (data) => {
      calls.writes.push(data)
      return { id: 1, orderNumber: data.data.orderNumber }
    } }) },
    "@/lib/epc/quote": { quoteYamahaPart: async (sku) => calls.quoteUnavailable
      ? { ok: false, reason: "unavailable" }
      : { ok: true, quote: { sku, name: "Trusted part", unitPrice: 22 } } },
    "@/lib/paypal/client": {
      getPayPalConfig: () => ({ ok: true, clientSecret: secret }),
      createPayPalOrder: async (input) => {
        calls.created = input
        return { ok: true, orderId }
      },
      getPayPalOrder: async () => ({
        ok: true, orderId, status: "APPROVED", purchaseUnitCount: 1,
        internalReference: calls.created.internalReference, currency: "AUD", amount: "56.00",
        items: [{ sku: "ABC-123", name: "Trusted part", quantity: "2", unit_amount: { value: "22.00", currency_code: "AUD" } }],
        ...calls.orderOverride,
      }),
      capturePayPalOrder: async () => {
        calls.captures++
        return { ok: true, orderId, status: "COMPLETED", captureId: "CAPTURE123", captureStatus: "COMPLETED",
          capturedAmount: "56.00", capturedCurrency: "AUD", raw: {}, ...calls.captureOverride }
      },
    },
  })
  return {
    calls, load,
    create: load("src/app/api/checkout/create-order/route.ts").POST,
    capture: load("src/app/api/checkout/capture/route.ts").POST,
    async start(input = body()) {
      const response = await this.create(request(input))
      assert.equal(response.status, 200)
      return { ...input, ...await response.json() }
    },
  }
}

test("create and capture use trusted prices and preserve the intended customer/address", async () => {
  const f = fixture()
  const response = await f.capture(request(await f.start()))
  assert.equal(response.status, 200)
  assert.equal(f.calls.created.total, 56)
  assert.equal(f.calls.writes[0].data.total, 56)
  assert.equal(f.calls.writes[0].data.lineItems[0].unitPrice, 22)
  assert.equal(f.calls.writes[0].data.customerEmail, "alice@example.test")
  assert.equal(f.calls.writes[0].data.addressLine1, "1 Test Street")
})

for (const [name, mutate] of [
  ["same cart with a different customer", (input) => { input.customer.email = "attacker@example.test" }],
  ["same cart with a different delivery address", (input) => { input.shippingAddress.addressLine1 = "9 Attacker Street" }],
  ["a swapped PayPal order ID", (input) => { input.paypalOrderId = "SWAPPED123456789" }],
  ["a missing checkout token", (input) => { delete input.checkoutToken }],
  ["a forged checkout token", (input) => { input.checkoutToken += "x" }],
  ["a changed quantity", (input) => { input.lineItems[0].qty = 1 }],
  ["a changed fulfilment method", (input) => { input.shippingMethod = "pickup" }],
]) {
  test(`rejects ${name} before charging or persisting`, async () => {
    const f = fixture()
    const input = await f.start()
    mutate(input)
    assert.equal((await f.capture(request(input))).status, 409)
    assert.equal(f.calls.captures, 0)
    assert.equal(f.calls.writes.length, 0)
  })
}

for (const override of [
  { internalReference: "another-checkout" }, { status: "COMPLETED" },
  { purchaseUnitCount: 2 }, { orderId: "DIFFERENT123456789" },
  { currency: "USD" }, { amount: "55.99" },
  { items: [{ sku: "ABC-123", name: "Trusted part", quantity: "2", unit_amount: { value: "22.00", currency_code: "USD" } }] },
]) {
  test(`rejects mismatched PayPal details ${JSON.stringify(override)} before capture`, async () => {
    const f = fixture()
    const input = await f.start()
    f.calls.orderOverride = override
    assert.equal((await f.capture(request(input))).status, 409)
    assert.equal(f.calls.captures, 0)
  })
}

for (const override of [{ captureStatus: "PENDING" }, { capturedCurrency: "USD" }, { capturedAmount: "55.99" }, { status: "APPROVED" }]) {
  test(`does not mark an unconfirmed payment as paid ${JSON.stringify(override)}`, async () => {
    const f = fixture()
    const input = await f.start()
    f.calls.captureOverride = override
    assert.equal((await f.capture(request(input))).status, 409)
    assert.equal(f.calls.writes.length, 0)
  })
}

test("EPC unavailable fails closed without creating or capturing payment", async () => {
  const f = fixture()
  f.calls.quoteUnavailable = true
  assert.equal((await f.create(request(body()))).status, 502)
  assert.equal(f.calls.created, null)
  assert.equal(f.calls.captures, 0)
})

test("checkout tokens expire and reject a different signing secret", async () => {
  const f = fixture()
  const checkout = await f.load("src/lib/cart/server.ts").priceCheckoutInput(
    f.load("src/lib/cart/server.ts").validateCheckoutInput(body()),
  )
  const { createCheckoutToken, verifyCheckoutToken } = f.load("src/lib/cart/checkout-token.ts")
  const token = createCheckoutToken(checkout, orderId, "reference", secret, 1000)
  assert.equal(verifyCheckoutToken(token, checkout, orderId, secret, 1000), "reference")
  assert.equal(verifyCheckoutToken(token, checkout, orderId, secret, 1801000), null)
  assert.equal(verifyCheckoutToken(token, checkout, orderId, "wrong-secret", 1000), null)
})

test("PayPal adapter exposes the exact order/custom_id and capture currency from provider responses", async () => {
  const calls = []
  const load = createLoader(root, {}, {
    process: { env: { PAYPAL_CLIENT_ID: "test-client", PAYPAL_CLIENT_SECRET: secret } },
    fetch: async (url, options) => {
      calls.push(url)
      if (url.endsWith("/v1/oauth2/token")) return Response.json({ access_token: "fake-token", expires_in: 600 })
      if (url.endsWith("/capture")) {
        assert.equal(options.headers.Prefer, "return=representation")
        return Response.json({
        id: orderId, status: "COMPLETED", purchase_units: [{ payments: { captures: [{
          id: "CAPTURE123", status: "COMPLETED", amount: { value: "56.00", currency_code: "AUD" },
        }] } }],
        })
      }
      return Response.json({ id: orderId, status: "APPROVED", purchase_units: [{
        custom_id: "bound-reference", amount: { value: "56.00", currency_code: "AUD" }, items: [],
      }] })
    },
  })
  const client = load("src/lib/paypal/client.ts")
  const order = await client.getPayPalOrder(orderId)
  assert.equal(order.orderId, orderId)
  assert.equal(order.status, "APPROVED")
  assert.equal(order.internalReference, "bound-reference")
  assert.equal(order.purchaseUnitCount, 1)
  const capture = await client.capturePayPalOrder(orderId)
  assert.equal(capture.captureStatus, "COMPLETED")
  assert.equal(capture.capturedCurrency, "AUD")
  assert.equal(calls.length, 3)
})

test("EPC quote resolves GST-inclusive canonical pricing and rejects unverified prices", async () => {
  let responseBody = [{ PartNo: "ABC-123", Description: "Trusted part", Price: 20 }]
  const load = createLoader(root, {
    "./access-key": { getYamahaAccessKey: async () => ({ ok: true, key: "fake-access-key" }) },
  }, { fetch: async () => new Response(`quote(${JSON.stringify(responseBody)});`) })
  const { quoteYamahaPart } = load("src/lib/epc/quote.ts")
  const quote = await quoteYamahaPart("abc-123")
  assert.equal(quote.ok, true)
  assert.equal(quote.quote.unitPrice, 22)
  assert.equal(quote.quote.sku, "ABC-123")
  for (const part of [
    { PartNo: "ABC-123", Description: "Trusted part", Price: 0 },
    { PartNo: "ABC-123", Description: "Trusted part", Price: 20, Discontinued: true },
    { PartNo: "OTHER-PART", Description: "Trusted part", Price: 20 },
  ]) {
    responseBody = [part]
    assert.equal((await quoteYamahaPart("ABC-123")).ok, false)
  }
})
