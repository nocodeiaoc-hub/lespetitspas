import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import type { JSX } from "react";
import type { Role } from "./data/types";
import { AppStateProvider, useApp } from "./state/AppState";
import { Layout } from "./components/Layout";
import { Toast } from "./components/Toast";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { StaffChildren } from "./pages/staff/StaffChildren";
import { StaffChildDetail } from "./pages/staff/StaffChildDetail";
import { StaffMessages } from "./pages/staff/StaffMessages";
import { ParentChildren } from "./pages/parent/ParentChildren";
import { ParentChildDetail } from "./pages/parent/ParentChildDetail";
import { ParentNewMessage } from "./pages/parent/ParentNewMessage";

function RequireRole({ role, children }: { role: Role; children: JSX.Element }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== role) {
    return <Navigate to={currentUser.role === "staff" ? "/staff" : "/parent"} replace />;
  }
  return <Layout>{children}</Layout>;
}

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/staff"
        element={<RequireRole role="staff"><StaffChildren /></RequireRole>}
      />
      <Route
        path="/staff/children/:id"
        element={<RequireRole role="staff"><StaffChildDetail /></RequireRole>}
      />
      <Route
        path="/staff/messages"
        element={<RequireRole role="staff"><StaffMessages /></RequireRole>}
      />

      <Route
        path="/parent"
        element={<RequireRole role="parent"><ParentChildren /></RequireRole>}
      />
      <Route
        path="/parent/children/:id"
        element={<RequireRole role="parent"><ParentChildDetail /></RequireRole>}
      />
      <Route
        path="/parent/messages/new"
        element={<RequireRole role="parent"><ParentNewMessage /></RequireRole>}
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <HashRouter>
        <Router />
        <Toast />
      </HashRouter>
    </AppStateProvider>
  );
}
