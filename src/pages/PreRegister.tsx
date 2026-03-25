import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import Webcam from "react-webcam";
import { User, Building, Phone, Mail, UserCheck, Calendar, Clock, ArrowRight, CheckCircle2, Camera, X, RotateCcw } from "lucide-react";
import Layout from "../components/Layout";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const WebcamComponent = Webcam as any;

export default function PreRegister() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<any>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    phone: "",
    email: "",
    personToMeet: "",
    purpose: "",
    date: "",
    time: "",
    photo: ""
  });

  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setFormData(prev => ({ ...prev, photo: imageSrc }));
      setShowWebcam(false);
      toast.success("Photo captured!");
    }
  }, [webcamRef]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const qrId = Math.random().toString(36).substr(2, 9);
      const visitorData = {
        ...formData,
        status: "Pending",
        preRegistered: true,
        qrCodeId: qrId,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "visitors"), visitorData);
      
      setQrData({
        id: docRef.id,
        qrId: qrId,
        name: formData.fullName,
        host: formData.personToMeet
      });
      
      setStep(2);
      toast.success("Pre-registration successful!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "visitors");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl text-brand-dark mb-4">Visitor Pre-Registration</h1>
            <p className="text-gray-600">Fill in your details for a faster check-in experience upon arrival.</p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-soft"
          >
            {step === 1 ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col items-center mb-8">
                  <div className="relative group">
                    <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-200 group-hover:border-brand-coral transition-colors">
                      {formData.photo ? (
                        <img src={formData.photo} alt="Visitor" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-gray-300" />
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={() => setShowWebcam(true)}
                      className="absolute -bottom-2 -right-2 p-2 bg-brand-dark text-white rounded-xl shadow-lg hover:bg-brand-coral transition-colors"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                    {formData.photo && (
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, photo: "" }))}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-3">Add a photo for your visitor pass (optional)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup 
                    label="Full Name" 
                    name="fullName" 
                    icon={<User className="w-5 h-5" />} 
                    value={formData.fullName} 
                    onChange={handleChange} 
                    required 
                  />
                  <InputGroup 
                    label="Company Name" 
                    name="companyName" 
                    icon={<Building className="w-5 h-5" />} 
                    value={formData.companyName} 
                    onChange={handleChange} 
                    required 
                  />
                  <InputGroup 
                    label="Phone Number" 
                    name="phone" 
                    type="tel" 
                    icon={<Phone className="w-5 h-5" />} 
                    value={formData.phone} 
                    onChange={handleChange} 
                    required 
                  />
                  <InputGroup 
                    label="Email Address" 
                    name="email" 
                    type="email" 
                    icon={<Mail className="w-5 h-5" />} 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                  />
                  <InputGroup 
                    label="Person to Meet" 
                    name="personToMeet" 
                    icon={<UserCheck className="w-5 h-5" />} 
                    value={formData.personToMeet} 
                    onChange={handleChange} 
                    required 
                  />
                  <InputGroup 
                    label="Purpose of Visit" 
                    name="purpose" 
                    icon={<ArrowRight className="w-5 h-5" />} 
                    value={formData.purpose} 
                    onChange={handleChange} 
                    required 
                  />
                  <InputGroup 
                    label="Date" 
                    name="date" 
                    type="date" 
                    icon={<Calendar className="w-5 h-5" />} 
                    value={formData.date} 
                    onChange={handleChange} 
                    required 
                  />
                  <InputGroup 
                    label="Time" 
                    name="time" 
                    type="time" 
                    icon={<Clock className="w-5 h-5" />} 
                    value={formData.time} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="pt-6">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full btn-pill btn-dark text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Processing..." : "Complete Pre-Registration"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="flex justify-center mb-6">
                  <div className="bg-green-100 p-4 rounded-full">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl mb-2">Registration Confirmed!</h2>
                <p className="text-gray-600 mb-8">Please save or screenshot this QR code for your visit.</p>
                
                <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-gray-200 inline-block mb-8">
                  <QRCodeSVG 
                    value={JSON.stringify(qrData)} 
                    size={200}
                    level="H"
                  />
                </div>

                <div className="text-left bg-gray-50 p-6 rounded-xl space-y-3 max-w-sm mx-auto mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Visitor:</span>
                    <span className="font-semibold">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Host:</span>
                    <span className="font-semibold">{formData.personToMeet}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Date:</span>
                    <span className="font-semibold">{formData.date} at {formData.time}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setStep(1)} 
                  className="btn-pill btn-outline"
                >
                  Register Another Visitor
                </button>
              </div>
            )}
          </motion.div>
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
  return (
    <div className="space-y-2">
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
