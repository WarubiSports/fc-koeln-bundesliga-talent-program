import { useState, useEffect } from 'react';
import Header from './components/exposure/Header';
import PlayerInputForm from './components/exposure/PlayerInputForm';
import AnalysisResultView from './components/exposure/AnalysisResult';
import type { PlayerProfile, AnalysisResult } from '../../shared/exposure-types';

function App() {
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
    setProfile(submittedProfile);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/public/exposure/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submittedProfile),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysisResult(data.result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error("Analysis Error Details:", err);
      let errorMessage = "Failed to analyze profile. Please try again.";
      if (err instanceof Error) {
        errorMessage = err.message;
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-center text-red-200 text-sm" data-testid="error-message">
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
          <AnalysisResultView result={analysisResult} profile={profile!} onReset={handleReset} isDark={true} />
        )}
      </main>

      <footer className="py-8 text-center text-xs text-slate-600">
        <p>© {new Date().getFullYear()} ExposureEngine. Not affiliated with NCAA, MLS NEXT or ECNL.</p>
      </footer>
    </div>
  );
}

export default App;
