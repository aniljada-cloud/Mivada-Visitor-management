import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Webcam from "react-webcam";
import { toast } from "sonner";
import { Camera, QrCode, User, Building, Phone, Mail, UserCheck, ArrowRight, CheckCircle2, Printer, X, RotateCcw, Upload, Calendar, Clock } from "lucide-react";
import Layout from "../components/Layout";
import Logo from "../components/Logo";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit, updateDoc, doc } from "firebase/firestore";
import { notificationService } from "../services/notificationService";

const WebcamComponent = Webcam as any;

export default function Kiosk() {
  const [mode, setMode] = useState<"manual" | "badge">("manual");
  const [loading, setLoading] = useState(false);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [visitorData, setVisitorData] = useState({
    fullName: "",
    companyName: "",
    phone: "",
    email: "",
    personToMeet: "",
    hostEmail: "",
    purpose: "",
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    photo: ""
  });

  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setVisitorData(prev => ({ ...prev, photo: imageSrc }));
      setShowWebcam(false);
      toast.success("Photo captured!");
    }
  }, [webcamRef]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size too large. Please upload an image under 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setVisitorData(prev => ({ ...prev, photo: reader.result as string }));
        toast.success("Photo uploaded!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!visitorData.photo) {
      setShowWebcam(true);
      return;
    }

    setLoading(true);
    try {
      if (visitorId) {
        await updateDoc(doc(db, "visitors", visitorId), {
          ...visitorData,
          status: "Checked-In",
          checkInTime: new Date().toISOString()
        });
      } else {
        const docRef = await addDoc(collection(db, "visitors"), {
          ...visitorData,
          status: "Checked-In",
          checkInTime: new Date().toISOString(),
          preRegistered: false,
          createdAt: serverTimestamp()
        });
        setVisitorId(docRef.id);
      }
      setMode("badge");
      toast.success("Check-in successful!");
      
      // Notify the host
      notificationService.notifyCheckIn(visitorData.fullName, visitorData.personToMeet, visitorData.hostEmail);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "visitors");
    } finally {
      setLoading(false);
    }
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
              {mode === "manual" && (
                <motion.div 
                  key="manual"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="card-soft"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl">Visitor Details</h2>
                  </div>
                  <form onSubmit={handleManualSubmit} className="space-y-6">
                    <div className="flex flex-col items-center mb-8">
                      <div className="relative group">
                        <div className="w-40 h-40 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-200 group-hover:border-brand-coral transition-colors">
                          {visitorData.photo ? (
                            <img src={visitorData.photo} alt="Visitor" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-16 h-16 text-gray-300" />
                          )}
                        </div>
                        
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          <button 
                            type="button"
                            onClick={() => setShowWebcam(true)}
                            className="p-2.5 bg-brand-dark text-white rounded-xl shadow-lg hover:bg-brand-coral transition-colors"
                            title={visitorData.photo ? "Retake Photo" : "Take Photo"}
                          >
                            {visitorData.photo ? <RotateCcw className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                          </button>
                          <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2.5 bg-white text-brand-dark border border-gray-200 rounded-xl shadow-lg hover:bg-gray-50 transition-colors"
                            title="Upload Photo"
                          >
                            <Upload className="w-5 h-5" />
                          </button>
                          {visitorData.photo && (
                            <button 
                              type="button"
                              onClick={() => setVisitorData(prev => ({ ...prev, photo: "" }))}
                              className="p-2.5 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-colors"
                              title="Remove Photo"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleFileUpload}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-8">Visitor photo (required for check-in)</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup label="Full Name" icon={<User className="w-5 h-5" />} value={visitorData.fullName} onChange={(e: any) => setVisitorData({...visitorData, fullName: e.target.value})} required />
                      <InputGroup label="Company Name" icon={<Building className="w-5 h-5" />} value={visitorData.companyName} onChange={(e: any) => setVisitorData({...visitorData, companyName: e.target.value})} required />
                      <InputGroup label="Phone Number" icon={<Phone className="w-5 h-5" />} value={visitorData.phone} onChange={(e: any) => setVisitorData({...visitorData, phone: e.target.value})} required />
                      <InputGroup 
                        label="Email Address" 
                        type="email" 
                        icon={<Mail className="w-5 h-5" />} 
                        value={visitorData.email} 
                        onChange={(e: any) => setVisitorData({...visitorData, email: e.target.value})} 
                        required 
                        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                        title="Please enter a valid email address (e.g. name@company.com)"
                      />
                      <InputGroup 
                        label="Person to Meet" 
                        icon={<UserCheck className="w-5 h-5" />} 
                        value={visitorData.personToMeet} 
                        onChange={(e: any) => setVisitorData({...visitorData, personToMeet: e.target.value})} 
                        required 
                      />
                      <InputGroup 
                        label="Host Email Address" 
                        type="email" 
                        icon={<Mail className="w-5 h-5" />} 
                        value={visitorData.hostEmail} 
                        onChange={(e: any) => setVisitorData({...visitorData, hostEmail: e.target.value})} 
                        required 
                        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                        title="Please enter a valid host email address"
                      />
                      <InputGroup label="Purpose of Visit" icon={<ArrowRight className="w-5 h-5" />} value={visitorData.purpose} onChange={(e: any) => setVisitorData({...visitorData, purpose: e.target.value})} required />
                      <InputGroup label="Date" type="date" icon={<Calendar className="w-5 h-5" />} value={visitorData.date} onChange={(e: any) => setVisitorData({...visitorData, date: e.target.value})} required />
                      <InputGroup label="Time" type="time" icon={<Clock className="w-5 h-5" />} value={visitorData.time} onChange={(e: any) => setVisitorData({...visitorData, time: e.target.value})} required />
                    </div>
                    <button type="submit" disabled={loading} className="w-full btn-pill btn-dark text-lg disabled:opacity-50">
                      {loading ? "Processing..." : visitorData.photo ? "Check In Now" : "Next: Capture Photo"}
                    </button>
                  </form>
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
                            setMode("manual");
                            setVisitorData({ 
                              fullName: "", 
                              companyName: "", 
                              phone: "", 
                              email: "", 
                              personToMeet: "", 
                              hostEmail: "",
                              purpose: "",
                              date: new Date().toISOString().split('T')[0],
                              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                              photo: "" 
                            });
                          }, 2000);
                        }} className="btn-pill btn-dark flex items-center justify-center gap-2">
                          <Printer className="w-5 h-5" />
                          Print Badge
                        </button>
                        <button onClick={() => setMode("manual")} className="text-sm text-gray-400 hover:text-gray-600">Finish</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <WebcamModal 
        isOpen={showWebcam} 
        onClose={() => setShowWebcam(false)} 
        onCapture={capture} 
        webcamRef={webcamRef} 
      />
    </Layout>
  );
}

function WebcamModal({ isOpen, onClose, onCapture, webcamRef }: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-brand-dark">Capture Photo</h3>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video mb-8">
              <WebcamComponent
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                videoConstraints={{
                  width: 1280,
                  height: 720,
                  facingMode: "user"
                }}
              />
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 btn-pill btn-outline">Cancel</button>
              <button 
                type="button" 
                onClick={onCapture} 
                className="flex-1 btn-pill btn-dark flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Capture
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function InputGroup({ label, icon, ...props }: any) {
  const isEmail = props.type === "email";
  const isEmpty = !props.value;
  
  return (
    <div className="space-y-2 text-left">
      <label className="text-sm font-semibold text-gray-700 ml-1">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
        <input 
          {...props}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-coral/20 focus:border-brand-coral outline-none transition-all invalid:border-red-500 invalid:text-red-600 peer"
        />
        <p className="mt-1 hidden peer-invalid:block text-xs text-red-500 ml-1">
          {!isEmpty && isEmail ? "Please enter a valid email address." : !isEmpty ? "Invalid input." : ""}
        </p>
      </div>
    </div>
  );
}
