// import { NavLink } from 'react-router-dom';
// import {
//   LayoutDashboard,
//   Bot,
//   BarChart3,
//   Code2,
//   HelpCircle,
//   Sparkles,
// } from 'lucide-react';

// const coreModules = [
//   { name: 'Dashboard', path: '/', icon: LayoutDashboard },
//   { name: 'AI Tutor', path: '/tutor', icon: Bot },
//   { name: 'DSA Visualizer', path: '/visualizer', icon: BarChart3 },
//   { name: 'Code Runner', path: '/editor', icon: Code2 },
//   { name: 'Quiz', path: '/quiz', icon: HelpCircle },
//   { name: 'Recommendations', path: '/recommendations', icon: Sparkles },
// ];

// export const Sidebar = () => {
//   return (
//     <aside className="w-60 bg-[#F8F7F2] dark:bg-slate-900 border-r border-[#ECEAE2] dark:border-slate-800 flex flex-col h-screen sticky top-0 shrink-0 p-4 select-none transition-colors">
//       {/* Brand Header */}
//       <div className="px-3 py-2 mb-3 flex items-center gap-2.5">
//         <div className="w-7 h-7 rounded-lg bg-[#1E4D40] dark:bg-emerald-600 flex items-center justify-center font-bold text-white text-xs shadow-xs">
//           CS
//         </div>
//         <h1 className="font-handwriting text-2xl font-bold text-[#1E293B] dark:text-slate-100 tracking-tight">
//           CS LearnAI
//         </h1>
//       </div>

//       {/* Navigation Items */}
//       <nav className="flex-1 space-y-1 overflow-y-auto">
//         {coreModules.map((item) => {
//           const Icon = item.icon;
//           return (
//             <NavLink
//               key={item.path}
//               to={item.path}
//               className={({ isActive }) =>
//                 `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[14px] font-semibold transition-all ${
//                   isActive
//                     ? 'bg-[#E3EEE7] dark:bg-emerald-950/60 text-[#1E4D40] dark:text-emerald-300 shadow-xs font-bold'
//                     : 'text-[#5A6878] dark:text-slate-400 hover:bg-[#EFECE1] dark:hover:bg-slate-800 hover:text-[#1A202C] dark:hover:text-slate-200'
//                 }`
//               }
//             >
//               <Icon size={18} className="stroke-[2.2]" />
//               <span>{item.name}</span>
//             </NavLink>
//           );
//         })}
//       </nav>

//       {/* Footer Backend Status */}
//       <div className="pt-3 border-t border-[#ECEAE2] dark:border-slate-800 px-2 flex items-center gap-2">
//         <div className="w-2 h-2 rounded-full bg-[#2C8562] dark:bg-emerald-400 animate-pulse" />
//         <span className="text-[11px] text-[#64748B] dark:text-slate-400 font-bold">FastAPI Engine: Active</span>
//       </div>
//     </aside>
//   );
// };

import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  BarChart3,
  Code2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

const coreModules = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'AI Tutor', path: '/ai-tutor', icon: Bot },
  { name: 'DSA Visualizer', path: '/visualizer', icon: BarChart3 },
  { name: 'Code Runner', path: '/runner', icon: Code2 },
  { name: 'Quiz', path: '/quiz', icon: HelpCircle },
  { name: 'Recommendations', path: '/recommendations', icon: Sparkles },
];

export const Sidebar = () => {
  return (
    <aside className="w-60 bg-[#F8F7F2] dark:bg-slate-900 border-r border-[#ECEAE2] dark:border-slate-800 flex flex-col h-screen sticky top-0 shrink-0 p-4 select-none transition-colors">
      {/* Brand Header */}
      <div className="px-3 py-2 mb-3 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#1E4D40] dark:bg-emerald-600 flex items-center justify-center font-bold text-white text-xs shadow-xs">
          CS
        </div>
        <h1 className="font-handwriting text-2xl font-bold text-[#1E293B] dark:text-slate-100 tracking-tight">
          CS LearnAI
        </h1>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {coreModules.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[14px] font-semibold transition-all ${
                  isActive
                    ? 'bg-[#E3EEE7] dark:bg-emerald-950/60 text-[#1E4D40] dark:text-emerald-300 shadow-xs font-bold'
                    : 'text-[#5A6878] dark:text-slate-400 hover:bg-[#EFECE1] dark:hover:bg-slate-800 hover:text-[#1A202C] dark:hover:text-slate-200'
                }`
              }
            >
              <Icon size={18} className="stroke-[2.2]" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Backend Status */}
      <div className="pt-3 border-t border-[#ECEAE2] dark:border-slate-800 px-2 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#2C8562] dark:bg-emerald-400 animate-pulse" />
        <span className="text-[11px] text-[#64748B] dark:text-slate-400 font-bold">
          FastAPI Engine: Active
        </span>
      </div>
    </aside>
  );
};