// Standalone HTML page that hosts the Yamaha OEM Parts widget.
// Designed to be iframed from /oem-parts-finder. Lives at /oem-widget.
//
// We have to inject the access key + bootstrap globals server-side because
// the widget's JS expects a `ypicAjax` global to exist before it inits.
// Rendering a full HTML response from a Next.js route handler is the
// simplest way to do this without fighting React's hydration.

import { getYamahaAccessKey } from "@/lib/epc/access-key"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  const result = await getYamahaAccessKey()

  if (!result.ok) {
    return new Response(buildErrorHtml(result.error), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    })
  }

  const html = buildWidgetHtml(result.key)
  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      // Cache for 5 minutes — the access key is good for ~30 min and we don't
      // want every iframe load to hit our cache helper.
      "cache-control": "public, max-age=300",
    },
  })
}

function buildErrorHtml(error: string) {
  return `<!doctype html>
<html><head><meta charset="utf-8"/><title>Parts finder — error</title>
<style>body{font-family:system-ui,sans-serif;padding:40px;color:#1a1a1a}
a{color:#d72631}</style></head>
<body>
<h1>Parts finder isn't available right now</h1>
<p>${escapeHtml(error)}</p>
<p>Please <a href="/contact-us?type=parts">send us a parts enquiry</a> or call
<a href="tel:+61243319007">(02) 4331 9007</a> and we'll sort you out.</p>
</body></html>`
}

function buildWidgetHtml(accessKey: string) {
  // ypicAjax mirrors the localized variables the WP plugin used to inject.
  // 'MB' is "Motor Bikes" — the only Yamaha product type Two Wheel Obsession
  // sells through this catalog. Other settings use sensible defaults.
  const ypicAjax = {
    ajaxurl: "",
    homeurl: "",
    accesskey: accessKey,
    ypicproducttypes: "MB",
    ypicsetting_ma: "",
    ypicsetting_mb: "",
    ypicsetting_gst: "",
    customcontactlink: "",
    customcontactnewpage: "1",
    text_color: "#121212",
    text_color_highlight: "#dadada",
    background_color: "#d2160c",
    background_color_highlight: "D28474",
    initial_scale_factor: "100%",
  }

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Yamaha OEM Parts Finder</title>
<link rel="stylesheet" href="/oem/styles/libs/leaflet.css"/>
<link rel="stylesheet" href="/oem/styles/libs/basictable.min.css"/>
<link rel="stylesheet" href="/oem/styles/libs/imgViewer2.min.css"/>
<link rel="stylesheet" href="/oem/styles/yamaha.css"/>
<style>
  body { margin: 0; padding: 16px; font-family: system-ui, sans-serif; background: #fff; color: #1a1a1a; }
  #yamaha-oem-parts-lookup { max-width: 1280px; margin: 0 auto; }
  #yamaha-oem-filterpanel select { padding: 8px 10px; margin: 0 8px 12px 0; min-width: 200px; }
  #PartsList { width: 100%; border-collapse: collapse; }
  #PartsList th, #PartsList td { padding: 8px; border-bottom: 1px solid #eee; text-align: left; }
  #loading-image_ajax { display:none; position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); }
</style>
</head>
<body>
<div id="yamaha-oem-parts-lookup">
  <div id="yamaha-oem-filterpanel">
    <div id="TypeSelection"><select id="TypeSelect" name="TypeSelect"></select></div>
    <div id="YearSelection"><select id="YearSelect" name="YearSelect"></select></div>
    <div id="ModelSelection"><select id="ModelSelect" name="ModelSelect"></select></div>
    <div id="ContentSelection"><select id="ContentSelect" name="ContentSelect"></select></div>
    <div id="AssemblySelection"><select id="AssemblySelect" name="AssemblySelect"></select></div>
  </div>
  <div id="yamaha-oem-AssemblyContainer">
    <div id="Diagram"><div id="newCanvas"></div></div>
    <div id="PartsListContainer">
      <table id="PartsList">
        <thead>
          <tr>
            <th class="refno">Ref No.</th>
            <th>Desc</th>
            <th>Number</th>
            <th>Qty per Assembly</th>
            <th>Qty to Order</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  </div>
  <div id="yamaha-oem-imageWrap"></div>
  <img id="loading-image_ajax" src="/oem/styles/img/loading.gif" alt=""/>
</div>

<script>window.ypicAjax = ${JSON.stringify(ypicAjax)};</script>
<script src="https://code.jquery.com/jquery-1.12.4.min.js"></script>
<script src="https://code.jquery.com/ui/1.11.4/jquery-ui.min.js"></script>
<script src="/oem/js/libs/leaflet.js"></script>
<script src="/oem/js/libs/basictable.min.js"></script>
<script src="/oem/js/libs/imgViewer2.min.js"></script>
<script src="/oem/js/libs/jquery.cookies.2.2.0.min.js"></script>
<script src="/oem/js/yamaha-oem-parts-lookup.js"></script>
</body>
</html>`
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string),
  )
}
