"use client"

// Custom thread + reply UI embedded into the Conversation edit page
// via `admin.components.beforeFields`. Staff opens a Conversation
// doc and sees this above the standard fields — a chat-style message
// thread plus a reply box. Mark-as-read fires on mount so the
// unread badge clears.
//
// Designed mobile-first so the same UI works whether the staff
// member is on their iPhone PWA or a desktop browser.

import { useEffect, useMemo, useRef, useState } from "react"
import { useDocumentInfo } from "@payloadcms/ui"

type Message = {
  id: string | number
  direction: "inbound" | "outbound"
  body: string
  status: string
  createdAt: string
  sentBy?: { email?: string; name?: string } | null
}

export default function ConversationThread() {
  const docInfo = useDocumentInfo()
  const conversationId = docInfo?.id

  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  // Fetch messages for this conversation.
  async function loadMessages() {
    if (!conversationId) return
    try {
      const res = await fetch(
        `/api/messages?where[conversation][equals]=${encodeURIComponent(String(conversationId))}&sort=createdAt&limit=200&depth=1`,
        { credentials: "include" },
      )
      if (!res.ok) throw new Error(`http ${res.status}`)
      const data = (await res.json()) as { docs: Message[] }
      setMessages(data.docs)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  // Initial load + mark-read on mount.
  useEffect(() => {
    if (!conversationId) return
    setLoading(true)
    loadMessages()
    // Best-effort mark-as-read.
    fetch("/api/twilio/mark-read", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ conversationId }),
    }).catch(() => {
      /* silent */
    })
  }, [conversationId])

  // Auto-scroll to bottom when messages change.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" })
  }, [messages.length])

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [messages],
  )

  async function sendReply(ev: React.FormEvent) {
    ev.preventDefault()
    const body = reply.trim()
    if (!body || !conversationId || sending) return
    setSending(true)
    setError(null)
    try {
      const res = await fetch("/api/twilio/send-sms", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ conversationId, body }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        ok?: boolean
      }
      if (!res.ok || !data.ok) {
        setError(data.error ?? `Send failed (${res.status})`)
      } else {
        setReply("")
        await loadMessages()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSending(false)
    }
  }

  if (!conversationId) {
    return (
      <div style={hint}>Save this conversation first to start a thread.</div>
    )
  }

  return (
    <div style={container}>
      <header style={header}>
        <strong>Messages</strong>
        <button
          type="button"
          onClick={loadMessages}
          style={refreshBtn}
          aria-label="Refresh messages"
          title="Refresh"
        >
          ↻
        </button>
      </header>

      <div style={thread} aria-live="polite">
        {loading && <div style={hint}>Loading…</div>}
        {!loading && sortedMessages.length === 0 && (
          <div style={hint}>
            No messages yet. Reply below to start the conversation.
          </div>
        )}
        {sortedMessages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendReply} style={replyForm}>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply…"
          rows={2}
          style={textarea}
          onKeyDown={(e) => {
            // ⌘/Ctrl+Enter to send.
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") sendReply(e)
          }}
        />
        <div style={replyActions}>
          {error && <span style={errorText}>{error}</span>}
          <button
            type="submit"
            disabled={sending || !reply.trim()}
            style={sendBtn}
          >
            {sending ? "Sending…" : "Send SMS"}
          </button>
        </div>
      </form>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const inbound = message.direction === "inbound"
  const time = new Date(message.createdAt).toLocaleString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  })
  return (
    <div style={{ ...row, justifyContent: inbound ? "flex-start" : "flex-end" }}>
      <div
        style={{
          ...bubble,
          background: inbound
            ? "var(--theme-elevation-100)"
            : "var(--theme-success-500, #16a34a)",
          color: inbound ? "var(--theme-text)" : "white",
          alignSelf: inbound ? "flex-start" : "flex-end",
        }}
      >
        <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {message.body}
        </div>
        <div style={meta}>
          {time}
          {message.status === "failed" && " · failed"}
          {!inbound && message.sentBy?.email && ` · ${message.sentBy.email}`}
        </div>
      </div>
    </div>
  )
}

const container: React.CSSProperties = {
  border: "1px solid var(--theme-elevation-150)",
  borderRadius: 8,
  background: "var(--theme-elevation-50)",
  marginBottom: 24,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  maxHeight: "70vh",
}
const header: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 14px",
  borderBottom: "1px solid var(--theme-elevation-150)",
  background: "var(--theme-elevation-100)",
}
const refreshBtn: React.CSSProperties = {
  background: "transparent",
  border: "1px solid var(--theme-elevation-200)",
  color: "var(--theme-text)",
  borderRadius: 4,
  padding: "4px 8px",
  cursor: "pointer",
}
const thread: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: 14,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  minHeight: 240,
}
const row: React.CSSProperties = { display: "flex", width: "100%" }
const bubble: React.CSSProperties = {
  maxWidth: "80%",
  padding: "8px 12px",
  borderRadius: 12,
  fontSize: 14,
  lineHeight: 1.4,
}
const meta: React.CSSProperties = {
  marginTop: 4,
  fontSize: 11,
  opacity: 0.7,
}
const replyForm: React.CSSProperties = {
  borderTop: "1px solid var(--theme-elevation-150)",
  padding: 12,
  display: "flex",
  flexDirection: "column",
  gap: 8,
}
const textarea: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid var(--theme-elevation-200)",
  borderRadius: 6,
  background: "var(--theme-input-bg, var(--theme-elevation-0))",
  color: "var(--theme-text)",
  fontFamily: "inherit",
  fontSize: 14,
  resize: "vertical",
}
const replyActions: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
}
const sendBtn: React.CSSProperties = {
  background: "var(--theme-success-500, #16a34a)",
  color: "white",
  border: "none",
  padding: "8px 16px",
  borderRadius: 6,
  fontWeight: 600,
  cursor: "pointer",
}
const errorText: React.CSSProperties = {
  color: "var(--theme-error-500, #dc2626)",
  fontSize: 12,
  flex: 1,
}
const hint: React.CSSProperties = {
  fontSize: 13,
  color: "var(--theme-text-dim, #888)",
  padding: 24,
  textAlign: "center",
}
