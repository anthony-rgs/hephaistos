import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";
import App from "@/App";
import { store } from "@/store";

// Restaure le thème avant le premier rendu
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark");
  document.body.classList.remove("light");
} else {
  document.body.classList.remove("dark");
  document.body.classList.add("light");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
