/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import PreRegister from "./pages/PreRegister";
import Kiosk from "./pages/Kiosk";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import CheckOut from "./pages/CheckOut";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pre-register" element={<PreRegister />} />
            <Route path="/kiosk" element={<Kiosk />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/check-out" element={<CheckOut />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
