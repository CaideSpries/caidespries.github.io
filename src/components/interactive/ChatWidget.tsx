import { useState } from "react";

const PLACEHOLDER_RESPONSES = [
  "Still being trained on Caide's full portfolio. Check back soon.",
  "This chat will be powered by a fine-tuned model. For now, have a look around.",
  "Coming soon. I'll be able to answer questions about Caide's experience, skills, and projects.",
  "I'm a work in progress. In the meantime, feel free to reach out via email.",
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([
    {
      role: "assistant",
      content:
        "Hey. I'm Caide's AI assistant. Still being built, but feel free to say hi.",
    },
  ]);
  const [input, setInput] = useState("");

  function handleSend() {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMsg },
    ]);

    setTimeout(() => {
      const response =
        PLACEHOLDER_RESPONSES[
          Math.floor(Math.random() * PLACEHOLDER_RESPONSES.length)
        ];
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    }, 800);
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
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl flex flex-col max-h-[28rem] overflow-hidden"
          style={{
            background: "#0d0d0d",
            border: "1px solid rgba(232, 213, 192, 0.12)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
          }}
        >
          <div className="px-4 py-3 rounded-t-2xl" style={{ background: "#e85d3a" }}>
            <p className="font-bold text-sm" style={{ color: "#080808", fontFamily: "var(--font-display)" }}>
              Chat with Caide's AI
            </p>
            <p className="text-xs" style={{ color: "rgba(8, 8, 8, 0.6)" }}>
              Coming soon / placeholder mode
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[80%] px-3 py-2 rounded-xl text-sm"
                  style={
                    msg.role === "user"
                      ? { background: "#e85d3a", color: "#080808" }
                      : {
                          background: "rgba(232, 213, 192, 0.08)",
                          color: "#f2e8dc",
                        }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3" style={{ borderTop: "1px solid rgba(232, 213, 192, 0.1)" }}>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Say something..."
                className="flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none"
                style={{
                  background: "rgba(232, 213, 192, 0.05)",
                  border: "1px solid rgba(232, 213, 192, 0.12)",
                  color: "#f2e8dc",
                }}
              />
              <button
                onClick={handleSend}
                className="px-3 py-2 rounded-lg transition-colors"
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
