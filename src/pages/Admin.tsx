import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, Users, FileText, Settings, ShieldAlert, 
  TrendingUp, Download, Plus, Search, Filter, MoreVertical, Lock, X, Camera, User as UserIcon, Building, Phone, Mail, UserCheck, ArrowRight
} from "lucide-react";
import Layout from "../components/Layout";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import Webcam from "react-webcam";

const WebcamComponent = Webcam as any;

export default function Admin() {
  const { user, loading: authLoading, login } = useAuth();
  const [activeTab, setActiveTab] = useState("logs");
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [newVisitor, setNewVisitor] = useState({
    fullName: "",
    companyName: "",
    phone: "",
    email: "",
    personToMeet: "",
    purpose: "",
    photo: ""
  });

  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setNewVisitor(prev => ({ ...prev, photo: imageSrc }));
      setShowWebcam(false);
      toast.success("Photo captured!");
    }
  }, [webcamRef]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, "visitors"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const visitorLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(visitorLogs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "visitors");
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "visitors"), {
        ...newVisitor,
        status: "Checked-In",
        checkInTime: new Date().toISOString(),
        preRegistered: false,
        createdAt: serverTimestamp()
      });
      toast.success("Visitor added and checked in!");
      setShowAddModal(false);
      setNewVisitor({
        fullName: "",
        companyName: "",
        phone: "",
        email: "",
        personToMeet: "",
        purpose: "",
        photo: ""
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "visitors");
    }
  };

  const exportToExcel = () => {
    if (logs.length === 0) {
      toast.error("No data available to export.");
      return;
    }

    try {
      // Prepare data for Excel
      const exportData = logs.map(log => ({
        "Full Name": log.fullName,
        "Company": log.companyName || "N/A",
        "Email": log.email,
        "Person to Meet": log.personToMeet,
        "Purpose": log.purpose || "N/A",
        "Status": log.status,
        "Check-In Time": log.checkInTime ? new Date(log.checkInTime).toLocaleString() : "N/A",
        "Check-Out Time": log.checkOutTime ? new Date(log.checkOutTime).toLocaleString() : "N/A",
        "Pre-Registered": log.preRegistered ? "Yes" : "No",
        "Rating": log.rating || "N/A",
        "Feedback": log.feedback || "N/A",
        "Created At": log.createdAt ? (log.createdAt.toDate ? log.createdAt.toDate().toLocaleString() : new Date(log.createdAt).toLocaleString()) : "N/A"
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Visitor Logs");

      // Generate Excel file and trigger download
      const fileName = `Visitor_Logs_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success("Report exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export report.");
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-brand-coral border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center card-soft p-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
              <Lock className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-brand-dark mb-4">Admin Access Restricted</h2>
            <p className="text-gray-600 mb-8">Please login with an administrator account to access the management panel.</p>
            <button onClick={login} className="btn-pill btn-dark w-full py-3">Login as Admin</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full md:w-64 space-y-2">
              <SidebarItem 
                icon={<LayoutDashboard className="w-5 h-5" />} 
                label="Overview" 
                active={activeTab === "overview"} 
                onClick={() => setActiveTab("overview")} 
              />
              <SidebarItem 
                icon={<FileText className="w-5 h-5" />} 
                label="Visitor Logs" 
                active={activeTab === "logs"} 
                onClick={() => setActiveTab("logs")} 
              />
              <SidebarItem 
                icon={<Users className="w-5 h-5" />} 
                label="Employee Management" 
                active={activeTab === "employees"} 
                onClick={() => setActiveTab("employees")} 
              />
              <SidebarItem 
                icon={<TrendingUp className="w-5 h-5" />} 
                label="Reports & Analytics" 
                active={activeTab === "reports"} 
                onClick={() => setActiveTab("reports")} 
              />
              <SidebarItem 
                icon={<ShieldAlert className="w-5 h-5" />} 
                label="Security Settings" 
                active={activeTab === "security"} 
                onClick={() => setActiveTab("security")} 
              />
              <SidebarItem 
                icon={<Settings className="w-5 h-5" />} 
                label="General Settings" 
                active={activeTab === "settings"} 
                onClick={() => setActiveTab("settings")} 
              />
            </aside>

            {/* Main Content */}
            <main className="flex-grow space-y-8">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl text-brand-dark capitalize">{activeTab.replace("-", " ")}</h1>
                <div className="flex gap-3">
                  <button 
                    onClick={exportToExcel}
                    className="btn-pill btn-outline py-2 px-4 flex items-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" /> Export
                  </button>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="btn-pill btn-dark py-2 px-4 flex items-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" /> Add New
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <AdminStatCard label="Today's Visitors" value="24" trend="+12%" />
                <AdminStatCard label="Average Visit Time" value="45m" trend="-5%" />
                <AdminStatCard label="Active Visitors" value="8" trend="Steady" />
                <AdminStatCard label="Security Alerts" value="0" trend="Safe" />
              </div>

              {/* Content Area */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input 
                        type="text" 
                        placeholder="Search logs..." 
                        className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-coral/20 outline-none w-64 text-sm"
                      />
                    </div>
                    <button className="p-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-100">
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-semibold">Visitor</th>
                        <th className="px-6 py-4 font-semibold">Host</th>
                        <th className="px-6 py-4 font-semibold">Check-In</th>
                        <th className="px-6 py-4 font-semibold">Check-Out</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-brand-dark">{log.fullName}</td>
                          <td className="px-6 py-4 text-gray-600">{log.personToMeet}</td>
                          <td className="px-6 py-4 text-gray-600">
                            {log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              log.status === "Checked-In" ? "bg-blue-100 text-blue-700" : 
                              log.status === "Checked-Out" ? "bg-gray-100 text-gray-600" :
                              "bg-orange-100 text-orange-700"
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      <AddVisitorModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSubmit={handleAddVisitor}
        formData={newVisitor}
        setFormData={setNewVisitor}
        onOpenWebcam={() => setShowWebcam(true)}
      />

      <WebcamModal 
        isOpen={showWebcam} 
        onClose={() => setShowWebcam(false)} 
        onCapture={capture} 
        webcamRef={webcamRef} 
      />
    </Layout>
  );
}

function AddVisitorModal({ isOpen, onClose, onSubmit, formData, setFormData, onOpenWebcam }: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-brand-dark">Add New Visitor</h3>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600"><X /></button>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup 
                  label="Full Name" 
                  icon={<UserIcon className="w-5 h-5" />}
                  value={formData.fullName}
                  onChange={(e: any) => setFormData({...formData, fullName: e.target.value})}
                  required
                />
                <InputGroup 
                  label="Company" 
                  icon={<Building className="w-5 h-5" />}
                  value={formData.companyName}
                  onChange={(e: any) => setFormData({...formData, companyName: e.target.value})}
                  required
                />
                <InputGroup 
                  label="Phone Number" 
                  icon={<Phone className="w-5 h-5" />}
                  value={formData.phone}
                  onChange={(e: any) => setFormData({...formData, phone: e.target.value})}
                  required
                />
                <InputGroup 
                  label="Email Address" 
                  icon={<Mail className="w-5 h-5" />}
                  type="email"
                  value={formData.email}
                  onChange={(e: any) => setFormData({...formData, email: e.target.value})}
                  required
                />
                <InputGroup 
                  label="Person to Meet" 
                  icon={<UserCheck className="w-5 h-5" />}
                  value={formData.personToMeet}
                  onChange={(e: any) => setFormData({...formData, personToMeet: e.target.value})}
                  required
                />
                <InputGroup 
                  label="Purpose of Visit" 
                  icon={<FileText className="w-5 h-5" />}
                  value={formData.purpose}
                  onChange={(e: any) => setFormData({...formData, purpose: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Visitor Photo</label>
                {formData.photo ? (
                  <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-2 border-brand-coral">
                    <img src={formData.photo} alt="Visitor" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, photo: ""})}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-red-500 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenWebcam}
                    className="w-40 h-40 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-brand-coral hover:text-brand-coral transition-colors"
                  >
                    <Camera className="w-8 h-8" />
                    <span className="text-xs font-medium">Take Photo</span>
                  </button>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={onClose} className="flex-1 btn-pill btn-outline">Cancel</button>
                <button type="submit" className="flex-1 btn-pill btn-dark">Check In Visitor</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function WebcamModal({ isOpen, onClose, onCapture, webcamRef }: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
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

function InputGroup({ label, icon, type = "text", ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
        <input
          type={type}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-coral focus:border-transparent outline-none transition-all"
          {...props}
        />
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        active 
          ? "bg-brand-dark text-white shadow-lg shadow-brand-dark/20" 
          : "text-gray-500 hover:bg-white hover:text-brand-coral"
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

function AdminStatCard({ label, value, trend }: { label: string, value: string, trend: string }) {
  const isPositive = trend.startsWith("+");
  const isNeutral = trend === "Steady" || trend === "Safe";

  return (
    <div className="card-soft">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex items-end justify-between">
        <h3 className="text-2xl font-bold text-brand-dark">{value}</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
          isNeutral ? "bg-gray-100 text-gray-500" :
          isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {trend}
        </span>
      </div>
    </div>
  );
}
