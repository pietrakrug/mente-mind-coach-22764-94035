import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, Lightbulb, Moon, Target, Brain, Zap, Clock } from 'lucide-react';

const TIPS_CATEGORIES = [
  {
    id: 'habit-formation',
    name: 'Formação de Hábitos',
    icon: Target,
    color: 'bg-primary',
    tips: [
      {
        title: 'A Regra dos 2 Minutos',
        content: 'Torne seus hábitos tão pequenos que seja impossível dizer não. Quer meditar? Comece com 2 minutos. Quer ler mais? Uma página por dia. O segredo não é a grandiosidade, é a consistência.',
        science: 'Estudos mostram que hábitos pequenos têm 80% mais chances de se consolidar porque diminuem a resistência inicial.',
        action: 'Identifique a menor versão do seu hábito. Se é exercício, faça 1 flexão. Se é escrever, uma frase.',
      },
      {
        title: 'Empilhamento de Hábitos',
        content: 'Anexe um novo hábito a algo que você já faz. "Depois de escovar os dentes, vou fazer 10 respirações profundas." Use sua rotina existente como gatilho.',
        science: 'Seu cérebro já tem caminhos neurais para os hábitos atuais. Conectar novos hábitos a eles facilita a formação de novas conexões.',
        action: 'Complete: "Depois de [HÁBITO ATUAL], eu vou [NOVO HÁBITO]."',
      },
      {
        title: 'Design de Ambiente',
        content: 'Seu ambiente é mais forte que sua força de vontade. Quer ler mais? Deixe o livro no travesseiro. Quer comer melhor? Coloque frutas à vista.',
        science: 'Pesquisas mostram que mudanças ambientais são 3x mais eficazes que confiar apenas em motivação.',
        action: 'Torne o hábito óbvio: deixe pistas visuais no seu caminho.',
      },
      {
        title: 'O Platô do Potencial Latente',
        content: 'Você não verá resultados imediatos. Um cubo de gelo não derrete a -1°C, -0,5°C... mas a 0°C, tudo muda. Seus esforços estão se acumulando, mesmo quando parecem invisíveis.',
        science: 'Hábitos funcionam por acumulação. Os primeiros 21 dias são os mais difíceis porque os resultados são imperceptíveis.',
        action: 'Confie no processo. Continue mesmo sem ver resultados. Eles vêm.',
      },
    ],
  },
  {
    id: 'sleep',
    name: 'Sono & Recuperação',
    icon: Moon,
    color: 'bg-accent',
    tips: [
      {
        title: 'O Ciclo de 90 Minutos',
        content: 'Seu sono funciona em ciclos de aproximadamente 90 minutos. Acorde no final de um ciclo, não no meio. Durma 7,5h (5 ciclos) em vez de 8h.',
        science: 'Acordar no meio de um ciclo REM causa aquela sensação de "ressaca de sono", mesmo tendo dormido bastante.',
        action: 'Calcule: se precisa acordar às 6h, vá dormir às 22h30 ou 00h00.',
      },
      {
        title: 'Luz Solar pela Manhã',
        content: 'Nos primeiros 30 minutos após acordar, exponha-se à luz natural. Isso sincroniza seu relógio biológico e melhora o sono noturno.',
        science: 'A luz solar suprime a melatonina e ativa o cortisol, preparando você para o dia e garantindo sono melhor à noite.',
        action: 'Tome café perto de uma janela ou dê uma caminhada matinal.',
      },
      {
        title: 'Ritual de Desligamento',
        content: 'Crie uma sequência de 30-60 minutos antes de dormir. Sempre a mesma ordem: banho, leitura, alongamento. Seu cérebro vai aprender que é hora de desacelerar.',
        science: 'Rituais previsíveis ativam o sistema nervoso parassimpático, reduzindo cortisol e preparando o corpo para o sono.',
        action: 'Defina 3 atividades relaxantes e faça nessa ordem toda noite.',
      },
      {
        title: 'Timing da Cafeína',
        content: 'Cafeína tem meia-vida de 5-6 horas. Se você toma café às 16h, metade ainda está no seu sistema às 22h. Corte após as 14h.',
        science: 'A adenosina (químico do sono) é bloqueada pela cafeína. Mesmo que você "durma", a qualidade é inferior.',
        action: 'Limite: última dose de cafeína 8-10 horas antes de dormir.',
      },
    ],
  },
  {
    id: 'focus',
    name: 'Foco & Produtividade',
    icon: Brain,
    color: 'bg-success',
    tips: [
      {
        title: 'Técnica Pomodoro Adaptada',
        content: 'Trabalhe em blocos de foco: 25 min de trabalho profundo, 5 min de pausa. Após 4 blocos, pausa de 15-30 min. Mas ajuste ao seu ritmo: alguns precisam de 50 min.',
        science: 'Seu córtex pré-frontal (centro do foco) consome muita energia. Pausas regulares restauram a glicose cerebral.',
        action: 'Teste diferentes durações. Encontre seu "sweet spot" de concentração.',
      },
      {
        title: 'Monotarefa Radical',
        content: 'Multitarefa não existe. É troca rápida de atenção, e cada troca custa até 23 minutos para voltar ao foco total. Uma coisa de cada vez.',
        science: 'Estudos mostram que "multitarefas" têm 40% menos produtividade e cometem mais erros.',
        action: 'Feche abas desnecessárias. Um projeto, uma tela, uma ação.',
      },
      {
        title: 'O Poder do Tédio',
        content: 'Seu cérebro precisa de momentos sem estímulos. Nada de podcast durante a caminhada, nada de celular na fila. O tédio ativa o modo de rede padrão, essencial para criatividade.',
        science: 'A rede de modo padrão (DMN) processa informações em background e gera insights quando você "não está fazendo nada".',
        action: 'Permita 10-15 min de tédio puro por dia. Sem telas, sem áudio.',
      },
      {
        title: 'Gestão de Energia, Não de Tempo',
        content: 'Você tem ~4 horas de foco profundo por dia. Use-as nas tarefas mais importantes, de preferência quando sua energia está no pico (geralmente manhã).',
        science: 'Força de vontade e foco são recursos finitos que se esgotam ao longo do dia (ego depletion).',
        action: 'Identifique suas "horas de ouro" e proteja-as ferozmente.',
      },
    ],
  },
  {
    id: 'motivation',
    name: 'Motivação & Mentalidade',
    icon: Zap,
    color: 'bg-warning',
    tips: [
      {
        title: 'Motivação Intrínseca vs. Extrínseca',
        content: 'Recompensas externas (dinheiro, elogios) funcionam no curto prazo. Mas hábitos duradouros vêm de motivação intrínseca: prazer, propósito, crescimento pessoal.',
        science: 'O efeito de superjustificação mostra que recompensas externas podem reduzir a motivação intrínseca ao longo do tempo.',
        action: 'Pergunte: "Por que isso importa PRA MIM?" A resposta profunda é seu combustível.',
      },
      {
        title: 'O Princípio do Progresso',
        content: 'Nada motiva mais que ver progresso, mesmo que pequeno. Registre vitórias diárias, por menores que sejam.',
        science: 'Teresa Amabile descobriu que o progresso é o motivador número 1 no trabalho e na vida pessoal.',
        action: 'Todo dia, anote 1 pequena vitória relacionada ao seu hábito.',
      },
      {
        title: 'Bundling de Tentações',
        content: 'Combine algo que você PRECISA fazer com algo que ADORA. "Só vou ouvir esse podcast durante a corrida."',
        science: 'Associar prazer a tarefas difíceis recondiciona seu cérebro a esperar recompensas.',
        action: 'Liste um prazer culposo e vincule-o ao seu hábito desafiador.',
      },
      {
        title: 'Reformule o Fracasso',
        content: 'Você não "falhou". Você coletou um dado. "Interessante, não funcionou fazer X à noite. E se tentar de manhã?"',
        science: 'Growth mindset (Carol Dweck): ver desafios como oportunidades de aprendizado aumenta persistência em 34%.',
        action: 'Após cada "falha", pergunte: "O que aprendi? O que vou testar diferente?"',
      },
    ],
  },
];

const Tips = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = TIPS_CATEGORIES.map(category => ({
    ...category,
    tips: category.tips.filter(tip =>
      tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tip.content.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(category => category.tips.length > 0);

  return (
    <div className="max-w-5xl space-y-6 animate-fade-in pb-20 md:pb-6">
      <div>
        <h1 className="text-3xl font-bold">Dicas & Estratégias</h1>
        <p className="text-muted-foreground mt-1">
          Conhecimento baseado em ciência para fortalecer seus hábitos
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar dicas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      {filteredCategories.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">Nenhuma dica encontrada. Tente outro termo.</p>
          </CardContent>
        </Card>
      ) : (
        filteredCategories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>{category.tips.length} dicas disponíveis</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.tips.map((tip, index) => (
                    <AccordionItem key={index} value={`tip-${index}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{tip.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <p className="text-foreground leading-relaxed">{tip.content}</p>
                          
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <div className="flex items-start gap-2">
                              <Brain className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-semibold text-accent mb-1">Base Científica</p>
                                <p className="text-sm text-muted-foreground">{tip.science}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                            <div className="flex items-start gap-2">
                              <Clock className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-semibold text-primary mb-1">Experimente Hoje</p>
                                <p className="text-sm text-foreground">{tip.action}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default Tips;
