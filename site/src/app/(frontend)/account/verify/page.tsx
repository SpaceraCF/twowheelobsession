import Link from "next/link"
import { getPayload } from "payload"
import config from "@payload-config"

export const metadata = { title: "Verify email" }

type Params = Promise<{ token?: string }>

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Params
}) {
  const sp = await searchParams
  const token = sp.token?.trim()

  if (!token) {
    return (
      <Box kind="warn">
        <h2 className="text-xl font-bold">Missing verification token</h2>
        <p className="mt-2 text-sm">
          Use the link from the email we sent — if you copy-pasted, make sure
          the entire URL came through.
        </p>
      </Box>
    )
  }

  const payload = await getPayload({ config })
  let ok = false
  let errorMsg: string | null = null
  try {
    await payload.verifyEmail({ collection: "customers", token })
    ok = true
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : "Verification failed."
  }

  if (!ok) {
    return (
      <Box kind="warn">
        <h2 className="text-xl font-bold">Couldn't verify your email</h2>
        <p className="mt-2 text-sm">{errorMsg}</p>
        <p className="mt-3 text-sm">
          The link might have already been used, or it's expired. Try{" "}
          <Link href="/account/login" className="underline">
            signing in
          </Link>{" "}
          — if that fails, register again or call us.
        </p>
      </Box>
    )
  }

  return (
    <Box kind="ok">
      <h2 className="text-xl font-bold">Email verified ✓</h2>
      <p className="mt-2 text-sm">
        You're good to go. Sign in to get started.
      </p>
      <Link
        href="/account/login"
        className="mt-4 inline-flex h-11 items-center px-5 bg-red-600 text-white font-semibold uppercase text-sm tracking-wider hover:bg-red-700"
      >
        Sign in
      </Link>
    </Box>
  )
}

function Box({
  children,
  kind,
}: {
  children: React.ReactNode
  kind: "ok" | "warn"
}) {
  const bg =
    kind === "ok"
      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
      : "bg-amber-50 border-amber-200 text-amber-900"
  return (
    <div className={`max-w-md border p-6 rounded ${bg}`}>{children}</div>
  )
}
