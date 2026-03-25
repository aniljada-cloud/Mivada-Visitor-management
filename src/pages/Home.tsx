import React from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Shield, UserPlus, LogIn, CheckCircle, Bell, Printer } from "lucide-react";
import Layout from "../components/Layout";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-brand-gradient py-24 md:py-32">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-display font-bold text-white leading-tight"
            >
              Smart Visitor Management for Secure Workspaces
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-xl text-white/90 font-medium"
            >
              Streamline your reception, enhance security, and provide a professional first impression for every visitor.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link to="/pre-register" className="btn-pill btn-dark text-lg flex items-center justify-center gap-2">
                <UserPlus className="w-5 h-5" />
                Pre-Register Visitor
              </Link>
              <Link to="/dashboard" className="btn-pill bg-white text-brand-dark hover:bg-opacity-90 text-lg flex items-center justify-center gap-2">
                <LogIn className="w-5 h-5" />
                Employee Login
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Abstract Shapes */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl text-brand-dark">Powerful Features for Modern Offices</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">Everything you need to manage your workspace visitors efficiently and securely.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<CheckCircle className="w-8 h-8 text-brand-coral" />}
              title="Digital Check-in"
              description="Fast, paperless check-in process for visitors at your reception kiosk."
            />
            <FeatureCard 
              icon={<UserPlus className="w-8 h-8 text-brand-coral" />}
              title="Pre-Registration"
              description="Allow visitors to fill in their details before they even arrive at the office."
            />
            <FeatureCard 
              icon={<Printer className="w-8 h-8 text-brand-coral" />}
              title="Badge Printing"
              description="Automatically generate and print visitor badges with QR codes for tracking."
            />
            <FeatureCard 
              icon={<Bell className="w-8 h-8 text-brand-coral" />}
              title="Instant Notifications"
              description="Notify employees immediately via email or SMS when their visitor arrives."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl text-brand-dark">How It Works</h2>
            <p className="mt-4 text-gray-600">A simple 3-step process for a seamless visitor experience.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <StepCard 
              number="01"
              title="Register"
              description="Visitor pre-registers online or checks in at the reception kiosk."
            />
            <StepCard 
              number="02"
              title="Check-in"
              description="Scan QR code or enter details. Host receives an instant notification."
            />
            <StepCard 
              number="03"
              title="Exit"
              description="Visitor checks out easily, providing feedback on their visit."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-dark rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-brand-gradient opacity-10"></div>
            <h2 className="text-3xl md:text-4xl mb-6 relative z-10">Ready to secure your workspace?</h2>
            <p className="text-gray-400 mb-10 text-lg relative z-10">Join hundreds of companies using Mivada SecurePass for smarter visitor management.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Link to="/admin" className="btn-pill bg-white text-brand-dark hover:bg-gray-100">Get Started Now</Link>
              <Link to="/kiosk" className="btn-pill border border-white/20 hover:bg-white/10">Try Kiosk Mode</Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="card-soft hover:shadow-md transition-shadow">
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl mb-3">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="text-center">
      <div className="text-6xl font-display font-bold text-brand-coral/10 mb-6">{number}</div>
      <h3 className="text-2xl mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
