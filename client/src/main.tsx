import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add Material Icons from Google CDN
const link = document.createElement("link");
link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
link.rel = "stylesheet";
document.head.appendChild(link);

// Add page title
const title = document.createElement("title");
title.textContent = "DocuAI Platform - Document Processing System";
document.head.appendChild(title);

// Add meta description
const metaDescription = document.createElement("meta");
metaDescription.name = "description";
metaDescription.content = "Upload and process documents using AI-powered extraction and analysis with DocuAI Platform.";
document.head.appendChild(metaDescription);

createRoot(document.getElementById("root")!).render(<App />);
