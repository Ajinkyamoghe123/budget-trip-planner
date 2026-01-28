
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
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] max-w-2xl mx-auto space-y-8">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Departure</label>
            <input 
              type="text" 
              placeholder="Where from?"
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-300"
              value={formData.fromCity}
              onChange={(e) => setFormData({...formData, fromCity: e.target.value})}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Destination</label>
            <input 
              type="text" 
              placeholder="Going to?"
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-300"
              value={formData.toCity}
              onChange={(e) => setFormData({...formData, toCity: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Vibe / Persona</label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {Object.values(TripType).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({...formData, tripType: type})}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all border-2 ${
                  formData.tripType === type 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm' 
                    : 'border-slate-100 bg-white text-slate-500 hover:border-indigo-200'
                }`}
              >
                <span className="text-2xl mb-1">{tripIcons[type]}</span>
                <span className="text-[10px] font-bold uppercase">{type}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Budget</label>
              <span className="text-indigo-600 font-extrabold text-lg">₹{(formData.budget/1000).toFixed(0)}k</span>
            </div>
            <input 
              type="range" 
              min="5000" 
              max="100000" 
              step="5000"
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value)})}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Duration</label>
            <div className="flex items-center bg-slate-50 rounded-2xl px-4 py-1">
               <button 
                type="button"
                onClick={() => setFormData({...formData, duration: Math.max(1, formData.duration - 1)})}
                className="w-10 h-10 flex items-center justify-center text-xl text-indigo-600 font-bold hover:bg-white rounded-xl"
              >-</button>
              <span className="flex-1 text-center font-bold text-slate-700">{formData.duration} Days</span>
              <button 
                type="button"
                onClick={() => setFormData({...formData, duration: formData.duration + 1})}
                className="w-10 h-10 flex items-center justify-center text-xl text-indigo-600 font-bold hover:bg-white rounded-xl"
              >+</button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Interests</label>
          <div className="flex flex-wrap gap-2">
            {Object.values(Interest).map(interest => (
              <button
                key={interest}
                type="button"
                onClick={() => handleInterestToggle(interest)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  formData.interests.includes(interest) 
                    ? 'bg-slate-900 text-white shadow-lg' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className={`w-full py-5 rounded-2xl font-black text-white shadow-[0_10px_30px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
          isLoading ? 'bg-slate-200' : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        ) : (
          <>
            <span>GENERATE MY TRIP</span>
            <span className="text-xl">✨</span>
          </>
        )}
      </button>
    </form>
  );
};

export default InputForm;
