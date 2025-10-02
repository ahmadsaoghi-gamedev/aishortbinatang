
import React from 'react';
import { FilmIcon } from './Icons';

export const Header: React.FC = () => {
    return (
        <header className="text-center">
            <div className="flex items-center justify-center gap-4">
                <FilmIcon className="w-10 h-10 text-cyan-400" />
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                    Advanced AI Video Generator
                </h1>
            </div>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400">
                Craft professional, multi-scene prompts for generating cinema-quality animal videos with seamless continuity.
            </p>
        </header>
    );
};
