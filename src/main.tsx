import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { KindeProvider } from "@kinde-oss/kinde-auth-react";

const getRedirectUriBasedOnEnv = () => { 
  const base = import.meta.env.DEV ? "http://localhost:5173/" : import.meta.env.VITE_GIT_BASE_URL;
  const git_repo_name = import.meta.env.VITE_GIT_REPO_NAME;
  return base + git_repo_name + "/";
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <KindeProvider
      clientId={import.meta.env.VITE_KINDE_CLIENTID}
      domain={import.meta.env.VITE_KINDE_DOMAIN}
      redirectUri={getRedirectUriBasedOnEnv()}
      logoutUri={getRedirectUriBasedOnEnv()}
    >
      <App />
    </KindeProvider>
  </StrictMode>
);
