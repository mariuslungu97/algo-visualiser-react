import React from "react";
import { Routes, Route } from "react-router-dom";

import WelcomePage from "./views/Welcome/WelcomePage";
import MazePage from "./views/Maze/MazePage";
import GraphPage from "./views/Graph/GraphPage";
import MatchboxPage from "./views/Matchbox/MatchboxPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="maze" element={<MazePage />} />
      <Route path="graph" element={<GraphPage />} />
      <Route path="matchbox" element={<MatchboxPage />} />
    </Routes>
  );
}

export default App;
