"use client"

// Registers the service worker, subscribes for Web Push, and shows
// an iOS "Add to Home Screen" banner when the user is on Safari and
// hasn't installed the PWA yet. Mounted globally on the admin via
// `admin.components.providers` in payload.config.ts.
//
// Lifecycle:
//   1. On mount, register /sw.js scoped to /admin/.
//   2. If Notification.permission is 'default', show a one-time
//      "Enable notifications" prompt — staff opts in with a tap.
//   3. On grant, ask the service worker for a push subscription and
//      POST it to /api/push/subscribe.
//   4. On iOS Safari (not standalone), show an "Add to Home Screen"
//      banner — push doesn't work on iOS until the PWA is installed.

import { useEffect, useState } from "react"

type State = "loading" | "needs-install" | "needs-permission" | "subscribed" | "denied" | "unsupported"

export default function PushSetup({ children }: { children?: React.ReactNode }) {
  const [state, setState] = useState<State>("loading")
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Only act inside the admin scope.
    if (typeof window === "undefined") return
    if (!window.location.pathname.startsWith("/admin")) {
      setState("subscribed") // hide UI; nothing to do
      return
    }

    // Skip entirely if Service Worker / Push aren't supported.
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported")
      return
    }

    void setup()
  }, [])

  async function setup() {
    try {
      // iOS Safari: push works ONLY when running as an installed PWA
      // (standalone display mode). Detect and prompt to install.
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as { standalone?: boolean }).standalone === true
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent)
      if (isIos && !isStandalone) {
        setState("needs-install")
        return
      }

      // Register the service worker.
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/admin/" })
      await navigator.serviceWorker.ready

      const permission = Notification.permission
      if (permission === "granted") {
        await subscribeAndSync(reg)
        setState("subscribed")
        return
      }
      if (permission === "denied") {
        setState("denied")
        return
      }
      setState("needs-permission")
    } catch (err) {
      console.error("[push-setup] failed", err)
      setState("unsupported")
    }
  }

  async function requestPermission() {
    try {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "needs-permission")
        return
      }
      const reg = await navigator.serviceWorker.ready
      await subscribeAndSync(reg)
      setState("subscribed")
    } catch (err) {
      console.error("[push-setup] permission request failed", err)
    }
  }

  async function subscribeAndSync(reg: ServiceWorkerRegistration) {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!publicKey) {
      console.warn("[push-setup] NEXT_PUBLIC_VAPID_PUBLIC_KEY not set")
      return
    }

    let sub = await reg.pushManager.getSubscription()
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })
    }
    const json = sub.toJSON()
    await fetch("/api/push/subscribe", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(json),
    })
  }

  // The banner UI sits above everything else in the admin so it
  // can't be missed. Auto-hides once `state === 'subscribed'`.
  return (
    <>
      {!dismissed && state === "needs-install" && (
        <Banner kind="info" onDismiss={() => setDismissed(true)}>
          <strong>One-time setup for SMS notifications:</strong> tap the{" "}
          <span aria-hidden>⎋</span> Share button, then "Add to Home Screen".
          Open the app from your home screen — push notifications work after that.
        </Banner>
      )}
      {!dismissed && state === "needs-permission" && (
        <Banner kind="info">
          <span>Enable push so you don&apos;t miss customer SMS messages.</span>
          <button
            type="button"
            onClick={requestPermission}
            style={{
              background: "white",
              color: "#0b1320",
              fontWeight: 600,
              border: "none",
              padding: "6px 12px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Allow notifications
          </button>
        </Banner>
      )}
      {!dismissed && state === "denied" && (
        <Banner kind="warn" onDismiss={() => setDismissed(true)}>
          Notifications are blocked. Enable them in your browser settings to get
          SMS alerts on this device.
        </Banner>
      )}
      {children}
    </>
  )
}

function Banner({
  kind,
  children,
  onDismiss,
}: {
  kind: "info" | "warn"
  children: React.ReactNode
  onDismiss?: () => void
}) {
  const bg = kind === "warn" ? "#b45309" : "#1d4ed8"
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 200,
        background: bg,
        color: "white",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        fontSize: 14,
        textAlign: "center",
        flexWrap: "wrap",
      }}
      role="status"
    >
      <span>{children}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            background: "transparent",
            color: "white",
            border: "1px solid rgba(255,255,255,0.4)",
            borderRadius: 4,
            padding: "2px 8px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      )}
    </div>
  )
}

// Convert a base64-url-encoded VAPID public key to an ArrayBuffer.
// PushManager.subscribe's `applicationServerKey` is typed as
// BufferSource — TypeScript's narrow ArrayBuffer is the safest
// fit (Uint8Array<ArrayBufferLike> mismatches in TS 5.x because of
// SharedArrayBuffer being part of ArrayBufferLike).
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const buf = new ArrayBuffer(rawData.length)
  const bytes = new Uint8Array(buf)
  for (let i = 0; i < rawData.length; i++) {
    bytes[i] = rawData.charCodeAt(i)
  }
  return buf
}
