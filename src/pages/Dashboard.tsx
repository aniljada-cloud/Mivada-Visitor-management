import React, { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Users, Clock, CheckCircle, XCircle, Search, Filter, MoreVertical, Calendar, Lock } from "lucide-react";
import Layout from "../components/Layout";
import { db, handleFirestoreError, OperationType, auth } from "../firebase";
import { collection, onSnapshot, query, where, updateDoc, doc, orderBy } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { user, loading: authLoading, login } = useAuth();
  const [visitors, setVisitors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // In a real app, we'd filter by the current employee's name or UID
    // For this prototype, we'll show all visitors for the "Sarah Smith" host
    const q = query(
      collection(db, "visitors"), 
      where("personToMeet", "==", "Sarah Smith"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const visitorList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVisitors(visitorList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "visitors");
    });

    return () => unsubscribe();
  }, [user]);

  const handleAction = async (id: string, action: "Approved" | "Rejected") => {
    try {
      await updateDoc(doc(db, "visitors", id), { status: action });
      toast.success(`Visitor ${action.toLowerCase()} successfully!`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "visitors");
    }
  };

  const filteredVisitors = visitors.filter(v => 
    v.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h2 className="text-2xl font-bold text-brand-dark mb-4">Access Restricted</h2>
            <p className="text-gray-600 mb-8">Please login with your employee account to access the dashboard.</p>
            <button onClick={login} className="btn-pill btn-dark w-full py-3">Login to Continue</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <h1 className="text-3xl text-brand-dark">Employee Dashboard</h1>
              <p className="text-gray-500 mt-1">Welcome back, Sarah Smith. You have 2 pending visitor requests.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search visitors..." 
                  className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-coral/20 outline-none w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <StatCard icon={<Users className="text-blue-500" />} label="Total Visitors" value="12" />
            <StatCard icon={<Clock className="text-orange-500" />} label="Pending Requests" value="2" />
            <StatCard icon={<CheckCircle className="text-green-500" />} label="Checked In" value="5" />
          </div>

          {/* Visitor List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl">Upcoming Visitors</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Today, {new Date().toLocaleDateString()}</span>
              </div>
            </div>
            
            {loading ? (
              <div className="p-12 text-center text-gray-500">
                <div className="animate-spin w-8 h-8 border-4 border-brand-coral border-t-transparent rounded-full mx-auto mb-4"></div>
                Loading visitors...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold">Visitor</th>
                      <th className="px-6 py-4 font-semibold">Company</th>
                      <th className="px-6 py-4 font-semibold">Time</th>
                      <th className="px-6 py-4 font-semibold">Purpose</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredVisitors.map((visitor) => (
                      <motion.tr 
                        key={visitor.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-coral/10 rounded-full flex items-center justify-center text-brand-coral font-bold overflow-hidden">
                              {visitor.photo ? (
                                <img src={visitor.photo} alt={visitor.fullName} className="w-full h-full object-cover" />
                              ) : (
                                visitor.fullName.charAt(0)
                              )}
                            </div>
                            <span className="font-medium text-brand-dark">{visitor.fullName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{visitor.companyName || "-"}</td>
                        <td className="px-6 py-4 text-gray-600">{visitor.checkInTime ? new Date(visitor.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (visitor.time || "-")}</td>
                        <td className="px-6 py-4 text-gray-600">{visitor.purpose}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            visitor.status === "Approved" ? "bg-green-100 text-green-700" :
                            visitor.status === "Pending" ? "bg-orange-100 text-orange-700" :
                            visitor.status === "Checked-In" ? "bg-blue-100 text-blue-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {visitor.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {visitor.status === "Pending" ? (
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleAction(visitor.id, "Approved")}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleAction(visitor.id, "Rejected")}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && filteredVisitors.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                No visitors found matching your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="card-soft flex items-center gap-6">
      <div className="p-4 bg-gray-50 rounded-2xl">{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-brand-dark">{value}</p>
      </div>
    </div>
  );
}
