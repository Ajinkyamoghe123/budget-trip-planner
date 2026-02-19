
import React, { useEffect, useState } from 'react';
import { TravelPlan } from '../types';
import { submitFeedback, isFeedbackEnabled } from '../services/feedbackService';
import { trackEvent } from '../services/analyticsService';

interface PlanDisplayProps {
  plan: TravelPlan;
  onReset: () => void;
}

const GI_TAG_MAP: Array<{ keywords: string[]; tags: string[] }> = [
  { keywords: ["goa"], tags: ["Goa Feni"] },
  { keywords: ["jaipur", "udaipur", "jodhpur", "rajasthan"], tags: ["Jaipur Blue Pottery", "Kota Doria"] },
  { keywords: ["varanasi", "banaras"], tags: ["Banarasi Brocades and Sarees"] },
  { keywords: ["lucknow"], tags: ["Lucknow Chikan Craft"] },
  { keywords: ["agra"], tags: ["Agra Petha"] },
  { keywords: ["manali", "kullu", "shimla", "himachal"], tags: ["Kullu Shawl", "Kangra Tea"] },
  { keywords: ["srinagar", "kashmir"], tags: ["Kashmir Pashmina", "Kashmiri Saffron"] },
  { keywords: ["darjeeling"], tags: ["Darjeeling Tea"] },
  { keywords: ["assam", "guwahati"], tags: ["Assam Orthodox Tea"] },
  { keywords: ["mysore", "mysuru"], tags: ["Mysore Silk"] },
  { keywords: ["coorg", "kodagu"], tags: ["Coorg Arabica Coffee"] },
  { keywords: ["hyderabad", "telangana"], tags: ["Pochampally Ikat"] },
  { keywords: ["kanchipuram", "chennai", "tamil nadu"], tags: ["Kanchipuram Silk"] },
  { keywords: ["kochi", "munnar", "kerala"], tags: ["Aranmula Kannadi", "Alleppey Coir"] },
  { keywords: ["bhubaneswar", "puri", "odisha"], tags: ["Odisha Pattachitra"] },
];

const resolveGiTags = (destination: string): string[] => {
  const normalized = destination.trim().toLowerCase();
  if (!normalized) return [];

  const tags = GI_TAG_MAP
    .filter((entry) => entry.keywords.some((keyword) => normalized.includes(keyword)))
    .flatMap((entry) => entry.tags);

  return [...new Set(tags)];
};

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, onReset }) => {
  const getAllDayNumbers = (itinerary: TravelPlan["itinerary"] = []): number[] =>
    itinerary.map((day, index) => day?.day || index + 1);
  const giTags = resolveGiTags(plan?.accommodation?.area || "");

  const [feedbackState, setFeedbackState] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [expandedDays, setExpandedDays] = useState<number[]>(() => getAllDayNumbers(plan?.itinerary || []));

  useEffect(() => {
    setExpandedDays(getAllDayNumbers(plan?.itinerary || []));
  }, [plan]);

  useEffect(() => {
    void trackEvent('itinerary_viewed', {
      destination: plan?.accommodation?.area || '',
      totalDays: (plan?.itinerary || []).length,
      totalCost: plan?.costBreakdown?.total || 0,
    });
  }, [plan]);

  // const handleShare = async () => {
  //   const shareData = {
  //     title: `Chalo: My ${plan.accommodation.area} Itinerary`,
  //     text: `Just planned a killer trip using Chalo! Check it out.`,
  //     url: window.location.href,
  //   };
  //   if (navigator.share) {
  //     try { await navigator.share(shareData); } catch (err) { }
  //   } else {
  //     alert("Sharing is not supported on this browser.");
  //   }
  // };

  const handleFeedbackSubmit = async () => {
    if (feedbackState === 'submitting' || feedbackState === 'submitted') return;
    if (rating < 1 || rating > 5) return;

    setFeedbackState('submitting');

    try {
      await submitFeedback(rating, feedbackText);
      void trackEvent('feedback_submitted', {
        rating,
        hasComment: feedbackText.trim().length > 0,
        destination: plan?.accommodation?.area || '',
      });
      setFeedbackState('submitted');
    } catch (error) {
      console.error("Feedback submission failed:", error);
      setFeedbackState('error');
    }
  };

  const toggleDay = (dayNumber: number) => {
    setExpandedDays((prev) =>
      prev.includes(dayNumber)
        ? prev.filter((num) => num !== dayNumber)
        : [...prev, dayNumber]
    );
  };

  const jumpToDay = (dayNumber: number) => {
    const section = document.getElementById(`day-${dayNumber}`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (!expandedDays.includes(dayNumber)) {
      setExpandedDays((prev) => [...prev, dayNumber]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-14 pb-32">
      {/* Dynamic Header */}
      <div className="relative z-30">
        <div className="glass-card px-6 py-4 rounded-[2rem] shadow-xl border border-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onReset}
              className="px-5 py-3 bg-white text-slate-800 rounded-2xl flex items-center justify-center hover:shadow-lg transition-all border border-slate-100 text-sm font-bold uppercase tracking-wider"
            >
              Back
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">Your Safarnama</h1>
            </div>
          </div>
          {/* <button
            onClick={handleShare}
            className="px-6 py-3 gradient-bg text-white rounded-2xl hover:brightness-110 transition-all text-sm font-bold shadow-lg shadow-indigo-200 flex items-center gap-2"
          >
            <span>Share Itinerary</span>
            <span>📤</span>
          </button> */}
        </div>
      </div>

      {/* Hero: The Vibe Check */}
      <section className="relative p-10 md:p-16 bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white group animate-rise">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/80 rounded-full -mr-32 -mt-32 blur-[100px] group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-pink-50/50 rounded-full -ml-20 -mb-20 blur-[80px]"></div>

        <div className="relative z-10 max-w-2xl space-y-8">
          <div className="inline-block p-4 bg-white rounded-3xl shadow-xl border border-slate-50">
            <svg className="w-9 h-9 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3l7 4v10l-7 4-7-4V7l7-4z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7v10m-4-8l8 0m-6 6l4 0" />
            </svg>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-[1.1]">
            Your travel plan, <br />
            <span className="gradient-text">ready to book.</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed">
            {plan?.summary || "Your custom itinerary has been generated."}
          </p>
        </div>
      </section>

      {/* The Core: Stays & Budget */}
      <section className="space-y-8 animate-rise" style={{ animationDelay: '120ms' }}>
        <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <span>🏨</span> Top Stay Picks
            </h3>
            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
              {plan?.accommodation?.area || "Recommended Stays"}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-500 mb-8">
            Included in your full-trip booking approval.
          </p>

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

                <p className="text-xs font-semibold text-indigo-600">
                  Included in final in-app booking after approval.
                </p>
              </div>
            ))}
          </div>

        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

          <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Transport</h3>
            <p className="text-sm font-semibold text-slate-500 mb-6">
              Also included in full-trip booking approval.
            </p>
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

        <div className="relative overflow-hidden rounded-[2rem] border border-indigo-100/90 bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-5 md:p-6 shadow-[0_16px_35px_rgba(99,102,241,0.12)] cta-float">
          <div className="absolute -top-16 -right-14 w-44 h-44 rounded-full bg-pink-200/45 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-16 w-56 h-56 rounded-full bg-indigo-200/45 blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500 mb-2">
                Trip Approval
              </p>
              <p className="text-sm md:text-base font-semibold text-slate-700">
                Approve once and Chalo handles stay, transport, and itinerary bookings in-app.
              </p>
            </div>
            <button
              type="button"
              disabled
              className="relative overflow-hidden w-full md:w-auto px-7 py-3.5 rounded-xl gradient-bg text-white text-sm font-bold tracking-wide opacity-90 cursor-not-allowed cta-button-glow"
            >
              <span className="absolute inset-0 cta-shimmer pointer-events-none"></span>
              <span className="relative">Approve Full Trip</span>
            </button>
          </div>
        </div>
      </section>

      {/* The Roadmap (Day by Day) */}
      <section className="space-y-8 animate-rise" style={{ animationDelay: '180ms' }}>
        <div className="text-center md:text-left px-4">
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight">The Daily Roadmap</h3>
          <p className="text-slate-400 font-medium mt-2">A curated flow of experiences.</p>
        </div>

        <div className="flex flex-wrap gap-3 px-4">
          {(plan?.itinerary || []).map((day, i) => (
            <button
              key={day?.day || i + 1}
              type="button"
              onClick={() => jumpToDay(day?.day || i + 1)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:border-indigo-300 hover:text-indigo-700 transition-all"
            >
              Day {(day?.day || i + 1).toString().padStart(2, '0')}
            </button>
          ))}
        </div>

        <div className="space-y-8">
          {(plan?.itinerary || []).map((day, i) => (
            <div id={`day-${day?.day || i + 1}`} key={i} className="group bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="gradient-bg rounded-2xl px-6 py-4 text-white mb-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-lg md:text-xl font-black tracking-wide">Day {(day?.day || i + 1).toString().padStart(2, '0')}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-white/90">Est. Spend: ₹{day?.estimatedCost || 0}</span>
                    <button
                      type="button"
                      onClick={() => toggleDay(day?.day || i + 1)}
                      className="text-xs md:text-sm font-bold uppercase tracking-wider text-white border border-white/40 px-3 py-1 rounded-lg hover:bg-white/15 transition-all"
                    >
                      {expandedDays.includes(day?.day || i + 1) ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                </div>
              </div>

              <h4 className="text-2xl font-bold text-slate-900 leading-tight mb-6">{day?.title || "Plan"}</h4>

              {expandedDays.includes(day?.day || i + 1) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {(day?.activities || []).map((act, j) => (
                    <div key={j} className="flex gap-4 items-start p-5 bg-slate-50/70 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                        <span className="text-base">📍</span>
                      </div>
                      <span className="text-base font-medium text-slate-700 leading-relaxed pt-0.5 flex-1">{act}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Local Insights */}
      <section className="bg-indigo-600 p-10 md:p-14 rounded-[4rem] text-white shadow-[0_30px_60px_rgba(79,70,229,0.3)] relative overflow-hidden group animate-rise" style={{ animationDelay: '220ms' }}>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mb-20 blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 text-center md:text-left">
            <div>
              <h3 className="text-3xl font-bold tracking-tight">Local Insights</h3>
              <p className="text-indigo-200 font-medium text-lg mt-2">Practical recommendations from local patterns and traveler behavior.</p>
            </div>
            <div className="px-6 py-2 bg-white/20 rounded-full text-xs font-bold tracking-widest uppercase">Trusted Tips</div>
          </div>

          {giTags.length > 0 && (
            <div className="mb-8 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/10 p-5">
              <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-white text-indigo-700 text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
                GI Tags
              </span>
              <div className="flex flex-wrap gap-2">
                {giTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-indigo-500/20 border border-white/30 text-white rounded-xl text-[11px] font-bold uppercase tracking-wide"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(plan?.localTips || []).map((tip, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 hover:bg-white/20 hover:-translate-y-1 transition-all duration-300">
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

      <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm text-center md:text-left">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Did you like this app?</h3>
        <p className="text-slate-500 font-medium mt-2">Rate your itinerary and share what we should improve.</p>

        {!isFeedbackEnabled && (
          <p className="mt-4 text-sm font-semibold text-slate-500">
            Feedback is currently unavailable. Configure Google Form env values to enable it.
          </p>
        )}

        {feedbackState !== 'submitted' && (
          <div className="mt-6 space-y-5">
            <div className="flex items-center justify-center md:justify-start gap-2">
              {[1, 2, 3, 4, 5].map((value) => {
                const isActive = (hoverRating || rating) >= value;
                return (
                  <button
                    key={value}
                    type="button"
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => {
                      setRating(value);
                      if (feedbackState === 'error') setFeedbackState('idle');
                    }}
                    disabled={!isFeedbackEnabled || feedbackState === 'submitting'}
                    className="p-1 transition-transform hover:scale-110 disabled:cursor-not-allowed"
                    aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                  >
                    <svg
                      className={`w-8 h-8 ${isActive ? 'text-amber-400' : 'text-slate-300'}`}
                      viewBox="0 0 24 24"
                      fill={isActive ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.036 6.263a1 1 0 00.95.69h6.586c.969 0 1.371 1.24.588 1.81l-5.327 3.87a1 1 0 00-.364 1.118l2.036 6.263c.3.921-.755 1.688-1.538 1.118l-5.327-3.87a1 1 0 00-1.176 0l-5.327 3.87c-.783.57-1.838-.197-1.539-1.118l2.036-6.263a1 1 0 00-.363-1.118l-5.327-3.87c-.784-.57-.38-1.81.587-1.81h6.587a1 1 0 00.95-.69l2.036-6.263z" />
                    </svg>
                  </button>
                );
              })}
            </div>

            <textarea
              rows={4}
              placeholder="What did you like? What can be improved?"
              value={feedbackText}
              onChange={(e) => {
                setFeedbackText(e.target.value);
                if (feedbackState === 'error') setFeedbackState('idle');
              }}
              disabled={!isFeedbackEnabled || feedbackState === 'submitting'}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
            />

            <button
              type="button"
              onClick={handleFeedbackSubmit}
              disabled={!isFeedbackEnabled || feedbackState === 'submitting' || rating === 0}
              className="px-6 py-3 rounded-2xl gradient-bg text-white font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {feedbackState === 'submitting' ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        )}

        {feedbackState === 'submitted' && (
          <p className="mt-4 text-sm font-semibold text-emerald-700">Thanks for your feedback.</p>
        )}
        {feedbackState === 'error' && (
          <p className="mt-4 text-sm font-semibold text-rose-700">Could not submit feedback right now. Please try again.</p>
        )}
      </section>

    </div>
  );
};

export default PlanDisplay;
