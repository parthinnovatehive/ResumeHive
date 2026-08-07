"use client";

import React, { useEffect, useState } from "react";
import { 
  FileCode2, 
  Plus, 
  Trash2, 
  UploadCloud, 
  Clock, 
  X, 
  Search, 
  Code,
  CheckCircle2,
  FileText
} from "lucide-react";
import { api } from "@/lib/api/client";

export default function SuperAdminAssessmentsPage() {
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [searchQuestion, setSearchQuestion] = useState("");

  // Modals
  const [showAddAssessmentModal, setShowAddAssessmentModal] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showCsvImportModal, setShowCsvImportModal] = useState(false);

  // Forms
  const [assessmentForm, setAssessmentForm] = useState({ title: "", duration_minutes: 60 });
  const [questionForm, setQuestionForm] = useState({
    assessment_id: 1,
    title: "",
    description_html: "",
    difficulty: "Medium",
    constraints: "1 <= N <= 10^5",
    test_cases_json: '[{"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]"}]',
    python_stub: "def solve():\n    pass",
    js_stub: "function solve() {\n    \n}"
  });
  const [csvFile, setCsvFile] = useState<File | null>(null);

  useEffect(() => {
    loadAssessmentsData();
  }, []);

  const loadAssessmentsData = async () => {
    setLoading(true);
    try {
      const [assessRes, questionsRes] = await Promise.all([
        api.get("/superadmin/assessments"),
        api.get("/superadmin/questions")
      ]);
      setAssessments(assessRes.data);
      setQuestions(questionsRes.data);

      if (assessRes.data.length > 0) {
        setQuestionForm(prev => ({ ...prev, assessment_id: assessRes.data[0].id }));
      }
    } catch (err) {
      console.error("Failed to load assessment data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/superadmin/assessments", assessmentForm);
      setShowAddAssessmentModal(false);
      setAssessmentForm({ title: "", duration_minutes: 60 });
      loadAssessmentsData();
      alert("Assessment Test Suite created!");
    } catch (err) {
      alert("Failed to create assessment");
    }
  };

  const handleDeleteAssessment = async (id: number) => {
    if (!confirm("Delete this assessment suite?")) return;
    try {
      await api.delete(`/superadmin/assessments/${id}`);
      loadAssessmentsData();
    } catch (err) {
      alert("Failed to delete assessment");
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/superadmin/questions", questionForm);
      setShowAddQuestionModal(false);
      loadAssessmentsData();
      alert("Question saved successfully!");
    } catch (err) {
      alert("Failed to create question");
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm("Delete this coding question?")) return;
    try {
      await api.delete(`/superadmin/questions/${id}`);
      loadAssessmentsData();
    } catch (err) {
      alert("Failed to delete question");
    }
  };

  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return alert("Select a CSV file first");

    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      await api.post("/superadmin/assessments/import-csv", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setShowCsvImportModal(false);
      setCsvFile(null);
      loadAssessmentsData();
      alert("CSV Imported Successfully!");
    } catch (err: any) {
      alert(err?.response?.data?.detail || "CSV import failed");
    }
  };

  const filteredQuestions = questions.filter(q =>
    q.title.toLowerCase().includes(searchQuestion.toLowerCase())
  );

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <FileCode2 className="text-emerald-400" size={24} /> Assessments &amp; Question Bank
          </h1>
          <p className="text-xs text-slate-400">Manage coding test suites, problem statements, constraints, and bulk CSV uploads.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCsvImportModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-2xl transition-all flex items-center gap-2 shadow-md shadow-emerald-600/20"
          >
            <UploadCloud size={16} /> Import CSV Tests
          </button>
          <button
            onClick={() => setShowAddQuestionModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl transition-all flex items-center gap-2 shadow-md shadow-indigo-600/20"
          >
            <Plus size={16} /> Add Question
          </button>
        </div>
      </div>

      {/* Assessment Test Suites Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-extrabold text-white">Assessment Test Suites ({assessments.length})</h3>
            <p className="text-xs text-slate-400">Timed assessment modules for candidate coding evaluations.</p>
          </div>
          <button
            onClick={() => setShowAddAssessmentModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2"
          >
            <Plus size={15} /> Create Test Suite
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assessments.map((a) => (
            <div key={a.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-extrabold text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Suite #{a.id}
                  </span>
                  <button
                    onClick={() => handleDeleteAssessment(a.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete Assessment Suite"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <h4 className="font-extrabold text-sm text-white mb-1">{a.title}</h4>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock size={13} /> {a.duration_minutes} Minutes Duration
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">{a.questions_count} Questions</span>
                <button
                  onClick={() => {
                    setQuestionForm(prev => ({ ...prev, assessment_id: a.id }));
                    setShowAddQuestionModal(true);
                  }}
                  className="text-indigo-400 hover:underline font-bold text-[11px]"
                >
                  + Add Question
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Questions Bank Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-extrabold text-white">Coding Question Bank ({questions.length})</h3>
            <p className="text-xs text-slate-400">LeetCode-style coding questions with constraints &amp; starter stubs.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input
              type="text"
              placeholder="Search question title..."
              value={searchQuestion}
              onChange={(e) => setSearchQuestion(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Q_ID</th>
                <th className="py-3.5 px-4">Question Title</th>
                <th className="py-3.5 px-4">Assessment Suite</th>
                <th className="py-3.5 px-4">Difficulty</th>
                <th className="py-3.5 px-4">Constraints</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredQuestions.map((q) => (
                <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-500">#{q.id}</td>
                  <td className="py-3.5 px-4 font-extrabold text-white">{q.title}</td>
                  <td className="py-3.5 px-4 text-indigo-400 font-semibold">Suite #{q.assessment_id}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      q.difficulty === "Easy" ? "bg-emerald-500/20 text-emerald-400" :
                      q.difficulty === "Medium" ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400"
                    }`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[10px]">{q.constraints || "Standard"}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Add Assessment Modal */}
      {showAddAssessmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-extrabold text-white">Create Assessment Test Suite</h3>
              <button onClick={() => setShowAddAssessmentModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateAssessment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Assessment Suite Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Backend Engineer Screening"
                  value={assessmentForm.title}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  required
                  value={assessmentForm.duration_minutes}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, duration_minutes: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors"
              >
                Create Test Suite
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Question Modal */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-extrabold text-white">Add New Coding Question</h3>
              <button onClick={() => setShowAddQuestionModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Target Assessment Suite</label>
                  <select
                    value={questionForm.assessment_id}
                    onChange={(e) => setQuestionForm({ ...questionForm, assessment_id: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  >
                    {assessments.map(a => (
                      <option key={a.id} value={a.id}>{a.title} (#{a.id})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Difficulty</label>
                  <select
                    value={questionForm.difficulty}
                    onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Question Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lowest Common Ancestor in Binary Tree"
                  value={questionForm.title}
                  onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Problem Description (HTML / Text)</label>
                <textarea
                  rows={3}
                  required
                  value={questionForm.description_html}
                  onChange={(e) => setQuestionForm({ ...questionForm, description_html: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Constraints</label>
                <input
                  type="text"
                  value={questionForm.constraints}
                  onChange={(e) => setQuestionForm({ ...questionForm, constraints: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Test Cases (JSON Format)</label>
                <textarea
                  rows={3}
                  value={questionForm.test_cases_json}
                  onChange={(e) => setQuestionForm({ ...questionForm, test_cases_json: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors"
              >
                Save Question
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. CSV Import Modal */}
      {showCsvImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-extrabold text-white">Import Questions via CSV</h3>
              <button onClick={() => setShowCsvImportModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleCsvImport} className="space-y-4 text-xs">
              <p className="text-slate-400 text-xs leading-relaxed">
                Upload a CSV containing columns: <code className="text-emerald-400 font-mono">Test_Title, Question_Title, Difficulty, Problem_Description, Constraints, Sample_Test_Cases, Starter_Code_Python</code>.
              </p>
              
              <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center hover:border-emerald-500/50 transition-colors">
                <UploadCloud className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files ? e.target.files[0] : null)}
                  className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={!csvFile}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-xl transition-colors shadow-md"
              >
                Upload &amp; Bulk Import CSV
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
