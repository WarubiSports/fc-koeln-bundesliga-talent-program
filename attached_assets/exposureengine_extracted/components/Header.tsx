import React from 'react';
import { Target, ShieldAlert } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Target className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">ExposureEngine</h1>
            <p className="text-xs text-slate-400 font-medium">College Recruiting Visibility Check</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
          <ShieldAlert className="w-3 h-3 text-emerald-400" />
          <span className="text-xs text-slate-300 font-mono">MLS NEXT / ECNL / ELITE</span>
        </div>
      </div>
    </header>
  );
};

export default Header;