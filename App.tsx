
import React, { useState, useEffect } from 'react';
import { UserInput, TravelPlan } from './types';
import { generateTravelPlan } from './services/geminiService';
import { trackEvent } from './services/analyticsService';
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

  const handleFormSubmit = async (data: UserInput) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    void trackEvent('generation_started', {
      duration: data.duration,
      tripType: data.tripType,
      travelers: data.numberOfPeople,
      fromCity: data.fromCity,
      toCity: data.toCity,
      pace: data.pace,
      transportPreference: data.transportPreference,
    });
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateTravelPlan(data);
      void trackEvent('generation_succeeded', {
        duration: data.duration,
        totalCost: result.costBreakdown?.total || 0,
      });
      setPlan(result);
      localStorage.setItem('last_chalo_plan', JSON.stringify(result));
    } catch (err: any) {
      void trackEvent('generation_failed', {
        message: err?.message || 'unknown_error',
      });
      const message = err?.message || "We could not generate your itinerary right now. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Start fresh? This will clear your current plan.")) {
      void trackEvent('plan_reset');
      setPlan(null);
      setError(null);
      localStorage.removeItem('last_chalo_plan');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1a1a1e] px-4 sm:px-6 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      {/* Immersive Background */}
      {!plan && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-100/50 rounded-full blur-[160px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] left-[-20%] w-[50%] h-[50%] bg-pink-100/40 rounded-full blur-[140px]"></div>
        </div>
      )}

      <nav className="max-w-5xl mx-auto py-6 md:py-10 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4 group cursor-default">
          <div className="w-14 h-14 gradient-bg rounded-[1.25rem] flex items-center justify-center text-white text-3xl shadow-2xl shadow-indigo-200 group-hover:scale-110 transition-transform">
            ✈️
          </div>
          <div>
            <span className="text-3xl font-black tracking-tighter text-slate-900 leading-none block">CHALO</span>
            <span className="text-[10px] font-bold text-indigo-500 tracking-[0.3em] uppercase mt-1 block">Safarnama</span>
          </div>
        </div>
        {!plan && (
          <div className="hidden md:flex items-center gap-12 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            <span className="text-slate-900 border-b-2 border-indigo-600 pb-1 cursor-pointer">Planner</span>
          </div>
        )}
      </nav>

      <main className={`${plan ? 'max-w-6xl' : 'max-w-5xl'} mx-auto pt-4 md:pt-8 pb-16 md:pb-20 relative z-10`}>
        {!plan && !isLoading && (
          <div className="space-y-14 md:space-y-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <header className="max-w-3xl mx-auto text-center space-y-6 md:space-y-8">
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.98] md:leading-[0.9]">
                Plan your next <br />
                <span className="gradient-text">journey.</span>
              </h1>
              <p className="text-slate-500 text-lg md:text-2xl font-medium max-w-lg mx-auto leading-relaxed">
                Smart and practical travel planning with budget-first recommendations.
              </p>
            </header>

            <InputForm onSubmit={handleFormSubmit} isLoading={isLoading} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 pt-12 md:pt-16 max-w-4xl mx-auto border-t border-slate-100">
              {[
                { n: 'Live', l: 'Search Grounded' },
                { n: 'Local', l: 'Insider Insights' },
                { n: 'Smart', l: 'Budget Logic' },
                { n: 'Fast', l: 'Smart Curation' }
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
          <div className="flex flex-col items-center justify-center min-h-[65vh] py-20 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-full max-w-2xl bg-white/95 border border-slate-100 rounded-[2rem] shadow-[0_20px_50px_rgba(15,23,42,0.08)] p-8 md:p-10 text-left space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 3a9 9 0 109 9" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-[0.22em]">Planning In Progress</p>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-1">Building your itinerary</h2>
                </div>
              </div>

              <p className="text-slate-500 font-medium">
                Gathering routes, stays, and local insights for your trip.
              </p>

              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-1/3 gradient-bg rounded-full animate-route-progress"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['Checking routes', 'Comparing stays', 'Refining day plans'].map((label) => (
                  <div key={label} className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{label}</p>
                    <div className="h-2 bg-slate-200/80 rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-lg mx-auto bg-white border border-rose-100 p-16 rounded-[3rem] text-center space-y-10 shadow-3xl shadow-rose-100">
            <div className="text-7xl">🚑</div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-slate-900">Something went wrong</h3>
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
