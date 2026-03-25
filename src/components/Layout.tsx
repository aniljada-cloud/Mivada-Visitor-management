import Navbar from "./Navbar";
import Logo from "./Logo";
import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-brand-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <Logo variant="light" />
            </Link>
            <p className="text-sm text-gray-500">
              © 2026 Mivada SecurePass. Internal Use Only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
