import React, { useState, useRef } from "react";
import Chart from "react-apexcharts";

function ForecastResult({ forecast, interpretation }) {
  // --- NOUVEAU : États pour le podcast ---
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef(null);
  if (!forecast) return null;

  // --- 1. Préparation des données (Identique à avant) ---
  const regions = [...new Set(forecast.forecast_regional.map((r) => r.Région))];
  const years = [
    ...new Set(forecast.forecast_regional.map((r) => r.Année)),
  ].sort();

  const regionalSeries = regions.map((region) => ({
    name: region,
    data: years.map((year) => {
      const entry = forecast.forecast_regional.find(
        (r) => r.Région === region && r.Année === year
      );
      return entry ? Math.round(entry["Dépenses_Prédites"]) : 0;
    }),
  }));

  const nationalYears = forecast.forecast_national.map((n) => n.Année);
  const nationalDepenses = forecast.forecast_national.map((n) =>
    Math.round(n.Dépenses_Prédites)
  );

  const palette = [
    "#3366CC",
    "#DC3912",
    "#FF9900",
    "#109618",
    "#990099",
    "#0099C6",
    "#DD4477",
    "#66AA00",
    "#B82E2E",
    "#316395",
  ];

  // --- 2. Options Charts (Identique à avant) ---
  const lineOptions = {
    chart: {
      id: "regional-trend",
      toolbar: { show: true },
      zoom: { enabled: true },
      background: "transparent",
      fontFamily: "Inter, sans-serif",
    },
    colors: palette,
    stroke: { curve: "smooth", width: 3 },
    markers: { size: 0, hover: { size: 6 } },
    dataLabels: { enabled: false },
    xaxis: { categories: years, tooltip: { enabled: false } },
    yaxis: {
      labels: { formatter: (val) => (val / 1000000).toFixed(1) + " M" },
      title: { text: "Dépenses (Millions MGA)" },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (val) => val.toLocaleString() + " MGA" },
    },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
    legend: { position: "top", horizontalAlign: "left" },
  };

  const stackedOptions = {
    chart: {
      id: "regional-stacked",
      stacked: true,
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
    },
    colors: palette,
    plotOptions: {
      bar: { horizontal: false, borderRadius: 0, columnWidth: "70%" },
    },
    dataLabels: { enabled: false },
    xaxis: { categories: years },
    yaxis: {
      labels: { formatter: (val) => (val / 1000000).toFixed(0) + " M" },
    },
    tooltip: { y: { formatter: (val) => val.toLocaleString() + " MGA" } },
    legend: { show: false },
    grid: { borderColor: "#f1f5f9" },
  };

  const nationalOptions = {
    chart: {
      id: "national-forecast",
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
    },
    colors: ["#1e40af"],
    plotOptions: { bar: { borderRadius: 4, columnWidth: "50%" } },
    dataLabels: { enabled: false },
    xaxis: { categories: nationalYears },
    yaxis: {
      labels: { formatter: (val) => (val / 1000000000).toFixed(2) + " Mrd" },
      title: { text: "Total National" },
    },
    tooltip: { y: { formatter: (val) => val.toLocaleString() + " MGA" } },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
  };

  // --- NOUVEAU : Fonction pour générer le podcast ---
  const handleGeneratePodcast = async () => {
    setLoadingAudio(true);
    setAudioUrl(null);

    try {
      // 1. Nettoyer le HTML pour ne garder que le texte pur pour la voix
      const plainText = interpretation.replace(/<[^>]+>/g, " ");

      // 2. Appel API
      const response = await fetch(
        process.env.REACT_APP_API_URL + "/geneRatePodcast",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texte: plainText }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // IMPORTANT : Ajuste l'URL selon comment ton serveur sert les fichiers statiques
        // Si le serveur renvoie "./uploads/audio.mp3", il faut peut-être le transformer
        // Ici je suppose que le backend renvoie un chemin relatif accessible
        const fileUrl = `${process.env.REACT_APP_API_URL}/podcast/${data.file}`;
        setAudioUrl(fileUrl);
      } else {
        alert("Erreur: " + data.error);
      }
    } catch (error) {
      console.error("Erreur podcast:", error);
      alert("Impossible de générer le podcast.");
    } finally {
      setLoadingAudio(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b pb-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Prévisions Budgétaires Stratégiques
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Projection financière sur 10 ans ({years[0]} -{" "}
            {years[years.length - 1]})
          </p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-medium">
          Horizon 10 Ans
        </div>
      </div>

      {/* Ligne 1 : Graphiques */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">📊</div>
            <h3 className="font-semibold text-gray-700">
              Trajectoires Régionales
            </h3>
          </div>
          <Chart
            options={lineOptions}
            series={regionalSeries}
            type="line"
            height={350}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              📈
            </div>
            <h3 className="font-semibold text-gray-700">Volume National</h3>
          </div>
          <Chart
            options={nationalOptions}
            series={[{ name: "National", data: nationalDepenses }]}
            type="bar"
            height={350}
          />
        </div>
      </div>

      {/* Ligne 2 : Composition & Interprétation */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Graphique Stacked */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-green-50 rounded-lg text-green-600">💰</div>
            <h3 className="font-semibold text-gray-700">Poids Budgétaire</h3>
          </div>
          <Chart
            options={stackedOptions}
            series={regionalSeries}
            type="bar"
            height={300}
          />
        </div>

        {/* --- BLOC INTELLIGENCE ARTIFICIELLE & PODCAST --- */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-blue-200 p-0 overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-blue-50 to-white p-4 border-b border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <h3 className="font-semibold text-blue-900">Analyse IA</h3>
            </div>

            {/* --- BOUTON PODCAST --- */}
            {!audioUrl ? (
              <button
                onClick={handleGeneratePodcast}
                disabled={loadingAudio}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  loadingAudio
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                }`}
              >
                {loadingAudio ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Génération...
                  </>
                ) : (
                  <>
                    <span>🎧</span> Écouter le rapport
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-4 bg-blue-950 border border-gray-400/30 rounded-xl px-4 py-2 shadow-lg">
                {/* --- VISUALISATION CONDITIONNELLE --- */}
                {isPlaying ? (
                  // AFFICHÉ QUAND isPlaying est VRAI (Wave)
                  <div className="flex items-center gap-[3px] h-8">
                    <div
                      className="w-1.5 bg-white rounded-full animate-wave"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1.5 bg-white rounded-full animate-wave"
                      style={{ animationDelay: "0.3s" }}
                    ></div>
                    <div
                      className="w-1.5 bg-white rounded-full animate-wave"
                      style={{ animationDelay: "0.0s" }}
                    ></div>
                    <div
                      className="w-1.5 bg-white rounded-full animate-wave"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                    <div
                      className="w-1.5 bg-white rounded-full animate-wave"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                ) : (
                  // AFFICHÉ QUAND isPlaying est FAUX (Icône AI)
                  <div className="flex items-center justify-center h-8 w-10 text-2xl text-gray-400">
                    <span title="Analyse IA en pause">🧠</span>
                  </div>
                )}

                {/* --- LECTEUR AUDIO (AVEC ÉVÉNEMENTS) --- */}
                <audio
                  ref={audioRef} // Ajout de la référence
                  controls
                  autoPlay
                  // Mise à jour de l'état quand l'audio se met en pause ou est terminé
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  // Mise à jour de l'état quand l'audio redémarre (si l'utilisateur clique sur play)
                  onPlaying={() => setIsPlaying(true)}
                  className="h-8 w-[100px] outline-none opacity-90 transition-all duration-300 hover:opacity-100"
                  controlsList="nodownload nofullscreen noplaybackrate"
                >
                  <source src={audioUrl} type="audio/mpeg" />
                </audio>

                {/* Badge 'LIVE' (Utilise maintenant l'état isPlaying pour changer de couleur/texte) */}
                <div
                  className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded text-[10px] border font-mono tracking-widest transition-colors ${
                    isPlaying
                      ? "bg-green-700/50 border-green-500/20 text-white"
                      : "bg-blue-600/50 border-gray-500/20 text-gray-400"
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      PLAYING
                    </>
                  ) : (
                    <>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
                      PAUSED
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 overflow-y-auto max-h-[340px]">
            <div
              className="prose prose-sm prose-blue max-w-none text-gray-600"
              dangerouslySetInnerHTML={{ __html: interpretation }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForecastResult;
