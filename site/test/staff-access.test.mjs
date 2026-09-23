import assert from "node:assert/strict"
import { test } from "node:test"
import { fileURLToPath } from "node:url"
import { createLoader } from "./helpers/load-ts.mjs"

const root = fileURLToPath(new URL("..", import.meta.url))
const load = createLoader(root)
const staff = { id: 7, collection: "users", role: "staff" }
const admin = { ...staff, role: "admin" }
const customer = { id: 7, collection: "customers" }
const outsiders = [null, undefined, customer, { ...customer, role: "admin" }, { id: 7, role: "admin" }, { ...staff, role: "unknown" }]
const check = (fn, user) => fn({ req: { user } })
const json = (value) => JSON.parse(JSON.stringify(value))

test("staff/admin helpers require both auth collection and an allowed role", () => {
  const { isStaffUser, isAdminUser } = load("src/lib/auth/staff.ts")
  for (const user of outsiders) {
    assert.equal(isStaffUser(user), false)
    assert.equal(isAdminUser(user), false)
  }
  assert.equal(isStaffUser(staff), true)
  assert.equal(isStaffUser(admin), true)
  assert.equal(isAdminUser(staff), false)
  assert.equal(isAdminUser(admin), true)
})

for (const collection of ["Orders", "Conversations", "Messages", "Brands", "BikeCategories", "NewBikes", "UsedBikes", "Pages", "Enquiries", "ServiceRequests", "HeroSlides", "Media", "Posts"]) {
  test(`${collection} denies customer/anonymous operational access and admits staff`, () => {
    const { access } = load(`src/collections/${collection}.ts`)[collection]
    for (const operation of ["create", "read", "update", "delete"]) {
      if (operation === "create" && ["Enquiries", "ServiceRequests"].includes(collection)) continue
      if (operation === "read" && ["HeroSlides", "Media", "Posts"].includes(collection)) continue
      for (const user of outsiders) assert.equal(check(access[operation], user), false, operation)
      assert.equal(check(access[operation], admin), true)
      const adminOnly = (collection === "Conversations" && operation === "delete") ||
        (collection === "Messages" && ["update", "delete"].includes(operation))
      assert.equal(check(access[operation], staff), !adminOnly)
    }
  })
}

test("public registration, enquiries, media and published news remain accessible", () => {
  for (const collection of ["Customers", "Enquiries", "ServiceRequests"]) {
    assert.equal(check(load(`src/collections/${collection}.ts`)[collection].access.create, null), true)
  }
  for (const collection of ["HeroSlides", "Media"]) {
    assert.equal(check(load(`src/collections/${collection}.ts`)[collection].access.read, null), true)
  }
  const posts = load("src/collections/Posts.ts").Posts
  for (const user of [null, customer]) assert.deepEqual(json(check(posts.access.read, user)), { _status: { equals: "published" } })
  assert.equal(check(posts.access.read, staff), true)
})

test("same numeric customer ID cannot access a staff account or elevate its role", () => {
  const users = load("src/collections/Users.ts").Users
  for (const operation of ["create", "read", "update", "delete"]) assert.equal(check(users.access[operation], customer), false)
  assert.deepEqual(json(check(users.access.read, staff)), { id: { equals: 7 } })
  assert.deepEqual(json(check(users.access.update, staff)), { id: { equals: 7 } })
  const role = users.fields.find((field) => field.name === "role")
  assert.equal(check(role.access.update, staff), false)
  assert.equal(check(role.access.update, admin), true)
})

test("customer self access stays scoped to its row; ordinary staff cannot read customers", () => {
  const { access } = load("src/collections/Customers.ts").Customers
  for (const operation of ["read", "update"]) {
    assert.deepEqual(json(check(access[operation], customer)), { id: { equals: 7 } })
    assert.equal(check(access[operation], staff), false)
    assert.equal(check(access[operation], admin), true)
    assert.equal(check(access[operation], { id: 7, collection: "unknown" }), false)
  }
})

for (const route of ["twilio/send-sms", "twilio/mark-read", "push/subscribe"]) {
  test(`${route} rejects customer identities before reading body or performing effects`, async () => {
    for (const user of outsiders) {
      let bodyReads = 0
      const routeLoad = createLoader(root, {
        "next/server": { NextResponse: Response }, "next/headers": { headers: async () => new Headers() },
        "@payload-config": { default: {} },
        payload: { getPayload: async () => ({ auth: async () => ({ user }) }) },
        "@/lib/twilio/client": { sendSms: () => { throw new Error("SMS must not be sent") } },
      })
      const response = await routeLoad(`src/app/api/${route}/route.ts`).POST({ json: () => { bodyReads++; throw new Error("Unexpected body read") } })
      assert.equal(response.status, 401)
      assert.equal(bodyReads, 0)
    }
  })
  test(`${route} permits authenticated staff to reach request validation`, async () => {
    const routeLoad = createLoader(root, {
      "next/server": { NextResponse: Response }, "next/headers": { headers: async () => new Headers() },
      "@payload-config": { default: {} },
      payload: { getPayload: async () => ({ auth: async () => ({ user: staff }) }) },
      "@/lib/twilio/client": { sendSms: () => { throw new Error("SMS must not be sent") } },
    })
    const response = await routeLoad(`src/app/api/${route}/route.ts`).POST({ json: async () => ({}) })
    assert.equal(response.status, 400)
  })
}
