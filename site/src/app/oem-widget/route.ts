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
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"/>
<link rel="stylesheet" href="/oem/styles/libs/leaflet.css"/>
<link rel="stylesheet" href="/oem/styles/libs/basictable.min.css"/>
<link rel="stylesheet" href="/oem/styles/libs/imgViewer2.min.css"/>
<link rel="stylesheet" href="/oem/styles/yamaha.css"/>
<style>
  /* ===== Modern overrides for the EPC widget. Loaded AFTER yamaha.css so
     these win in cascade. !important is used where the plugin's CSS uses
     specific IDs we can't outweigh otherwise. ===== */
  :root {
    --ink: #18181b;
    --ink-muted: #52525b;
    --ink-soft: #71717a;
    --line: #e4e4e7;
    --line-soft: #f4f4f5;
    --bg: #ffffff;
    --bg-alt: #fafafa;
    --accent: #d72631;
    --accent-dark: #b01e26;
    --shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04);
  }

  * { box-sizing: border-box; }

  html, body {
    margin: 0;
    background: var(--bg-alt);
    color: var(--ink);
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 15px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  #yamaha-oem-parts-lookup {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px 24px 48px;
  }

  /* ---------- Step / filter panel ---------- */
  #yamaha-oem-filterpanel {
    background: var(--bg) !important;
    border: 1px solid var(--line) !important;
    border-radius: 12px !important;
    padding: 16px 20px !important;
    margin: 0 auto 24px !important;
    height: auto !important;
    width: 100% !important;
    box-shadow: var(--shadow);
    display: flex !important;
    flex-wrap: wrap;
    align-items: stretch;
    gap: 14px 18px;
  }

  /* Title block — sits left of "1. Year" */
  #yamaha-oem-filtertitle {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    padding-right: 18px;
    border-right: 1px solid var(--line);
    flex: 0 0 auto;
  }
  #yamaha-oem-filtertitle .eyebrow {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
  }
  #yamaha-oem-filtertitle .title {
    font-size: 17px;
    font-weight: 700;
    color: var(--ink);
    line-height: 1.2;
    white-space: nowrap;
  }

  /* Dropdown cells flex to fill remaining space */
  #yamaha-oem-filterpanel > div:not(#yamaha-oem-filtertitle) {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1 1 165px;
    min-width: 150px;
  }

  /* Auto-labels for each step using ::before */
  #YearSelection::before    { content: '1. Year'; }
  #ModelSelection::before   { content: '2. Model'; }
  #ContentSelection::before { content: '3. Section'; }
  #AssemblySelection::before { content: '4. Assembly'; }
  /* We always run single-type (MB / Motorcycles), so hide the type slot. */
  #TypeSelection { display: none !important; }
  #yamaha-oem-filterpanel > div:not(#yamaha-oem-filtertitle)::before {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--ink-soft);
  }

  @media (max-width: 720px) {
    #yamaha-oem-filtertitle {
      flex: 1 1 100%;
      padding-right: 0;
      padding-bottom: 12px;
      border-right: 0;
      border-bottom: 1px solid var(--line);
    }
    #yamaha-oem-filtertitle .title { white-space: normal; }
  }

  #yamaha-oem-filterpanel select {
    appearance: none !important;
    -webkit-appearance: none !important;
    float: none !important;
    margin: 0 !important;
    width: 100% !important;
    padding: 11px 38px 11px 14px !important;
    background: var(--bg) !important;
    border: 1px solid var(--line) !important;
    border-radius: 8px !important;
    color: var(--ink) !important;
    font: inherit !important;
    text-transform: none !important;
    cursor: pointer;
    transition: border-color 120ms ease, box-shadow 120ms ease;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M1 1.5l5 5 5-5'/%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
    background-position: right 14px center !important;
    background-size: 12px 8px !important;
  }
  #yamaha-oem-filterpanel select:hover { border-color: var(--ink-muted) !important; }
  #yamaha-oem-filterpanel select:focus {
    outline: none !important;
    border-color: var(--accent) !important;
    box-shadow: 0 0 0 3px rgba(215, 38, 49, 0.15) !important;
  }

  /* ---------- Diagram + parts area ---------- */
  #yamaha-oem-AssemblyContainer {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    margin: 0 !important;
  }

  @media (min-width: 1024px) {
    #yamaha-oem-AssemblyContainer {
      grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
      grid-template-areas: "parts diagram";
      align-items: start;
    }
    #PartsListContainer { grid-area: parts; }
    #Diagram { grid-area: diagram; }
  }

  #Diagram {
    background: var(--bg) !important;
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 12px;
    box-shadow: var(--shadow);
    margin: 0 !important;
    min-height: 320px;
    overflow: hidden;
    position: relative;
    min-width: 0;
  }
  #newCanvas {
    width: 100% !important;
    max-width: 100%;
    overflow: hidden;
    border-radius: 8px;
    position: relative; /* containing block for the leaflet viewport so overflow clips it */
  }
  /* The base yamaha.css sets #imgScaler { width:auto; max-height:1200px }
     at viewport >= 1400px, which renders the image wider than the column
     and overlaps the parts table. Force fit-to-container — imgViewer2
     reads the image's CSS size at load and pan/zoom still works. */
  #newCanvas #imgScaler {
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    max-height: none !important;
    display: block;
  }
  #newCanvas .viewport,
  #newCanvas .leaflet-container {
    max-width: 100% !important;
  }

  #PartsListContainer {
    background: var(--bg);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 0 !important;
    overflow: hidden;
    box-shadow: var(--shadow);
    margin: 0 !important;
  }

  /* ---------- Parts table ---------- */
  #yamaha-oem-AssemblyContainer #PartsList,
  #yamaha-oem-filterpanel #SearchPartsList {
    width: 100% !important;
    border-collapse: collapse;
    font-size: 14px !important;
    color: var(--ink) !important;
    background: var(--bg);
  }
  #yamaha-oem-filterpanel #PartsList th,
  #yamaha-oem-AssemblyContainer #PartsList thead th {
    background: var(--bg-alt) !important;
    color: var(--ink-soft) !important;
    text-transform: uppercase !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    letter-spacing: 0.06em;
    text-align: left;
    padding: 12px 14px !important;
    border-bottom: 1px solid var(--line);
    white-space: nowrap;
  }
  #yamaha-oem-AssemblyContainer #PartsList tbody > tr > td {
    background: var(--bg) !important;
    color: var(--ink) !important;
    padding: 12px 14px !important;
    border-bottom: 1px solid var(--line-soft);
    vertical-align: middle;
  }
  #yamaha-oem-AssemblyContainer #PartsList tbody > tr:nth-child(odd) > td {
    background: var(--bg) !important;
    color: var(--ink) !important;
  }
  #yamaha-oem-AssemblyContainer #PartsList tbody > tr:hover > td {
    background: var(--bg-alt) !important;
  }
  #yamaha-oem-AssemblyContainer #PartsList tbody > tr:last-child > td {
    border-bottom: 0;
  }

  /* Quantity input */
  #yamaha-oem-AssemblyContainer #PartsList input[type="text"].qtyTextbox {
    width: 56px !important;
    padding: 6px 8px;
    border: 1px solid var(--line);
    border-radius: 6px;
    font: inherit;
    text-align: center;
    color: var(--ink);
    background: var(--bg);
  }
  #yamaha-oem-AssemblyContainer #PartsList input.qtyTextbox:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(215, 38, 49, 0.15);
  }

  /* Add to Cart button */
  #yamaha-oem-AssemblyContainer #PartsList input[type="button"].btnAddToCart {
    background: var(--accent) !important;
    color: #fff !important;
    border: 0 !important;
    padding: 8px 14px;
    border-radius: 6px;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: background 120ms ease;
    text-transform: none;
  }
  #yamaha-oem-AssemblyContainer #PartsList input[type="button"].btnAddToCart:hover {
    background: var(--accent-dark) !important;
  }
  .successButton { color: #15803d !important; font-weight: 600 !important; font-size: 13px !important; }

  /* Hide the Diagram/PartsListContainer until they have content (avoids
     empty zinc rectangles on first paint). */
  #Diagram:empty, #PartsListContainer:has(tbody:empty) tbody { }

  /* ---------- Loading indicator (replace gif with spinner) ---------- */
  #loading-image_ajax {
    display: none;
    position: fixed;
    top: 16px; right: 16px;
    width: 28px; height: 28px;
    visibility: hidden;
  }
  body.loading::after {
    content: '';
    position: fixed;
    top: 16px; right: 16px;
    width: 28px; height: 28px;
    border: 3px solid var(--line);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    z-index: 9999;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ---------- Misc ---------- */
  #yamaha-oem-imageWrap {
    margin: 24px 0 0 0 !important;
    padding: 0 !important;
  }
  div.modelImageContainer {
    border: 1px solid var(--line);
    border-radius: 8px;
    overflow: hidden;
    width: 280px;
    height: 170px;
    margin: 0 8px 8px 0;
  }
  div.partinfopanel {
    background: #1f2937 !important;
    color: #fff !important;
    border: 0 !important;
    padding: 6px 10px !important;
    border-radius: 6px;
    font-size: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  @media (max-width: 640px) {
    #yamaha-oem-parts-lookup { padding: 16px 12px 32px; }
    #yamaha-oem-filterpanel { padding: 16px !important; }
  }
</style>
<script>
  // Toggle a body class for the loading state — drives the spinner above.
  // (Plugin shows/hides #loading-image_ajax via jQuery; mirror that.)
  (function() {
    document.addEventListener('DOMContentLoaded', function () {
      var bodyEl = document.body;
      var observer = new MutationObserver(function () {
        var img = document.getElementById('loading-image_ajax');
        if (!img) return;
        var visible = img.style.display !== 'none' && img.offsetParent !== null;
        bodyEl.classList.toggle('loading', visible);
      });
      var img = document.getElementById('loading-image_ajax');
      if (img) observer.observe(img, { attributes: true, attributeFilter: ['style'] });
    });
  })();
</script>
</head>
<body>
<div id="yamaha-oem-parts-lookup">
  <div id="yamaha-oem-filterpanel">
    <div id="yamaha-oem-filtertitle">
      <span class="eyebrow">Genuine Yamaha</span>
      <span class="title">OEM Parts Finder</span>
    </div>
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
