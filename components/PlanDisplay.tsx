
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
      text: `My Chalo trip to ${plan.accommodation.area}!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) {}
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32">
      {/* Header Sticky Bar - Vibrant Accent */}
      <div className="sticky top-6 z-40">
        <div className="bg-white/95 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-white flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button 
                onClick={onReset}
                className="w-11 h-11 bg-slate-50 text-slate-700 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all border border-slate-100 shadow-sm group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">🏠</span>
              </button>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 block mb-0.5">Safarnama</span>
                <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">Your Curated Plan</h1>
              </div>
          </div>
          <button 
            onClick={handleShare}
            className="px-6 py-2.5 gradient-bg text-white rounded-xl hover:brightness-110 transition-all text-xs font-bold shadow-lg shadow-indigo-100 flex items-center gap-2 active:scale-95"
          >
            <span>Share</span>
            <span>📤</span>
          </button>
        </div>
      </div>

      {/* Hero Summary - Dreamy Background */}
      <section className="bg-white p-10 md:p-14 rounded-[2.5rem] border border-white shadow-[0_20px_60px_rgba(0,0,0,0.02)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-50/50 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-pink-50/30 rounded-full -ml-20 -mb-20 blur-[60px]"></div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center text-2xl shadow-xl shadow-indigo-100 mb-8">🗺️</div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">Your Adventure <br/><span className="gradient-text">Starts Here.</span></h2>
          <p className="text-lg text-slate-600 leading-relaxed font-medium">{plan.summary}</p>
        </div>
      </section>

      {/* Logistics & Stays Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Travel Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-white p-7 rounded-3xl border border-white shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <span className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">🚆</span> 
              Travel
            </h3>
            <div className="space-y-4">
              {plan.travelOptions.map((opt, i) => (
                <div key={i} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50 hover:bg-white hover:border-indigo-100 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm text-slate-800">{opt.mode}</span>
                    <span className="text-indigo-600 font-bold text-sm bg-white px-2 py-0.5 rounded-lg shadow-sm">₹{opt.estimatedCost}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{opt.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Budget Widget */}
          <section className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 rounded-full -mr-16 -mt-16 opacity-40 blur-3xl"></div>
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-8">Trip Economy</h3>
            <div className="space-y-8 relative z-10">
              <div>
                <p className="text-4xl font-bold tracking-tighter">₹{(plan.costBreakdown.total / 1000).toFixed(1)}k</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Total Estimate</p>
              </div>
              <div className="space-y-5 pt-6 border-t border-white/10">
                {[
                  { label: 'Travel', val: plan.costBreakdown.travel, color: 'bg-indigo-500' },
                  { label: 'Stay', val: plan.costBreakdown.stay, color: 'bg-pink-500' },
                  { label: 'Food', val: plan.costBreakdown.food, color: 'bg-amber-400' }
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-[11px] font-bold mb-2">
                      <span className="text-slate-400">{item.label}</span>
                      <span>₹{item.val}</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className={`${item.color} h-full transition-all duration-1000`} style={{ width: `${(item.val / plan.costBreakdown.total) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Accommodation Main */}
        <section className="lg:col-span-2 bg-white p-8 md:p-10 rounded-3xl border border-white shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <span className="text-2xl">🏨</span> Stay Picks
            </h3>
            <div className="px-4 py-1.5 bg-pink-50 text-pink-600 text-[10px] font-bold rounded-full uppercase tracking-widest border border-pink-100">
              {plan.accommodation.area}
            </div>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100">
             <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
              "We chose {plan.accommodation.area} because {plan.accommodation.whyThisArea.charAt(0).toLowerCase() + plan.accommodation.whyThisArea.slice(1)}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plan.accommodation.options.map((option, idx) => (
              <div key={idx} className="flex flex-col bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-xl transition-all hover:border-indigo-100 group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-slate-50 group-hover:bg-indigo-500 transition-colors"></div>
                <div className="flex justify-between items-start mb-5">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-slate-100">🏠</div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-900 leading-none">₹{option.price}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1.5">per night</p>
                  </div>
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">{option.name}</h4>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-4">{option.type}</p>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg text-xs font-bold">
                    <span>★</span>
                    <span>{option.rating}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase">{option.reviewCount}</span>
                </div>
                <p className="text-sm text-slate-600 font-medium mb-8 leading-relaxed italic flex-1">"{option.highlight}"</p>
                {option.bookingUrl && (
                  <a href={option.bookingUrl} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest text-center transition-all hover:gradient-bg shadow-lg hover:shadow-indigo-100">
                    Book This Stay
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Insider Wisdom - Vibrant Category Badges */}
      <section className="bg-indigo-50 p-10 rounded-[2.5rem] border border-indigo-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 gradient-bg"></div>
        <div className="mb-10 text-center md:text-left">
          <h3 className="text-2xl font-bold text-slate-900 flex items-center justify-center md:justify-start gap-3">
            <span className="text-3xl">✨</span> Insider Hacks
          </h3>
          <p className="text-indigo-600 text-xs font-bold uppercase tracking-[0.2em] mt-2 ml-1">Hyper-local secrets for your trip</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {plan.localTips.map((tip, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl flex gap-5 items-start shadow-sm hover:shadow-md transition-shadow border border-white">
              <div className="bg-indigo-50 px-2.5 py-1.5 rounded-xl border border-indigo-100 flex flex-col items-center justify-center min-w-[70px]">
                <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-tighter text-center leading-tight">
                  {tip.category.split(' ').join('\n')}
                </span>
              </div>
              <p className="text-[15px] font-medium text-slate-700 leading-relaxed pt-1">
                {tip.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Itinerary - Clean Timeline Style */}
      <section className="space-y-10">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <span>📅</span> Daily Roadmap
          </h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Grounded in Live Data</span>
        </div>
        
        <div className="space-y-8">
          {plan.itinerary.map((day, i) => (
            <div key={i} className="bg-white rounded-[2rem] border border-white shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-56 gradient-bg p-10 flex flex-col items-center justify-center text-white">
                <span className="text-5xl font-bold tracking-tighter">0{day.day}</span>
                <span className="text-xs font-bold uppercase tracking-[0.3em] mt-3 opacity-80">Day</span>
              </div>
              <div className="flex-1 p-10 space-y-8">
                <div>
                  <h4 className="text-2xl font-bold text-slate-900 mb-2">{day.title}</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">₹{day.estimatedCost} activity budget</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {day.activities.map((act, j) => (
                    <div key={j} className="flex gap-4 items-start p-5 bg-slate-50/50 rounded-2xl hover:bg-white border border-transparent hover:border-slate-100 transition-all">
                      <div className="mt-1.5 w-2 h-2 rounded-full gradient-bg shadow-sm flex-shrink-0"></div>
                      <span className="text-base font-medium text-slate-700 leading-relaxed">{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* References Footer */}
      {plan.sources && plan.sources.length > 0 && (
        <section className="bg-white p-10 rounded-3xl border border-white shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Verified Research Material</p>
          <div className="flex flex-wrap gap-4">
            {plan.sources.map((source, i) => (
              <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-slate-50 hover:bg-indigo-600 hover:text-white border border-slate-100 rounded-xl text-sm font-bold text-slate-600 transition-all flex items-center gap-3">
                <span className="text-lg">🔍</span>
                {source.title.substring(0, 35)}...
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default PlanDisplay;
