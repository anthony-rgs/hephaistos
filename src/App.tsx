import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { routes } from "@/utils";

export default function App() {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          {routes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={element}
            />
          ))}
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
}
