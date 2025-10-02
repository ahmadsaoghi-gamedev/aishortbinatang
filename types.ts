export interface UserInput {
  scenario: string;
  duration: string;
  environment: string;
  timeOfDay: string;
  mood: string;
  aspectRatio: string;
  referenceVideo: File | null;
}

export interface CharacterDNA {
  [animalName: string]: string;
}

export interface SoundDesign {
  ambientSounds: string[];
  audioMix: string;
}

export interface VideoPrompt {
  sceneNumber: number;
  scenePrompt: string;
  characterDNA: CharacterDNA;
  storyContext: string;
  aspectRatio: string;
  sceneEndingSummary: string;
  captionDisplay: string;
  culturalContext: string;
  quality: string;
}

export interface GeneratedScene {
  sceneNumber: number;
  totalScenes: number;
  imagePrompt: string;
  videoPrompt: VideoPrompt;
  soundDesign: SoundDesign;
  cameraMood: {
    cameraWork: string;
    targetMood: string;
  };
  storyBeat: string;
  imageUrl?: string;
  isGeneratingImage?: boolean;
  imageError?: string;
}

export interface AnimalCategory {
    name: string;
    animals: string[];
}