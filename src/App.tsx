/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Kiosk from "./pages/Kiosk";
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
            <Route path="/kiosk" element={<Kiosk />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/check-out" element={<CheckOut />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
