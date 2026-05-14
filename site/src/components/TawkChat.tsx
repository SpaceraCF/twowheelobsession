import Script from "next/script"

// tawk.to live chat widget. Free forever, agent app on iOS/Android.
//
// Setup (one-time, in tawk.to dashboard):
//   1. Sign up at https://tawk.to (use info@twowheelobsession.com.au)
//   2. Property ID + Widget ID land in Administration → Channels →
//      Chat Widget → Direct Chat Link. The widget src looks like
//      https://embed.tawk.to/<propertyId>/<widgetId>
//   3. Drop both into Render env:
//        NEXT_PUBLIC_TAWK_PROPERTY_ID
//        NEXT_PUBLIC_TAWK_WIDGET_ID
//      Both are public values (embedded in the client bundle, visible
//      via View Source). NEXT_PUBLIC_ prefix is required.
//   4. Customise the bubble colour / welcome message / business hours
//      in the tawk.to dashboard — no code changes needed.
//
// Until both env vars are set, this component renders nothing so the
// site stays clean.

export function TawkChat() {
  const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID
  const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID
  if (!propertyId || !widgetId) return null

  return (
    <Script
      id="tawk-chat"
      strategy="lazyOnload"
      // Mirror tawk's official embed snippet. The inline script
      // initialises the Tawk_API globals then loads the widget; we
      // delay it to lazyOnload so it never blocks first paint.
    >
      {`
var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
(function () {
  var s1 = document.createElement("script"),
      s0 = document.getElementsByTagName("script")[0];
  s1.async = true;
  s1.src = "https://embed.tawk.to/${propertyId}/${widgetId}";
  s1.charset = "UTF-8";
  s1.setAttribute("crossorigin", "*");
  s0.parentNode.insertBefore(s1, s0);
})();
`}
    </Script>
  )
}
