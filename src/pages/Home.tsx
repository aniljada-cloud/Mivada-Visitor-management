import React from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { UserPlus, LogOut } from "lucide-react";
import Layout from "../components/Layout";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-brand-gradient py-24 md:py-32 min-h-[80vh] flex items-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-display font-bold text-white leading-tight"
            >
              Smart Visitor Management for Secure Workspaces
            </motion.h1>
            <div 
              className="mt-10 flex flex-col sm:flex-row justify-center gap-4 relative z-50"
            >
              <Link to="/kiosk" className="btn-pill btn-dark text-lg flex items-center justify-center gap-2 cursor-pointer">
                <UserPlus className="w-5 h-5" />
                Visitor Check-In
              </Link>
              <Link to="/check-out" className="btn-pill bg-white text-brand-dark hover:bg-opacity-90 text-lg flex items-center justify-center gap-2 cursor-pointer">
                <LogOut className="w-5 h-5" />
                Visitor Check-Out
              </Link>
            </div>
          </div>
        </div>
        
        {/* Abstract Shapes */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl z-0"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl z-0"></div>
      </section>
    </Layout>
  );
}
