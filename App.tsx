
import React, { useState } from 'react';
import { UserInput, TravelPlan } from './types';
import { generateTravelPlan } from './services/geminiService';
import InputForm from './components/InputForm';
import PlanDisplay from './components/PlanDisplay';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<TravelPlan | null>(null);

  const handleFormSubmit = async (data: UserInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateTravelPlan(data);
      setPlan(result);
    } catch (err: any) {
      console.error(err);
      setError("We hit a roadblock. Let's try that again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPlan(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-[#1a1a1e] px-4">
      {/* Decorative background elements */}
      {!plan && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-pink-50 rounded-full blur-[100px] opacity-40"></div>
        </div>
      )}

      <nav className="max-w-5xl mx-auto py-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-200">
            ✈️
          </div>
          <span className="text-2xl font-black tracking-tighter">CHALO</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-400">
          <span className="text-indigo-600">Discover</span>
          <span className="hover:text-slate-600 cursor-pointer transition-colors">Safety</span>
          <span className="hover:text-slate-600 cursor-pointer transition-colors">Budgets</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto pt-8 pb-20 relative z-10">
        {!plan && !isLoading && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <header className="max-w-2xl mx-auto text-center space-y-4">
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Travel smarter, <br/>
                <span className="gradient-text">not harder.</span>
              </h1>
              <p className="text-slate-400 text-lg md:text-xl font-medium max-w-lg mx-auto leading-relaxed">
                The only travel planner built for real Indian budgets and real personas.
              </p>
            </header>

            <InputForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 max-w-3xl mx-auto border-t border-slate-100">
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900">0%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Luxury Fluff</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900">100%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Hyper Local</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900">AI</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Smart Engine</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900">₹0</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Platform Fee</p>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 animate-in zoom-in-95 duration-500">
             <div className="relative">
                <div className="w-24 h-24 border-4 border-slate-100 rounded-full"></div>
                <div className="w-24 h-24 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
                <div className="absolute inset-0 flex items-center justify-center text-3xl">🌴</div>
             </div>
             <div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Finding your perfect rasta...</h2>
                <p className="text-slate-400 font-medium">Checking train availability and local hostel vibes.</p>
             </div>
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto bg-rose-50 border border-rose-100 p-8 rounded-[2.5rem] text-center shadow-xl shadow-rose-100">
            <div className="text-4xl mb-4">🛑</div>
            <p className="text-rose-600 font-bold text-lg mb-6">{error}</p>
            <button 
              onClick={handleReset}
              className="px-8 py-3 bg-rose-600 text-white rounded-2xl font-black hover:bg-rose-700 transition-all shadow-lg shadow-rose-200"
            >
              LET'S REBOOT
            </button>
          </div>
        )}

        {plan && !isLoading && (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-700">
            <PlanDisplay plan={plan} onReset={handleReset} />
          </div>
        )}
      </main>

      <footer className="py-12 text-center relative z-10">
        <div className="max-w-5xl mx-auto pt-12 border-t border-slate-100">
           <p className="text-xs font-black text-slate-300 uppercase tracking-widest">
            © 2024 CHALO TRAVELS • DESIGNED FOR THE INDIAN NOMAD
           </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
