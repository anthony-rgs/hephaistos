import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { Home, Logging, CreateVideo, LastJob, RenderView } from "@/pages";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";

export default function App() {
  return (
    <React.StrictMode>
      <Toaster
        position="top-right"
        toastOptions={{
          classNames: {
            toast: "bg-popover border border-border text-popover-foreground shadow-lg rounded-xl text-sm",
            title: "font-semibold text-sm",
            description: "text-xs text-muted-foreground",
            success: "border-green-500/30 [&_[data-icon]]:text-green-500",
            error: "border-destructive/30 [&_[data-icon]]:text-destructive",
            info: "border-violet-400/30 [&_[data-icon]]:text-violet-400",
          },
        }}
      />
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
