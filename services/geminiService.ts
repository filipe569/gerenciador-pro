
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ClientStatus } from '../types';

if (!process.env.API_KEY) {
  // In a real app, this would be a more robust check or handled during build.
  // For this environment, we assume it's set.
  console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateRenewalReminder = async (clientName: string, dueDate: string): Promise<string> => {
  if (!process.env.API_KEY) return "Serviço de IA indisponível. Chave de API não configurada.";

  const prompt = `Gere uma mensagem curta, amigável e profissional em português para lembrar um cliente sobre o vencimento de sua assinatura.
    Cliente: ${clientName}
    Data de Vencimento: ${dueDate}
    
    A mensagem deve ser concisa e clara. Inclua o nome do cliente e a data. Não adicione saudações como "Prezado" ou "Olá". Comece diretamente com o lembrete. Termine pedindo para entrar em contato para renovar.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating renewal reminder:", error);
    return "Não foi possível gerar a mensagem de renovação no momento.";
  }
};

export const generateDashboardSummary = async (stats: { total: number; active: number; expired: number; expiringSoon: number }): Promise<string> => {
    if (!process.env.API_KEY) return "Serviço de IA indisponível. Chave de API não configurada.";

    const prompt = `Aja como um analista de negócios. Analise os seguintes dados de uma carteira de clientes e gere um resumo conciso (2-3 frases) em português. Destaque o ponto mais importante (positivo ou negativo).
    - Total de Clientes: ${stats.total}
    - Clientes Ativos: ${stats.active}
    - Clientes Vencidos: ${stats.expired}
    - Clientes com Vencimento Próximo (próximos 7 dias): ${stats.expiringSoon}

    Exemplo de saída: "Com ${stats.total} clientes, a saúde da carteira é boa, mas atenção aos ${stats.expiringSoon} clientes prestes a vencer para evitar um aumento na taxa de churn."
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating dashboard summary:", error);
        return "Não foi possível gerar o resumo do painel no momento.";
    }
};

export const generateStrongPassword = async (): Promise<string> => {
    if (!process.env.API_KEY) return "IA-indisponivel";

    const prompt = `Gere uma senha forte e segura com 12 caracteres. Deve incluir letras maiúsculas, minúsculas, números e símbolos. Responda apenas com a senha, sem qualquer texto adicional.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: prompt,
            config: { thinkingConfig: { thinkingBudget: 0 } }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating password:", error);
        return "erro-ao-gerar";
    }
};
