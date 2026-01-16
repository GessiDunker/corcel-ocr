import { GoogleGenAI } from "@google/genai";

/**
 * Performs OCR on a base64 encoded image string.
 * Uses the 'gemini-flash-lite-latest' model.
 */
export const performOCR = async (base64Image: string, mimeType: string = 'image/jpeg'): Promise<string> => {
  // Access process.env inside the function to avoid init issues
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error("API_KEY not found in process.env");
    throw new Error("Chave de API não encontrada. Verifique a configuração do ambiente (API_KEY).");
  }

  // Initialize the client with the key
  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    // Clean the base64 string if it contains the data URL prefix
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64
            }
          },
          {
            text: "Você é um especialista em OCR (Reconhecimento Óptico de Caracteres) acadêmico. Transcreva EXATAMENTE todo o texto visível nesta imagem. Mantenha a formatação de parágrafos. Se houver tabelas, tente representá-las com espaçamento ou markdown. Não adicione comentários, introduções ou conclusões, forneça apenas o texto extraído."
          }
        ]
      }
    });

    return response.text || "Nenhum texto pôde ser extraído.";
  } catch (error: any) {
    console.error("Erro ao chamar Gemini API:", error);
    
    // Provide a more helpful error message for 401
    if (error.toString().includes("401") || error.message?.includes("401")) {
      throw new Error("Erro de autenticação (401). A chave de API pode estar inválida ou não suportada para este modelo.");
    }
    
    throw new Error("Falha no processamento da imagem. Tente novamente.");
  }
};