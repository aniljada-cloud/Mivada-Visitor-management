import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, Search, User, Clock, Star, CheckCircle2, ArrowLeft, Building } from "lucide-react";
import Layout from "../components/Layout";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, query, where, getDocs, limit, updateDoc, doc, onSnapshot } from "firebase/firestore";
import { notificationService } from "../services/notificationService";

export default function CheckOut() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"search" | "confirm" | "feedback" | "done">("search");
  const [visitor, setVisitor] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeVisitors, setActiveVisitors] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "visitors"),
      where("status", "==", "Checked-In")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const visitors = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActiveVisitors(visitors);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "visitors");
    });

    return () => unsubscribe();
  }, []);

  const selectVisitor = (v: any) => {
    setVisitor({
      id: v.id,
      name: v.fullName,
      company: v.companyName || "-",
      checkIn: v.checkInTime ? new Date(v.checkInTime).toLocaleTimeString() : "-",
      host: v.personToMeet,
      hostEmail: v.hostEmail
    });
    setStep("confirm");
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Search by name first
      let q = query(
        collection(db, "visitors"), 
        where("fullName", "==", searchTerm),
        where("status", "==", "Checked-In"),
        limit(1)
      );
      let querySnapshot = await getDocs(q);
      
      // If not found by name, try by QR ID
      if (querySnapshot.empty) {
        q = query(
          collection(db, "visitors"), 
          where("qrCodeId", "==", searchTerm),
          where("status", "==", "Checked-In"),
          limit(1)
        );
        querySnapshot = await getDocs(q);
      }
      
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        setVisitor({
          id: querySnapshot.docs[0].id,
          name: docData.fullName,
          company: docData.companyName || "-",
          checkIn: docData.checkInTime ? new Date(docData.checkInTime).toLocaleTimeString() : "-",
          host: docData.personToMeet,
          hostEmail: docData.hostEmail
        });
        setStep("confirm");
      } else {
        toast.error("No active check-in found for this name or QR ID.");
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "visitors");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "visitors", visitor.id), {
        status: "Checked-Out",
        checkOutTime: new Date().toISOString()
      });
      
      // Notify the host
      notificationService.notifyCheckOut(visitor.name, visitor.host, visitor.hostEmail);
      
      setStep("feedback");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "visitors");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "visitors", visitor.id), {
        rating: rating,
        feedback: (document.querySelector('textarea') as HTMLTextAreaElement)?.value || ""
      });
      setStep("done");
      toast.success("Check-out successful! Thank you for your visit.");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "visitors");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl text-brand-dark mb-4">Visitor Check-Out</h1>
            <p className="text-gray-600">Thank you for visiting. Please check out before you leave.</p>
          </div>

          <AnimatePresence mode="wait">
            {step === "search" && (
              <motion.div 
                key="search"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="card-soft">
                  <form onSubmit={handleSearch} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">Search by name or QR ID</label>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="e.g. John Doe"
                          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-coral/20 outline-none"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full btn-pill btn-dark text-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? "Searching..." : "Find My Visit"}
                    </button>
                  </form>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-brand-dark flex items-center gap-2 px-1">
                    <User className="w-5 h-5 text-brand-coral" />
                    Currently Checked In ({activeVisitors.length})
                  </h3>
                  
                  {activeVisitors.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {activeVisitors
                        .filter(v => 
                          v.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.qrCodeId?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((v) => (
                        <motion.div 
                          key={v.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="card-soft flex items-center justify-between p-4 hover:border-brand-coral transition-colors group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-brand-coral/10 group-hover:text-brand-coral transition-colors overflow-hidden">
                              {v.photo ? (
                                <img src={v.photo} alt={v.fullName} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-6 h-6" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-brand-dark">{v.fullName}</h4>
                              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                <span className="flex items-center gap-1">
                                  <Building className="w-3 h-3" />
                                  {v.companyName || "-"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {v.checkInTime ? new Date(v.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => selectVisitor(v)}
                            className="p-2.5 bg-brand-dark text-white rounded-xl shadow-sm hover:bg-brand-coral transition-colors"
                            title="Check Out"
                          >
                            <LogOut className="w-5 h-5" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="card-soft text-center py-12 text-gray-400 italic">
                      No visitors currently checked in.
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <button onClick={() => navigate("/")} className="text-sm text-gray-400 hover:text-gray-600">
                    Cancel and Return to Home
                  </button>
                </div>
              </motion.div>
            )}

            {step === "confirm" && (
              <motion.div 
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card-soft text-center"
              >
                <div className="w-20 h-20 bg-brand-coral/10 rounded-full flex items-center justify-center text-brand-coral mx-auto mb-6">
                  <User className="w-10 h-10" />
                </div>
                <h2 className="text-2xl mb-1">{visitor.name}</h2>
                <p className="text-gray-500 mb-8">{visitor.company}</p>
                
                <div className="bg-gray-50 rounded-2xl p-6 text-left space-y-4 mb-8">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Checked In:</span>
                    </div>
                    <span className="font-semibold">{visitor.checkIn}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 text-gray-500">
                      <User className="w-4 h-4" />
                      <span className="text-sm">Host:</span>
                    </div>
                    <span className="font-semibold">{visitor.host}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleCheckOut} 
                    disabled={loading}
                    className="btn-pill btn-dark flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <LogOut className="w-5 h-5" />
                    {loading ? "Checking Out..." : "Confirm Check-Out"}
                  </button>
                  <button onClick={() => setStep("search")} className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-gray-600">
                    <ArrowLeft className="w-4 h-4" />
                    Not you? Search again
                  </button>
                </div>
              </motion.div>
            )}

            {step === "feedback" && (
              <motion.div 
                key="feedback"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card-soft text-center"
              >
                <h2 className="text-2xl mb-2">How was your visit?</h2>
                <p className="text-gray-500 mb-8">Your feedback helps us improve our workspace experience.</p>
                
                <div className="flex justify-center gap-4 mb-10">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-2 transition-all duration-200 ${rating >= star ? "text-yellow-400 scale-125" : "text-gray-200 hover:text-yellow-200"}`}
                    >
                      <Star className="w-10 h-10 fill-current" />
                    </button>
                  ))}
                </div>

                <textarea 
                  placeholder="Optional: Share your thoughts..."
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-coral/20 outline-none mb-8 min-h-[120px]"
                ></textarea>

                <button 
                  onClick={handleFeedback} 
                  disabled={loading}
                  className="w-full btn-pill btn-dark disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit & Finish"}
                </button>
              </motion.div>
            )}

            {step === "done" && (
              <motion.div 
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card-soft text-center py-12"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl mb-2">Safe Travels!</h2>
                <p className="text-gray-500 mb-8">You have been successfully checked out. We hope to see you again soon.</p>
                <button onClick={() => navigate("/")} className="btn-pill btn-outline">Return to Home</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
