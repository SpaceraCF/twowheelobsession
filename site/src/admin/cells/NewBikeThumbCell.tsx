/* Custom admin list cell for NewBikes — shows a thumbnail.
 *
 * The Yamaha sync stores image URLs (Yamaha CDN) in
 * `externalImageUrl`, NOT in Payload's Media collection. So the
 * default admin list view has no image column. Adding this cell
 * (mounted on a `ui` field) gives staff a thumbnail per row,
 * falling back to the Media relation if it's been manually set.
 *
 * Payload v3 cells receive `cellData` and `rowData`. We use rowData
 * to read both potential image sources.
 */

type CellProps = {
  rowData?: {
    externalImageUrl?: string
    primaryImage?: { url?: string } | string | number | null
    displayName?: string
  }
}

export default function NewBikeThumbCell({ rowData }: CellProps) {
  const fromMedia =
    typeof rowData?.primaryImage === "object" ? rowData.primaryImage?.url : undefined
  const url = fromMedia || rowData?.externalImageUrl

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
