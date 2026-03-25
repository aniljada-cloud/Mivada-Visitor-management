import Navbar from "./Navbar";
import { ReactNode } from "react";

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-brand-gradient p-2 rounded-lg flex items-center justify-center">
                  <img 
                    src="https://mivada.com/wp-content/uploads/2023/10/Mivada-Logo-White.png" 
                    alt="Mivada Logo" 
                    className="w-8 h-8 object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback to stylized M if image fails
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-white font-bold text-xl">M</span>';
                    }}
                  />
                </div>
                <span className="text-2xl font-display font-bold tracking-tight">Mivada <span className="text-brand-coral">SecurePass</span></span>
              </div>
              <p className="text-gray-400 max-w-md">
                Smart visitor management for Mivada workspaces. Secure, efficient, and professional.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-4 text-gray-400">
                <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="/pre-register" className="hover:text-white transition-colors">Pre-Register</a></li>
                <li><a href="/kiosk" className="hover:text-white transition-colors">Kiosk Mode</a></li>
                <li><a href="/dashboard" className="hover:text-white transition-colors">Employee Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6">Contact</h3>
              <ul className="space-y-4 text-gray-400">
                <li>support@securepass.com</li>
                <li>+1 (555) 123-4567</li>
                <li>123 Secure Way, Tech City</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2026 Mivada SecurePass. All rights reserved.
            </p>
            <div className="flex gap-8 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
