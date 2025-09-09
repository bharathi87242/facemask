
import { GoogleGenAI, Type } from "@google/genai";
import { FaceDetection, DetectionStatus } from "../types";

// Ensure the API key is available, but do not handle its input.
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

const prompt = `Analyze the provided image to detect all human faces.
For each face found, determine if a protective face mask is being worn correctly.
Return the results as a JSON array. Each object in the array should represent one detected face and strictly follow this structure:
- "box": An object with "x", "y", "width", and "height" for the bounding box. These values must be normalized percentages (0.0 to 1.0) of the image dimensions, with the origin at the top-left corner.
- "status": A string, which must be either "Mask" or "No Mask".
- "confidence": A number between 0.0 and 1.0 representing the confidence of the mask status detection.
If no faces are detected, return an empty array.`;

const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        box: {
          type: Type.OBJECT,
          properties: {
            x: { type: Type.NUMBER },
            y: { type: Type.NUMBER },
            width: { type: Type.NUMBER },
            height: { type: Type.NUMBER },
          },
          required: ["x", "y", "width", "height"],
        },
        status: { 
            type: Type.STRING,
            enum: [DetectionStatus.Mask, DetectionStatus.NoMask]
        },
        confidence: { type: Type.NUMBER },
      },
      required: ["box", "status", "confidence"],
    },
};


export const detectMasksInImage = async (base64Image: string): Promise<FaceDetection[]> => {
  const base64Data = base64Image.split(',')[1];

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data,
            },
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        return [];
    }
    
    // The response is already validated by the schema to be a JSON array.
    const detectedFaces: FaceDetection[] = JSON.parse(jsonText);
    return detectedFaces;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Gracefully handle API errors by returning an empty array
    return [];
  }
};
