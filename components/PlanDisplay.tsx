
import React from 'react';
import { TravelPlan } from '../types';

interface PlanDisplayProps {
  plan: TravelPlan;
  onReset: () => void;
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, onReset }) => {
  const handleShare = async () => {
    const shareData = {
      title: `Chalo: My ${plan.accommodation.area} Itinerary`,
      text: `Just planned a killer trip using Chalo! Check it out.`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { }
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-16 pb-40">
      {/* Dynamic Header */}
      <div className="sticky top-6 z-50">
        <div className="glass-card px-6 py-4 rounded-[2rem] shadow-xl border border-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onReset}
              className="w-12 h-12 bg-white text-slate-800 rounded-2xl flex items-center justify-center hover:shadow-lg transition-all border border-slate-100 group"
            >
              <span className="text-2xl group-hover:scale-125 transition-transform">🔙</span>
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">Your Safarnama</h1>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Custom Built</span>
            </div>
          </div>
          <button
            onClick={handleShare}
            className="px-6 py-3 gradient-bg text-white rounded-2xl hover:brightness-110 transition-all text-sm font-bold shadow-lg shadow-indigo-200 flex items-center gap-2"
          >
            <span>Share Itinerary</span>
            <span>📤</span>
          </button>
        </div>
      </div>

      {/* Hero: The Vibe Check */}
      <section className="relative p-10 md:p-16 bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/80 rounded-full -mr-32 -mt-32 blur-[100px] group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-pink-50/50 rounded-full -ml-20 -mb-20 blur-[80px]"></div>

        <div className="relative z-10 max-w-2xl space-y-8">
          <div className="inline-block p-4 bg-white rounded-3xl shadow-xl border border-slate-50 animate-bounce-slow">
            <span className="text-4xl">🎒</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-[1.1]">
            Pack your bags, <br />
            <span className="gradient-text">the plan is ready.</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed">
            {plan?.summary || "Your custom itinerary has been generated."}
          </p>
        </div>
      </section>

      {/* The Core: Stays & Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Left Column: Stays */}
        <div className="lg:col-span-8 space-y-10">
          <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <span>🏨</span> Top Stay Picks
              </h3>
              <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                {plan?.accommodation?.area || "Recommended Stays"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {(plan?.accommodation?.options || []).map((option, idx) => (
                <div key={idx} className="group bg-slate-50/50 rounded-[2.5rem] p-8 border border-transparent hover:border-indigo-100 hover:bg-white transition-all hover:shadow-2xl">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-md border border-slate-50">🏠</div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">₹{option?.price || 0}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase mt-1">/ Night</p>
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">{option?.name || "Stay Option"}</h4>
                  <p className="text-xs font-bold text-pink-500 uppercase tracking-widest mb-4">{option?.type || "Accommodation"}</p>

                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold">★ {option?.rating || "N/A"}</span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase">{option?.reviewCount || "Many reviews"}</span>
                  </div>

                  <p className="text-sm text-slate-600 font-medium leading-relaxed italic mb-8">"{option?.highlight || "Highly recommended"}"</p>

                  {option?.bookingUrl && (
                    <a href={option.bookingUrl} target="_blank" rel="noopener noreferrer" className="block w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest text-center transition-all hover:gradient-bg shadow-xl hover:shadow-indigo-100 active:scale-95">
                      Check Availability
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Quick Stats */}
        <div className="lg:col-span-4 space-y-10">
          <section className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500/20 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-pink-500/30 transition-all"></div>
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-10">Trip Wallet</h3>
            <div className="space-y-10 relative z-10">
              <div>
                <p className="text-5xl font-bold tracking-tighter">₹{((plan?.costBreakdown?.total || 0) / 1000).toFixed(1)}k</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Total Estimated Cost</p>
              </div>
              <div className="space-y-6 pt-10 border-t border-white/10">
                {[
                  { label: 'Travel', val: plan?.costBreakdown?.travel || 0, color: 'bg-indigo-500' },
                  { label: 'Stay', val: plan?.costBreakdown?.stay || 0, color: 'bg-pink-500' },
                  { label: 'Others', val: ((plan?.costBreakdown?.food || 0) + (plan?.costBreakdown?.activities || 0)), color: 'bg-amber-400' }
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-bold mb-3">
                      <span className="text-slate-400">{item.label}</span>
                      <span>₹{item.val.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`${item.color} h-full rounded-full transition-all duration-1000 delay-300`} style={{ width: `${(item.val / (plan?.costBreakdown?.total || 1)) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white p-10 rounded-[3xl] border border-slate-100 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Transport</h3>
            <div className="space-y-4">
              {(plan?.travelOptions || []).map((opt, i) => (
                <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all">
                  <p className="font-bold text-slate-800 mb-1">{opt?.mode || "Transport"}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{opt?.description || "Travel details"}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Pro Jugaad (The Juice) */}
      <section className="bg-indigo-600 p-10 md:p-14 rounded-[4rem] text-white shadow-[0_30px_60px_rgba(79,70,229,0.3)] relative overflow-hidden group">
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mb-20 blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 text-center md:text-left">
            <div>
              <h3 className="text-3xl font-bold tracking-tight">Pro Jugaad (Insider Tips)</h3>
              <p className="text-indigo-200 font-medium text-lg mt-2">The stuff most tourists miss.</p>
            </div>
            <div className="px-6 py-2 bg-white/20 rounded-full text-xs font-bold tracking-widest uppercase">Verified Hacks</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(plan?.localTips || []).map((tip, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 hover:bg-white/20 transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-white text-indigo-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">{tip?.category || "Tip"}</span>
                </div>
                <p className="text-base md:text-lg font-medium leading-relaxed">
                  {tip?.text || ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Roadmap (Day by Day) */}
      <section className="space-y-12">
        <div className="text-center md:text-left px-4">
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight">The Daily Roadmap</h3>
          <p className="text-slate-400 font-medium mt-2">A curated flow of experiences.</p>
        </div>

        <div className="space-y-10">
          {(plan?.itinerary || []).map((day, i) => (
            <div key={i} className="group flex flex-col md:flex-row bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl transition-all">
              <div className="md:w-64 gradient-bg p-12 flex flex-col items-center justify-center text-white text-center">
                <span className="text-6xl font-bold tracking-tighter">0{day?.day || i + 1}</span>
                <span className="text-sm font-bold uppercase tracking-[0.4em] mt-4 opacity-70">Day</span>
              </div>
              <div className="flex-1 p-10 md:p-14 space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <h4 className="text-2xl font-bold text-slate-900 leading-tight">{day?.title || "Plan"}</h4>
                  <span className="px-5 py-2 bg-slate-50 text-slate-500 text-xs font-bold rounded-xl border border-slate-100">Est. Spend: ₹{day?.estimatedCost || 0}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {(day?.activities || []).map((act, j) => (
                    <div key={j} className="flex gap-5 items-start p-6 bg-slate-50/50 rounded-3xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all shadow-sm group/act">
                      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center group-hover/act:gradient-bg group-hover/act:text-white transition-all">
                        <span className="text-xl">📍</span>
                      </div>
                      <span className="text-base md:text-lg font-medium text-slate-700 leading-relaxed pt-1 flex-1">{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* References Footer */}
      {(plan?.sources || []).length > 0 && (
        <section className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm text-center md:text-left">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">Research grounded in live data</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            {(plan?.sources || []).map((source, i) => (
              <a key={i} href={source?.uri} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 transition-all flex items-center gap-3">
                <span>🔍</span>
                {source?.title ? (source.title.length > 30 ? `${source.title.substring(0, 30)}...` : source.title) : "Travel Source"}
              </a>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default PlanDisplay;
