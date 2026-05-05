// Inline a JSON-LD structured-data block. Server component (no "use
// client") so the script tag is in the SSR output where crawlers find
// it without executing JS.
//
// Use one of the helpers from `lib/seo/jsonld.ts` to build the data.
export function JsonLd({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  )
}
