import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { WebSocketProvider } from "./lib/websocket";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./index.css";
import { Toaster } from "@/components/ui/toaster";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <WebSocketProvider>
      <App />
      <Toaster />
    </WebSocketProvider>
  </QueryClientProvider>
);
