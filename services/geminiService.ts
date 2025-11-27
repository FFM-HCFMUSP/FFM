import { GoogleGenAI, Type } from "@google/genai";
import { DocumentData } from "../types";

const DATA_EXTRACTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    fullName: { type: Type.STRING, description: "O nome completo da pessoa, se houver." },
    cpf: { type: Type.STRING, description: "O número do CPF, se houver." },
    documentNumber: { type: Type.STRING, description: "O número do documento de identidade (RG), se houver." },
    birthDate: { type: Type.STRING, description: "A data de nascimento, se houver." },
    issueDate: { type: Type.STRING, description: "A data de emissão do documento, se houver." },
    address: { type: Type.STRING, description: "O endereço completo, se for um comprovante de residência." },
    zipCode: { type: Type.STRING, description: "O CEP, se for um comprovante de residência." },
  },
};

export const extractDataFromDocument = async (
    base64ImageData: string,
    mimeType: string,
): Promise<DocumentData | null> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Analise a imagem deste documento e extraia as seguintes informações, se presentes: nome completo, CPF, número do documento de identidade (RG), data de nascimento, data de emissão, endereço e CEP. Responda no formato JSON definido. Se um campo não for encontrado, omita-o do JSON.`;

    const imagePart = {
        inlineData: {
            data: base64ImageData,
            mimeType,
        },
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }, imagePart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: DATA_EXTRACTION_SCHEMA,
            },
        });

        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);
        
        // Filter out null/empty values from the response
        const cleanedData: DocumentData = {};
        for (const key in parsedData) {
            if (Object.prototype.hasOwnProperty.call(parsedData, key) && parsedData[key]) {
                cleanedData[key] = parsedData[key];
            }
        }
        return Object.keys(cleanedData).length > 0 ? cleanedData : null;

    } catch (e) {
        console.error("Falha ao analisar a resposta JSON ou erro na API:", e);
        throw new Error("A resposta da IA não pôde ser processada. Verifique o console.");
    }
};
