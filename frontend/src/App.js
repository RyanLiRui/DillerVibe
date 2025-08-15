import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DrillMaster from './components/Game/DrillMaster';
import { Toaster } from './components/ui/toaster';
import "./App.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DrillMaster />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;