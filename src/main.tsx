import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { KindeProvider } from "@kinde-oss/kinde-auth-react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <KindeProvider
      clientId="b707df7158804fbd818225f1698a0cef"
      domain="https://sxjtn.kinde.com"
      redirectUri="https://seanntxj.github.io/lucky_draw_check_in_app/"
      logoutUri="https://seanntxj.github.io/lucky_draw_check_in_app/"
    >
      <App />
    </KindeProvider>
  </StrictMode>
);
