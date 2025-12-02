import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PlayerInputForm from './components/PlayerInputForm';
import AnalysisResultView from './components/AnalysisResult';
import { PlayerProfile, AnalysisResult } from './types';
import { analyzeExposure } from './services/geminiService';

const App: React.FC = () => {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error]);

  const handleFormSubmit = async (submittedProfile: PlayerProfile) => {
    console.log("Starting analysis for profile:", submittedProfile);
    setProfile(submittedProfile);
    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeExposure(submittedProfile);
      console.log("Analysis result:", result);
      setAnalysisResult(result);
    } catch (err: any) {
      console.error("Analysis Error Details:", err);
      let errorMessage = "Failed to analyze profile. Please check your API key and try again.";
      if (err instanceof Error) {
        errorMessage += ` (${err.message})`;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setProfile(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-center text-red-200 text-sm">
             <span className="font-bold mr-2">Error:</span> {error}
          </div>
        )}

        {!analysisResult ? (
          <div className="space-y-6">
             <div className="text-center mb-8">
               <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Are you actually recruitable?</h2>
               <p className="text-slate-400 max-w-xl mx-auto">
                 Most players overrate their exposure. Enter your real stats, league level, and event history to get a brutally honest AI visibility score.
               </p>
             </div>
             <PlayerInputForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>
        ) : (
          <AnalysisResultView result={analysisResult} onReset={handleReset} />
        )}
      </main>

      <footer className="py-8 text-center text-xs text-slate-600">
        <p>© {new Date().getFullYear()} ExposureEngine. Not affiliated with NCAA, MLS NEXT or ECNL.</p>
      </footer>
    </div>
  );
};

export default App;