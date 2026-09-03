// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { MainLayout } from './layouts/MainLayout';
// import { Dashboard } from './pages/dashboard';
// import { Auth } from './pages/Auth';
// import { Visualizer } from './pages/Visualizer';
// import { AITutor } from './pages/AITutor';
// import { CodeRunner } from './pages/codeRunner';

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route element={<MainLayout />}>
//           <Route path="/" element={<Dashboard />} />
//           <Route path="/auth" element={<Auth />} />
//           <Route path="/ai-tutor" element={<AITutor />} />
        

//            <Route path="/code-runner" element={<CodeRunner />} />
//           <Route path="/visualizer" element={<Visualizer />} />
//           <Route path="/learn" element={<div className="p-4 text-lg font-bold">Learn Concepts (Step 7)</div>} />
//           <Route path="/pdf-chat" element={<div className="p-4 text-lg font-bold">PDF Chat (Step 11)</div>} />
//           <Route path="/runner" element={<CodeRunner />} />
//           <Route path="/quiz" element={<div className="p-4 text-lg font-bold">Quizzes (Step 12)</div>} />
//           <Route path="/recommendations" element={<div className="p-4 text-lg font-bold">Recommendations (Step 14)</div>} />
          
//           {/* Fallback Catch-All Route */}
//           <Route path="*" element={<Navigate to="/ai-tutor" replace />} />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// }

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/dashboard';
import { Auth } from './pages/Auth';
import { Visualizer } from './pages/Visualizer';
import { AITutor } from './pages/AITutor';
import { CodeRunner } from './pages/codeRunner';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/ai-tutor" element={<AITutor />} />
          <Route path="/visualizer" element={<Visualizer />} />
          <Route path="/learn" element={<div className="p-4 text-lg font-bold">Learn Concepts (Step 7)</div>} />
          <Route path="/pdf-chat" element={<div className="p-4 text-lg font-bold">PDF Chat (Step 11)</div>} />
          
          {/* Code Runner Routes (Handles /runner, /code-runner, and /coderunner) */}
          <Route path="/runner" element={<CodeRunner />} />
          <Route path="/code-runner" element={<CodeRunner />} />
          <Route path="/coderunner" element={<CodeRunner />} />

          <Route path="/quiz" element={<div className="p-4 text-lg font-bold">Quizzes (Step 12)</div>} />
          <Route path="/recommendations" element={<div className="p-4 text-lg font-bold">Recommendations (Step 14)</div>} />
          
          {/* Fallback Catch-All Route */}
          <Route path="*" element={<Navigate to="/ai-tutor" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}