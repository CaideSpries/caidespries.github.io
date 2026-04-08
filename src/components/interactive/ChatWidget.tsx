import { useState, useRef, useEffect } from "react";

const API_URL = "https://portfolio-chat.caidespries1.workers.dev";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hey! I'm Caide's portfolio assistant. Ask me anything about his experience, projects, skills, or education.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput("");

    const updatedMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: userMsg },
    ];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Convert to Gemini format (assistant -> model)
      const apiMessages = updatedMessages
        .filter((m) => m.role !== "assistant" || updatedMessages.indexOf(m) !== 0) // skip initial greeting
        .map((m) => ({
          role: m.role === "assistant" ? ("model" as const) : ("user" as const),
          content: m.content,
        }));

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error((err as { error?: string }).error || `HTTP ${res.status}`);
      }

      const data = (await res.json()) as { response: string };
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            message.includes("Rate limit")
              ? "You've sent too many messages. Please wait a minute and try again."
              : "Sorry, I couldn't get a response. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all flex items-center justify-center"
        style={{
          background: "#e85d3a",
          color: "#080808",
          boxShadow: "0 0 20px rgba(232, 93, 58, 0.4)",
        }}
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.671 1.09-.085 2.17-.207 3.238-.364 1.584-.233 2.707-1.627 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="chat-widget-panel fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl flex flex-col max-h-[28rem] overflow-hidden">
          <div className="px-4 py-3 rounded-t-2xl" style={{ background: "#e85d3a" }}>
            <p className="font-bold text-sm" style={{ color: "#080808", fontFamily: "var(--font-display)" }}>
              Chat with Caide's AI
            </p>
            <p className="text-xs" style={{ color: "rgba(8, 8, 8, 0.6)" }}>
              Powered by Gemini — ask about experience, projects, skills
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "user" ? (
                  <div
                    className="max-w-[80%] px-3 py-2 rounded-xl text-sm"
                    style={{ background: "#e85d3a", color: "#080808" }}
                  >
                    {msg.content}
                  </div>
                ) : (
                  <div className="chat-widget-assistant-bubble max-w-[80%] px-3 py-2 rounded-xl text-sm">
                    {msg.content}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="chat-widget-assistant-bubble px-3 py-2 rounded-xl text-sm flex gap-1">
                  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-widget-divider p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about Caide's work..."
                disabled={isLoading}
                className="chat-widget-input flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                style={{ background: "#e85d3a", color: "#080808" }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
