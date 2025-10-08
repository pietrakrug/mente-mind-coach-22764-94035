import { CheckIn } from '@/types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export const geminiService = {
  async generateInsight(checkIns: CheckIn[]): Promise<string> {
    if (!GEMINI_API_KEY) {
      return 'Configure sua API key do Gemini para receber insights personalizados.';
    }

    const recentCheckIns = checkIns.slice(0, 7);
    const summary = recentCheckIns.map(c => ({
      date: new Date(c.date).toLocaleDateString('pt-BR'),
      status: c.status,
      challenges: c.challenges,
      motivations: c.motivations,
      mood: c.energy.mood,
    }));

    const prompt = `Você é um coach de PNL experiente chamado Mente Viva. Analise os últimos check-ins de hábito do usuário e forneça um insight curto, empático e acionável.

Dados dos check-ins:
${JSON.stringify(summary, null, 2)}

Identifique O PADRÃO MAIS SIGNIFICATIVO e forneça uma mensagem de 2-3 frases que:
1. Reconheça o padrão de forma específica
2. Seja empática e encorajadora
3. Ofereça uma sugestão prática

Responda apenas com o texto do insight, sem formatação JSON.`;

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate insight');
      }

      const data: GeminiResponse = await response.json();
      const insight = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return insight || 'Continue assim! Cada dia é uma nova oportunidade de crescimento.';
    } catch (error) {
      console.error('Gemini API error:', error);
      return 'Continue se dedicando! Analise seus padrões e ajuste sua estratégia.';
    }
  },

  async generateDailyQuote(): Promise<string> {
    if (!GEMINI_API_KEY) {
      return 'Seu cérebro ama consistência. Cada repetição fortalece suas conexões neurais. Continue!';
    }

    const prompt = `Gere uma frase motivacional única sobre hábitos e neurociência para o dia de hoje.

Requisitos:
- Inclua um conceito simplificado de neurociência ou psicologia
- Adicione um toque de humor ou perspectiva inesperada
- Mantenha entre 2-3 frases
- Seja acionável e inspirador
- Use linguagem conversacional

Exemplo de estilo: "Seu sistema de recompensa cerebral não se importa com seus planos de 'algum dia'. Ele quer vitórias pequenas hoje. Então, pare de planejar a rotina perfeita e faça uma coisa pequena agora mesmo."

Gere uma nova frase neste estilo:`;

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quote');
      }

      const data: GeminiResponse = await response.json();
      const quote = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return quote || 'Neuroplasticidade é apenas uma palavra fancy para "seu cérebro é péssimo em dizer não pra você". Quer mudar? Comece mentindo pra ele com ações pequenas e consistentes até a mentira virar verdade.';
    } catch (error) {
      console.error('Gemini API error:', error);
      return 'Cada dia é uma nova sinapse sendo formada. Continue construindo sua rede neural do sucesso!';
    }
  },
};
