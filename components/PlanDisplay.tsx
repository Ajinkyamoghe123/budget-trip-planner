
import React from 'react';
import { TravelPlan } from '../types';

interface PlanDisplayProps {
  plan: TravelPlan;
  onReset: () => void;
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, onReset }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32">
      {/* Header Sticky Bar */}
      <div className="sticky top-6 z-30 mx-auto max-w-2xl px-4">
        <div className="glass-card px-6 py-4 rounded-[2rem] shadow-xl flex items-center justify-between border border-white/50">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 block">Current Itinerary</span>
            <h1 className="text-lg font-bold text-slate-800">Your Custom Trip</h1>
          </div>
          <button 
            onClick={onReset}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all text-xs font-bold"
          >
            NEW TRIP
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <section className="bg-white p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-20 -mt-20 opacity-50 blur-3xl"></div>
        <div className="relative z-10">
          <span className="text-4xl mb-4 block">🗺️</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">The Big Picture</h2>
          <p className="text-lg text-slate-500 leading-relaxed font-medium">{plan.summary}</p>
        </div>
      </section>

      {/* Logistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-2xl shadow-indigo-200">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <span className="p-2 bg-indigo-500 rounded-xl text-lg">🚆</span> 
            Getting There
          </h2>
          <div className="space-y-4">
            {plan.travelOptions.map((opt, i) => (
              <div key={i} className="p-5 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-lg">{opt.mode}</span>
                  <span className="bg-white text-indigo-600 px-3 py-1 rounded-full text-xs font-black">₹{opt.estimatedCost}</span>
                </div>
                <p className="text-sm text-indigo-100 font-medium">{opt.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <span className="p-2 bg-slate-50 rounded-xl text-lg">🏠</span> 
            Stay Recommendation
          </h2>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-2xl">🏨</div>
              <div>
                <h3 className="font-extrabold text-slate-900">{plan.accommodation.type}</h3>
                <p className="text-sm text-slate-500 font-medium">{plan.accommodation.area}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {plan.accommodation.benefits.map((benefit, i) => (
                <div key={i} className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100/50 text-center">
                  {benefit}
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-400">Nightly Rate</span>
              <span className="text-xl font-black text-indigo-600">₹{plan.accommodation.avgNightlyRate}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Modern Itinerary */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">The Safarnama</h2>
          <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{plan.itinerary.length} Days Planned</span>
        </div>
        
        <div className="space-y-6">
          {plan.itinerary.map((day, i) => (
            <div key={i} className="group bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 hover:shadow-xl hover:border-indigo-100 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl">
                    0{day.day}
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">{day.title}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Morning to Night</p>
                  </div>
                </div>
                <div className="px-4 py-2 bg-slate-50 rounded-2xl text-slate-600 font-bold text-sm">
                  Spend: <span className="text-indigo-600">₹{day.estimatedCost}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {day.activities.map((act, j) => (
                  <div key={j} className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-transparent group-hover:border-slate-100 transition-all">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    <span className="text-sm text-slate-600 font-medium">{act}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sources & Pro Tips Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="md:col-span-2 bg-slate-900 p-10 rounded-[3rem] text-white overflow-hidden relative">
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-500 rounded-full -mr-16 -mb-16 blur-3xl opacity-20"></div>
          
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3 relative z-10">
              <span className="text-2xl">🔍</span> Verified Research
            </h2>
            <div className="flex flex-wrap gap-2 relative z-10">
              {plan.sources && plan.sources.length > 0 ? (
                plan.sources.map((source, i) => (
                  <a 
                    key={i} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[11px] font-bold text-slate-300 transition-all flex items-center gap-2"
                  >
                    <span>🔗</span> {source.title.length > 20 ? source.title.substring(0, 20) + '...' : source.title}
                  </a>
                ))
              ) : (
                <p className="text-slate-500 text-xs">Based on latest internal travel models.</p>
              )}
            </div>
          </div>

          <h2 className="text-xl font-bold mb-6 flex items-center gap-3 relative z-10">
            <span className="text-2xl">🔥</span> Pro Tips
          </h2>
          <ul className="space-y-4 relative z-10">
            {plan.localTips.map((tip, i) => (
              <li key={i} className="text-sm text-slate-300 flex gap-4 items-start">
                <span className="text-indigo-400 font-bold">#</span>
                <p className="font-medium leading-relaxed">{tip}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-8">Wallet Check</h2>
          <div className="space-y-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-300 uppercase mb-1">Total Trip Value</span>
              <span className="text-4xl font-black text-indigo-600">₹{(plan.costBreakdown.total / 1000).toFixed(1)}k</span>
            </div>
            
            <div className="space-y-3 pt-6 border-t border-slate-50">
               {[
                 { label: 'Travel', val: plan.costBreakdown.travel, color: 'bg-blue-400' },
                 { label: 'Stay', val: plan.costBreakdown.stay, color: 'bg-indigo-400' },
                 { label: 'Food', val: plan.costBreakdown.food, color: 'bg-pink-400' }
               ].map((item, idx) => (
                 <div key={idx}>
                   <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                     <span>{item.label}</span>
                     <span>₹{item.val}</span>
                   </div>
                   <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
                     <div className={`${item.color} h-full`} style={{ width: `${(item.val / Math.max(1, plan.costBreakdown.total)) * 100}%` }}></div>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDisplay;
