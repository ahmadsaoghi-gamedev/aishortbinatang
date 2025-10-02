import React from 'react';
import type { UserInput } from '../types';
import { durationOptions, environments, timesOfDay, moods, aspectRatioOptions } from '../constants';

interface SelectionPanelProps {
  userInput: UserInput;
  setUserInput: React.Dispatch<React.SetStateAction<UserInput>>;
  onGenerate: () => void;
  onFeelingLucky: () => void;
  isLoading: boolean;
}

const CustomSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>
        <select {...props} className="block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition">
            {children}
        </select>
    </div>
);

const CustomTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>
        <textarea {...props} rows={4} className="block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition resize-y" />
    </div>
);


export const SelectionPanel: React.FC<SelectionPanelProps> = ({ userInput, setUserInput, onGenerate, onFeelingLucky, isLoading }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserInput(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('video/')) {
        setUserInput(prev => ({ ...prev, referenceVideo: file }));
      } else {
        alert('Please select a valid video file.');
      }
    }
  };

  const clearVideo = () => {
    setUserInput(prev => ({ ...prev, referenceVideo: null }));
    const fileInput = document.getElementById('video-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg sticky top-8">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-3">Creative Controls</h2>
      <div className="space-y-4">
        
        <CustomTextArea
            label="Scenario Description"
            name="scenario"
            value={userInput.scenario}
            onChange={handleChange}
            placeholder="e.g., Lizards attack peacock eggs, a cheetah's risky hunt near a trap, a bear vs wolf territorial dispute..."
        />

        <CustomSelect label="Duration" name="duration" value={userInput.duration} onChange={handleChange}>
          {Object.entries(durationOptions).map(([key, value]) => (
            <option key={key} value={key}>{value.description}</option>
          ))}
        </CustomSelect>

        <CustomSelect label="Aspect Ratio" name="aspectRatio" value={userInput.aspectRatio} onChange={handleChange}>
            {Object.entries(aspectRatioOptions).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
            ))}
        </CustomSelect>
        
        <CustomSelect label="Environment" name="environment" value={userInput.environment} onChange={handleChange}>
            {environments.map(env => <option key={env} value={env}>{env}</option>)}
        </CustomSelect>

        <CustomSelect label="Time of Day" name="timeOfDay" value={userInput.timeOfDay} onChange={handleChange}>
            {timesOfDay.map(time => <option key={time} value={time}>{time}</option>)}
        </CustomSelect>

        <CustomSelect label="Mood" name="mood" value={userInput.mood} onChange={handleChange}>
            {moods.map(m => <option key={m} value={m}>{m}</option>)}
        </CustomSelect>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-slate-400 mb-2">Reference Video (Optional)</label>
        {userInput.referenceVideo ? (
          <div className="group relative">
            <video
              key={userInput.referenceVideo.name} // Force re-render on file change
              src={URL.createObjectURL(userInput.referenceVideo)}
              className="w-full rounded-md max-h-48 object-cover"
              controls={false}
              autoPlay
              loop
              muted
            />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
              <button
                onClick={clearVideo}
                className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-500 transition-colors"
              >
                Clear Video
              </button>
            </div>
             <p className="text-xs text-slate-500 mt-1 truncate" title={userInput.referenceVideo.name}>{userInput.referenceVideo.name}</p>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <label htmlFor="video-upload" className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-700/50 hover:bg-slate-700 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-2 text-slate-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                    <p className="text-sm text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                </div>
                <input id="video-upload" type="file" className="hidden" accept="video/*" onChange={handleFileChange} />
            </label>
          </div>
        )}
      </div>

      <div className="mt-8 space-y-3">
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
             <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing & Generating...
             </>
          ) : 'Generate Sequence'}
        </button>
        <button
          onClick={onFeelingLucky}
          disabled={isLoading}
          className="w-full bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500 transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          I'm Feeling Lucky
        </button>
      </div>
    </div>
  );
};