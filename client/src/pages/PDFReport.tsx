import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'wouter';
import type { AnalysisResult, PlayerProfile, ActionItem } from '../../../shared/exposure-types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  AlertTriangle, CheckCircle2, Calendar, Shield, 
  TrendingUp, Activity, Minus, AlertCircle, Zap, Target, Trophy, Share2
} from 'lucide-react';

declare global {
  interface Window {
    __PDF_READY__?: boolean;
  }
}

const PDFReportPage = () => {
  const { token } = useParams();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError('No report token provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/public/pdf/data/${token}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to load report');
        }

        setResult(data.result);
        setProfile(data.profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    if (result && profile && !loading) {
      setTimeout(() => {
        window.__PDF_READY__ = true;
      }, 1000);
    }
  }, [result, profile, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading report...</div>
      </div>
    );
  }

  if (error || !result || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-red-400">{error || 'Report not found'}</div>
      </div>
    );
  }

  return <PDFReportContent result={result} profile={profile} />;
};

interface ContentProps {
  result: AnalysisResult;
  profile: PlayerProfile;
}

const PDFReportContent = ({ result, profile }: ContentProps) => {
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
          ? "Optimize your highlight video. Coaches spend 30s avg on a reel. Ensure your first 4 clips are undeniable 'Elite' moments."
          : "URGENT: Create a highlight video. You cannot be recruited without one. Record your next 3 matches and produce a 3-5 minute reel."
      };
      plan.unshift(newVideoItem);
    } else if (videoIndex > 0) {
      const [item] = plan.splice(videoIndex, 1);
      plan.unshift(item);
    }

    return plan.slice(0, 5);
  }, [rawActionPlan, profile.videoLink]);

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'High':
        return { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: TrendingUp, label: 'High Impact' };
      case 'Medium':
        return { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: Activity, label: 'Med Impact' };
      default:
        return { color: 'text-slate-400 bg-slate-800/50 border-slate-700/50', icon: Minus, label: 'Low Impact' };
    }
  };

  const getProbabilityStatus = (score: number) => {
    if (score < 25) return { label: 'very low', color: '#ef4444', textClass: 'text-red-500' };
    if (score < 50) return { label: 'low', color: '#f97316', textClass: 'text-orange-500' };
    if (score < 75) return { label: 'medium', color: '#eab308', textClass: 'text-yellow-500' };
    return { label: 'high', color: '#10b981', textClass: 'text-emerald-500' };
  };

  const radarData = [
    { subject: 'Athletic', A: readinessScore.athletic, fullMark: 100 },
    { subject: 'Technical', A: readinessScore.technical, fullMark: 100 },
    { subject: 'Market', A: readinessScore.market, fullMark: 100 },
    { subject: 'Academic', A: readinessScore.academic, fullMark: 100 },
    { subject: 'Tactical', A: readinessScore.tactical, fullMark: 100 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6">
      <div className="max-w-[900px] mx-auto space-y-5">
        
        {/* Header */}
        <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Exposure<span className="text-emerald-500">Engine</span> Report
            </h1>
            <p className="text-sm text-slate-400 mt-1">Generated via Warubi Sports Analytics</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-slate-200">{profile.firstName} {profile.lastName}</h2>
            <p className="text-sm text-slate-400">Class of {profile.gradYear} • {profile.position}</p>
            <p className="text-xs text-slate-500 mt-1">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-emerald-400" />
            Executive Summary
          </h3>
          <p className="text-slate-300 text-base leading-relaxed">
            {result.plainLanguageSummary}
          </p>
        </div>

        {/* Player Readiness - Radar Chart */}
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-emerald-400" />
            Player Readiness
          </h3>
          <div className="flex justify-center">
            <div style={{ width: 350, height: 250 }}>
              <RadarChart cx={175} cy={125} outerRadius={90} width={350} height={250} data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="You" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} isAnimationActive={false} />
              </RadarChart>
            </div>
          </div>
        </div>

        {/* Recruiting Probabilities - Bar Chart */}
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-emerald-400" />
            Recruiting Probabilities
          </h3>
          <div style={{ width: '100%', height: 200 }}>
            <BarChart data={chartData} layout="vertical" width={850} height={200} margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                dataKey="level"
                type="category"
                width={60}
                tick={{ fill: '#94a3b8', fontWeight: 700, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
              <Bar dataKey="visibilityPercent" radius={[0, 4, 4, 0]} barSize={24} isAnimationActive={false}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getProbabilityStatus(entry.visibilityPercent).color} />
                ))}
              </Bar>
            </BarChart>
          </div>

          {/* Probability Grid */}
          <div className="grid grid-cols-5 gap-2 mt-4">
            {['D1', 'D2', 'D3', 'NAIA', 'JUCO'].map((lvl) => {
              const score = visibilityScores.find(v => normalizeLevel(v.level) === lvl)?.visibilityPercent || 0;
              const status = getProbabilityStatus(score);
              return (
                <div key={lvl} className="bg-slate-950/50 border border-slate-800 rounded p-2 text-center">
                  <div className="text-white font-bold text-xs mb-0.5">{lvl}</div>
                  <div className={`text-[10px] font-medium ${status.textClass}`}>
                    {status.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Strengths */}
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-400" />
            Key Strengths
          </h3>
          <div className="space-y-2">
            {keyStrengths.map((s, i) => (
              <div key={i} className="flex items-start p-3 bg-emerald-500/5 border-l-3 border-emerald-500 rounded-r">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-3 mt-0.5 shrink-0" />
                <span className="text-slate-200 text-sm">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recruiting Funnel */}
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <Share2 className="w-5 h-5 mr-2 text-purple-400" />
            Recruiting Funnel
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4 text-center">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Outreach</div>
              <div className="text-2xl font-bold text-white">{profile.coachesContacted}</div>
              <div className="text-xs text-slate-400">coaches contacted</div>
            </div>
            <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4 text-center">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Responses</div>
              <div className="text-2xl font-bold text-white">{profile.responsesReceived}</div>
              <div className="text-xs text-slate-400">{funnelAnalysis.conversionRate}</div>
            </div>
            <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4 text-center">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Offers</div>
              <div className="text-2xl font-bold text-emerald-400">{profile.offersReceived}</div>
              <div className="text-xs text-slate-400">current stage</div>
            </div>
          </div>
          <div className="bg-purple-900/20 border border-purple-500/20 p-4 rounded-lg">
            <span className="text-xs font-bold text-purple-400 uppercase block mb-1">Funnel Diagnosis</span>
            <p className="text-sm text-purple-100">{funnelAnalysis.advice}</p>
          </div>
        </div>

        {/* Performance Constraints */}
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-amber-400" />
            Performance Constraints
          </h3>
          <div className="space-y-3">
            {keyRisks.map((risk, idx) => (
              <div key={idx} className={`p-4 rounded-lg border flex items-start ${
                risk.severity === 'High'
                  ? 'bg-red-900/10 border-red-500/30'
                  : risk.severity === 'Medium'
                  ? 'bg-amber-900/10 border-amber-500/30'
                  : 'bg-blue-900/10 border-blue-500/30'
              }`}>
                <AlertCircle className={`w-5 h-5 mr-3 mt-0.5 shrink-0 ${
                  risk.severity === 'High' ? 'text-red-400' : risk.severity === 'Medium' ? 'text-amber-400' : 'text-blue-400'
                }`} />
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                    risk.severity === 'High' ? 'text-red-400' : risk.severity === 'Medium' ? 'text-amber-400' : 'text-blue-400'
                  }`}>
                    {risk.severity === 'High' ? 'Critical Blocker' : risk.severity === 'Medium' ? 'Warning' : 'Optimization'} • {risk.category}
                  </span>
                  <p className="text-sm text-slate-300 leading-snug">{risk.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 90 Day Game Plan */}
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-emerald-400" />
            90 Day Game Plan
          </h3>
          <div className="space-y-3">
            {finalActionPlan.map((item, index) => {
              const videoKeywords = ['video', 'highlight', 'reel', 'film', 'footage'];
              const isVideoAction = videoKeywords.some(k => item.description.toLowerCase().includes(k));
              const impactConfig = getImpactBadge(item.impact);
              const ImpactIcon = impactConfig.icon;

              return (
                <div key={index} className={`p-4 rounded-xl border flex gap-4 items-start ${
                  isVideoAction
                    ? 'border-blue-500/50 border-dashed bg-blue-900/10'
                    : 'border-slate-800 bg-slate-950/40'
                }`}>
                  {isVideoAction && (
                    <div className="absolute -top-2 left-4 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                      Critical
                    </div>
                  )}
                  <div className="flex items-center space-x-2 shrink-0 w-28">
                    <div className={`w-2 h-2 rounded-full ${isVideoAction ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                    <span className={`text-xs font-mono font-bold uppercase ${isVideoAction ? 'text-blue-300' : 'text-slate-400'}`}>
                      {item.timeframe.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm leading-relaxed ${isVideoAction ? 'text-blue-50 font-medium' : 'text-slate-200'}`}>
                      {item.description}
                    </p>
                  </div>
                  <div className={`shrink-0 flex items-center space-x-1 px-2 py-1 rounded border text-[10px] font-bold uppercase ${impactConfig.color}`}>
                    <ImpactIcon className="w-3 h-3" />
                    <span>{impactConfig.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4 border-t border-slate-800 mt-6">
          <p className="text-xs text-slate-500">
            <strong className="text-slate-400">ExposureEngine</strong> by Warubi Sports • {new Date().toLocaleDateString()} • warubisports.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default PDFReportPage;
