import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Home, Logging, CreateVideo, LastJob, RenderView } from "@/pages";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";

export default function App() {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/logging" element={<Logging />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/create-video" element={<CreateVideo />} />
              <Route path="/last-job" element={<LastJob />} />
            </Route>
          </Route>
          <Route path="/render/:jobId" element={<RenderView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
}
