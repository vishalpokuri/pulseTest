import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { VideoProvider } from "./contexts/VideoContext.tsx";
import { SocketProvider } from "./contexts/SocketContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <SocketProvider>
        <VideoProvider>
          <App />
        </VideoProvider>
      </SocketProvider>
    </BrowserRouter>
  </StrictMode>
);
