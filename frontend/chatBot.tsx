"use client";
import { useState, useEffect } from "react";
import { FaMicrophone } from "react-icons/fa"; // 🎤 WhatsApp-style mic icon

interface Message {
  sender: "user" | "bot";
  text: string;
}

export default function ChatBot() {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [listening, setListening] = useState(false);

  // 🎤 Speech Recognition Setup
  useEffect(() => {
    interface Window {
      SpeechRecognition: any;
      webkitSpeechRecognition: any;
    }
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-IN";
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log("🎤 You said:", transcript);
      setInput(transcript);

      // Auto-send message after speech
      setTimeout(() => {
        handleSend(undefined, transcript);
      }, 400);
    };

    recognition.onend = () => setListening(false);

    if (listening) recognition.start();

    return () => {
      recognition.abort();
    };
  }, [listening]);

  // ✉️ Handle Send (text or voice)
  const handleSend = async (
    e?: React.FormEvent,
    speechInput?: string
  ): Promise<void> => {
    if (e) e.preventDefault();
    const userInput = speechInput || input.trim();
    if (!userInput) return;

    const userMessage: Message = { sender: "user", text: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Send message to Gemini backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.reply || data.message || "No response generated.",
        },
      ]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {showChat ? (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-80 h-96 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 p-3 flex justify-between items-center">
            <h3 className="text-white font-semibold">JanBol AI Assistant</h3>
            <button
              onClick={() => setShowChat(false)}
              className="text-white hover:text-gray-200 text-sm"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-800 text-sm">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-[75%] break-words ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white self-end ml-auto"
                    : "bg-gray-700 text-gray-100"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="text-gray-400 text-xs animate-pulse">
                Assistant is typing...
              </div>
            )}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSend}
            className="flex border-t border-gray-700 items-center"
          >
            <input
              type="text"
              placeholder={listening ? "Listening..." : "Type your message..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-gray-800 text-white p-2 text-sm focus:outline-none"
            />

            {/* 🎤 Mic Button */}
            <button
              type="button"
              onClick={() => setListening((prev) => !prev)}
              className={`p-3 text-white transition rounded-full ${
                listening
                  ? "bg-red-600 animate-pulse shadow-md shadow-red-400"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              <FaMicrophone size={16} />
            </button>

            {/* ➤ Send Button */}
            <button
              type="submit"
              className="bg-blue-600 px-3 text-white hover:bg-blue-700 rounded-r-xl"
            >
              ➤
            </button>
          </form>
        </div>
      ) : (
        // Floating Chat Icon
        <button
          onClick={() => setShowChat(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-transform transform hover:scale-110"
        >
          💬
        </button>
      )}
    </div>
  );
}
