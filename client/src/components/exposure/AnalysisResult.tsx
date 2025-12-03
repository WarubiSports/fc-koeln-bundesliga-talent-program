import { useState, useMemo } from 'react';
import type { AnalysisResult, RiskFlag, ActionItem, PlayerProfile, BenchmarkMetric } from '../../../../shared/exposure-types';
import { 
  AlertTriangle, CheckCircle2, Calendar, ArrowRight, Shield, 
  TrendingUp, Activity, Minus, AlertCircle, Zap, Target, Trophy
} from 'lucide-react';

interface Props {
  result: AnalysisResult;
  profile: PlayerProfile;
  onReset: () => void;
  isDark: boolean;
}

const PrintHeader = ({ profile }: { profile: PlayerProfile }) => (
  <div className="hidden print:block border-b border-slate-200 mb-8 pb-6">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Exposure<span className="text-emerald-600">Engine</span> Report</h1>
        <p className="text-sm text-slate-500 mt-1">Generated via Warubi Sports Analytics</p>
      </div>
      <div className="text-right">
        <h2 className="text-xl font-bold text-slate-800">{profile.firstName} {profile.lastName}</h2>
        <p className="text-sm text-slate-500">Class of {profile.gradYear} • {profile.position}</p>
        <p className="text-xs text-slate-400 mt-1">{new Date().toLocaleDateString()}</p>
      </div>
    </div>
  </div>
);

const SimpleBarChart = ({ data, isDark }: { data: Array<{ level: string; visibilityPercent: number }>; isDark: boolean }) => {
  const getBarColor = (score: number) => {
    if (score < 25) return '#ef4444';
    if (score < 50) return '#f97316';
    if (score < 75) return '#eab308';
    return '#10b981';
  };

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.level} className="flex items-center gap-4">
          <span className="w-12 text-sm font-bold text-slate-600 dark:text-slate-400">{item.level}</span>
          <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${item.visibilityPercent}%`,
                backgroundColor: getBarColor(item.visibilityPercent)
              }}
            />
          </div>
          <span className="w-12 text-right text-sm font-bold text-slate-700 dark:text-slate-300">{item.visibilityPercent}%</span>
        </div>
      ))}
    </div>
  );
};

const SimpleRadarChart = ({ data, isDark }: { data: { athletic: number; technical: number; tactical: number; academic: number; market: number }; isDark: boolean }) => {
  const categories = [
    { key: 'athletic', label: 'Athletic', value: data.athletic },
    { key: 'technical', label: 'Technical', value: data.technical },
    { key: 'tactical', label: 'Tactical', value: data.tactical },
    { key: 'academic', label: 'Academic', value: data.academic },
    { key: 'market', label: 'Market', value: data.market },
  ];

  return (
    <div className="space-y-4">
      {categories.map((cat) => (
        <div key={cat.key}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500 dark:text-slate-400">{cat.label}</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{cat.value}%</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${cat.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default function AnalysisResultView({ result, profile, onReset, isDark }: Props) {
  const [viewMode, setViewMode] = useState<'player' | 'coach'>('player');

  const visibilityScores = result.visibilityScores || [];
  const keyRisks = result.keyRisks || [];
  const rawActionPlan = result.actionPlan || [];
  const keyStrengths = result.keyStrengths || [];
  const funnelAnalysis = result.funnelAnalysis || {
    stage: 'Evaluation', conversionRate: '0%', bottleneck: 'Unknown', advice: 'Review data'
  };
  const benchmarkAnalysis = result.benchmarkAnalysis || [];
  const readinessScore = result.readinessScore || {
    athletic: 50, technical: 50, tactical: 50, academic: 50, market: 50
  };

  const normalizeLevel = (level: string) => {
    if (!level) return '';
    return level.replace(/NCAA\s*/i, '').trim();
  };

  const sortedVisibility = [...visibilityScores].sort((a, b) => {
    const order: Record<string, number> = { 'D1': 5, 'D2': 4, 'D3': 3, 'NAIA': 2, 'JUCO': 1 };
    const scoreA = order[normalizeLevel(a.level)] || 0;
    const scoreB = order[normalizeLevel(b.level)] || 0;
    return scoreB - scoreA;
  });
  
  const chartData = [...sortedVisibility];

  const bestLevel = [...visibilityScores]
    .sort((a, b) => b.visibilityPercent - a.visibilityPercent)[0];

  const finalActionPlan = useMemo(() => {
    let plan = [...rawActionPlan];
    const videoKeywords = ['video', 'highlight', 'reel', 'film', 'footage'];
    const videoIndex = plan.findIndex(item => 
      videoKeywords.some(k => item.description.toLowerCase().includes(k))
    );

    if (videoIndex === -1) {
      const newVideoItem: ActionItem = {
        timeframe: 'Next_30_Days',
        impact: 'High',
        description: profile.videoLink 
          ? "Optimize your highlight video. Coaches spend 30s avg on a reel. Ensure your first 4 clips are undeniable 'Elite' moments. Remove fluff and music intros."
          : "URGENT: Create a highlight video. You cannot be recruited without one. Record your next 3 matches and produce a 3-5 minute reel immediately."
      };
      plan.unshift(newVideoItem);
    } else if (videoIndex > 0) {
      const [item] = plan.splice(videoIndex, 1);
      plan.unshift(item);
    }
    
    return plan.slice(0, 5);
  }, [rawActionPlan, profile.videoLink]);

  const getImpactBadge = (impact: string) => {
    switch(impact) {
      case 'High': 
        return { 
          color: 'text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20', 
          icon: TrendingUp, 
          label: 'High Impact' 
        };
      case 'Medium': 
        return { 
          color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20', 
          icon: Activity, 
          label: 'Med Impact' 
        };
      default: 
        return { 
          color: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50', 
          icon: Minus, 
          label: 'Low Impact' 
        };
    }
  };

  const getProbabilityStatus = (score: number) => {
    if (score < 25) return { label: 'very low', color: '#ef4444', textClass: 'text-red-500' };
    if (score < 50) return { label: 'low', color: '#f97316', textClass: 'text-orange-500' };
    if (score < 75) return { label: 'medium', color: '#eab308', textClass: 'text-yellow-600 dark:text-yellow-500' };
    return { label: 'high', color: '#10b981', textClass: 'text-emerald-600 dark:text-emerald-500' };
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full animate-fade-in print:p-0" data-testid="analysis-result">
      <PrintHeader profile={profile} />

      <div className="flex justify-between items-center mb-8 print:hidden">
        <button 
          onClick={onReset}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center text-sm transition-colors"
          data-testid="button-back"
        >
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back to Form
        </button>

        <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-white/10 flex">
          <button
            type="button" 
            onClick={() => setViewMode('player')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'player' 
                ? 'bg-emerald-500 text-slate-900 shadow-md' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            data-testid="button-view-player"
          >
            Player View
          </button>
          <button
            type="button" 
            onClick={() => setViewMode('coach')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'coach' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            data-testid="button-view-coach"
          >
            Coach View
          </button>
        </div>
      </div>

      {viewMode === 'coach' ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6 font-mono text-sm shadow-xl dark:shadow-none">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8">
              <div>
                <span className="block text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider mb-1">Name</span>
                <span className="text-slate-900 dark:text-white font-bold">{profile.lastName}, {profile.firstName}</span>
              </div>
              <div>
                <span className="block text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider mb-1">Class</span>
                <span className="text-slate-900 dark:text-white">{profile.gradYear}</span>
              </div>
              <div>
                <span className="block text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider mb-1">Position</span>
                <span className="text-slate-900 dark:text-white">{profile.position} {profile.secondaryPositions && profile.secondaryPositions.length > 0 && `(${profile.secondaryPositions[0]})`}</span>
              </div>
              <div>
                <span className="block text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider mb-1">Primary Level</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">{bestLevel?.level || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-xl dark:shadow-none">
            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-mono uppercase tracking-widest mb-2 flex items-center">
              <Shield className="w-4 h-4 mr-2" /> Internal Scouting Note
            </h3>
            <p className="text-lg md:text-xl text-slate-900 dark:text-white font-medium leading-relaxed border-l-4 border-blue-500 pl-4 py-1 italic">
              "{result.coachShortEvaluation || "Data insufficient for evaluation."}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
              <h3 className="text-slate-900 dark:text-white font-bold mb-4">Recruiting Visibility</h3>
              <div className="space-y-4">
                {sortedVisibility.map((item) => (
                  <div key={item.level} className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-sm w-12">{item.level}</span>
                    <div className="flex-1 mx-4 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${item.visibilityPercent > 50 ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                        style={{ width: `${item.visibilityPercent}%` }}
                      ></div>
                    </div>
                    <span className="text-slate-900 dark:text-white font-mono text-sm w-8 text-right">{item.visibilityPercent}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-sm">
              <h3 className="text-slate-900 dark:text-white font-bold mb-4">Key Constraints</h3>
              <ul className="space-y-3">
                {keyRisks.map((risk, i) => (
                  <li key={i} className="flex items-start text-sm text-slate-600 dark:text-slate-300">
                    <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 mr-2 mt-0.5 shrink-0" />
                    <span>{risk.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-emerald-500 dark:text-emerald-400" />
              Executive Summary
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
              {result.plainLanguageSummary}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                <Target className="w-5 h-5 mr-2 text-emerald-500 dark:text-emerald-400" />
                Player Readiness
              </h3>
              <SimpleRadarChart data={readinessScore} isDark={isDark} />
            </div>

            <div className="lg:col-span-2 bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-emerald-500 dark:text-emerald-400" />
                  Recruiting Probabilities
                </h3>
                
                <div className="mb-6">
                  <SimpleBarChart data={chartData} isDark={isDark} />
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 mt-2">
                {['D1', 'D2', 'D3', 'NAIA', 'JUCO'].map((lvl) => {
                  const score = visibilityScores.find(v => normalizeLevel(v.level) === lvl)?.visibilityPercent || 0;
                  const status = getProbabilityStatus(score);
                  return (
                    <div key={lvl} className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded p-2 text-center">
                      <div className="text-slate-900 dark:text-white font-bold text-xs mb-0.5">{lvl}</div>
                      <div className={`text-[10px] font-medium leading-tight ${status.textClass}`}>
                        {status.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {benchmarkAnalysis.length > 0 && (
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-blue-500/20 shadow-lg dark:shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 opacity-50"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Reality Check: You vs The Market</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Comparing your current profile against typical commits.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {benchmarkAnalysis.map((metric, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-lg border border-slate-200 dark:border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">{metric.category}</h4>
                      <span className={`text-lg font-bold ${metric.userScore >= metric.d1Average ? 'text-emerald-500' : metric.userScore >= metric.d3Average ? 'text-yellow-500' : 'text-red-500'}`}>{metric.userScore}</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${metric.userScore}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{metric.feedback}</p>
                    <div className="flex gap-4 mt-2 text-[10px] text-slate-400">
                      <span>D1 Avg: {metric.d1Average}</span>
                      <span>D3 Avg: {metric.d3Average}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-emerald-500 dark:text-emerald-400" />
              90-Day Action Plan
            </h3>
            <div className="space-y-4">
              {finalActionPlan.map((item, i) => {
                const badge = getImpactBadge(item.impact);
                const BadgeIcon = badge.icon;
                return (
                  <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-950/30 rounded-lg border border-slate-200 dark:border-white/5">
                    <div className={`px-2 py-1 rounded text-[10px] font-bold border ${badge.color}`}>
                      <BadgeIcon className="w-3 h-3 inline mr-1" />
                      {badge.label}
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] text-slate-400 font-mono uppercase">{item.timeframe.replace(/_/g, ' ')}</span>
                      <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-500" />
                Key Strengths
              </h3>
              <ul className="space-y-2">
                {keyStrengths.map((strength, i) => (
                  <li key={i} className="flex items-start text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
                Risk Factors
              </h3>
              <ul className="space-y-2">
                {keyRisks.map((risk, i) => (
                  <li key={i} className="flex items-start text-sm text-slate-600 dark:text-slate-300">
                    <AlertTriangle className={`w-4 h-4 mr-2 mt-0.5 shrink-0 ${risk.severity === 'High' ? 'text-red-500' : risk.severity === 'Medium' ? 'text-amber-500' : 'text-slate-400'}`} />
                    <div>
                      <span className={`text-[10px] font-bold uppercase mr-2 ${risk.severity === 'High' ? 'text-red-500' : risk.severity === 'Medium' ? 'text-amber-500' : 'text-slate-400'}`}>{risk.severity}</span>
                      {risk.message}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-4 border border-slate-200 dark:border-white/5 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${funnelAnalysis.stage === 'Invisible' ? 'bg-red-500' : funnelAnalysis.stage === 'Outreach' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
              <div>
                <span className="text-xs text-slate-400 font-mono uppercase">Funnel Stage</span>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{funnelAnalysis.stage} • {funnelAnalysis.conversionRate}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-mono uppercase">Bottleneck</span>
              <p className="text-sm text-slate-600 dark:text-slate-300">{funnelAnalysis.bottleneck}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
