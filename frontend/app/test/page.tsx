'use client';
import { useState, useEffect } from 'react';
import { Play, CheckCircle2, XCircle, Terminal, ChevronDown, ArrowLeft, ArrowRight, FileText, Loader2 } from 'lucide-react';
import Editor from '@monaco-editor/react';

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'cpp', name: 'C++' },
  { id: 'c', name: 'C' }
];

export default function TestPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  
  const [activeTab, setActiveTab] = useState<'testcases' | 'result'>('testcases');
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [results, setResults] = useState<any[]>([]);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch all assessments on mount
  useEffect(() => {
    fetch('/api/assessments')
      .then(res => res.json())
      .then(data => {
        setAssessments(data);
        setLoading(false);
      });
  }, []);

  // Fetch questions when a test is selected
  useEffect(() => {
    if (selectedTest !== null) {
      setLoading(true);
      fetch(`/api/assessments/${selectedTest}/questions`)
        .then(res => res.json())
        .then(data => {
          setQuestions(data);
          setCurrentQIdx(0);
          if (data.length > 0) {
            setCode(data[0].js_stub || '');
            setLanguage('javascript');
          }
          setLoading(false);
        });
    }
  }, [selectedTest]);

  // Update editor when navigating questions
  useEffect(() => {
    if (questions.length > 0) {
      const q = questions[currentQIdx];
      const langKey = `${language}_stub`;
      setCode(q[langKey] || '');
      setStatus('idle');
      setActiveTab('testcases');
      setResults([]);
      setRuntimeError(null);
    }
  }, [currentQIdx, language, questions]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  const buildHarness = (lang: string, userCode: string, q: any) => {
    const testCasesStr = q.test_cases_json;

    if (lang === 'javascript') {
      const match = q.js_stub.match(/var\s+([a-zA-Z0-9_]+)\s*=\s*function/);
      const fnName = match ? match[1] : 'twoSum';
      
      return `
${userCode}
const testCases = ${testCasesStr};
for (const tc of testCases) {
  const inputs = Object.values(tc.input);
  const res = typeof ${fnName} !== 'undefined' ? ${fnName}(...inputs) : null;
  console.log("===TEST===");
  console.log(JSON.stringify(res));
}
`;
    } else if (lang === 'python') {
      const match = q.python_stub.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
      const fnName = match ? match[1] : 'twoSum';
      
      return `
import json
${userCode}
if __name__ == '__main__':
    sol = Solution()
    test_cases = ${testCasesStr}
    for tc in test_cases:
        inputs = list(tc['input'].values())
        res = getattr(sol, '${fnName}')(*inputs)
        print("===TEST===")
        print(json.dumps(res))
`;
    } 
    else if (lang === 'java' && q.title === "Two Sum") {
      return `
import java.util.*;
${userCode}
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[][] numsList = {{2,7,11,15}, {3,2,4}, {3,3}};
        int[] targets = {9, 6, 6};
        for(int i = 0; i < 3; i++) {
            int[] res = sol.twoSum(numsList[i], targets[i]);
            System.out.println("===TEST===");
            System.out.println(Arrays.toString(res));
        }
    }
}
`;
    }
    return userCode;
  };

  const handleRunCode = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (questions.length === 0) return;
    
    setStatus('running');
    setActiveTab('result');
    setRuntimeError(null);
    setResults([]);

    const q = questions[currentQIdx];
    const fullCode = buildHarness(language, code, q);
    const parsedTestCases = JSON.parse(q.test_cases_json || '[]');

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code: fullCode })
      });

      const data = await response.json();
      
      if (data.stderr) {
        setStatus('error');
        setRuntimeError(data.stderr);
        return;
      }

      const stdout = data.stdout;
      const outputs = stdout.split('===TEST===').map((s: string) => s.trim()).filter((s: string) => s);
      
      const runResults = parsedTestCases.map((tc: any, idx: number) => {
        let passed = false;
        let actualOutputStr = outputs[idx] || 'null';
        let err = null;
        let parsedOutput: any = null;
        
        try {
          if (language === 'java') {
             actualOutputStr = actualOutputStr.replace(/\\s/g, '');
          }
          parsedOutput = JSON.parse(actualOutputStr);
          
          if (Array.isArray(parsedOutput) && Array.isArray(tc.expected)) {
             const sortedActual = [...parsedOutput].sort((a,b)=>a-b);
             const sortedExpected = [...tc.expected].sort((a,b)=>a-b);
             passed = sortedActual.length === sortedExpected.length && sortedActual.every((val, index) => val === sortedExpected[index]);
          } else {
             passed = parsedOutput === tc.expected;
          }
        } catch (e: any) {
          err = 'Failed to parse output: ' + actualOutputStr;
        }

        return {
          testcase: idx + 1,
          input: tc.input,
          expected: tc.expected,
          actualOutput: parsedOutput !== null ? parsedOutput : actualOutputStr,
          passed,
          error: err
        };
      });

      setResults(runResults);
      const allPassed = runResults.length > 0 && runResults.every((r: any) => r.passed);
      setStatus(allPassed ? 'success' : 'error');
      
      if (!allPassed) {
        const firstFailedIdx = runResults.findIndex((r: any) => !r.passed);
        if (firstFailedIdx !== -1) setActiveTestCase(firstFailedIdx);
      }

    } catch (err: any) {
      setStatus('error');
      setRuntimeError(err.toString());
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-sm" />
      </div>
    );
  }

  // --- VIEW 1: Test Selection List ---
  if (selectedTest === null) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-slate-50 text-slate-900 font-sans p-10 relative overflow-hidden selection:bg-indigo-500/30">
        {/* Ambient VisionOS Lighting */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-0 left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[150px] mix-blend-multiply" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[150px] mix-blend-multiply" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-8 flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-600" />
            Available Assessments
          </h1>
          
          {assessments.length === 0 ? (
            <div className="p-12 bg-white/80 backdrop-blur-xl border border-white rounded-[32px] shadow-[0_20px_80px_rgba(0,0,0,0.04)] text-center">
              <p className="text-slate-500 text-lg">No tests available. Please upload a CSV first.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {assessments.map(test => (
                <div 
                  key={test.id}
                  onClick={() => setSelectedTest(test.id)}
                  className="bg-white/80 backdrop-blur-xl border border-white p-8 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_80px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex justify-between items-center"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{test.title}</h2>
                    <p className="text-sm font-medium text-slate-500 mt-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Duration: {test.duration_minutes} minutes
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md translate-x-4 group-hover:translate-x-0 flex items-center gap-2">
                    Start Test <ArrowRight className="w-4 h-4"/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- VIEW 2: The IDE (Test Runner) ---
  const currentQ = questions[currentQIdx];
  const parsedTestCases = currentQ ? JSON.parse(currentQ.test_cases_json || '[]') : [];
  const testTitle = assessments.find(a => a.id === selectedTest)?.title || "Assessment";

  return (
    <div className="flex flex-col h-[calc(100vh-72px)] bg-slate-50 relative overflow-hidden selection:bg-indigo-500/30">
      {/* Ambient VisionOS Lighting */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[150px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[150px] mix-blend-multiply" />
      </div>

      {/* SMART TOP TOOLBAR */}
      <header className="h-16 shrink-0 bg-white/70 backdrop-blur-3xl border-b border-slate-200/50 flex items-center justify-between px-6 z-40 relative shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedTest(null)}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
            title="Back to Tests"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-5 w-px bg-slate-200" />
          <h1 className="font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-600" /> {testTitle}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/50">
            <button 
              disabled={currentQIdx === 0}
              onClick={() => setCurrentQIdx(prev => prev - 1)}
              className="px-3 py-1.5 hover:bg-white rounded-lg text-sm font-bold text-slate-500 transition-all hover:shadow-sm disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Prev
            </button>
            <span className="px-3 text-sm font-bold text-indigo-600">
              Q{currentQIdx + 1} <span className="text-slate-400 font-medium">/ {questions.length}</span>
            </span>
            <button 
              disabled={currentQIdx === questions.length - 1}
              onClick={() => setCurrentQIdx(prev => prev + 1)}
              className="px-3 py-1.5 hover:bg-white rounded-lg text-sm font-bold text-slate-500 transition-all hover:shadow-sm disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
            >
              Next <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden p-4 gap-4 z-10 relative">
        {/* Left Panel: Question */}
        <div className="w-1/2 flex flex-col bg-white/80 backdrop-blur-xl rounded-[24px] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.04)] border border-white">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center space-x-2 bg-white/50">
            <FileText size={16} className="text-indigo-500"/>
            <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Description</span>
          </div>
          
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            {currentQ ? (
              <>
                <h1 className="text-3xl font-extrabold mb-4 text-slate-900 tracking-tight">{currentQ.title}</h1>
                <div className="flex space-x-2 mb-8">
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full border ${
                    currentQ.difficulty === 'EASY' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                    currentQ.difficulty === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                    'bg-rose-50 text-rose-600 border-rose-200'
                  }`}>
                    {currentQ.difficulty}
                  </span>
                </div>
                
                <div 
                  className="space-y-4 text-slate-600 text-[15px] leading-relaxed prose prose-slate max-w-none prose-pre:bg-slate-50 prose-pre:text-slate-800 prose-pre:border prose-pre:border-slate-200 prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md"
                  dangerouslySetInnerHTML={{ __html: currentQ.description_html }}
                />
                
                <div className="mt-12 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500"/> Constraints
                  </h3>
                  <div 
                    className="text-sm text-slate-600 space-y-2 prose prose-slate max-w-none prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md"
                    dangerouslySetInnerHTML={{ __html: currentQ.constraints }}
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 font-medium">No questions found in this assessment.</div>
            )}
          </div>
        </div>

        {/* Right Panel: Compiler & Console */}
        <div className="w-1/2 flex flex-col gap-4">
          {/* Editor Section */}
          <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-xl rounded-[24px] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.04)] border border-white">
            <div className="flex justify-between items-center px-6 py-3 border-b border-slate-100 bg-white/50">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <select 
                    value={language} 
                    onChange={handleLanguageChange}
                    className="appearance-none bg-slate-50 text-slate-700 text-sm font-bold rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer border border-slate-200 transition-all hover:bg-slate-100"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.id} value={lang.id}>{lang.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <button 
                type="button"
                onClick={handleRunCode}
                disabled={status === 'running'}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-400 disabled:to-slate-400 text-white rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
              >
                {status === 'running' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{status === 'running' ? 'Running...' : 'Run Code'}</span>
              </button>
            </div>
            
            <div className="flex-1">
              <Editor
                height="100%"
                language={language === 'cpp' || language === 'c' ? 'cpp' : language}
                theme="light"
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                  lineHeight: 24,
                  padding: { top: 24, bottom: 24 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  renderLineHighlight: "all",
                  bracketPairColorization: { enabled: true },
                  formatOnPaste: true,
                }}
              />
            </div>
          </div>

          {/* Console Section */}
          <div className="h-[40%] flex flex-col bg-white/80 backdrop-blur-xl rounded-[24px] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.04)] border border-white">
            <div className="flex px-4 pt-3 border-b border-slate-100 bg-white/50 space-x-2">
              <button
                onClick={() => setActiveTab('testcases')}
                className={`px-5 py-2.5 text-sm font-bold rounded-t-xl transition-colors flex items-center gap-2 ${
                  activeTab === 'testcases' ? 'bg-white text-indigo-600 shadow-[0_-4px_12px_rgba(0,0,0,0.02)] border-t border-x border-slate-100 -mb-[1px]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                }`}
              >
                Testcases
              </button>
              <button
                onClick={() => setActiveTab('result')}
                className={`px-5 py-2.5 text-sm font-bold rounded-t-xl transition-colors flex items-center gap-2 ${
                  activeTab === 'result' ? 'bg-white text-indigo-600 shadow-[0_-4px_12px_rgba(0,0,0,0.02)] border-t border-x border-slate-100 -mb-[1px]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                }`}
              >
                Test Result
                {status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" strokeWidth={3} />}
                {status === 'error' && <XCircle className="w-4 h-4 text-rose-500" strokeWidth={3} />}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
              {activeTab === 'testcases' && parsedTestCases.length > 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex gap-2 flex-wrap bg-slate-50 p-2 rounded-xl border border-slate-100 inline-flex">
                    {parsedTestCases.map((_: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setActiveTestCase(idx)}
                        className={`px-5 py-2 text-sm rounded-lg font-bold transition-all ${
                          activeTestCase === idx ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>
                  
                  <div className="space-y-5">
                    {Object.entries(parsedTestCases[activeTestCase]?.input || {}).map(([key, val]) => (
                      <div key={key}>
                        <div className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">{key} =</div>
                        <div className="font-mono text-[13px] bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 whitespace-pre-wrap shadow-inner">
                          {Array.isArray(val) ? `[${val.join(', ')}]` : String(val)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'result' && (
                <div className="h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {status === 'idle' && (
                    <div className="text-slate-400 font-medium text-sm h-full flex flex-col items-center justify-center gap-4">
                      <Terminal size={32} className="text-slate-200" />
                      Run your code to see the test results here.
                    </div>
                  )}
                  {status === 'running' && (
                    <div className="text-slate-500 font-bold text-sm flex flex-col items-center justify-center h-full gap-4">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-500"/>
                      Evaluating submission...
                    </div>
                  )}
                  {runtimeError && (
                    <div className="space-y-3">
                      <div className="text-rose-600 font-extrabold text-lg flex items-center gap-2">
                        <XCircle className="w-6 h-6"/> Compile/Runtime Error
                      </div>
                      <div className="bg-rose-50 border border-rose-200 p-5 rounded-xl font-mono text-sm text-rose-700 whitespace-pre-wrap shadow-inner">
                        {runtimeError}
                      </div>
                    </div>
                  )}
                  {results.length > 0 && !runtimeError && (
                    <div className="space-y-8 pb-6">
                      <div className="flex items-center gap-4">
                        <span className={`text-3xl font-extrabold tracking-tight ${status === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {status === 'success' ? 'Accepted' : 'Wrong Answer'}
                        </span>
                        <span className="text-slate-600 text-sm font-bold px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
                          {results.filter(r => r.passed).length} / {results.length} passed
                        </span>
                      </div>
  
                      <div className="flex gap-2 flex-wrap bg-slate-50 p-2 rounded-xl border border-slate-100 inline-flex">
                        {results.map((r, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveTestCase(idx)}
                            className={`px-5 py-2 text-sm rounded-lg font-bold transition-all flex items-center gap-2 ${
                              activeTestCase === idx 
                                ? (r.passed ? 'bg-white text-emerald-600 shadow-sm border border-emerald-200' : 'bg-white text-rose-600 shadow-sm border border-rose-200')
                                : (r.passed ? 'text-slate-500 hover:bg-white/60' : 'text-slate-500 hover:bg-white/60')
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full ${r.passed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            Case {idx + 1}
                          </button>
                        ))}
                      </div>
  
                      <div className="space-y-5">
                        {results[activeTestCase]?.error ? (
                          <div>
                            <div className="text-[11px] text-rose-500 mb-2 font-bold uppercase tracking-widest">Error Output</div>
                            <div className="font-mono text-[13px] bg-rose-50 text-rose-700 p-4 rounded-xl border border-rose-200 shadow-inner">
                              {results[activeTestCase].error}
                            </div>
                          </div>
                        ) : (
                          <>
                            <div>
                              <div className="text-[11px] text-slate-400 mb-2 font-bold uppercase tracking-widest">Input</div>
                              <div className="font-mono text-[13px] bg-slate-50 text-slate-700 p-4 rounded-xl border border-slate-200 whitespace-pre-wrap shadow-inner space-y-2">
                                {Object.entries(parsedTestCases[activeTestCase]?.input || {}).map(([key, val]) => (
                                  <div key={key}><span className="text-indigo-600">{key}</span> = {Array.isArray(val) ? `[${val.join(', ')}]` : String(val)}</div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="text-[11px] text-slate-400 mb-2 font-bold uppercase tracking-widest">Output</div>
                              <div className={`font-mono text-[13px] p-4 rounded-xl border shadow-inner ${
                                results[activeTestCase].passed 
                                  ? 'bg-emerald-50/50 text-emerald-700 border-emerald-200' 
                                  : 'bg-rose-50/50 text-rose-700 border-rose-200'
                              }`}>
                                {Array.isArray(results[activeTestCase].actualOutput) 
                                  ? `[${results[activeTestCase].actualOutput.join(', ')}]` 
                                  : String(results[activeTestCase].actualOutput)}
                              </div>
                            </div>
                            <div>
                              <div className="text-[11px] text-slate-400 mb-2 font-bold uppercase tracking-widest">Expected</div>
                              <div className="font-mono text-[13px] bg-slate-50 text-slate-700 p-4 rounded-xl border border-slate-200 shadow-inner">
                                {Array.isArray(results[activeTestCase].expected) ? `[${results[activeTestCase].expected.join(', ')}]` : String(results[activeTestCase].expected)}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.3); border-radius: 10px; border: 2px solid white; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.5); }
      `}} />
    </div>
  );
}
