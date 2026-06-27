import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { CinematicTrailer } from "./CinematicTrailer";
import "./styles.css";

const params = new URLSearchParams(window.location.search);
const Root = params.has("scene") ? CinematicTrailer : App;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
