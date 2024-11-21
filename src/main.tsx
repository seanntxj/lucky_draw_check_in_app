import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const getRedirectUriBasedOnEnv = () => {
  const base = import.meta.env.DEV
    ? "http://localhost:5173/"
    : import.meta.env.VITE_GIT_BASE_URL;
  const git_repo_name = import.meta.env.VITE_GIT_REPO_NAME;
  return base + git_repo_name + "/";
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
