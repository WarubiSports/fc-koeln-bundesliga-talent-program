import React from 'react';
import { AnalysisResult, RiskFlag, ActionItem, VisibilityScore } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { AlertTriangle, CheckCircle, TrendingUp, Calendar, ArrowRight } from 'lucide-react';

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

const AnalysisResultView: React.FC<Props> = ({ result, onReset }) => {
  
  // Prepare data for charts
  const readinessData = [
    { subject: 'Athletic', A: result.readinessScore.athletic, fullMark: 100 },
    { subject: 'Technical', A: result.readinessScore.technical, fullMark: 100 },
    { subject: 'Tactical', A: result.readinessScore.tactical, fullMark: 100 },
    { subject: 'Academic', A: result.readinessScore.academic, fullMark: 100 },
    { subject: 'Market Fit', A: result.readinessScore.market, fullMark: 100 },
  ];

  const getBarColor = (val: number) => {
    if (val < 20) return '#64748b'; // slate-500
    if (val < 50) return '#fbbf24'; // amber-400
    return '#10b981'; // emerald-500
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Executive Summary */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 rounded-2xl shadow-xl">
        <h2 className="text-xl font-bold text-white mb-2">Recruiting Reality Check</h2>
        <p className="text-slate-300 leading-relaxed text-sm md:text-base border-l-4 border-emerald-500 pl-4 py-1">
          {result.plainLanguageSummary}
        </p>
      </div>

      {/* Main Visuals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Visibility Chart */}
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Estimated Visibility by Level</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.visibilityScores} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis 
                  dataKey="level" 
                  type="category" 
                  tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 600 }} 
                  width={40}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: '#334155', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
                />
                <Bar dataKey="visibilityPercent" radius={[0, 4, 4, 0]} barSize={24}>
                  {result.visibilityScores.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.visibilityPercent)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {result.visibilityScores.map((score, i) => (
                <div key={i} className="text-xs text-slate-400">
                    <span className="font-bold text-white mr-1">{score.level}:</span>
                    {score.visibilityPercent}% 
                    <span className="block text-[10px] text-slate-500 truncate">{score.notes}</span>
                </div>
            ))}
          </div>
        </div>

        {/* Readiness Radar */}
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 flex flex-col items-center">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Profile Readiness</h3>
          <div className="h-64 w-full max-w-xs">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={readinessData}>
                <PolarGrid stroke="#475569" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Player"
                  dataKey="A"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="#10b981"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Risks and Strengths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-slate-900 border border-emerald-900/30 rounded-xl p-5">
            <h3 className="flex items-center text-emerald-400 font-bold mb-4">
                <CheckCircle className="w-5 h-5 mr-2" /> Key Strengths
            </h3>
            <ul className="space-y-2">
                {result.keyStrengths.map((str, idx) => (
                    <li key={idx} className="flex items-start text-sm text-slate-300">
                        <span className="mr-2 text-emerald-500">•</span>
                        {str}
                    </li>
                ))}
            </ul>
         </div>
         <div className="bg-slate-900 border border-red-900/20 rounded-xl p-5">
            <h3 className="flex items-center text-red-400 font-bold mb-4">
                <AlertTriangle className="w-5 h-5 mr-2" /> Critical Risks
            </h3>
             <ul className="space-y-3">
                {result.keyRisks.map((risk, idx) => (
                    <li key={idx} className="flex items-start text-sm text-slate-300">
                        <div className={`mt-0.5 w-1.5 h-1.5 rounded-full mr-2 flex-shrink-0 ${
                            risk.severity === 'High' ? 'bg-red-500' : 'bg-amber-400'
                        }`} />
                        <span>
                            <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block mb-0.5">{risk.category}</span>
                            {risk.message}
                        </span>
                    </li>
                ))}
            </ul>
         </div>
      </div>

      {/* Action Plan */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-4 bg-slate-900 border-b border-slate-700 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-emerald-500" />
                90-Day Action Plan
            </h3>
        </div>
        <div className="divide-y divide-slate-700">
            {result.actionPlan.map((action, idx) => (
                <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center hover:bg-slate-700/30 transition">
                    <div className="sm:w-32 flex-shrink-0 mb-2 sm:mb-0">
                        <span className={`text-xs font-bold px-2 py-1 rounded border ${
                            action.timeframe === 'Next_30_Days' 
                            ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' 
                            : 'bg-slate-800 text-slate-400 border-slate-600'
                        }`}>
                            {action.timeframe.replace(/_/g, ' ')}
                        </span>
                    </div>
                    <div className="flex-1 text-sm text-slate-200">
                        {action.description}
                    </div>
                    <div className="sm:w-20 text-right mt-2 sm:mt-0">
                         {action.impact === 'High' && <span className="text-xs text-amber-400 font-medium">High Impact</span>}
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button 
            onClick={onReset}
            className="text-slate-500 hover:text-white flex items-center text-sm font-medium transition"
        >
            Start New Analysis <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

    </div>
  );
};

export default AnalysisResultView;