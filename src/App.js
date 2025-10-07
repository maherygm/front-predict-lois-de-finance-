import React, { useState } from "react";
import UploadForm from "./components/UploadForm";
import ForecastResult from "./components/ForecastResult";
import AskForm from "./components/AskForm";
import ChatModal from "./components/ChatModal";

function App() {
  const [forecast, setForecast] = useState(null);
  const [interpretation, setInterpretation] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className=" p-4 flex flex-col  gap-4 font-sans">
      <h1 className="text-2xl font-bold mb-4 text-center text-blue-700">
        Prévisions Lois de Finance
      </h1>
      <UploadForm
        setForecast={setForecast}
        setInterpretation={setInterpretation}
        setLoading={setLoading}
        loading={loading}
      />
      {forecast && (
        <ForecastResult forecast={forecast} interpretation={interpretation} />
      )}
      {/* <hr className="my-6" />
      <AskForm /> */}
      <ChatModal />
    </div>
  );
}

export default App;
