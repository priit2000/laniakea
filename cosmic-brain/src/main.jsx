import React from "react";
import { createRoot } from "react-dom/client";
import CosmicBrainBuilder from "./CosmicBrainBuilder.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CosmicBrainBuilder />
  </React.StrictMode>
);
