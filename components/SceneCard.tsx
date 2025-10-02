import React, { useState } from 'react';
import type { GeneratedScene } from '../types';
import { CopyIcon, CheckIcon, AlertTriangleIcon, ImageIcon } from './Icons';

interface SceneCardProps {
  scene: GeneratedScene;
  onReviseImage: (sceneNumber: number, revisionPrompt: string) => void;
}

const PromptSection: React.FC<{ title: string; content: string }> = ({ title, content }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold text-cyan-400">{title}</h4>
                <button
                    onClick={handleCopy}
                    className="text-slate-400 hover:text-white transition-colors p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    aria-label={`Copy ${title}`}
                >
                    {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                </button>
            </div>
            <pre className="bg-slate-900/70 text-slate-300 p-4 rounded-md text-sm whitespace-pre-wrap font-mono text-left">{content}</pre>
        </div>
    );
};

const ImageLoader: React.FC = () => (
    <div className="w-full h-full bg-slate-700 animate-pulse flex flex-col items-center justify-center text-slate-500">
        <ImageIcon className="w-12 h-12 mb-2" />
        <p className="text-sm">Generating Keyframe...</p>
    </div>
);

const ImageError: React.FC<{ message: string }> = ({ message }) => (
    <div className="w-full h-full bg-red-900/30 flex flex-col items-center justify-center text-red-300 p-4">
        <AlertTriangleIcon className="w-12 h-12 mb-2" />
        <p className="font-semibold">Image Generation Failed</p>
        <p className="text-xs text-center mt-1">{message}</p>
    </div>
);

export const SceneCard: React.FC<SceneCardProps> = ({ scene, onReviseImage }) => {
    const [revisionPrompt, setRevisionPrompt] = useState('');

    const handleRevisionSubmit = () => {
        if (revisionPrompt.trim()) {
            onReviseImage(scene.sceneNumber, revisionPrompt);
        }
    };

    const aspectRatio = scene.videoPrompt.aspectRatio.replace(':', ' / ');
    
    return (
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
            <div 
                className="w-full bg-slate-900/70 rounded-md mb-4 flex items-center justify-center overflow-hidden border border-slate-700"
                style={{ aspectRatio }}
            >
                {scene.isGeneratingImage && <ImageLoader />}
                {scene.imageError && !scene.isGeneratingImage && <ImageError message={scene.imageError} />}
                {scene.imageUrl && !scene.isGeneratingImage && (
                    <img src={scene.imageUrl} alt={`AI generated keyframe for Scene ${scene.sceneNumber}`} className="w-full h-full object-cover" />
                )}
            </div>
            
            {scene.imageUrl && !scene.isGeneratingImage && (
                <div className="mb-6 flex gap-2">
                    <input
                        type="text"
                        value={revisionPrompt}
                        onChange={(e) => setRevisionPrompt(e.target.value)}
                        placeholder="e.g., add a dramatic thundercloud in the sky"
                        className="flex-grow bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                        aria-label="Image revision prompt"
                    />
                    <button
                        onClick={handleRevisionSubmit}
                        disabled={!revisionPrompt.trim() || scene.isGeneratingImage}
                        className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        Revise
                    </button>
                </div>
            )}

            <header className="border-b border-slate-700 pb-4 mb-6">
                <h3 className="text-2xl font-bold text-white">
                    Scene {scene.sceneNumber} <span className="text-slate-400 font-normal">of {scene.totalScenes}</span>
                </h3>
                <p className="text-cyan-400 font-semibold mt-1">{scene.storyBeat}</p>
            </header>
            
            <div className="space-y-6">
                <PromptSection title="Imagen Prompt (for Keyframe)" content={scene.imagePrompt} />
                <PromptSection title="VEO Prompt (for Video)" content={JSON.stringify(scene.videoPrompt, null, 2)} />
                
                <div>
                    <h4 className="text-lg font-semibold text-cyan-400 mb-2">Creative Notes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-slate-900/70 p-4 rounded-md">
                            <h5 className="font-bold text-slate-300 mb-2">Sound Design</h5>
                            <p className="text-slate-400 mb-2"><span className="font-semibold text-slate-300">Audio Mix:</span> {scene.soundDesign.audioMix}</p>
                            <h6 className="font-semibold text-slate-300 mb-1">Ambient Sounds:</h6>
                            <ul className="list-disc list-inside text-slate-400 space-y-1">
                                {scene.soundDesign.ambientSounds.map((note, index) => <li key={index}>{note}</li>)}
                            </ul>
                        </div>
                        <div className="bg-slate-900/70 p-4 rounded-md">
                            <h5 className="font-bold text-slate-300 mb-2">Camera & Mood</h5>
                            <p className="text-slate-400"><span className="font-semibold text-slate-300">Camera Work:</span> {scene.cameraMood.cameraWork}</p>
                            <p className="text-slate-400"><span className="font-semibold text-slate-300">Target Mood:</span> {scene.cameraMood.targetMood}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};