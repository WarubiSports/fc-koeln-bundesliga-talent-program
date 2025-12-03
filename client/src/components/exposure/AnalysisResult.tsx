import { useState, useMemo } from 'react';
import type { AnalysisResult, RiskFlag, ActionItem, PlayerProfile, BenchmarkMetric } from '../../../../shared/exposure-types';
import { 
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Cell, ReferenceLine, Tooltip
} from 'recharts';
import { 
  AlertTriangle, CheckCircle2, Calendar, ArrowLeft, Shield, 
  TrendingUp, Activity, Minus, AlertCircle, Zap, Target, Trophy,
  Printer, Mail, Globe, ArrowRight, Share2
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

  const radarData = [
    { subject: 'Athletic', A: readinessScore.athletic, fullMark: 100 },
    { subject: 'Techn', A: readinessScore.technical, fullMark: 100 },
    { subject: 'Market', A: readinessScore.market, fullMark: 100 },
    { subject: 'Academic', A: readinessScore.academic, fullMark: 100 },
    { subject: 'ictical', A: readinessScore.tactical, fullMark: 100 },
  ];

  const barChartData = sortedVisibility.map(item => ({
    level: `NCAA ${normalizeLevel(item.level)}`,
    score: item.visibilityPercent,
    displayLevel: normalizeLevel(item.level)
  }));

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

  const getBarColor = (score: number) => {
    if (score >= 70) return '#10b981';
    if (score >= 50) return '#eab308';
    if (score >= 30) return '#f97316';
    return '#ef4444';
  };

  const getProbabilityStatus = (score: number) => {
    if (score < 25) return { label: 'very low', color: '#ef4444', textClass: 'text-red-400' };
    if (score < 50) return { label: 'low', color: '#f97316', textClass: 'text-orange-400' };
    if (score < 75) return { label: 'medium', color: '#eab308', textClass: 'text-yellow-400' };
    return { label: 'high', color: '#10b981', textClass: 'text-emerald-400' };
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailReport = () => {
    const subject = encodeURIComponent(`ExposureEngine Report - ${profile.firstName} ${profile.lastName}`);
    const body = encodeURIComponent(`View my college soccer recruiting analysis from ExposureEngine by Warubi Sports.`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const parseRecruitingFunnel = () => {
    const contacted = parseInt(funnelAnalysis.conversionRate?.match(/\d+/)?.[0] || '0') || 40;
    const replies = Math.round(contacted * 0.3);
    const offers = Math.round(replies * 0.17);
    return { contacted, replies, offers, replyRate: '30%' };
  };

  const funnelData = parseRecruitingFunnel();

  return (
    <div className="w-full animate-fade-in print:p-0" data-testid="analysis-result">
      <PrintHeader profile={profile} />

      <div className="flex justify-between items-center mb-8 print:hidden">
        <button 
          onClick={onReset}
          className="text-slate-400 hover:text-white flex items-center text-sm transition-colors"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Form
        </button>

        <div className="bg-slate-800/50 p-1 rounded-lg border border-slate-700 flex">
          <button
            type="button" 
            onClick={() => setViewMode('player')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'player' 
                ? 'bg-emerald-500 text-slate-900 shadow-md' 
                : 'text-slate-400 hover:text-white'
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
                : 'text-slate-400 hover:text-white'
            }`}
            data-testid="button-view-coach"
          >
            Coach View
          </button>
        </div>
      </div>

      {viewMode === 'coach' ? (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 font-mono text-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8">
              <div>
                <span className="block text-slate-500 text-[10px] uppercase tracking-wider mb-1">Name</span>
                <span className="text-white font-bold">{profile.lastName}, {profile.firstName}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[10px] uppercase tracking-wider mb-1">Class</span>
                <span className="text-white">{profile.gradYear}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[10px] uppercase tracking-wider mb-1">Position</span>
                <span className="text-white">{profile.position} {profile.secondaryPositions && profile.secondaryPositions.length > 0 && `(${profile.secondaryPositions[0]})`}</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[10px] uppercase tracking-wider mb-1">Primary Level</span>
                <span className="text-blue-400 font-bold">{bestLevel?.level || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
            <h3 className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-2 flex items-center">
              <Shield className="w-4 h-4 mr-2" /> Internal Scouting Note
            </h3>
            <p className="text-lg md:text-xl text-white font-medium leading-relaxed border-l-4 border-blue-500 pl-4 py-1 italic">
              "{result.coachShortEvaluation || "Data insufficient for evaluation."}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
              <h3 className="text-white font-bold mb-4">Recruiting Visibility</h3>
              <div className="space-y-4">
                {sortedVisibility.map((item) => (
                  <div key={item.level} className="flex items-center justify-between">
                    <span className="text-slate-400 font-mono text-sm w-12">{item.level}</span>
                    <div className="flex-1 mx-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full"
                        style={{ width: `${item.visibilityPercent}%`, backgroundColor: getBarColor(item.visibilityPercent) }}
                      ></div>
                    </div>
                    <span className="text-white font-mono text-sm w-8 text-right">{item.visibilityPercent}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
              <h3 className="text-white font-bold mb-4">Key Constraints</h3>
              <ul className="space-y-3">
                {keyRisks.map((risk, i) => (
                  <li key={i} className="flex items-start text-sm text-slate-300">
                    <AlertCircle className="w-4 h-4 text-red-400 mr-2 mt-0.5 shrink-0" />
                    <span>{risk.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Executive Summary */}
          <div className="bg-slate-900/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-700/50">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-emerald-400" />
              Executive Summary
            </h3>
            <p className="text-slate-300 text-lg leading-relaxed">
              {result.plainLanguageSummary}
            </p>
          </div>

          {/* Player Readiness + Recruiting Probabilities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Radar Chart - Player Readiness */}
            <div className="bg-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-emerald-400" />
                Player Readiness
              </h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar 
                      name="You" 
                      dataKey="A" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 text-center">
                * Analysis based on self-reported<br/>ratings relative to current league level.<br/>Not independently verified.
              </p>
            </div>

            {/* Bar Chart - Recruiting Probabilities */}
            <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-emerald-400" />
                Recruiting Probabilities
              </h3>
              
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={barChartData} 
                    layout="vertical" 
                    margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
                  >
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis 
                      dataKey="level" 
                      type="category" 
                      width={70} 
                      tick={{ fill: '#94a3b8', fontWeight: 600, fontSize: 12 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Probability Labels */}
              <div className="grid grid-cols-5 gap-2 mt-4">
                {['D1', 'D2', 'D3', 'NAIA', 'JUCO'].map((lvl) => {
                  const score = visibilityScores.find(v => normalizeLevel(v.level) === lvl)?.visibilityPercent || 0;
                  const status = getProbabilityStatus(score);
                  return (
                    <div key={lvl} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
                      <div className="text-white font-bold text-sm mb-1">{lvl}</div>
                      <div className={`text-xs font-medium ${status.textClass}`}>
                        {status.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reality Check: You vs The Market */}
          {benchmarkAnalysis.length > 0 && (
            <div className="bg-slate-900/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-700/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Reality Check: You vs The Market</h3>
                  <p className="text-sm text-slate-400">Comparing your current profile against typical commits.</p>
                </div>
                <div className="flex items-center gap-6 mt-4 md:mt-0 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-3 bg-emerald-500/50 border border-emerald-500"></div>
                    <span className="text-slate-400">YOU</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 border-t-2 border-dashed border-slate-400"></div>
                    <span className="text-slate-400">D1 AVG</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 border-t-2 border-dashed border-emerald-400"></div>
                    <span className="text-slate-400">D3 AVG</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {benchmarkAnalysis.map((metric, idx) => (
                  <div key={idx} className="relative">
                    {/* Vertical Bar Chart */}
                    <div className="h-48 bg-slate-800/30 rounded-lg border border-slate-700/50 relative overflow-hidden">
                      {/* D1 Average Line */}
                      <div 
                        className="absolute w-full border-t-2 border-dashed border-slate-400 z-10"
                        style={{ bottom: `${metric.d1Average}%` }}
                      >
                        <span className="absolute right-1 -top-4 text-[10px] text-slate-400 font-mono">D1</span>
                      </div>
                      {/* D3 Average Line */}
                      <div 
                        className="absolute w-full border-t-2 border-dashed border-emerald-400 z-10"
                        style={{ bottom: `${metric.d3Average}%` }}
                      >
                        <span className="absolute right-1 -top-4 text-[10px] text-emerald-400 font-mono">D3</span>
                      </div>
                      {/* User Score Bar */}
                      <div 
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 bg-emerald-500/40 border-2 border-emerald-500 rounded-t-lg transition-all duration-500"
                        style={{ height: `${metric.userScore}%` }}
                      ></div>
                    </div>
                    <h4 className="text-sm font-bold text-slate-300 mt-3 text-center uppercase tracking-wider">{metric.category}</h4>
                    
                    {/* Insight Box */}
                    <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">INSIGHT</span>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{metric.feedback}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recruiting Funnel + Performance Constraints */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recruiting Funnel */}
            <div className="bg-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                <Share2 className="w-5 h-5 mr-2 text-purple-400" />
                Recruiting Funnel
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-slate-500 border-2 border-slate-400"></div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">OUTREACH</span>
                    <p className="text-lg font-bold text-white">{funnelData.contacted} Coaches Contacted</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-slate-600 border-2 border-slate-500"></div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">INTEREST</span>
                    <p className="text-lg font-bold text-white">{funnelData.replies} Replies ({funnelData.replyRate} Reply Rate)</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">RESULTS</span>
                    <p className="text-lg font-bold text-white">{funnelData.offers} Offers</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">FUNNEL DIAGNOSIS</span>
                <p className="text-slate-300 text-sm mt-2">{funnelAnalysis.advice}</p>
              </div>
            </div>

            {/* Performance Constraints */}
            <div className="bg-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-amber-400" />
                Performance Constraints
              </h3>
              
              <div className="space-y-4">
                {keyRisks.map((risk, i) => (
                  <div key={i} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">WARNING</span>
                    </div>
                    <h4 className="text-white font-bold text-sm mb-1">{risk.category || 'Risk Factor'}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{risk.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 90 Day Game Plan */}
          <div className="bg-slate-900/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-700/50">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-emerald-400" />
              90 Day Game Plan
            </h3>
            
            <div className="space-y-4">
              {finalActionPlan.map((item, i) => {
                const isFirst = i === 0;
                return (
                  <div 
                    key={i} 
                    className={`flex flex-col md:flex-row items-start gap-4 p-4 rounded-lg border ${
                      isFirst 
                        ? 'bg-amber-500/10 border-amber-500/30' 
                        : 'bg-slate-800/50 border-slate-700/50'
                    }`}
                  >
                    {isFirst && (
                      <span className="bg-amber-500 text-slate-900 text-[10px] font-bold uppercase px-2 py-1 rounded">
                        Critical Action Item
                      </span>
                    )}
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${item.impact === 'High' ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                      <span className="text-slate-400 font-mono text-xs uppercase whitespace-nowrap">
                        {item.timeframe.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="flex-1 text-slate-200 text-sm leading-relaxed">{item.description}</p>
                    {item.impact === 'High' && (
                      <span className="flex items-center gap-1 text-amber-400 text-xs font-bold whitespace-nowrap">
                        <TrendingUp className="w-3 h-3" /> HIGH IMPACT
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save Your Report */}
          <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
            <div>
              <h3 className="text-lg font-bold text-white">Save Your Report</h3>
              <p className="text-slate-400 text-sm">Download a PDF copy or email this analysis to yourself.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
                data-testid="button-print"
              >
                <Printer className="w-4 h-4" />
                Print / PDF
              </button>
              <button
                onClick={handleEmailReport}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-lg transition-colors font-medium"
                data-testid="button-email"
              >
                <Mail className="w-4 h-4" />
                Email Report
              </button>
            </div>
          </div>

          {/* Warubi Sports Elite Pathways */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8 rounded-2xl border border-slate-700/50 relative overflow-hidden print:hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-blue-500/5"></div>
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">International & Pro Level</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Warubi Sports Elite Pathways</h3>
                <p className="text-slate-400 max-w-lg">
                  Beyond analytics, we provide direct access to professional development. Exclusive residential academies in Germany, FIFA-licensed agency representation, and UEFA coaching education.
                </p>
              </div>
              <button
                onClick={() => window.open('/ecosystem.html', '_blank')}
                className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-lg transition-colors font-bold whitespace-nowrap"
                data-testid="button-elite-pathways"
              >
                Request Access <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
