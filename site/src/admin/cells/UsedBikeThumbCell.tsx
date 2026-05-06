/* Custom admin list cell for UsedBikes — shows the cover photo
 * thumbnail. Pulls from the first item in the `photos` array, which
 * has shape `{ image: Media, caption?: string }`. Returns a neutral
 * placeholder when the bike has no photos uploaded yet (most of the
 * seed bikes are in this state).
 */

type Photo = {
  image?: { url?: string; sizes?: { thumbnail?: { url?: string } } } | string | number | null
}

type CellProps = {
  rowData?: {
    photos?: Photo[]
    displayName?: string
  }
}

export default function UsedBikeThumbCell({ rowData }: CellProps) {
  const first = rowData?.photos?.[0]?.image
  const url =
    typeof first === "object"
      ? first?.sizes?.thumbnail?.url ?? first?.url
      : undefined

  if (!url) {
    return (
      <div
        style={{
          width: 56,
          height: 42,
          background: "var(--theme-elevation-100)",
          borderRadius: 4,
        }}
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={rowData?.displayName ?? ""}
      width={56}
      height={42}
      style={{
        width: 56,
        height: 42,
        objectFit: "cover",
        borderRadius: 4,
        display: "block",
      }}
    />
  )
}
