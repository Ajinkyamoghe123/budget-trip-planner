
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

  const handleFormSubmit = async (data: UserInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateTravelPlan(data);
      setPlan(result);
      localStorage.setItem('last_chalo_plan', JSON.stringify(result));
    } catch (err: any) {
      console.error(err);
      setError("Our search engine hit a snag. Let's try that again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Start a new search? Your current plan will be cleared.")) {
      setPlan(null);
      setError(null);
      localStorage.removeItem('last_chalo_plan');
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-[#1a1a1e] px-4 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Dreamy Background Accents */}
      {!plan && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-50 rounded-full blur-[140px] opacity-70"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-pink-50 rounded-full blur-[120px] opacity-60"></div>
        </div>
      )}

      <nav className="max-w-4xl mx-auto py-10 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl shadow-indigo-100">
            ✈️
          </div>
          <span className="text-3xl font-bold tracking-tighter text-slate-900">CHALO</span>
        </div>
        <div className="hidden md:flex items-center gap-10 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
          <span className="text-indigo-600 cursor-default">Itineraries</span>
          <span className="hover:text-slate-600 cursor-pointer transition-colors">Hotels</span>
          <span className="hover:text-slate-600 cursor-pointer transition-colors">Pricing</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto pt-10 pb-20 relative z-10">
        {!plan && !isLoading && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="max-w-2xl mx-auto text-center space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1]">
                Travel smarter, <br/>
                <span className="gradient-text">live louder.</span>
              </h1>
              <p className="text-slate-500 text-lg md:text-xl font-medium max-w-md mx-auto leading-relaxed">
                Smart, high-vibe travel planning for the modern Indian nomad.
              </p>
            </header>

            <InputForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-16 max-w-3xl mx-auto border-t border-slate-100">
              {[
                { n: 'Live', l: 'Search Grounded' },
                { n: '100%', l: 'Hyper Local' },
                { n: 'Smart', l: 'AI Curated' },
                { n: '₹0', l: 'Planning Fees' }
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl font-bold text-slate-800 tracking-tight">{item.n}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{item.l}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-40 text-center space-y-10 animate-in fade-in zoom-in-95 duration-500">
             <div className="relative">
                <div className="w-24 h-24 border-[5px] border-slate-100 rounded-full"></div>
                <div className="w-24 h-24 border-[5px] border-indigo-600 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
                <div className="absolute inset-0 flex items-center justify-center text-4xl">🏔️</div>
             </div>
             <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Generating Safarnama...</h2>
                <p className="text-slate-400 font-semibold italic text-base">Searching real-time rates for you.</p>
             </div>
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto bg-white border border-rose-100 p-12 rounded-[2rem] text-center space-y-8 shadow-2xl shadow-rose-100">
            <div className="text-6xl">🥺</div>
            <p className="text-slate-800 font-bold text-xl">{error}</p>
            <button onClick={() => setError(null)} className="w-full py-4 gradient-bg text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-indigo-100">
              Try Once More
            </button>
          </div>
        )}

        {plan && !isLoading && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <PlanDisplay plan={plan} onReset={handleReset} />
          </div>
        )}
      </main>

      <footer className="py-20 text-center">
        <p className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.4em]">
          © 2024 CHALO TRAVELS • DESIGNED FOR THE MODERN NOMAD
        </p>
      </footer>
    </div>
  );
};

export default App;
