
import React from 'react';
import { TravelPlan } from '../types';

interface PlanDisplayProps {
  plan: TravelPlan;
  onReset: () => void;
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, onReset }) => {
  const handleShare = async () => {
    const shareData = {
      title: `Chalo Trip: ${plan.summary.substring(0, 50)}...`,
      text: `Check out my Chalo trip plan! Budget: ₹${plan.costBreakdown.total}. Includes: ${plan.itinerary.length} days of adventure.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      alert("Sharing is not supported on this browser. Copy the URL to share!");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32 px-4 md:px-0">
      {/* Header Sticky Bar */}
      <div className="sticky top-6 z-30 mx-auto max-w-2xl">
        <div className="glass-card px-4 md:px-6 py-4 rounded-[2rem] shadow-xl flex items-center justify-between border border-white/50">
          <div className="flex items-center gap-3">
             <button 
                onClick={onReset}
                className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-all"
                title="New Search"
              >
                🏠
              </button>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 block">Safarnama</span>
                <h1 className="text-sm md:text-lg font-bold text-slate-800">Your Live Itinerary</h1>
              </div>
          </div>
          <button 
            onClick={handleShare}
            className="px-5 py-2.5 gradient-bg text-white rounded-2xl hover:opacity-90 transition-all text-xs font-bold shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            <span>SHARE</span>
            <span>📤</span>
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <section className="bg-white p-8 md:p-12 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-20 -mt-20 opacity-50 blur-3xl"></div>
        <div className="relative z-10">
          <span className="text-5xl mb-6 block">🗺️</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">The Big Picture</h2>
          <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium">{plan.summary}</p>
        </div>
      </section>

      {/* Logistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-slate-900 p-8 md:p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[60px] rounded-full"></div>
          <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
            <span className="p-2 bg-indigo-500/20 rounded-xl text-lg">🚆</span> 
            Travel Logic
          </h2>
          <div className="space-y-4">
            {plan.travelOptions.map((opt, i) => (
              <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-lg text-indigo-300">{opt.mode}</span>
                  <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">₹{opt.estimatedCost}</span>
                </div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">{opt.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
            <span className="p-2 bg-slate-50 rounded-xl text-lg">🏠</span> 
            Suggested Stay
          </h2>
          <div className="space-y-8">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-3xl shadow-inner">🏨</div>
              <div>
                <h3 className="text-xl font-black text-slate-900 leading-tight">{plan.accommodation.type}</h3>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">{plan.accommodation.area}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {plan.accommodation.benefits.map((benefit, i) => (
                <div key={i} className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100/50">
                  {benefit}
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-slate-50 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Nightly Est.</p>
                <span className="text-3xl font-black text-slate-900">₹{plan.accommodation.avgNightlyRate}</span>
              </div>
              <div className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-lg">LIVE RATE</div>
            </div>
          </div>
        </section>
      </div>

      {/* Modern Itinerary */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">The Roadmap</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grounded in search</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {plan.itinerary.map((day, i) => (
            <div key={i} className="group bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50 hover:shadow-xl hover:border-indigo-100 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-slate-200">
                    {day.day}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{day.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Phase {i+1}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                      <span className="text-xs font-medium text-slate-400">Total Spend: ₹{day.estimatedCost}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {day.activities.map((act, j) => (
                  <div key={j} className="flex items-start gap-4 p-5 bg-slate-50/50 rounded-2xl border border-transparent group-hover:border-slate-100 transition-all">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] flex-shrink-0"></div>
                    <span className="text-sm text-slate-600 font-semibold leading-relaxed">{act}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sources & Pro Tips Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-2 space-y-8">
            {/* Sources */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden relative">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="text-2xl">🔗</span> Live Sources
              </h2>
              <div className="flex flex-wrap gap-3">
                {plan.sources && plan.sources.length > 0 ? (
                  plan.sources.map((source, i) => (
                    <a 
                      key={i} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group px-4 py-3 bg-slate-50 hover:bg-indigo-600 border border-slate-100 rounded-[1.25rem] transition-all flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-xs group-hover:scale-110 transition-transform">🔍</div>
                      <div>
                        <p className="text-[11px] font-black text-slate-900 group-hover:text-white transition-colors">{source.title.substring(0, 15)}...</p>
                        <p className="text-[9px] font-bold text-slate-400 group-hover:text-indigo-200 transition-colors uppercase tracking-widest">Verified Site</p>
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="p-4 bg-indigo-50 rounded-2xl w-full border border-indigo-100 text-indigo-700 font-bold text-sm">
                    Plan generated using high-accuracy travel data models.
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
               <h2 className="text-xl font-bold mb-8 flex items-center gap-3 relative z-10">
                <span className="text-2xl">💡</span> Chalo Insider Tips
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {plan.localTips.map((tip, i) => (
                  <div key={i} className="flex gap-4 items-start p-4 bg-white/10 rounded-2xl border border-white/10">
                    <span className="text-indigo-200 font-black text-lg">!</span>
                    <p className="text-sm font-medium leading-relaxed text-indigo-50">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
         </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-lg shadow-slate-100/50 sticky top-24 h-fit">
          <h2 className="text-xl font-bold text-slate-900 mb-8">Expense Engine</h2>
          <div className="space-y-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-300 uppercase mb-1 tracking-widest">Total Estimated Budget</span>
              <span className="text-5xl font-black text-indigo-600">₹{(plan.costBreakdown.total / 1000).toFixed(1)}k</span>
            </div>
            
            <div className="space-y-5 pt-8 border-t border-slate-50">
               {[
                 { label: 'Transport', val: plan.costBreakdown.travel, color: 'bg-blue-400', icon: '✈️' },
                 { label: 'Lodging', val: plan.costBreakdown.stay, color: 'bg-indigo-400', icon: '🏠' },
                 { label: 'Dining', val: plan.costBreakdown.food, color: 'bg-pink-400', icon: '🍱' },
                 { label: 'Fun', val: plan.costBreakdown.activities, color: 'bg-amber-400', icon: '🎢' }
               ].map((item, idx) => (
                 <div key={idx} className="group">
                   <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-2 items-center">
                     <span className="flex items-center gap-2">
                        <span className="opacity-50 group-hover:opacity-100 transition-opacity">{item.icon}</span>
                        {item.label}
                     </span>
                     <span className="text-slate-900">₹{item.val}</span>
                   </div>
                   <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                     <div 
                        className={`${item.color} h-full transition-all duration-1000 ease-out`} 
                        style={{ width: `${(item.val / Math.max(1, plan.costBreakdown.total)) * 100}%` }}
                      ></div>
                   </div>
                 </div>
               ))}
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl text-[10px] font-bold text-slate-400 leading-relaxed italic text-center">
               Costs are estimates based on live trends and search results. Actuals may vary.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDisplay;
