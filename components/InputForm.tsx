
import React, { useState } from 'react';
import { UserInput, TripType, Interest } from '../types';

interface InputFormProps {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<UserInput>({
    fromCity: '',
    toCity: '',
    tripType: TripType.SOLO,
    budget: 15000,
    duration: 3,
    interests: [],
  });

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
    onSubmit(formData);
  };

  const tripIcons: Record<TripType, string> = {
    [TripType.SOLO]: '🧗',
    [TripType.BACHELOR]: '🎉',
    [TripType.COUPLE]: '🥂',
    [TripType.FRIENDS]: '🎸',
    [TripType.FAMILY]: '🏠',
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] max-w-2xl mx-auto space-y-8 border border-white">
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
        <div className="grid grid-cols-5 gap-3">
          {Object.values(TripType).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setFormData({...formData, tripType: type})}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <label className="text-sm font-semibold text-slate-400">Budget Range</label>
            <span className="text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-lg">₹{formData.budget.toLocaleString()}</span>
          </div>
          <input 
            type="range" 
            min="5000" 
            max="150000" 
            step="5000"
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            value={formData.budget}
            onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value)})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-400 ml-1">Trip Days</label>
          <div className="flex items-center bg-slate-50 rounded-2xl p-1.5 border border-slate-100">
             <button 
              type="button"
              onClick={() => setFormData({...formData, duration: Math.max(1, formData.duration - 1)})}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg>
            </button>
            <span className="flex-1 text-center font-bold text-slate-700">0{formData.duration} Days</span>
            <button 
              type="button"
              onClick={() => setFormData({...formData, duration: formData.duration + 1})}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        </div>
      </div>

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
        className={`w-full py-4.5 rounded-2xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-3 text-base active:scale-[0.98] ${
          isLoading ? 'bg-slate-200 cursor-not-allowed' : 'gradient-bg hover:brightness-110 shadow-indigo-200'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-white/50" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Finding Hidden Gems...
          </span>
        ) : (
          <>
            <span>Generate Itinerary</span>
            <span className="text-xl">✨</span>
          </>
        )}
      </button>
    </form>
  );
};

export default InputForm;
