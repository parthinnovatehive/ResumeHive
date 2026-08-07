"use client";

import React, { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  X, 
  RefreshCw, 
  ShieldCheck, 
  GraduationCap, 
  Building2, 
  FileText, 
  Award,
  Video
} from "lucide-react";
import { api } from "@/lib/api/client";

export default function SuperAdminStudentsPage() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [editModalStudent, setEditModalStudent] = useState<any>(null);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any>(null);

  // Forms
  const [addForm, setAddForm] = useState({ email: "", password: "", college_name: "", role: "student" });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/superadmin/students");
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to load students", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/superadmin/students", addForm);
      setShowAddModal(false);
      setAddForm({ email: "", password: "", college_name: "", role: "student" });
      loadStudents();
      alert("User account created successfully!");
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Failed to create user account");
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalStudent) return;
    try {
      await api.put(`/superadmin/students/${editModalStudent.id}`, {
        email: editModalStudent.email,
        college_name: editModalStudent.college_name,
        role: editModalStudent.role
      });
      setEditModalStudent(null);
      loadStudents();
      alert("User updated successfully!");
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Failed to update user");
    }
  };

  const handleDeleteStudent = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user and all associated data?")) return;
    try {
      await api.delete(`/superadmin/students/${id}`);
      loadStudents();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const handleViewStudentDetails = async (id: number) => {
    try {
      const res = await api.get(`/superadmin/students/${id}`);
      setSelectedStudentDetail(res.data);
    } catch (err) {
      alert("Failed to fetch student details");
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.college_name && s.college_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === "all" || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="text-indigo-400" size={24} /> Students &amp; Users Control
          </h1>
          <p className="text-xs text-slate-400">Manage user accounts, assign roles (Student, Teacher, HOD, Super Admin), and view performance.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 shrink-0 shadow-md shadow-blue-600/20"
        >
          <Plus size={16} /> Add User Account
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 rounded-3xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search users by email or college name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-bold shrink-0">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white outline-none focus:border-indigo-500 font-semibold"
          >
            <option value="all">All Roles ({students.length})</option>
            <option value="student">Student</option>
            <option value="college_teacher">College Teacher</option>
            <option value="college_hod">College HOD</option>
            <option value="superadmin">Super Admin</option>
          </select>
        </div>
      </div>

      {/* Students Datatable */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-800">
              <tr>
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">User Email</th>
                <th className="py-4 px-6">College</th>
                <th className="py-4 px-6">Assigned Role</th>
                <th className="py-4 px-6">Resumes</th>
                <th className="py-4 px-6">Coding Tests</th>
                <th className="py-4 px-6">Mock Interviews</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6 font-mono text-slate-500">#{st.id}</td>
                  <td className="py-4 px-6">
                    <span className="font-extrabold text-white block">{st.email}</span>
                    <span className="text-[10px] text-slate-500">Created: {st.created_at?.slice(0, 10)}</span>
                  </td>
                  <td className="py-4 px-6 text-slate-300">{st.college_name || "—"}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                      st.role === "superadmin" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" :
                      st.role === "college_hod" ? "bg-teal-500/20 text-teal-400 border border-teal-500/30" :
                      st.role === "college_teacher" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                      "bg-slate-800 text-slate-400"
                    }`}>
                      {st.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-blue-400">{st.resumes_count}</td>
                  <td className="py-4 px-6 font-bold text-amber-400">{st.tests_taken}</td>
                  <td className="py-4 px-6 font-bold text-purple-400">{st.interviews_taken}</td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => handleViewStudentDetails(st.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors"
                      title="Inspect Student Performance Drawer"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => setEditModalStudent(st)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
                      title="Edit User Role &amp; Information"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(st.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-rose-400 transition-colors"
                      title="Delete User Account"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-extrabold text-white">Create New Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">College Name</label>
                <input
                  type="text"
                  placeholder="e.g. PCCOE / IIT Bombay"
                  value={addForm.college_name}
                  onChange={(e) => setAddForm({ ...addForm, college_name: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Assigned Role</label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 font-bold"
                >
                  <option value="student">Student</option>
                  <option value="college_teacher">College Teacher</option>
                  <option value="college_hod">College HOD</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-md"
              >
                Create User Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit User Modal */}
      {editModalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-extrabold text-white">Edit User Record &amp; Role</h3>
              <button onClick={() => setEditModalStudent(null)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdateStudent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Email</label>
                <input
                  type="email"
                  value={editModalStudent.email}
                  onChange={(e) => setEditModalStudent({ ...editModalStudent, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">College Name</label>
                <input
                  type="text"
                  value={editModalStudent.college_name || ""}
                  onChange={(e) => setEditModalStudent({ ...editModalStudent, college_name: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Role</label>
                <select
                  value={editModalStudent.role}
                  onChange={(e) => setEditModalStudent({ ...editModalStudent, role: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none font-bold"
                >
                  <option value="student">Student</option>
                  <option value="college_teacher">College Teacher</option>
                  <option value="college_hod">College HOD</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-colors"
              >
                Save Role Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Student Detail Performance Drawer */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-xl h-full p-6 overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-white">{selectedStudentDetail.email}</h3>
                <p className="text-xs text-slate-400">{selectedStudentDetail.college_name || "No College Specified"}</p>
              </div>
              <button onClick={() => setSelectedStudentDetail(null)} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-slate-500 font-bold block">Resumes Built</span>
                <span className="text-2xl font-black text-blue-400">{selectedStudentDetail.resumes?.length || 0}</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-slate-500 font-bold block">Tests Practiced</span>
                <span className="text-2xl font-black text-amber-400">{selectedStudentDetail.tests_taken_count || 0}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Video size={16} className="text-purple-400" /> Mock Interview Attempts ({selectedStudentDetail.interviews?.length || 0})
              </h4>
              {selectedStudentDetail.interviews?.map((iv: any) => (
                <div key={iv.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-purple-400">{iv.category_name}</span>
                    <span className={`uppercase text-[10px] ${iv.status === "completed" ? "text-emerald-400" : "text-amber-400"}`}>
                      {iv.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Started: {iv.started_at?.slice(0, 16)}</span>
                    <span className={iv.flag_count > 0 ? "text-rose-400 font-bold" : ""}>{iv.flag_count} Flags</span>
                  </div>
                  {iv.report && (
                    <div className="mt-2 p-2 bg-slate-900 rounded-xl text-[10px] text-slate-300 font-mono">
                      Overall Score: {iv.report.overall_score || "N/A"}/10
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
