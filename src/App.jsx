import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Formulare from "./components/Formulare";
import VideoPage from "./components/VideoPage";

function App() {
  const [jsonData, setJsonData] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Formulare setJsonData={setJsonData} />} />
        <Route path="/video" element={<VideoPage jsonData={jsonData} />} />
      </Routes>
    </Router>
  );
}
export default App;
