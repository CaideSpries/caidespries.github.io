import { useState } from "react";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

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
              In development
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-center">
            <svg className="w-10 h-10 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384-3.082A1.5 1.5 0 015.25 10.8V6.75a1.5 1.5 0 011.5-1.5h10.5a1.5 1.5 0 011.5 1.5v4.05a1.5 1.5 0 01-.786 1.288l-5.384 3.082a1.5 1.5 0 01-1.66 0z" />
            </svg>
            <p className="text-sm font-medium opacity-70">Coming Soon</p>
            <p className="text-xs opacity-50 mt-1 max-w-[14rem]">
              This AI assistant is in development — currently limited by GPU availability and funding.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
