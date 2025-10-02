
import type { AnimalCategory } from './types';

export const durationOptions: { [key: string]: { scenes: number; description: string; structure: string[] } } = {
  "14_seconds": {
    scenes: 2,
    description: "2 scenes × 7 seconds each",
    structure: ["Setup/Approach", "Action/Climax"]
  },
  "21_seconds": {
    scenes: 3,
    description: "3 scenes × 7 seconds each", 
    structure: ["Setup/Tension", "Confrontation/Action", "Resolution/Outcome"]
  }
};

export const aspectRatioOptions: { [key: string]: string } = {
  '16:9': '16:9 (Widescreen)',
  '9:16': '9:16 (Vertical)',
  '1:1': '1:1 (Square)',
  '4:3': '4:3 (Standard)',
  '3:4': '3:4 (Portrait)',
};

export const animalCategories: { predators: AnimalCategory[], prey: AnimalCategory[] } = {
  predators: [
    { name: 'Big Cats', animals: ['Lion', 'Tiger', 'Cheetah', 'Leopard', 'Jaguar'] },
    { name: 'Birds of Prey', animals: ['Eagle', 'Hawk', 'Owl', 'Falcon', 'Vulture'] },
    { name: 'Reptiles', animals: ['Snake (Cobra)', 'Snake (Python)', 'Crocodile', 'Komodo Dragon'] },
    { name: 'Marine', animals: ['Shark', 'Octopus', 'Barracuda'] },
    { name: 'Mammals', animals: ['Wolf', 'Bear', 'Hyena'] }
  ],
  prey: [
    { name: 'Small Mammals', animals: ['Rabbit', 'Mouse', 'Squirrel', 'Meerkat'] },
    { name: 'Ungulates', animals: ['Gazelle', 'Deer', 'Zebra', 'Antelope'] },
    { name: 'Birds', animals: ['Peacock', 'Duck', 'Pigeon', 'Sparrow', 'Flamingo'] },
    { name: 'Aquatic', animals: ['Fish', 'Turtle', 'Frog', 'Seal'] },
    { name: 'Young/Vulnerable', animals: ['Baby Elephant', 'Eggs', 'Chicks', 'Fawn'] }
  ]
};

export const environments = [
    'African Savanna',
    'Amazon Rainforest',
    'Arctic Tundra',
    'Coral Reef',
    'Mountain Range',
    'Dense Forest',
    'Scorching Desert',
    'Misty Swamp'
];

export const timesOfDay = [
    'Golden Hour',
    'Misty Morning',
    'Harsh Midday Sun',
    'Dramatic Sunset',
    'Moonlit Night',
    'Stormy Afternoon'
];

export const moods = [
    'Tense',
    'Suspenseful',
    'Dramatic',
    'Majestic',
    'Chaotic',
    'Peaceful',
    'Intense',
    'Somber'
];

export const cameraMovements: { [key: string]: string[] } = {
  scene1: ["Slow push in on the predator", "Establishing wide shot of the environment", "Low angle approach, hiding in the grass"],
  scene2: ["Dynamic tracking shot following the chase", "Handheld shaky-cam for intensity", "Rapid zoom onto the moment of impact", "Orbit shot around the confrontation"],
  scene3: ["Pull back reveal of the outcome", "Slow motion closeup of the resolution", "Dramatic tilt up to the sky", "Final zoom out showing the aftermath"]
};

export const soundCategories: { [key: string]: string[] } = {
  ambientSounds: ["Forest ambience", "Savanna winds", "Ocean waves", "Morning birds chirping", "Rustling leaves", "Distant thunder"],
  animalSounds: ["Heavy breathing", "Wing flaps", "Paw steps on dry leaves", "A low growl", "Warning calls", "Heartbeat"],
  actionSounds: ["A sudden splash", "Thud of impact", "A powerful whoosh", "Crack of a twig", "Frantic rustling"],
  emotionalSounds: ["Eerie silence", "Building tension with low hum", "Sudden silence after chaos", "A triumphant roar", "A final, resigned sigh"]
};