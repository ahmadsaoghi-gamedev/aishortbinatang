import React from 'react';

export const AssemblyInstructions: React.FC = () => {
    return (
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
            <header className="border-b border-slate-700 pb-4 mb-6">
                <h3 className="text-2xl font-bold text-white">Workflow & Assembly Guide</h3>
                <p className="text-slate-400 mt-1">Bringing your sequence to life.</p>
            </header>
            <div className="prose prose-invert prose-slate max-w-none text-slate-300">
                <h4>Step 1: Generate Keyframes with Imagen</h4>
                <p>
                    For each scene, copy the <strong>"Imagen Prompt"</strong>. Use this to generate a high-quality still image that will serve as the visual anchor or "keyframe" for that scene. This helps ensure visual consistency.
                </p>
                
                <h4>Step 2: Generate Video Clips with VEO</h4>
                <p>
                    Next, copy the corresponding <strong>"VEO Prompt"</strong>. Use this prompt, along with the keyframe image generated in Step 1, to create your 7-second video clip. Using the image as a reference helps VEO maintain character and environmental consistency.
                </p>

                <h4>Step 3: Assemble in an Editor (like CapCut)</h4>
                <p>
                    Import all your generated 7-second clips into a video editor. Place them on the timeline in sequential order (Scene 1, Scene 2, etc.). The prompts are designed to create natural transitions, but you can add subtle crossfades if needed for a smoother flow.
                </p>

                <h4>Step 4: Sound Design</h4>
                <p>
                    Use the <strong>"Creative Notes"</strong> as a guide for your audio. Layer ambient sounds first to establish the environment. Then, add specific animal and action sounds to match the on-screen movements. Use the emotional sound cues (like a heartbeat or sudden silence) to maximize dramatic impact.
                </p>

                <h4>Step 5: Color Grading & Final Touches</h4>
                <p>
                    Apply a consistent color grade across all clips to unify the look and feel. Adjust contrast and saturation to match the intended mood. Export your final video and share your cinematic creation!
                </p>
            </div>
        </div>
    );
};