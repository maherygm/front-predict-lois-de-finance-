import React, { useRef, useState } from "react";
import axios from "axios";

function UploadForm({ setForecast, setInterpretation, setLoading, loading }) {
  const fileInput = useRef();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      fileInput.current.files = e.dataTransfer.files;
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    fileInput.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const file = fileInput.current.files[0];
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        process.env.REACT_APP_API_URL + "/predict",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setForecast(res.data.forecast);
      setInterpretation(res.data.interpretation);
    } catch (err) {
      alert("Erreur lors de la prédiction !");
      setForecast(null);
      setInterpretation("");
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 w-full sm:w-[450px] mx-auto"
    >
      <div
        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50"
        }`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        tabIndex={0}
        role="button"
      >
        <svg
          className="w-12 h-12 mb-2 text-blue-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16V4m0 0L8 8m4-4l4 4M20 16.5A4.5 4.5 0 0115.5 21h-7A4.5 4.5 0 014 16.5V16a2 2 0 012-2h12a2 2 0 012 2v.5z"
          />
        </svg>
        <p className="text-gray-700 text-sm mb-1">
          Glissez-déposez un fichier Excel ici ou{" "}
          <span className="text-blue-600 underline">cliquez</span> pour
          sélectionner
        </p>
        <input
          type="file"
          ref={fileInput}
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleChange}
        />
        {selectedFile && (
          <span className="text-green-700 text-xs mt-2">
            {selectedFile.name}
          </span>
        )}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition disabled:opacity-60"
      >
        {loading ? "Chargement..." : "Prédire"}
      </button>
    </form>
  );
}

export default UploadForm;
