
import React, { useState } from 'react';
import { UserInput, TripType, Interest, TransportPreference, TripPace } from '../types';

interface InputFormProps {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<UserInput>({
    fromCity: '',
    toCity: '',
    tripType: TripType.SOLO,
    numberOfPeople: 1,
    travelMonth: 'Any month',
    transportPreference: TransportPreference.ANY,
    pace: TripPace.BALANCED,
    budget: 15000,
    duration: 3,
    interests: [],
  });

  const shouldShowTravelersInput =
    // formData.tripType === TripType.BACHELOR ||
    formData.tripType === TripType.FRIENDS ||
    formData.tripType === TripType.FAMILY;

  const getEffectiveTravelerCount = (tripType: TripType, currentCount: number): number => {
    if (tripType === TripType.SOLO) return 1;
    if (tripType === TripType.COUPLE) return 2;
    return Math.max(2, currentCount);
  };

  const baseDailyCostByTripType: Record<TripType, number> = {
    [TripType.SOLO]: 1500,
    // [TripType.BACHELOR]: 1800,
    [TripType.COUPLE]: 2000,
    [TripType.FRIENDS]: 1800,
    [TripType.FAMILY]: 2200,
  };

  const paceMultiplier: Record<TripPace, number> = {
    [TripPace.RELAXED]: 0.95,
    [TripPace.BALANCED]: 1,
    [TripPace.PACKED]: 1.15,
  };

  const transportBufferByPreference: Record<TransportPreference, number> = {
    [TransportPreference.ANY]: 1500,
    [TransportPreference.TRAIN]: 1200,
    [TransportPreference.BUS]: 1000,
    [TransportPreference.FLIGHT]: 3500,
    [TransportPreference.CAB]: 2200,
  };

  const getBudgetWarning = (): string | null => {
    const travelers = getEffectiveTravelerCount(formData.tripType, formData.numberOfPeople);
    const baseDailyCost = baseDailyCostByTripType[formData.tripType];
    const travelBufferPerPerson = transportBufferByPreference[formData.transportPreference];
    const tripPaceMultiplier = paceMultiplier[formData.pace];
    const minRecommendedBudget =
      travelers * ((formData.duration * baseDailyCost * tripPaceMultiplier) + travelBufferPerPerson);

    if (formData.budget < minRecommendedBudget) {
      return `This plan may be unrealistic. For ${formData.duration} days and ${travelers} traveler${travelers > 1 ? 's' : ''}, recommended minimum is ₹${minRecommendedBudget.toLocaleString()}.`;
    }

    return null;
  };

  const budgetWarning = getBudgetWarning();

  const handleInterestToggle = (interest: Interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fromCity || !formData.toCity) return;
    const effectiveTravelerCount = getEffectiveTravelerCount(formData.tripType, formData.numberOfPeople);
    onSubmit({ ...formData, numberOfPeople: effectiveTravelerCount });
  };

  const handleTripTypeChange = (tripType: TripType) => {
    setFormData((prev) => ({
      ...prev,
      tripType,
      numberOfPeople: getEffectiveTravelerCount(tripType, prev.numberOfPeople),
    }));
  };

  const tripIcons: Record<TripType, string> = {
    [TripType.SOLO]: '🧗',
    // [TripType.BACHELOR]: '🎉',
    [TripType.COUPLE]: '🥂',
    [TripType.FRIENDS]: '🎸',
    [TripType.FAMILY]: '🏠',
  };

  const monthOptions = [
    'Any month',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] max-w-3xl mx-auto space-y-8 border border-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-400 ml-1">Starting From</label>
          <input 
            type="text" 
            placeholder="e.g. Mumbai"
            className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 outline-none transition-all text-slate-700 font-medium"
            value={formData.fromCity}
            onChange={(e) => setFormData({...formData, fromCity: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-400 ml-1">Heading To</label>
          <input 
            type="text" 
            placeholder="e.g. Manali"
            className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 outline-none transition-all text-slate-700 font-medium"
            value={formData.toCity}
            onChange={(e) => setFormData({...formData, toCity: e.target.value})}
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-semibold text-slate-400 ml-1">Choose Your Vibe</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.values(TripType).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => handleTripTypeChange(type)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all border-2 ${
                formData.tripType === type 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 scale-[1.05] shadow-sm' 
                  : 'border-slate-50 bg-white text-slate-300 hover:border-slate-200 hover:text-slate-400'
              }`}
            >
              <span className="text-3xl mb-1.5">{tripIcons[type]}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">{type}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className={`grid grid-cols-1 ${shouldShowTravelersInput ? 'md:grid-cols-2' : ''} gap-6`}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-400 ml-1">Trip Days</label>
            <div className="flex items-center bg-slate-50 rounded-2xl p-1.5 border border-slate-100">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, duration: Math.max(1, formData.duration - 1) })}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg>
              </button>
              <span className="flex-1 text-center font-bold text-slate-700">{formData.duration.toString().padStart(2, '0')} Days</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, duration: formData.duration + 1 })}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>
          </div>

          {shouldShowTravelersInput && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-400 ml-1">Travelers</label>
              <div className="flex items-center bg-slate-50 rounded-2xl p-1.5 border border-slate-100">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, numberOfPeople: Math.max(2, formData.numberOfPeople - 1) })}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg>
                </button>
                <span className="flex-1 text-center font-bold text-slate-700">{formData.numberOfPeople.toString().padStart(2, '0')} People</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, numberOfPeople: formData.numberOfPeople + 1 })}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-400 ml-1">Travel Month</label>
            <select
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 outline-none transition-all text-slate-700 font-medium"
              value={formData.travelMonth}
              onChange={(e) => setFormData({ ...formData, travelMonth: e.target.value })}
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-400 ml-1">Transport</label>
            <select
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 outline-none transition-all text-slate-700 font-medium"
              value={formData.transportPreference}
              onChange={(e) => setFormData({ ...formData, transportPreference: e.target.value as TransportPreference })}
            >
              {Object.values(TransportPreference).map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-400 ml-1">Trip Pace</label>
            <select
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 outline-none transition-all text-slate-700 font-medium"
              value={formData.pace}
              onChange={(e) => setFormData({ ...formData, pace: e.target.value as TripPace })}
            >
              {Object.values(TripPace).map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <label className="text-sm font-semibold text-slate-400">Total Budget</label>
            <span className="text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-lg">₹{formData.budget.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="5000"
            max="150000"
            step="5000"
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
          />
        </div>
      </div>

      {budgetWarning && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-semibold text-amber-800">{budgetWarning}</p>
        </div>
      )}

      <div className="space-y-4">
        <label className="text-sm font-semibold text-slate-400 ml-1">Interests</label>
        <div className="flex flex-wrap gap-2.5">
          {Object.values(Interest).map(interest => (
            <button
              key={interest}
              type="button"
              onClick={() => handleInterestToggle(interest)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                formData.interests.includes(interest) 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-[1.02]' 
                  : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-100'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className={`w-full py-5 rounded-2xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-3 text-lg active:scale-[0.98] ${
          isLoading ? 'bg-slate-200 cursor-not-allowed' : 'gradient-bg hover:brightness-110 shadow-indigo-200'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-white/50" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Building your itinerary...
          </span>
        ) : (
          <>
            <span>Generate Itinerary</span>
          </>
        )}
      </button>
    </form>
  );
};

export default InputForm;
