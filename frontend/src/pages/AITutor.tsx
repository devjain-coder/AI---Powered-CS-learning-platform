import React, { useState } from 'react';
import { Send, Bot, Sparkles, AlertTriangle, Cpu, HelpCircle } from 'lucide-react';

interface Message {
  sender: 'user' | 'tutor';
  text: string;
  time: string;
}

interface GeneratedProblem {
  title: string;
  difficulty: string;
  description: string;
  constraints: string[];
  test_cases: { input: string; expected: string }[];
  starter_code: { python: string; cpp: string };
}

export const AITutor: React.FC = () => {
  // State variables for Chat and Inputs
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'tutor',
      text: 'Hello! I am your AI DSA Tutor. Ask me any conceptual question, paste buggy code for error diagnostics, or use the panel on the right to generate custom practice questions.',
      time: '12:00 PM',
    },
  ]);
  const [userQuery, setUserQuery] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [language, setLanguage] = useState('Python');
  const [socraticMode, setSocraticMode] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // State variables for Problem Generator
  const [selectedTopic, setSelectedTopic] = useState('Arrays & Hashing');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');
  const [isGenLoading, setIsGenLoading] = useState(false);
  const [_generatedProblem, setGeneratedProblem] = useState<GeneratedProblem | null>(null);

  // Helper to format timestamp
  const getCurrentTime = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Send Message to AI Tutor Endpoint (/api/tutor/chat)
  const handleSendMessage = async () => {
    if (!userQuery.trim() && !codeInput.trim()) return;

    const userMsgText = userQuery.trim() || 'Please analyze my code snippet below.';
    const newMsg: Message = { sender: 'user', text: userMsgText, time: getCurrentTime() };
    
    setMessages((prev) => [...prev, newMsg]);
    setUserQuery('');
    setIsChatLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsgText,
          code_input: codeInput,
          language: language,
          socratic_mode: socraticMode,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          { sender: 'tutor', text: data.response, time: getCurrentTime() },
        ]);
      } else {
        throw new Error(data.detail || 'Failed to fetch tutor response');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'tutor',
          text: '⚠️ Unable to connect to backend service. Please ensure Uvicorn is running.',
          time: getCurrentTime(),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // 2. Generate Practice Problem Endpoint (/api/tutor/generate-problem)
  const handleGenerateProblem = async () => {
    setIsGenLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/tutor/generate-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic,
          difficulty: selectedDifficulty,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setGeneratedProblem(data.problem);
        // Display notification message in chat feed
        setMessages((prev) => [
          ...prev,
          {
            sender: 'tutor',
            text: `🎯 **New Problem Generated: ${data.problem.title}**\n\n${data.problem.description}\n\n*Constraints:*\n${data.problem.constraints.map((c: string) => `- ${c}`).join('\n')}`,
            time: getCurrentTime(),
          },
        ]);
      } else {
        alert('Failed to generate problem: ' + data.detail);
      }
    } catch (err) {
      alert('Network error connecting to Backend.');
    } finally {
      setIsGenLoading(false);
    }
  };

  // 3. Quick Shortcuts Endpoint (/api/tutor/quick-audit)
  const handleQuickAudit = async (auditType: 'complexity' | 'edge_cases') => {
    if (!codeInput.trim()) {
      alert('Please paste code into the Optional Code Input box first.');
      return;
    }

    setIsChatLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/tutor/quick-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code_input: codeInput,
          language: language,
          audit_type: auditType,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          { sender: 'tutor', text: data.response, time: getCurrentTime() },
        ]);
      } else {
        alert('Audit failed: ' + data.detail);
      }
    } catch (err) {
      alert('Network error executing shortcut.');
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#0b0f17] text-gray-100 p-6 overflow-y-auto">
      {/* Top Banner & Socratic Toggle */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles size={14} /> Turbo-Learner AI Assistant
          </div>
          <h1 className="text-3xl font-bold font-mono">AI DSA Tutor Workspace</h1>
        </div>

        {/* Socratic Mode Toggle */}
        <div className="flex items-center gap-3 bg-[#131b2e] px-4 py-2 rounded-xl border border-gray-800">
          <HelpCircle size={18} className="text-amber-400" />
          <div className="text-right">
            <div className="text-xs font-semibold">Socratic Mode</div>
            <div className="text-[10px] text-gray-400">Guides with hints</div>
          </div>
          <button
            onClick={() => setSocraticMode(!socraticMode)}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              socraticMode ? 'bg-emerald-500 justify-end' : 'bg-gray-700 justify-start'
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Chat & Input Panel */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
          {/* Chat Messages Window */}
          <div className="bg-[#131b2e] rounded-2xl p-4 border border-gray-800 h-[380px] overflow-y-auto flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    msg.sender === 'user' ? 'bg-indigo-600' : 'bg-emerald-600/20 text-emerald-400'
                  }`}
                >
                  {msg.sender === 'user' ? 'U' : <Bot size={18} />}
                </div>
                <div
                  className={`rounded-2xl p-4 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-[#1a243b] text-gray-200 border border-gray-700/50 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  {msg.text}
                  <div className="text-[10px] opacity-50 mt-2 text-right">{msg.time}</div>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex gap-3 items-center text-emerald-400 text-sm">
                <Bot size={18} className="animate-spin" /> Analyzing response...
              </div>
            )}
          </div>

          {/* Optional Code Input Box */}
          <div className="bg-[#131b2e] rounded-2xl p-4 border border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                &gt;_ Optional Code Input
              </span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-[#1a243b] border border-gray-700 text-xs text-gray-200 rounded-lg px-2 py-1 outline-none"
              >
                <option value="Python">Python</option>
                <option value="C++">C++</option>
              </select>
            </div>
            <textarea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Paste code snippet here for error diagnosis or complexity optimization..."
              className="w-full h-24 bg-[#0d1322] border border-gray-800 rounded-xl p-3 text-xs font-mono text-gray-300 focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>

          {/* Main Question Input */}
          <div className="flex gap-3">
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask a question about DSA concepts or code errors..."
              className="flex-1 bg-[#131b2e] border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50"
            />
            <button
              onClick={handleSendMessage}
              disabled={isChatLoading}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              Ask <Send size={16} />
            </button>
          </div>
        </div>

        {/* Right Column: Problem Generator & Shortcuts */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          {/* DSA Question Generator */}
          <div className="bg-[#131b2e] rounded-2xl p-5 border border-gray-800">
            <h2 className="text-base font-semibold flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-emerald-400" /> DSA Question Generator
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Select Topic</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full bg-[#1a243b] border border-gray-700 text-sm rounded-xl px-3 py-2 text-gray-200 outline-none"
                >
                  <option value="Arrays & Hashing">Arrays & Hashing</option>
                  <option value="Two Pointers">Two Pointers</option>
                  <option value="Sliding Window">Sliding Window</option>
                  <option value="Stack & Queue">Stack & Queue</option>
                  <option value="Binary Search">Binary Search</option>
                  <option value="Linked List">Linked List</option>
                  <option value="Trees & Graphs">Trees & Graphs</option>
                  <option value="Dynamic Programming">Dynamic Programming</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Easy', 'Medium', 'Hard'].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`py-2 rounded-xl text-xs font-semibold transition-colors ${
                        selectedDifficulty === diff
                          ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400'
                          : 'bg-[#1a243b] border border-gray-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateProblem}
                disabled={isGenLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer mt-2"
              >
                <Sparkles size={16} />{' '}
                {isGenLoading ? 'Generating...' : 'Generate Practice Problem'}
              </button>
            </div>
          </div>

          {/* Quick Error Analyzer Shortcuts */}
          <div className="bg-[#131b2e] rounded-2xl p-5 border border-gray-800">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <BugIcon size={16} className="text-rose-400" /> Quick Error Analyzer Shortcuts
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleQuickAudit('complexity')}
                className="bg-[#1a243b] hover:bg-[#23304e] border border-gray-700 rounded-xl p-3 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 group-hover:text-indigo-200">
                  <Cpu size={14} /> Complexity Trace
                </div>
              </button>

              <button
                onClick={() => handleQuickAudit('edge_cases')}
                className="bg-[#1a243b] hover:bg-[#23304e] border border-gray-700 rounded-xl p-3 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 group-hover:text-rose-200">
                  <AlertTriangle size={14} /> Edge Case Audit
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BugIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m8 2 1.88 1.88" />
    <path d="M14.12 3.88 16 2" />
    <path d="M9 7.13v-1a3.003 3.003 0 0 1 6 0v1" />
    <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z" />
    <path d="M12 20v-9" />
    <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
    <path d="M6 13H2" />
    <path d="M3 21c0-2.1 1.6-3.8 3.53-4" />
    <path d="M20.47 9c1.93-.2 3.53-1.9 3.53-4" />
    <path d="M18 13h4" />
    <path d="M21 21c0-2.1-1.6-3.8-3.53-4" />
  </svg>
);