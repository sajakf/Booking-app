"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Sparkles, Bot } from "lucide-react"
import { t } from "@/lib/i18n"
import type { Locale } from "@/types/i18n"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function AIChatWidget({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: t("chat.greeting", locale) },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isAr = locale === "ar"

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
      inputRef.current?.focus()
    }
  }, [open, messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const next: Message[] = [...messages, { role: "user", content: text }]
    setMessages(next)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      const reply = data.reply ?? t("chat.error", locale)
      setMessages((prev) => [...prev, { role: "assistant", content: reply }])
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: t("chat.error", locale) }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Chat panel ── */}
      {open && (
        <div
          className={cn(
            "fixed bottom-24 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl shadow-blue-900/20 transition-all",
            isAr ? "left-4" : "right-4"
          )}
          style={{ height: "min(520px, calc(100dvh - 8rem))" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-700 to-indigo-700 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30">
                <Sparkles className="size-4 text-yellow-300" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none">{t("chat.title", locale)}</p>
                <p className="mt-0.5 text-xs text-blue-200">{t("chat.subtitle", locale)}</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label={t("chat.close", locale)}
              className="flex size-8 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-end gap-2",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="mb-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                    <Bot className="size-3.5 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                    msg.role === "user"
                      ? "rounded-ee-sm bg-blue-600 text-white"
                      : "rounded-es-sm bg-gray-100 text-gray-800"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-end gap-2">
                <div className="mb-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                  <Bot className="size-3.5 text-white" />
                </div>
                <div className="rounded-2xl rounded-es-sm bg-gray-100 px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="size-1.5 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: `${d * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 bg-white px-3 py-3">
            <form
              onSubmit={(e) => { e.preventDefault(); send() }}
              className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-1.5 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-400/20"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("chat.placeholder", locale)}
                dir={isAr ? "rtl" : "ltr"}
                disabled={loading}
                className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label={t("chat.send", locale)}
                className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-40"
              >
                <Send className={cn("size-3.5", isAr && "rotate-180")} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Floating trigger button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("chat.label", locale)}
        className={cn(
          "fixed bottom-6 z-50 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 px-4 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-700/40 transition-all hover:scale-105 hover:shadow-2xl active:scale-95",
          isAr ? "left-4 flex-row-reverse" : "right-4"
        )}
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
        <span className="hidden sm:inline">{t("chat.label", locale)}</span>
        {!open && (
          <span className="flex size-5 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-black text-gray-900">
            AI
          </span>
        )}
      </button>
    </>
  )
}
