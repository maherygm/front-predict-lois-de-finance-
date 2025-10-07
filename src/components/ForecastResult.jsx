import React from "react";
import Chart from "react-apexcharts";

function ForecastResult({ forecast, interpretation }) {
  if (!forecast) return null;

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
      return entry ? entry["Dépenses_Prédites"] : null;
    }),
  }));

  const nationalYears = forecast.forecast_national.map((n) => n.Année);
  const nationalDepenses = forecast.forecast_national.map(
    (n) => n.Dépenses_Prédites
  );

  const regionColors = [
    "#2563eb",
    "#16a34a",
    "#f59e42",
    "#e11d48",
    "#a21caf",
    "#0ea5e9",
    "#d97706",
    "#be185d",
    "#334155",
    "#7c3aed",
  ];

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 lg:p-10">
      {/* Bloc principal responsive */}
      <div className="flex flex-col lg:flex-row justify-center items-stretch gap-6">
        {/* Graphique régional */}
        <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all">
          <h2 className="font-bold text-lg md:text-xl text-blue-700 mb-4 tracking-tight flex items-center gap-2">
            <span className="inline-block w-2 h-6 bg-blue-600 rounded-full mr-1" />
            Prévisions régionales{" "}
            <span className="font-normal text-gray-500 text-base">
              (Dépenses Prédites)
            </span>
          </h2>
          <div className="overflow-x-auto">
            <Chart
              type="area"
              height="390"
              width="100%"
              options={{
                chart: {
                  id: "regional-forecast",
                  toolbar: { show: true },
                  zoom: { enabled: true },
                  background: "transparent",
                },
                stroke: { curve: "smooth", width: 3 },
                dataLabels: {
                  enabled: true,
                  style: { fontWeight: "bold" },
                  formatter: (val) => val && val.toLocaleString(),
                },
                colors: regionColors,
                xaxis: {
                  categories: years,
                  title: { text: "Année", style: { fontWeight: 600 } },
                  labels: { style: { fontSize: "13px" } },
                },
                yaxis: {
                  title: {
                    text: "Dépenses Prédites (MGA)",
                    style: { fontWeight: 600 },
                  },
                  labels: { formatter: (val) => val?.toLocaleString() },
                },
                legend: {
                  position: "top",
                  horizontalAlign: "left",
                  fontSize: "14px",
                  markers: { width: 14, height: 14, radius: 4 },
                },
                tooltip: {
                  y: {
                    formatter: (val) => val && val.toLocaleString() + " MGA",
                  },
                },
                grid: { borderColor: "#e0e7ef" },
                fill: {
                  type: "gradient",
                  gradient: {
                    shade: "light",
                    type: "vertical",
                    shadeIntensity: 0.1,
                    opacityFrom: 0.38,
                    opacityTo: 0.04,
                    stops: [0, 80, 100],
                  },
                },
              }}
              series={regionalSeries}
            />
          </div>
        </div>

        {/* Graphique national */}
        <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all">
          <h2 className="font-bold text-lg md:text-xl text-blue-700 mb-4 tracking-tight flex items-center gap-2">
            <span className="inline-block w-2 h-6 bg-blue-600 rounded-full mr-1" />
            Prévision nationale{" "}
            <span className="font-normal text-gray-500 text-base">
              (Dépenses Prédites)
            </span>
          </h2>
          <Chart
            type="bar"
            height="320"
            options={{
              chart: { id: "national-forecast", toolbar: { show: true } },
              xaxis: {
                categories: nationalYears,
                title: { text: "Année", style: { fontWeight: 900 } },
              },
              yaxis: {
                title: {
                  text: "Dépenses nationales (MGA)",
                  style: { fontWeight: 600 },
                },
                labels: { formatter: (val) => val?.toLocaleString() },
              },
              plotOptions: {
                bar: { borderRadius: 10, columnWidth: "50%" },
              },
              colors: ["#2563eb"],
              dataLabels: {
                enabled: true,
                offsetY: -20,
                style: { colors: ["#334155"], fontWeight: "bold" },
                formatter: (val) => val && val.toLocaleString(),
              },
              tooltip: {
                y: { formatter: (val) => val && val.toLocaleString() + " MGA" },
              },
              grid: { borderColor: "#e0e7ef" },
            }}
            series={[{ name: "Dépenses nationales", data: nationalDepenses }]}
          />
        </div>
      </div>

      {/* Bloc interprétation */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border-l-8 border-blue-600 transition hover:shadow-2xl">
        <div className="mb-2 text-blue-700 font-semibold text-lg">
          Interprétation
        </div>
        <div
          className="text-gray-700 leading-relaxed whitespace-pre-line text-sm md:text-base"
          dangerouslySetInnerHTML={{
            __html: interpretation.replace(/\n/g, "<br/>"),
          }}
        />
      </div>
    </div>
  );
}

export default ForecastResult;
