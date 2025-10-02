import { GoogleGenAI, Type } from "@google/genai";
import type { UserInput, GeneratedScene } from '../types';
import { durationOptions } from '../constants';

if (!process.env.API_KEY) {
    throw new Error("The API_KEY environment variable is not set. Please ensure it is configured.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      mimeType: file.type,
      data: base64EncodedData,
    },
  };
};


// This schema is what we expect the AI to return for EACH scene.
const generateSceneSchema = {
    type: Type.OBJECT,
    properties: {
        sceneNumber: { type: Type.INTEGER, description: "The sequence number of this scene." },
        totalScenes: { type: Type.INTEGER, description: "The total number of scenes in the sequence." },
        storyBeat: { type: Type.STRING, description: "A short, cinematic title for this scene's moment in the story (e.g., 'The Stalk', 'The Chase', 'The Conclusion')." },
        imagePrompt: { type: Type.STRING, description: "A highly detailed, vivid, and cinematic prompt for Imagen to generate a keyframe still image. Describe the complete scene, characters, specific actions, environment, and lighting. Use phrases like 'photorealistic, 8k, professional color grading, dramatic lighting'." },
        videoPrompt: {
            type: Type.OBJECT,
            properties: {
                sceneNumber: { type: Type.INTEGER, description: "The sequence number of this scene, matching the parent object." },
                scenePrompt: { type: Type.STRING, description: "A detailed prompt for VEO describing the action in this 7-second clip. Focus on movement, character interaction, and camera motion. This should describe a sequence of events." },
                characterDNA: {
                    type: Type.STRING,
                    description: "A JSON string representing an object where keys are animal names (e.g., 'Cheetah') and values are comma-separated visual descriptors. Example: '{\"Cheetah\": \"lithe, with a distinctive scar over its right eye, unusually dark spots\"}'. This MUST be consistent across all scenes."
                },
                storyContext: { type: Type.STRING, description: "A brief summary of what has happened in the story up to this point, providing context for this scene." },
                aspectRatio: { type: Type.STRING, description: "The aspect ratio for the video clip, which must be the user-provided value." },
                sceneEndingSummary: { type: Type.STRING, description: "A one-sentence summary of how this scene ends, to ensure a smooth transition to the next scene." },
                captionDisplay: { type: Type.STRING, description: "Instructions for caption display, e.g., 'No captions, clean video output without text overlay'." },
                culturalContext: { type: Type.STRING, description: "Cultural context for the scene, if specified by the user. E.g., 'Focus on the natural beauty and wildlife of Indonesia'." },
                quality: { type: Type.STRING, description: "Desired output quality, e.g., 'Ultra Sharp 4K Quality'." }
            },
            required: ['sceneNumber', 'scenePrompt', 'characterDNA', 'storyContext', 'aspectRatio', 'sceneEndingSummary', 'captionDisplay', 'culturalContext', 'quality']
        },
        soundDesign: {
            type: Type.OBJECT,
            properties: {
                ambientSounds: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of key ambient sounds with descriptive percentages, e.g., 'Rainforest ambiance (45%)'." },
                audioMix: { type: Type.STRING, description: "A detailed description of the audio mix strategy for this scene." }
            },
            required: ['ambientSounds', 'audioMix']
        },
        cameraMood: {
            type: Type.OBJECT,
            properties: {
                cameraWork: { type: Type.STRING, description: "A specific camera movement suggestion for this scene (e.g., 'Slow push in on the predator', 'Dynamic tracking shot following the chase', 'Handheld shaky-cam for intensity')." },
                targetMood: { type: Type.STRING, description: "The primary mood or emotion of this scene (e.g., 'Tense', 'Chaotic', 'Somber'), which must align with the overall user-specified mood." }
            },
            required: ['cameraWork', 'targetMood']
        }
    },
    required: ['sceneNumber', 'totalScenes', 'storyBeat', 'imagePrompt', 'videoPrompt', 'soundDesign', 'cameraMood']
};

// The overall response should be an array of the scene objects defined above.
const responseSchema = {
    type: Type.ARRAY,
    items: generateSceneSchema
};


/**
 * Generates a multi-scene video prompt sequence using the Gemini API.
 * @param userInput The user's selections for the video scenario.
 * @returns A promise that resolves to an array of GeneratedScene objects.
 */
export const generateSequence = async (userInput: UserInput): Promise<GeneratedScene[]> => {
    const { scenario, duration, environment, timeOfDay, mood, aspectRatio, referenceVideo } = userInput;
    const durationInfo = durationOptions[duration];
    if (!durationInfo) {
        throw new Error("Invalid duration selected.");
    }
    const { scenes: sceneCount, structure } = durationInfo;

    const systemInstruction = `You are a world-class film director and scriptwriter specializing in cinematic wildlife documentaries. Your task is to break down a user's scenario into a series of detailed, professional-grade prompts for AI image and video generation tools (Imagen and VEO).

You MUST adhere to the following rules:
1.  **Strict JSON Output**: Your entire output must be a single, valid JSON array of scene objects, matching the provided schema perfectly. Do not include any text, explanations, or markdown formatting before or after the JSON.
2.  **Continuity is KEY**: Create a 'characterDNA' for each primary animal. This is a set of 3-5 distinct, consistent visual descriptors that MUST be referenced in EVERY prompt (image and video) where that character appears. This ensures the AI generates the same-looking animal across different scenes. You must format this as a JSON string within the 'videoPrompt' object.
3.  **Core Conflict Representation**: The main characters involved in the scenario's central conflict MUST be visually represented in every scene's \`imagePrompt\`. For a scenario like 'Lizards attack peacock eggs', the protective peacock, the threatening lizard(s), and the nest of eggs must all be framed together in the composition for each keyframe image prompt. This is crucial to visually establish the complete narrative and tension from the very beginning, even in a 'setup' scene.
4.  **Separate Prompts for Image & Video**:
    *   **imagePrompt (for Imagen)**: This is for a still keyframe. It should be highly descriptive, focusing on composition, lighting, detail, and the emotional peak of the scene. Think of it as a movie poster.
    *   **videoPrompt.scenePrompt (for VEO)**: This is for a 7-second video clip. It must focus on ACTION and MOVEMENT. Describe what happens from the beginning to the end of the 7 seconds.
5.  **Scene Structure**: Follow the provided story structure (${structure.join(', ')}). Each scene should logically follow the last.
6.  **Detailed Sound & Video Specs**:
    *   **soundDesign**: Must be a JSON object with 'ambientSounds' (an array of descriptive sounds with percentages, e.g., "Rainforest ambiance (45%)") and 'audioMix' (a description of the mixing strategy).
    *   **videoPrompt**: Must include 'captionDisplay' (e.g., "No captions, clean video output"), 'culturalContext' (e.g., "Focus on the natural beauty of Indonesia"), and 'quality' (e.g., "Ultra Sharp 4K Quality") fields with specific, professional instructions.
7.  **VideoPrompt Object**: The 'videoPrompt' must be a complete JSON object. The 'aspectRatio' field MUST be set to "${aspectRatio}". 'sceneEndingSummary' is crucial for linking scenes.
8.  **Total Scenes**: The 'totalScenes' field in each object must correctly be ${sceneCount}.`;

    const userPrompt = `Generate a cinematic sequence based on the following specifications.
- **Scenario**: ${scenario}
- **Total Duration**: ${duration} (${durationInfo.description})
- **Number of Scenes**: ${sceneCount}
- **Environment**: ${environment}
- **Time of Day**: ${timeOfDay}
- **Overall Mood**: ${mood}
- **Aspect Ratio**: ${aspectRatio}
- **Scene Structure to Follow**: ${structure.join(' -> ')}

${referenceVideo ? "A reference video has been provided. Analyze its content, style, and pacing to influence the generated prompts. " : ""}Remember to maintain strict continuity for all animals using a detailed 'characterDNA' formatted as a JSON string. Crucially, ensure all key characters are present in each scene's image prompt to capture the full conflict. Output ONLY the JSON array.`;

    try {
        // FIX: Conditionally construct promptParts array to ensure correct type inference for mixed content (text and video).
        const basePrompt = [{ text: userPrompt }];
        const promptParts = referenceVideo
            ? [...basePrompt, await fileToGenerativePart(referenceVideo)]
            : basePrompt;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: promptParts },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.8, 
            },
        });
        
        const responseText = response.text.trim();
        // The AI returns the raw JSON as a string.
        const rawScenes = JSON.parse(responseText);

        // Post-process the scenes to parse the inner characterDNA JSON string
        const generatedScenes: GeneratedScene[] = rawScenes.map((scene: any) => ({
            ...scene,
            videoPrompt: {
                ...scene.videoPrompt,
                // The AI returns characterDNA as a string, so we parse it into an object here.
                characterDNA: JSON.parse(scene.videoPrompt.characterDNA)
            }
        }));

        if (!Array.isArray(generatedScenes) || generatedScenes.length !== sceneCount) {
            throw new Error(`AI returned an invalid number of scenes. Expected ${sceneCount}, got ${generatedScenes.length}`);
        }
        
        // Basic validation of the returned structure
        generatedScenes.forEach(scene => {
            if (!scene.imagePrompt || !scene.videoPrompt || !scene.videoPrompt.scenePrompt) {
                throw new Error("AI response is missing critical prompt fields.");
            }
        });

        return generatedScenes;

    } catch (error) {
        console.error("Error generating sequence with Gemini:", error);
        if (error instanceof Error) {
            if (error.message.includes("JSON")) {
                 throw new Error("Failed to parse the AI's response. The service may be busy. Please try again.");
            }
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the sequence.");
    }
};