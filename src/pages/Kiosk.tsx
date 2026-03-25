import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Webcam from "react-webcam";
import { toast } from "sonner";
import { Camera, QrCode, User, Building, Phone, Mail, UserCheck, ArrowRight, CheckCircle2, Printer, X } from "lucide-react";
import Layout from "../components/Layout";
import Logo from "../components/Logo";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit, updateDoc, doc } from "firebase/firestore";

const WebcamComponent = Webcam as any;

export default function Kiosk() {
  const [mode, setMode] = useState<"initial" | "scan" | "manual" | "photo" | "badge">("initial");
  const [loading, setLoading] = useState(false);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [visitorData, setVisitorData] = useState({
    fullName: "",
    companyName: "",
    phone: "",
    email: "",
    personToMeet: "",
    photo: ""
  });

  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setLoading(true);
      try {
        setVisitorData(prev => ({ ...prev, photo: imageSrc }));
        
        if (visitorId) {
          // Update existing pre-registered visitor
          await updateDoc(doc(db, "visitors", visitorId), {
            photo: imageSrc,
            status: "Checked-In",
            checkInTime: new Date().toISOString()
          });
        } else {
          // Create new visitor
          const docRef = await addDoc(collection(db, "visitors"), {
            ...visitorData,
            photo: imageSrc,
            status: "Checked-In",
            checkInTime: new Date().toISOString(),
            preRegistered: false,
            createdAt: serverTimestamp()
          });
          setVisitorId(docRef.id);
        }
        
        setMode("badge");
        toast.success("Check-in successful!");
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "visitors");
      } finally {
        setLoading(false);
      }
    }
  }, [webcamRef, visitorData, visitorId]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMode("photo");
  };

  const handleScan = () => {
    setMode("scan");
    // In a real app, this would be triggered by a QR scanner component
    // We'll simulate finding a pre-registered visitor
    setTimeout(async () => {
      try {
        const q = query(collection(db, "visitors"), where("qrCodeId", "==", "MOCK_QR"), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          setVisitorId(querySnapshot.docs[0].id);
          setVisitorData({
            fullName: docData.fullName,
            companyName: docData.companyName || "",
            phone: docData.phone || "",
            email: docData.email,
            personToMeet: docData.personToMeet,
            photo: ""
          });
          setMode("photo");
          toast.success("Pre-registration found!");
        } else {
          // Fallback for demo if no mock exists
          setVisitorData({
            fullName: "John Doe",
            companyName: "Acme Corp",
            phone: "+1 234 567 890",
            email: "john@acme.com",
            personToMeet: "Sarah Smith",
            photo: ""
          });
          setMode("photo");
          toast.success("QR Code scanned (Demo Mode)");
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "visitors");
      }
    }, 2000);
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl text-brand-dark mb-4">Reception Check-In</h1>
            <p className="text-gray-600">Welcome! Please check in to enter the workspace.</p>
          </div>

          <div className="relative min-h-[500px]">
            <AnimatePresence mode="wait">
              {mode === "initial" && (
                <motion.div 
                  key="initial"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  <KioskOption 
                    icon={<QrCode className="w-12 h-12 text-brand-coral" />}
                    title="Scan QR Code"
                    description="Fast check-in for pre-registered visitors."
                    onClick={handleScan}
                  />
                  <KioskOption 
                    icon={<User className="w-12 h-12 text-brand-coral" />}
                    title="Manual Entry"
                    description="New visitor? Enter your details manually."
                    onClick={() => setMode("manual")}
                  />
                </motion.div>
              )}

              {mode === "scan" && (
                <motion.div 
                  key="scan"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="card-soft text-center py-20"
                >
                  <div className="relative inline-block">
                    <div className="absolute inset-0 border-4 border-brand-coral rounded-2xl animate-pulse"></div>
                    <div className="bg-white p-8 rounded-2xl">
                      <QrCode className="w-32 h-32 text-gray-300" />
                    </div>
                  </div>
                  <h2 className="text-2xl mt-8 mb-4">Scanning QR Code...</h2>
                  <p className="text-gray-500">Please hold your QR code in front of the camera.</p>
                  <button onClick={() => setMode("initial")} className="mt-8 text-brand-coral font-semibold">Cancel</button>
                </motion.div>
              )}

              {mode === "manual" && (
                <motion.div 
                  key="manual"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="card-soft"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl">Visitor Details</h2>
                    <button onClick={() => setMode("initial")} className="p-2 text-gray-400 hover:text-gray-600"><X /></button>
                  </div>
                  <form onSubmit={handleManualSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup label="Full Name" icon={<User className="w-5 h-5" />} value={visitorData.fullName} onChange={(e: any) => setVisitorData({...visitorData, fullName: e.target.value})} required />
                      <InputGroup label="Company Name" icon={<Building className="w-5 h-5" />} value={visitorData.companyName} onChange={(e: any) => setVisitorData({...visitorData, companyName: e.target.value})} required />
                      <InputGroup label="Phone Number" icon={<Phone className="w-5 h-5" />} value={visitorData.phone} onChange={(e: any) => setVisitorData({...visitorData, phone: e.target.value})} required />
                      <InputGroup label="Email Address" icon={<Mail className="w-5 h-5" />} value={visitorData.email} onChange={(e: any) => setVisitorData({...visitorData, email: e.target.value})} required />
                      <InputGroup label="Person to Meet" icon={<UserCheck className="w-5 h-5" />} value={visitorData.personToMeet} onChange={(e: any) => setVisitorData({...visitorData, personToMeet: e.target.value})} required />
                    </div>
                    <button type="submit" className="w-full btn-pill btn-dark text-lg">Next: Capture Photo</button>
                  </form>
                </motion.div>
              )}

              {mode === "photo" && (
                <motion.div 
                  key="photo"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="card-soft text-center"
                >
                  <h2 className="text-2xl mb-8">Smile for the Camera!</h2>
                  <div className="relative max-w-md mx-auto rounded-2xl overflow-hidden bg-black aspect-video mb-8">
                    <WebcamComponent
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      className="w-full h-full object-cover"
                      disablePictureInPicture={true}
                      forceScreenshotSourceSize={false}
                      imageSmoothing={true}
                      mirrored={false}
                      onUserMedia={() => {}}
                      onUserMediaError={() => {}}
                      screenshotQuality={0.92}
                      videoConstraints={{
                        width: 1280,
                        height: 720,
                        facingMode: "user"
                      }}
                    />
                    <div className="absolute inset-0 border-2 border-white/20 pointer-events-none"></div>
                  </div>
                  <div className="flex justify-center gap-4">
                    <button onClick={() => setMode("manual")} className="btn-pill btn-outline">Back</button>
                    <button onClick={capture} className="btn-pill btn-dark flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      Capture Photo
                    </button>
                  </div>
                </motion.div>
              )}

              {mode === "badge" && (
                <motion.div 
                  key="badge"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-md mx-auto"
                >
                  <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                    <div className="bg-brand-gradient p-6 text-white text-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl"></div>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Logo variant="light" />
                      </div>
                      <h3 className="text-xl font-display font-bold">VISITOR PASS</h3>
                      <p className="text-sm opacity-90">SecurePass Workspace</p>
                    </div>
                    <div className="p-8 text-center">
                      <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden mb-6 border-4 border-gray-50">
                        <img src={visitorData.photo} alt="Visitor" className="w-full h-full object-cover" />
                      </div>
                      <h2 className="text-2xl font-bold mb-1">{visitorData.fullName}</h2>
                      <p className="text-gray-500 mb-6">{visitorData.companyName}</p>
                      
                      <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-left space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Host:</span>
                          <span className="font-semibold">{visitorData.personToMeet}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Date:</span>
                          <span className="font-semibold">{new Date().toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex justify-center mb-8">
                        <QrCode className="w-16 h-16 text-gray-300" />
                      </div>

                      <div className="flex flex-col gap-3">
                        <button onClick={() => {
                          toast.success("Badge printing started...");
                          setTimeout(() => {
                            setMode("initial");
                            setVisitorData({ fullName: "", companyName: "", phone: "", email: "", personToMeet: "", photo: "" });
                          }, 2000);
                        }} className="btn-pill btn-dark flex items-center justify-center gap-2">
                          <Printer className="w-5 h-5" />
                          Print Badge
                        </button>
                        <button onClick={() => setMode("initial")} className="text-sm text-gray-400 hover:text-gray-600">Finish</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function KioskOption({ icon, title, description, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="card-soft text-center py-12 hover:border-brand-coral hover:shadow-lg transition-all group"
    >
      <div className="mb-6 flex justify-center group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-2xl mb-3">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </button>
  );
}

function InputGroup({ label, icon, ...props }: any) {
  return (
    <div className="space-y-2 text-left">
      <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
        <input 
          {...props}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-coral/20 focus:border-brand-coral outline-none transition-all"
        />
      </div>
    </div>
  );
}
