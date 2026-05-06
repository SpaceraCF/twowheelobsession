/* Custom Payload admin ICON. Shows in the admin nav top-left, on
   the loading screen, etc. Uses the small "TWO" mark — square-ish
   and reads at 32-40px. Replaces the stock Payload hex. */

import Image from "next/image"

export default function Icon() {
  return (
    <Image
      src="/two-logo-full.png"
      alt="Two Wheel Obsession"
      width={600}
      height={600}
      style={{
        height: "32px",
        width: "32px",
        objectFit: "contain",
        display: "block",
      }}
    />
  )
}
