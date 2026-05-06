/* Custom Payload admin LOGIN logo. Replaces the stock Payload
   wordmark on /admin/login. Uses the cursive Two Wheel Obsession
   wordmark already shipped at /public. Stays a server component —
   Payload renders it server-side and hydrates if needed. */

import Image from "next/image"

export default function Logo() {
  return (
    <Image
      src="/two-wheel-obsession-logo.jpg"
      alt="Two Wheel Obsession"
      width={768}
      height={166}
      priority
      style={{
        height: "auto",
        width: "min(420px, 80vw)",
        display: "block",
      }}
    />
  )
}
