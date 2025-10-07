import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

function ChatModal() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "ia", text: "Bonjour 👋\nPosez-moi vos questions budgétaires !" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Ferme la modal avec ESC
  useEffect(() => {
    if (!open) return;
    const closeOnEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEsc);
    return () => window.removeEventListener("keydown", closeOnEsc);
  }, [open]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    setMessages((msgs) => [...msgs, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(process.env.REACT_APP_API_URL + "/ask", {
        question: input,
      });
      setMessages((msgs) => [
        ...msgs,
        { sender: "ia", text: res.data.response || "Aucune réponse." },
      ]);
    } catch {
      setMessages((msgs) => [
        ...msgs,
        { sender: "ia", text: "Erreur lors de la requête à l'IA." },
      ]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Bouton flottant d’ouverture du chat */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white shadow-2xl rounded-full w-14 h-14 flex items-center justify-center text-2xl transition-all"
        onClick={() => setOpen(true)}
        title="Ouvrir le chat IA"
      >
        💬
      </button>

      {/* Overlay et modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-end sm:items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col h-[85vh] sm:h-[600px] mx-2 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-600">
              <span className="w-8 h-8 bg-white flex items-center justify-center rounded-full text-blue-600 font-bold text-2xl">
                🤖
              </span>
              <div className="text-white text-lg font-semibold">
                Assistant IA Budgétaire
              </div>
              <button
                className="ml-auto text-white text-2xl hover:text-blue-200 p-1"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 bg-blue-50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex mb-2 ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender === "ia" && (
                    <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white font-bold rounded-full flex items-center justify-center mr-2">
                      🤖
                    </span>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm whitespace-pre-line ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-lg"
                        : "bg-white text-gray-900 rounded-bl-lg border border-blue-100"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.sender === "user" && (
                    <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ml-2"></span>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex justify-start mb-2">
                  <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white font-bold rounded-full flex items-center justify-center mr-2">
                    🤖
                  </span>
                  <div className="bg-white text-gray-400 px-4 py-2 rounded-2xl rounded-bl-lg border border-blue-100">
                    IA est en train d'écrire...
                  </div>
                </div>
              )}
              <div ref={bottomRef}></div>
            </div>
            {/* Input */}
            <form
              onSubmit={sendMessage}
              className="flex items-center gap-2 p-3 bg-white border-t border-gray-200"
            >
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Tapez votre question et appuyez sur Entrée…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                autoFocus
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl disabled:opacity-60 transition-all"
                disabled={!input.trim() || loading}
              >
                Envoyer
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatModal;
