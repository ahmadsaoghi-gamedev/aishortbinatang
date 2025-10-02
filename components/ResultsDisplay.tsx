import React from 'react';
import type { GeneratedScene } from '../types';
import { SceneCard } from './SceneCard';
import { AssemblyInstructions } from './AssemblyInstructions';

interface ResultsDisplayProps {
  sequence: GeneratedScene[] | null;
  isLoading: boolean;
  error: string | null;
  onReviseImage: (sceneNumber: number, revisionPrompt: string) => void;
}

const WelcomeMessage: React.FC = () => (
    <div className="text-center bg-slate-800 p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to the AI Video Generator</h2>
        <p className="text-slate-400">
            Use the controls on the left to define your cinematic animal encounter. Select your actors, set the scene, and click "Generate Sequence" to create a series of professional prompts for your video project.
        </p>
    </div>
);

const LoadingSpinner: React.FC = () => (
    <div className="text-center bg-slate-800 p-8 rounded-lg flex flex-col items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-cyan-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h2 className="text-xl font-semibold text-white">Generating Your Cinematic Sequence...</h2>
        <p className="text-slate-400 mt-1">Crafting the perfect shots, please wait.</p>
    </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{message}</span>
    </div>
);


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ sequence, isLoading, error, onReviseImage }) => {
    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorDisplay message={error} />;
    }
    
    if (!sequence) {
        return <WelcomeMessage />;
    }

    return (
        <div className="space-y-8">
            {sequence.map((scene) => (
                <SceneCard key={scene.sceneNumber} scene={scene} onReviseImage={onReviseImage} />
            ))}
            <AssemblyInstructions />
        </div>
    );
};