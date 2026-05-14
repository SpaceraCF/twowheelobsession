import { logoutCustomer } from "@/lib/auth/actions"

// Server-action-only logout — submits a tiny form that calls
// `logoutCustomer`, which deletes the auth cookie and redirects
// home. No client JS needed.

export function LogoutButton() {
  return (
    <form action={logoutCustomer}>
      <button
        type="submit"
        className="block w-full text-left px-3 py-2 rounded text-zinc-600 hover:bg-zinc-100 hover:text-red-600 text-sm font-semibold"
      >
        Sign out
      </button>
    </form>
  )
}
