
import React, { useState, useEffect } from 'react';
import { UserInput, TravelPlan } from './types';
import { generateTravelPlan } from './services/geminiService';
import InputForm from './components/InputForm';
import PlanDisplay from './components/PlanDisplay';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<TravelPlan | null>(null);

  useEffect(() => {
    const savedPlan = localStorage.getItem('last_chalo_plan');
    if (savedPlan) {
      try {
        setPlan(JSON.parse(savedPlan));
      } catch (e) {
        localStorage.removeItem('last_chalo_plan');
      }
    }
  }, []);

  useEffect(() => {
    console.log("=== PLAN STATE CHANGED ===");
    console.log("Current plan:", plan);
    console.log("Is loading:", isLoading);
    console.log("Error:", error);
    console.log("========================");
  }, [plan, isLoading, error]);

  const handleFormSubmit = async (data: UserInput) => {
    console.log("=== FORM SUBMITTED ===");
    console.log("Input data:", data);
    setIsLoading(true);
    setError(null);
    try {
      console.log("Calling generateTravelPlan...");
      const result = await generateTravelPlan(data);
      console.log("=== PLAN GENERATED SUCCESSFULLY ===");
      console.log("Result:", result);
      setPlan(result);
      localStorage.setItem('last_chalo_plan', JSON.stringify(result));
      console.log("Plan saved to state and localStorage");
    } catch (err: any) {
      console.error("=== ERROR IN FORM SUBMISSION ===");
      console.error(err);
      setError("Oops! Chalo AI hit a snag. Let's try that again, shall we?");
    } finally {
      setIsLoading(false);
      console.log("Loading state set to false");
    }
  };

  const handleReset = () => {
    if (window.confirm("Start fresh? This will clear your current plan.")) {
      setPlan(null);
      setError(null);
      localStorage.removeItem('last_chalo_plan');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1a1a1e] px-4 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Immersive Background */}
      {!plan && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-100/50 rounded-full blur-[160px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] left-[-20%] w-[50%] h-[50%] bg-pink-100/40 rounded-full blur-[140px]"></div>
        </div>
      )}

      <nav className="max-w-5xl mx-auto py-12 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4 group cursor-default">
          <div className="w-14 h-14 gradient-bg rounded-[1.25rem] flex items-center justify-center text-white text-3xl shadow-2xl shadow-indigo-200 group-hover:scale-110 transition-transform">
            ✈️
          </div>
          <div>
            <span className="text-3xl font-black tracking-tighter text-slate-900 leading-none block">CHALO</span>
            <span className="text-[10px] font-bold text-indigo-500 tracking-[0.3em] uppercase mt-1 block">Safarnama AI</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-12 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
          <span className="text-slate-900 border-b-2 border-indigo-600 pb-1 cursor-pointer">Planner</span>
          <span className="hover:text-slate-900 cursor-pointer transition-colors">Safety</span>
          <span className="hover:text-slate-900 cursor-pointer transition-colors">Community</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto pt-10 pb-20 relative z-10">
        {!plan && !isLoading && (
          <div className="space-y-24 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <header className="max-w-3xl mx-auto text-center space-y-8">
              <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.95] md:leading-[0.9]">
                Where to, <br />
                <span className="gradient-text">Captain?</span>
              </h1>
              <p className="text-slate-500 text-xl md:text-2xl font-medium max-w-lg mx-auto leading-relaxed">
                Smart, high-vibe travel planning for the modern Indian soul.
              </p>
            </header>

            <InputForm onSubmit={handleFormSubmit} isLoading={isLoading} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-20 max-w-4xl mx-auto border-t border-slate-100">
              {[
                { n: 'Live', l: 'Search Grounded' },
                { n: 'Hacks', l: 'Pro Jugaad' },
                { n: 'Smart', l: 'Budget Logic' },
                { n: 'Fast', l: 'AI Curation' }
              ].map((item, i) => (
                <div key={i} className="text-center group">
                  <p className="text-3xl font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{item.n}</p>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">{item.l}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-48 text-center space-y-12 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative">
              <div className="w-32 h-32 border-[6px] border-slate-100 rounded-full"></div>
              <div className="w-32 h-32 border-[6px] border-indigo-600 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
              <div className="absolute inset-0 flex items-center justify-center text-5xl animate-bounce-slow">🌏</div>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Hang tight, Bhai...</h2>
              <p className="text-slate-400 font-bold italic text-lg max-w-xs mx-auto">
                Chalo AI is scouting real-time rates and hidden gems for you.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-lg mx-auto bg-white border border-rose-100 p-16 rounded-[3rem] text-center space-y-10 shadow-3xl shadow-rose-100">
            <div className="text-7xl">🚑</div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-slate-900">Breakdown!</h3>
              <p className="text-slate-500 font-medium text-lg leading-relaxed">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="w-full py-5 gradient-bg text-white rounded-[2rem] font-bold text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-indigo-100 active:scale-95">
              Let's Try Again
            </button>
          </div>
        )}

        {plan && !isLoading && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
            <PlanDisplay plan={plan} onReset={handleReset} />
          </div>
        )}
      </main>

      <footer className="py-24 text-center">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-2 h-2 rounded-full bg-slate-200"></div>
          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
          <div className="w-2 h-2 rounded-full bg-slate-200"></div>
        </div>
        <p className="text-[12px] font-bold text-slate-300 uppercase tracking-[0.5em]">
          CHALO TRAVELS • DESIGNED FOR THE MODERN NOMAD • 2024
        </p>
      </footer>
    </div>
  );
};

export default App;
