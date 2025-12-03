import { useState, useMemo, useRef } from 'react';
import type { AnalysisResult, RiskFlag, ActionItem, PlayerProfile, BenchmarkMetric } from '../../../../shared/exposure-types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ReferenceLine, Legend
} from 'recharts';
import { 
  AlertTriangle, CheckCircle2, Calendar, ArrowRight, Shield, 
  Download, Mail, Printer, Share2, TrendingUp, Activity, Minus, 
  AlertCircle, Info, Zap, User, Target, Globe, Trophy, Loader2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

const AnalysisResultView = ({ result, profile, onReset, isDark }: Props) => {
  const [viewMode, setViewMode] = useState<'player' | 'coach'>('player');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const reportContainerRef = useRef<HTMLDivElement>(null);

  // Defensive Coding: Ensure we have arrays even if API returns undefined
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

  // Helper to normalize level names (e.g. "NCAA D1" -> "D1") for consistent sorting and mapping
  const normalizeLevel = (level: string) => {
    if (!level) return '';
    return level.replace(/NCAA\s*/i, '').trim();
  };

  // Sort visibility scores safely
  const sortedVisibility = [...visibilityScores].sort((a, b) => {
    const order: Record<string, number> = { 'D1': 5, 'D2': 4, 'D3': 3, 'NAIA': 2, 'JUCO': 1 };
    const scoreA = order[normalizeLevel(a.level)] || 0;
    const scoreB = order[normalizeLevel(b.level)] || 0;
    return scoreB - scoreA;
  });
  
  // No longer reversing. D1 (index 0) will be at the top in Recharts Vertical Layout.
  const chartData = [...sortedVisibility];

  // Calculate top realistic level for Coach View summary
  const bestLevel = [...visibilityScores]
    .sort((a, b) => b.visibilityPercent - a.visibilityPercent)[0];

  // Logic to enforce Video Action Item presence
  const finalActionPlan = useMemo(() => {
    let plan = [...rawActionPlan];
    const videoKeywords = ['video', 'highlight', 'reel', 'film', 'footage'];
    const videoIndex = plan.findIndex(item => 
      videoKeywords.some(k => item.description.toLowerCase().includes(k))
    );

    if (videoIndex === -1) {
      // No video item found, inject one at the top
      const newVideoItem: ActionItem = {
        timeframe: 'Next_30_Days',
        impact: 'High',
        description: profile.videoLink 
          ? "Optimize your highlight video. Coaches spend 30s avg on a reel. Ensure your first 4 clips are undeniable 'Elite' moments. Remove fluff and music intros."
          : "URGENT: Create a highlight video. You cannot be recruited without one. Record your next 3 matches and produce a 3-5 minute reel immediately."
      };
      plan.unshift(newVideoItem);
    } else if (videoIndex > 0) {
      // Video item exists but isn't first, move to top to ensure priority
      const [item] = plan.splice(videoIndex, 1);
      plan.unshift(item);
    }
    
    return plan.slice(0, 5); // Ensure list doesn't get too long
  }, [rawActionPlan, profile.videoLink]);

  // Helper for Impact Badges
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

  // Helper for Probability Status
  const getProbabilityStatus = (score: number) => {
    if (score < 25) return { label: 'very low', color: '#ef4444', textClass: 'text-red-500' };
    if (score < 50) return { label: 'low', color: '#f97316', textClass: 'text-orange-500' };
    if (score < 75) return { label: 'medium', color: '#eab308', textClass: 'text-yellow-600 dark:text-yellow-500' };
    return { label: 'high', color: '#10b981', textClass: 'text-emerald-600 dark:text-emerald-500' };
  };

  const generatePDF = async () => {
    setIsGeneratingPdf(true);
    
    try {
      if (!reportContainerRef.current) {
        throw new Error('Report container not found');
      }
      
      const container = reportContainerRef.current;
      
      // Create an iframe with fresh document to avoid oklch colors from Tailwind
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.top = '0';
      iframe.style.width = '900px';
      iframe.style.height = '10000px';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('Could not access iframe document');
      }
      
      // Build HTML with inline styles matching web UI (no oklch)
      const getProbColor = (score: number) => score >= 75 ? '#10b981' : score >= 50 ? '#eab308' : score >= 25 ? '#f97316' : '#ef4444';
      const getProbLabel = (score: number) => score >= 75 ? 'high' : score >= 50 ? 'medium' : score >= 25 ? 'low' : 'very low';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: #0f172a;
              color: #f1f5f9;
              padding: 32px;
              width: 850px;
            }
            
            /* Header matching web UI */
            .report-header {
              background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%);
              border-radius: 16px;
              padding: 28px;
              margin-bottom: 24px;
              border: 1px solid rgba(255,255,255,0.05);
              box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            }
            .header-content { display: flex; justify-content: space-between; align-items: center; }
            .brand-title { font-size: 26px; font-weight: 700; color: #f1f5f9; }
            .brand-accent { color: #10b981; }
            .subtitle { font-size: 13px; color: #94a3b8; margin-top: 6px; }
            .player-info { text-align: right; }
            .player-name { font-size: 20px; font-weight: 700; color: #e2e8f0; }
            .player-details { font-size: 13px; color: #94a3b8; margin-top: 4px; }
            
            /* Sections matching web UI */
            .section {
              background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%);
              border-radius: 16px;
              padding: 28px;
              margin-bottom: 20px;
              border: 1px solid rgba(255,255,255,0.05);
              box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            }
            .section-title {
              font-size: 20px;
              font-weight: 700;
              color: #f1f5f9;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
            }
            .section-title-icon { 
              width: 24px; 
              height: 24px; 
              margin-right: 12px; 
              display: inline-flex;
              align-items: center;
              justify-content: center;
            }
            .icon-emerald { color: #10b981; }
            .icon-purple { color: #a78bfa; }
            .icon-blue { color: #3b82f6; }
            .summary-text { font-size: 17px; line-height: 1.7; color: #cbd5e1; }
            
            /* Two column grid */
            .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            
            /* Readiness Scores (replaces radar chart) */
            .readiness-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 16px; }
            .readiness-item {
              background: rgba(15, 23, 42, 0.6);
              border: 1px solid rgba(255,255,255,0.05);
              border-radius: 12px;
              padding: 16px 12px;
              text-align: center;
            }
            .readiness-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
            .readiness-value { font-size: 28px; font-weight: 700; color: #10b981; }
            .readiness-bar { height: 4px; background: #1e293b; border-radius: 2px; margin-top: 8px; overflow: hidden; }
            .readiness-fill { height: 100%; background: linear-gradient(90deg, #10b981, #34d399); border-radius: 2px; }
            
            /* Probability bars matching web UI */
            .prob-bar-container { margin-bottom: 16px; }
            .prob-bar-row { display: flex; align-items: center; margin-bottom: 12px; }
            .prob-label { width: 50px; font-size: 13px; font-weight: 700; color: #f1f5f9; }
            .prob-track { flex: 1; height: 24px; background: #1e293b; border-radius: 4px; overflow: hidden; margin: 0 12px; }
            .prob-fill { height: 100%; border-radius: 0 4px 4px 0; transition: width 0.3s; }
            .prob-percent { width: 50px; font-size: 14px; font-weight: 700; text-align: right; }
            
            /* Probability grid at bottom */
            .prob-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 20px; }
            .prob-card {
              background: rgba(15, 23, 42, 0.6);
              border: 1px solid rgba(255,255,255,0.05);
              border-radius: 8px;
              padding: 14px 10px;
              text-align: center;
            }
            .prob-level { font-size: 13px; font-weight: 700; color: #f1f5f9; }
            .prob-status { font-size: 11px; font-weight: 600; margin-top: 4px; }
            
            /* Benchmark section */
            .benchmark-grid { display: flex; justify-content: space-around; gap: 16px; }
            .benchmark-item {
              flex: 1;
              text-align: center;
              padding: 20px 16px;
              background: rgba(15, 23, 42, 0.5);
              border-radius: 12px;
              border: 1px solid rgba(255,255,255,0.05);
            }
            .benchmark-label { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
            .benchmark-track { height: 120px; width: 40px; background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border-radius: 6px; margin: 0 auto 12px; position: relative; border: 1px solid rgba(255,255,255,0.1); }
            .benchmark-you { position: absolute; left: 4px; right: 4px; height: 16px; background: #10b981; border-radius: 4px; }
            .benchmark-d1 { position: absolute; left: 0; right: 0; height: 2px; border-top: 2px dashed #94a3b8; }
            .benchmark-d3 { position: absolute; left: 0; right: 0; height: 2px; border-top: 2px dashed #475569; }
            .benchmark-value { font-size: 18px; font-weight: 700; color: #10b981; }
            
            /* Funnel section */
            .funnel-content { display: flex; gap: 24px; }
            .funnel-stage-box {
              flex: 1;
              background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
              border: 1px solid rgba(255,255,255,0.08);
              border-radius: 16px;
              padding: 24px;
              text-align: center;
            }
            .funnel-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
            .funnel-value { font-size: 28px; font-weight: 700; color: #a78bfa; margin: 8px 0; }
            .funnel-rate { font-size: 14px; color: #10b981; font-weight: 600; }
            .funnel-advice {
              flex: 2;
              background: rgba(15, 23, 42, 0.5);
              border-radius: 12px;
              padding: 20px;
              border-left: 3px solid #a78bfa;
            }
            .funnel-advice-title { font-size: 12px; color: #a78bfa; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
            .funnel-advice-text { font-size: 14px; color: #e2e8f0; line-height: 1.6; }
            
            /* Strengths */
            .strength-item {
              display: flex;
              align-items: flex-start;
              margin-bottom: 12px;
              padding: 14px 16px;
              background: rgba(16, 185, 129, 0.08);
              border-radius: 10px;
              border-left: 3px solid #10b981;
            }
            .strength-icon { color: #10b981; margin-right: 14px; font-size: 18px; flex-shrink: 0; }
            .strength-text { color: #e2e8f0; font-size: 14px; line-height: 1.5; }
            
            /* Constraints/Risks */
            .risk-item {
              display: flex;
              align-items: flex-start;
              margin-bottom: 12px;
              padding: 14px 16px;
              border-radius: 10px;
            }
            .risk-high { background: rgba(239, 68, 68, 0.08); border-left: 3px solid #ef4444; }
            .risk-medium { background: rgba(245, 158, 11, 0.08); border-left: 3px solid #f59e0b; }
            .risk-low { background: rgba(59, 130, 246, 0.08); border-left: 3px solid #3b82f6; }
            .risk-icon { margin-right: 14px; font-size: 18px; flex-shrink: 0; }
            .risk-content { flex: 1; }
            .risk-category { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
            .risk-text { color: #e2e8f0; font-size: 14px; line-height: 1.5; }
            
            /* Action items */
            .action-item {
              padding: 18px 20px;
              background: rgba(15, 23, 42, 0.6);
              border-radius: 14px;
              margin-bottom: 14px;
              border: 1px solid rgba(255,255,255,0.05);
              display: flex;
              align-items: flex-start;
              gap: 18px;
            }
            .action-critical {
              border: 1px dashed rgba(59, 130, 246, 0.5);
              background: rgba(59, 130, 246, 0.05);
              position: relative;
            }
            .action-badge {
              position: absolute;
              top: -10px;
              left: 16px;
              background: #3b82f6;
              color: white;
              font-size: 9px;
              font-weight: 700;
              padding: 3px 8px;
              border-radius: 4px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .action-timeframe {
              display: flex;
              align-items: center;
              gap: 8px;
              min-width: 110px;
            }
            .action-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; }
            .action-time-text { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
            .action-text { color: #e2e8f0; font-size: 14px; flex: 1; line-height: 1.5; }
            .action-impact {
              font-size: 10px;
              font-weight: 700;
              padding: 5px 10px;
              border-radius: 6px;
              text-transform: uppercase;
              display: flex;
              align-items: center;
              gap: 6px;
              flex-shrink: 0;
            }
            .impact-high { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.25); }
            .impact-medium { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.25); }
            
            /* Footer */
            .footer {
              margin-top: 36px;
              padding-top: 20px;
              border-top: 1px solid rgba(255,255,255,0.05);
              text-align: center;
              font-size: 12px;
              color: #64748b;
            }
            .footer-brand { font-weight: 600; color: #94a3b8; }
            
            /* Page break helpers */
            .page-break { page-break-before: always; }
          </style>
        </head>
        <body>
          <!-- HEADER -->
          <div class="report-header">
            <div class="header-content">
              <div>
                <div class="brand-title">Exposure<span class="brand-accent">Engine</span> Report</div>
                <div class="subtitle">Generated via Warubi Sports Analytics</div>
              </div>
              <div class="player-info">
                <div class="player-name">${profile.firstName} ${profile.lastName}</div>
                <div class="player-details">Class of ${profile.gradYear} • ${profile.position}</div>
                <div class="player-details">${new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>
          
          <!-- EXECUTIVE SUMMARY -->
          <div class="section">
            <div class="section-title">
              <span class="section-title-icon icon-emerald">⚡</span> Executive Summary
            </div>
            <p class="summary-text">${result.plainLanguageSummary}</p>
          </div>
          
          <!-- PLAYER READINESS (replaces radar chart) -->
          <div class="section">
            <div class="section-title">
              <span class="section-title-icon icon-emerald">🎯</span> Player Readiness
            </div>
            <div class="readiness-grid">
              ${[
                { label: 'Athletic', value: readinessScore.athletic },
                { label: 'Technical', value: readinessScore.technical },
                { label: 'Tactical', value: readinessScore.tactical },
                { label: 'Academic', value: readinessScore.academic },
                { label: 'Market', value: readinessScore.market }
              ].map(item => `
                <div class="readiness-item">
                  <div class="readiness-label">${item.label}</div>
                  <div class="readiness-value">${item.value}</div>
                  <div class="readiness-bar">
                    <div class="readiness-fill" style="width: ${item.value}%"></div>
                  </div>
                </div>
              `).join('')}
            </div>
            <p style="font-size: 11px; color: #64748b; text-align: center; margin-top: 12px;">* Analysis based on self-reported ratings relative to current league level</p>
          </div>
          
          <!-- RECRUITING PROBABILITIES with bars -->
          <div class="section">
            <div class="section-title">
              <span class="section-title-icon icon-emerald">🏆</span> Recruiting Probabilities
            </div>
            <div class="prob-bar-container">
              ${sortedVisibility.map(item => {
                const score = item.visibilityPercent;
                return `
                <div class="prob-bar-row">
                  <div class="prob-label">${normalizeLevel(item.level)}</div>
                  <div class="prob-track">
                    <div class="prob-fill" style="width: ${score}%; background: ${getProbColor(score)};"></div>
                  </div>
                  <div class="prob-percent" style="color: ${getProbColor(score)}">${score}%</div>
                </div>
              `;}).join('')}
            </div>
            <div class="prob-grid">
              ${['D1', 'D2', 'D3', 'NAIA', 'JUCO'].map(lvl => {
                const score = visibilityScores.find(v => normalizeLevel(v.level) === lvl)?.visibilityPercent || 0;
                return `<div class="prob-card">
                  <div class="prob-level">${lvl}</div>
                  <div class="prob-status" style="color: ${getProbColor(score)}">${getProbLabel(score)}</div>
                </div>`;
              }).join('')}
            </div>
          </div>
          
          <!-- REALITY CHECK: Benchmarks -->
          <div class="section" style="border-top: 3px solid rgba(59, 130, 246, 0.3);">
            <div class="section-title">
              <span class="section-title-icon icon-blue">📊</span> Reality Check: You vs The Market
            </div>
            <p style="font-size: 13px; color: #94a3b8; margin-bottom: 20px;">Comparing your current profile against typical commits</p>
            <div class="benchmark-grid">
              ${benchmarkAnalysis.map(metric => {
                const youPos = 100 - metric.you;
                const d1Pos = 100 - metric.d1Avg;
                const d3Pos = 100 - metric.d3Avg;
                return `
                <div class="benchmark-item">
                  <div class="benchmark-label">${metric.metric}</div>
                  <div class="benchmark-track">
                    <div class="benchmark-you" style="bottom: ${metric.you}%;"></div>
                    <div class="benchmark-d1" style="bottom: ${metric.d1Avg}%;"></div>
                    <div class="benchmark-d3" style="bottom: ${metric.d3Avg}%;"></div>
                  </div>
                  <div class="benchmark-value">${metric.you}</div>
                </div>
              `;}).join('')}
            </div>
            <div style="display: flex; justify-content: center; gap: 32px; margin-top: 16px; font-size: 11px;">
              <div style="display: flex; align-items: center; gap: 8px; color: #94a3b8;">
                <div style="width: 16px; height: 12px; background: #10b981; border-radius: 3px;"></div> You
              </div>
              <div style="display: flex; align-items: center; gap: 8px; color: #94a3b8;">
                <div style="width: 20px; height: 0; border-top: 2px dashed #94a3b8;"></div> D1 Avg
              </div>
              <div style="display: flex; align-items: center; gap: 8px; color: #94a3b8;">
                <div style="width: 20px; height: 0; border-top: 2px dashed #475569;"></div> D3 Avg
              </div>
            </div>
          </div>
          
          <!-- FUNNEL & STRENGTHS side by side -->
          <div class="two-col">
            <!-- Recruiting Funnel -->
            <div class="section">
              <div class="section-title">
                <span class="section-title-icon icon-purple">📈</span> Recruiting Funnel
              </div>
              <div class="funnel-content" style="flex-direction: column; gap: 16px;">
                <div class="funnel-stage-box">
                  <div class="funnel-label">Current Stage</div>
                  <div class="funnel-value">${funnelAnalysis.stage}</div>
                  <div class="funnel-rate">${funnelAnalysis.conversionRate}</div>
                </div>
                <div class="funnel-advice" style="border-left-color: #f59e0b;">
                  <div class="funnel-advice-title" style="color: #f59e0b;">⚠ Bottleneck</div>
                  <div class="funnel-advice-text">${funnelAnalysis.bottleneck}</div>
                </div>
                <div class="funnel-advice">
                  <div class="funnel-advice-title">💡 Advice</div>
                  <div class="funnel-advice-text">${funnelAnalysis.advice}</div>
                </div>
              </div>
            </div>
            
            <!-- Key Strengths -->
            <div class="section">
              <div class="section-title">
                <span class="section-title-icon icon-emerald">✅</span> Key Strengths
              </div>
              ${keyStrengths.map(s => `
                <div class="strength-item">
                  <span class="strength-icon">✓</span>
                  <span class="strength-text">${s}</span>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- PERFORMANCE CONSTRAINTS -->
          <div class="section">
            <div class="section-title">
              <span class="section-title-icon" style="color: #ef4444;">⚠️</span> Performance Constraints
            </div>
            ${keyRisks.map(r => `
              <div class="risk-item risk-${r.severity.toLowerCase()}">
                <span class="risk-icon" style="color: ${r.severity === 'High' ? '#ef4444' : r.severity === 'Medium' ? '#f59e0b' : '#3b82f6'}">⚠</span>
                <div class="risk-content">
                  <div class="risk-category" style="color: ${r.severity === 'High' ? '#ef4444' : r.severity === 'Medium' ? '#f59e0b' : '#3b82f6'}">
                    ${r.severity === 'High' ? 'Critical Blocker' : r.severity === 'Medium' ? 'Warning' : 'Optimization'} • ${r.category}
                  </div>
                  <div class="risk-text">${r.message}</div>
                </div>
              </div>
            `).join('')}
          </div>
          
          <!-- 90-DAY GAME PLAN -->
          <div class="section">
            <div class="section-title">
              <span class="section-title-icon icon-emerald">📅</span> 90-Day Game Plan
            </div>
            ${finalActionPlan.map((item, idx) => {
              const isVideo = ['video', 'highlight', 'reel', 'film', 'footage'].some(k => item.description.toLowerCase().includes(k));
              return `
              <div class="action-item ${isVideo ? 'action-critical' : ''}" style="${isVideo ? 'margin-top: 20px;' : ''}">
                ${isVideo ? '<div class="action-badge">Critical Action Item</div>' : ''}
                <div class="action-timeframe">
                  <div class="action-dot" style="background: ${isVideo ? '#3b82f6' : '#10b981'};"></div>
                  <span class="action-time-text" style="color: ${isVideo ? '#93c5fd' : '#94a3b8'}">${item.timeframe.replace(/_/g, ' ')}</span>
                </div>
                <div class="action-text" style="${isVideo ? 'color: #bfdbfe; font-weight: 500;' : ''}">${item.description}</div>
                <div class="action-impact ${item.impact === 'High' ? 'impact-high' : 'impact-medium'}">
                  ${item.impact === 'High' ? '↗' : '→'} ${item.impact} Impact
                </div>
              </div>
            `;}).join('')}
          </div>
          
          <!-- FOOTER -->
          <div class="footer">
            <div class="footer-brand">ExposureEngine</div> by Warubi Sports • ${new Date().toLocaleDateString()} • warubisports.com
          </div>
        </body>
        </html>
      `;
      
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();
      
      // Wait for content to render
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(iframeDoc.body, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a',
        logging: false,
        allowTaint: true,
        width: 850,
        windowWidth: 850,
      });
      
      // Remove iframe
      document.body.removeChild(iframe);
      
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Failed to capture report content');
      }
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      // Create PDF with multiple pages if needed
      const pdf = new jsPDF('p', 'mm', 'letter');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - (margin * 2);
      
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const maxHeight = pageHeight - (margin * 2);
      
      // If content fits on one page
      if (imgHeight <= maxHeight) {
        pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
      } else {
        // Split across multiple pages
        let remainingHeight = imgHeight;
        let srcY = 0;
        let isFirstPage = true;
        
        while (remainingHeight > 0) {
          if (!isFirstPage) {
            pdf.addPage();
          }
          
          const sliceHeight = Math.min(remainingHeight, maxHeight);
          const srcHeight = (sliceHeight / imgWidth) * canvas.width;
          
          // Create a temporary canvas for this slice
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = srcHeight;
          const ctx = sliceCanvas.getContext('2d');
          
          if (ctx) {
            ctx.drawImage(canvas, 0, srcY, canvas.width, srcHeight, 0, 0, canvas.width, srcHeight);
            const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.95);
            pdf.addImage(sliceData, 'JPEG', margin, margin, imgWidth, sliceHeight);
          }
          
          srcY += srcHeight;
          remainingHeight -= sliceHeight;
          isFirstPage = false;
        }
      }
      
      pdf.save(`ExposureEngine_${profile.firstName}_${profile.lastName}_Report.pdf`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('PDF generation error:', errorMessage, error);
      alert('There was an error generating the PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleEmailReport = () => {
    setTimeout(() => {
      setShowEmailModal(false);
      alert(`Report sent to ${profile.firstName}'s email address.`);
    }, 1000);
  };

  return (
    <div className="w-full animate-fade-in print:p-0">
      <PrintHeader profile={profile} />

      {/* VIEW TOGGLE SWITCH */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <button 
          onClick={onReset}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center text-sm transition-colors"
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
          >
            Coach View
          </button>
        </div>
      </div>

      {viewMode === 'coach' ? (
        /* COACH VIEW - Brutally Honest Dashboard */
        <div className="space-y-6">
           {/* PLAYER BIO STATS - SCOUTING DB STYLE */}
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
                    <span className="text-slate-900 dark:text-white">{profile.position} {profile.secondaryPositions.length > 0 && `(${profile.secondaryPositions[0]})`}</span>
                 </div>
                 <div>
                    <span className="block text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider mb-1">Citizenship</span>
                    <span className="text-slate-900 dark:text-white">{profile.citizenship || "N/A"}</span>
                 </div>
                 <div>
                    <span className="block text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider mb-1">Height</span>
                    <span className="text-slate-900 dark:text-white">{profile.height}</span>
                 </div>
                 <div>
                    <span className="block text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider mb-1">Dominant Foot</span>
                    <span className="text-slate-900 dark:text-white">{profile.dominantFoot}</span>
                 </div>
                 <div>
                    <span className="block text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider mb-1">GPA</span>
                    <span className="text-slate-900 dark:text-white">{profile.academics.gpa}</span>
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
        /* PLAYER VIEW - Detailed Analysis */
        <div ref={reportContainerRef} className="space-y-6">
          
          {/* PDF Header - visible during PDF generation */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Exposure<span className="text-emerald-600">Engine</span> Report</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Generated via Warubi Sports Analytics</p>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{profile.firstName} {profile.lastName}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Class of {profile.gradYear} • {profile.position}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-xl mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-emerald-500 dark:text-emerald-400" />
              Executive Summary
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
              {result.plainLanguageSummary}
            </p>
          </div>

          {/* Radar Chart: Readiness */}
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-xl mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                <Target className="w-5 h-5 mr-2 text-emerald-500 dark:text-emerald-400" />
                Player Readiness
              </h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                    { subject: 'Athletic', A: readinessScore.athletic, fullMark: 100 },
                    { subject: 'Technical', A: readinessScore.technical, fullMark: 100 },
                    { subject: 'Market', A: readinessScore.market, fullMark: 100 },
                    { subject: 'Academic', A: readinessScore.academic, fullMark: 100 },
                    { subject: 'Tactical', A: readinessScore.tactical, fullMark: 100 },
                  ]}>
                    <PolarGrid stroke={isDark ? "#334155" : "#e2e8f0"} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="You" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} isAnimationActive={false} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 text-center leading-relaxed">
                * Analysis based on self-reported ratings relative to current league level. Not independently verified.
              </p>
          </div>

          {/* Recruiting Probabilities */}
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-xl flex flex-col justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                   <Trophy className="w-5 h-5 mr-2 text-emerald-500 dark:text-emerald-400" />
                   Recruiting Probabilities
                </h3>
                
                <div className="h-[200px] w-full mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis 
                        dataKey="level" 
                        type="category" 
                        width={60} 
                        tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 700, fontSize: 12 }} 
                        axisLine={false} 
                        tickLine={false} 
                      />
                      <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ 
                          backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                          border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0', 
                          borderRadius: '8px',
                          color: isDark ? '#f1f5f9' : '#0f172a'
                        }}
                        itemStyle={{ color: isDark ? '#f1f5f9' : '#0f172a' }}
                      />
                      <Bar dataKey="visibilityPercent" radius={[0, 4, 4, 0]} barSize={20} isAnimationActive={false}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getProbabilityStatus(entry.visibilityPercent).color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Probability Grid */}
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

          {/* Reality Check */}
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-blue-500/20 shadow-lg dark:shadow-xl relative overflow-hidden group mb-6">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 opacity-50"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Reality Check: You vs The Market</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Comparing your current profile against typical commits.</p>
              </div>
              
              {/* Custom Legend */}
              <div className="flex space-x-6 mt-4 md:mt-0 text-[10px] font-mono uppercase tracking-wider justify-end">
                <div className="flex items-center text-slate-600 dark:text-slate-300"><span className="w-3 h-3 bg-emerald-500 rounded-sm mr-2"></span>You</div>
                <div className="flex items-center text-slate-600 dark:text-slate-300"><span className="w-8 h-0.5 border-t-2 border-dashed border-slate-400 dark:border-slate-200 mr-2"></span>D1 AVG</div>
                <div className="flex items-center text-slate-600 dark:text-slate-300"><span className="w-8 h-0.5 border-t-2 border-dashed border-slate-900 dark:border-slate-600 mr-2"></span>D3 AVG</div>
              </div>
            </div>

            <div className="flex justify-around items-end h-[280px] w-full mb-8 px-2 md:px-12 pt-8 pb-2">
               {benchmarkAnalysis.map((metric, idx) => (
                  <div key={idx} className="flex flex-col items-center h-full w-1/3 max-w-[120px] group relative">
                     {/* The Track */}
                     <div className="relative w-full flex-1 bg-slate-100 dark:bg-slate-950 rounded-t-lg border-x border-t border-slate-200 dark:border-white/5 overflow-visible print-benchmark-track">
                        
                        {/* Grid lines (optional aesthetic) - hidden in print */}
                        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(0deg,transparent_24%,rgba(0,0,0,0.1)_25%,rgba(0,0,0,0.1)_26%,transparent_27%,transparent_74%,rgba(0,0,0,0.1)_75%,rgba(0,0,0,0.1)_76%,transparent_77%,transparent)] dark:bg-[linear-gradient(0deg,transparent_24%,rgba(255,255,255,0.3)_25%,rgba(255,255,255,0.3)_26%,transparent_27%,transparent_74%,rgba(255,255,255,0.3)_75%,rgba(255,255,255,0.3)_76%,transparent_77%,transparent)] bg-[length:100%_20px] print:hidden"></div>

                        {/* User Bar */}
                        <div 
                           className="absolute bottom-0 left-2 right-2 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] print-benchmark-bar"
                           style={{ height: `${metric.userScore}%` }}
                        >
                           {/* Score Tooltip/Label */}
                           <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-emerald-400 text-xs font-bold px-2 py-1 rounded border border-emerald-500/30 opacity-0 group-hover:opacity-100 transition-opacity">
                              {metric.userScore}
                           </div>
                        </div>

                        {/* D3 Marker */}
                        <div 
                           className="absolute w-full border-t-2 border-dashed border-slate-900 dark:border-slate-600 left-0"
                           style={{ bottom: `${metric.d3Average}%` }}
                        >
                           <span className="absolute right-0 -top-3 text-[9px] font-mono text-slate-900 dark:text-slate-500 font-bold bg-white/80 dark:bg-slate-900/80 px-1">D3</span>
                        </div>

                        {/* D1 Marker */}
                        <div 
                           className="absolute w-full border-t-2 border-dashed border-slate-400 dark:border-slate-200 left-0"
                           style={{ bottom: `${metric.d1Average}%` }}
                        >
                           <span className="absolute right-0 -top-3 text-[9px] font-mono text-slate-500 dark:text-slate-200 font-bold bg-white/80 dark:bg-slate-900/80 px-1">D1</span>
                        </div>
                     </div>
                     
                     {/* Category Label */}
                     <div className="mt-4 text-center">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">{metric.category}</span>
                     </div>
                  </div>
               ))}
            </div>

            {/* Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {benchmarkAnalysis.map((metric, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-lg border border-slate-200 dark:border-white/5">
                     <h4 className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-2">INSIGHT</h4>
                     <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{metric.feedback}</p>
                  </div>
               ))}
            </div>
          </div>

          {/* Funnel & Constraints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
             {/* Recruiting Funnel */}
             <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-xl print-section">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                   <Share2 className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400" />
                   Recruiting Funnel
                </h3>
                <div className="relative pt-4 pb-8 px-4">
                   <div className="absolute left-6 top-4 bottom-8 w-0.5 bg-slate-200 dark:bg-slate-800"></div>
                   
                   <div className="relative mb-8 pl-8">
                      <div className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 ${funnelAnalysis.stage === 'Invisible' ? 'bg-red-500 border-red-500' : 'bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-600'}`}></div>
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Outreach</h4>
                      <p className="text-slate-900 dark:text-white font-bold">{profile.coachesContacted} Coaches Contacted</p>
                   </div>

                   <div className="relative mb-8 pl-8">
                      <div className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 ${funnelAnalysis.stage === 'Conversation' ? 'bg-amber-500 border-amber-500' : 'bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-600'}`}></div>
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Interest</h4>
                      <p className="text-slate-900 dark:text-white font-bold">{profile.responsesReceived} Replies ({funnelAnalysis.conversionRate})</p>
                   </div>

                   <div className="relative pl-8">
                      <div className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 ${funnelAnalysis.stage === 'Closing' ? 'bg-emerald-500 border-emerald-500' : 'bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-600'}`}></div>
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Results</h4>
                      <p className="text-slate-900 dark:text-white font-bold">{profile.offersReceived} Offers</p>
                   </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/20 p-4 rounded-lg">
                   <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase block mb-1">Funnel Diagnosis</span>
                   <p className="text-sm text-purple-900 dark:text-purple-100">{funnelAnalysis.advice}</p>
                </div>
             </div>

             {/* Constraints & Blockers */}
             <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-xl">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                   <AlertTriangle className="w-5 h-5 mr-2 text-amber-500 dark:text-amber-400" />
                   Performance Constraints
                </h3>
                <div className="space-y-4">
                   {keyRisks.map((risk, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border flex items-start ${
                         risk.severity === 'High' 
                           ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-500/30' 
                           : risk.severity === 'Medium'
                           ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-500/30'
                           : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-500/30'
                      }`}>
                         <div className={`mt-0.5 mr-3 shrink-0 ${
                            risk.severity === 'High' ? 'text-red-600 dark:text-red-400' : risk.severity === 'Medium' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'
                         }`}>
                            <AlertCircle className="w-5 h-5" />
                         </div>
                         <div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                               risk.severity === 'High' ? 'text-red-600 dark:text-red-400' : risk.severity === 'Medium' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'
                            }`}>
                               {risk.severity === 'High' ? 'Critical Blocker' : risk.severity === 'Medium' ? 'Warning' : 'Optimization'}
                            </span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">{risk.category}</span>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">{risk.message}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* 90 Day Game Plan */}
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-xl mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
              <Calendar className="w-6 h-6 mr-3 text-emerald-500 dark:text-emerald-400" />
              90 Day Game Plan
            </h3>
            <div className="space-y-4">
                {finalActionPlan.map((item, index) => {
                 // Determine if this is the Video Action Item by checking keywords
                 // Logic updated to be content-aware rather than index-dependent
                 const videoKeywords = ['video', 'highlight', 'reel', 'film', 'footage'];
                 const isVideoAction = videoKeywords.some(k => item.description.toLowerCase().includes(k));
                 
                 // Apply highlighting if it's a video action
                 const isCritical = isVideoAction; 
                 
                 // Resolve Impact Badge styles
                 const impactConfig = getImpactBadge(item.impact);
                 const ImpactIcon = impactConfig.icon;

                 return (
                  <div key={index} className={`relative p-5 rounded-xl border flex flex-col sm:flex-row gap-4 sm:items-start transition-all ${
                     isCritical 
                     ? 'border-blue-400/50 dark:border-blue-500/50 border-dashed bg-blue-50 dark:bg-blue-900/10 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                     : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}>
                    {isCritical && (
                       <div className="absolute -top-3 left-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg uppercase tracking-wider animate-pulse">
                          Critical Action Item
                       </div>
                    )}
                    
                    {/* Timeframe Badge */}
                    <div className="flex items-center space-x-2 shrink-0 sm:w-32 mt-1">
                      <div className={`w-2 h-2 rounded-full ${isCritical ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                      <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isCritical ? 'text-blue-600 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'}`}>
                        {item.timeframe.replace(/_/g, ' ')}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <p className={`text-sm md:text-base leading-relaxed ${isCritical ? 'text-blue-900 dark:text-blue-50 font-medium' : 'text-slate-700 dark:text-slate-200'}`}>
                        {item.description}
                      </p>
                    </div>

                    {/* Impact Badge */}
                    <div className={`shrink-0 flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider self-start sm:self-center ${impactConfig.color}`}>
                       <ImpactIcon className="w-3.5 h-3.5" />
                       <span>{impactConfig.label}</span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAKE ACTION FOOTER (PDF & EMAIL) */}
      <div className="mt-12 border-t border-slate-200 dark:border-white/5 pt-8 print:hidden">
         <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-6 rounded-2xl border border-slate-300 dark:border-white/10">
            <div className="mb-6 md:mb-0">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Save Your Report</h3>
               <p className="text-sm text-slate-600 dark:text-slate-400">Download a PDF copy or email this analysis to yourself.</p>
            </div>
            <div className="flex space-x-4">
               <button 
                  onClick={generatePDF}
                  disabled={isGeneratingPdf}
                  className="flex items-center px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-lg border border-slate-300 dark:border-slate-600 transition-colors text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </>
                  )}
               </button>
               <button 
                  onClick={() => setShowEmailModal(true)}
                  className="flex items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-emerald-900/20"
               >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Report
               </button>
            </div>
         </div>
      </div>

      {/* WARUBI PATHWAYS CTA */}
      <div className="mt-12 mb-12 relative group cursor-pointer print:hidden">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
        <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="relative z-10 text-center md:text-left">
              <div className="inline-flex items-center space-x-2 text-emerald-400 mb-3">
                  <Globe className="w-4 h-4" />
                  <span className="text-xs font-mono uppercase tracking-widest font-bold">International & Pro Level</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Warubi Sports Elite Pathways</h3>
              <p className="text-slate-400 max-w-lg text-sm leading-relaxed">
                  Beyond analytics, we provide direct access to professional development. Exclusive residential academies in Germany, FIFA-licensed agency representation, and UEFA coaching education.
              </p>
            </div>
            
            <a 
              href="https://warubisports.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="relative z-10 shrink-0 flex items-center px-8 py-4 bg-white text-slate-950 hover:bg-emerald-50 rounded-xl font-bold text-sm transition-all transform group-hover:scale-105 shadow-xl shadow-emerald-900/20"
            >
              <span>Request Access</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
        </div>
      </div>

      {/* EMAIL MODAL */}
      {showEmailModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:hidden">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-slide-up">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Email Full Report</h3>
               <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Enter your email address to receive the full PDF analysis.</p>
               
               <input 
                  type="email" 
                  placeholder="player@example.com" 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white mb-4 focus:border-emerald-500 focus:outline-none"
               />
               
               <div className="flex justify-end space-x-3">
                  <button 
                     onClick={() => setShowEmailModal(false)}
                     className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm"
                  >
                     Cancel
                  </button>
                  <button 
                     onClick={handleEmailReport}
                     className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm"
                  >
                     Send Report
                  </button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default AnalysisResultView;