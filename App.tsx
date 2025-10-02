import React, { useState, useCallback } from 'react';
import { SelectionPanel } from './components/SelectionPanel';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { generateSequence } from './services/promptGenerator';
import { generateImage, editImage } from './services/geminiService';
import type { UserInput, GeneratedScene } from './types';
import { durationOptions, environments, timesOfDay, moods, aspectRatioOptions } from './constants';

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<UserInput>({
    scenario: 'A brave cheetah hunts a gazelle near a hidden hunter\'s trap',
    duration: '14_seconds',
    environment: 'African Savanna',
    timeOfDay: 'Golden Hour',
    mood: 'Tense',
    aspectRatio: '9:16',
    referenceVideo: null,
  });

  const [generatedSequence, setGeneratedSequence] = useState<GeneratedScene[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedSequence(null);

    try {
        const sequenceWithoutImages = await generateSequence(userInput);
        
        const initialSequence = sequenceWithoutImages.map(scene => ({
            ...scene,
            isGeneratingImage: true,
            imageUrl: undefined,
            imageError: undefined,
        }));
        setGeneratedSequence(initialSequence);
        setIsLoading(false);

        let sceneIndex = 0;
        for (const scene of initialSequence) {
            try {
                const imageUrl = await generateImage(scene.imagePrompt, userInput.aspectRatio);
                setGeneratedSequence(currentSequence => {
                    if (!currentSequence) return null;
                    return currentSequence.map(s => 
                        s.sceneNumber === scene.sceneNumber 
                        ? { ...s, imageUrl, isGeneratingImage: false } 
                        : s
                    );
                });
            } catch (imageError: any) {
                console.error(`Failed to generate image for scene ${scene.sceneNumber}:`, imageError);
                
                setGeneratedSequence(currentSequence => {
                    if (!currentSequence) return null;
                    return currentSequence.map(s => 
                        s.sceneNumber === scene.sceneNumber 
                        ? { ...s, isGeneratingImage: false, imageError: imageError.message || 'Failed to generate image.' }
                        : s
                    );
                });

                // If it's a fatal quota error, stop everything.
                if (imageError.message && imageError.message.includes("API Quota Exceeded")) {
                    setError(`Image generation stopped: ${imageError.message}`);
                    
                    // Cancel remaining image generations.
                    setGeneratedSequence(currentSequence => {
                        if (!currentSequence) return null;
                        return currentSequence.map(s => 
                            s.sceneNumber > scene.sceneNumber 
                            ? { ...s, isGeneratingImage: false, imageError: 'Generation cancelled due to API quota error.' }
                            : s
                        );
                    });
                    
                    // Stop the loop.
                    break; 
                }
            }

            if (sceneIndex < initialSequence.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            sceneIndex++;
        }
    } catch (e: any) {
      setError(e.message || 'Failed to generate sequence. Please try again.');
      console.error(e);
      setIsLoading(false);
    }
  }, [userInput]);

  const handleFeelingLucky = useCallback(() => {
     const scenarios = [
        'A pack of wolves coordinating to hunt a large bison in the snow',
        'An eagle diving to catch a fish from a river',
        'A Komodo dragon ambushing a deer',
        'A mother bear fiercely defending her cubs from a lone wolf',
        'Lizards attempting a raid on a nest of peacock eggs',
        'A huge python slowly stalking an unsuspecting monkey in the jungle canopy',
        'A tense standoff between a honey badger and a cobra over a meal'
    ];
    
    const randomDuration = Object.keys(durationOptions)[Math.floor(Math.random() * Object.keys(durationOptions).length)];
    const randomAspectRatio = Object.keys(aspectRatioOptions)[Math.floor(Math.random() * Object.keys(aspectRatioOptions).length)];

    setUserInput({
        scenario: scenarios[Math.floor(Math.random() * scenarios.length)],
        duration: randomDuration,
        environment: environments[Math.floor(Math.random() * environments.length)],
        timeOfDay: timesOfDay[Math.floor(Math.random() * timesOfDay.length)],
        mood: moods[Math.floor(Math.random() * moods.length)],
        aspectRatio: randomAspectRatio,
        referenceVideo: null,
    });
  }, []);

  const handleReviseImage = useCallback(async (sceneNumber: number, revisionPrompt: string) => {
    if (!generatedSequence) return;

    const sceneToRevise = generatedSequence.find(s => s.sceneNumber === sceneNumber);
    if (!sceneToRevise || !sceneToRevise.imageUrl) {
        console.error("Scene or original image URL not found for revision.");
        return;
    }

    setGeneratedSequence(currentSequence => {
        if (!currentSequence) return null;
        return currentSequence.map(s => 
            s.sceneNumber === sceneNumber ? { ...s, isGeneratingImage: true, imageError: undefined } : s
        );
    });

    try {
        const [header, base64Data] = sceneToRevise.imageUrl.split(',');
        if (!header || !base64Data) {
            throw new Error("Invalid image data URL format.");
        }
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
        
        const newImageUrl = await editImage(base64Data, mimeType, revisionPrompt);

        setGeneratedSequence(currentSequence => {
            if (!currentSequence) return null;
            return currentSequence.map(s => 
                s.sceneNumber === sceneNumber ? { ...s, imageUrl: newImageUrl, isGeneratingImage: false } : s
            );
        });
    } catch (e: any) {
        console.error(`Failed to revise image for scene ${sceneNumber}:`, e);
        setGeneratedSequence(currentSequence => {
            if (!currentSequence) return null;
            return currentSequence.map(s => 
                s.sceneNumber === sceneNumber ? { ...s, isGeneratingImage: false, imageError: e.message || 'Failed to revise image.' } : s
            );
        });
    }
  }, [generatedSequence]);


  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <div className="container mx-auto px-4 py-8">
        <Header />
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          <div className="lg:col-span-4">
            <SelectionPanel
              userInput={userInput}
              setUserInput={setUserInput}
              onGenerate={handleGenerate}
              onFeelingLucky={handleFeelingLucky}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-8">
            <ResultsDisplay
              sequence={generatedSequence}
              isLoading={isLoading}
              error={error}
              onReviseImage={handleReviseImage}
            />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;