import React, { useState } from "react";
import axios from "axios";

function AskForm() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async (e) => {
    e.preventDefault();
    if (!question) return;
    setLoading(true);
    try {
      const res = await axios.post(process.env.REACT_APP_API_URL + "/ask", {
        question,
      });
      setResponse(res.data.response || "Aucune réponse.");
    } catch {
      setResponse("Erreur lors de la requête.");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-white rounded shadow mt-4">
      <form onSubmit={ask} className="flex flex-col gap-2">
        <label className="font-medium">
          Question sur les données :
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full mt-1"
            placeholder="Ex : Quelle région dépense le plus ?"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-60"
        >
          {loading ? "Envoi..." : "Demander"}
        </button>
      </form>
      {response && (
        <div className="mt-2 p-2 border-l-4 border-green-600 bg-green-50">
          <b>Réponse :</b> {response}
        </div>
      )}
    </div>
  );
}

export default AskForm;
