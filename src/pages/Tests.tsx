import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Target, Shield, ArrowRight } from 'lucide-react';

const TESTS = [
  {
    id: 'executive',
    title: 'Avaliação de Controle Executivo',
    description: 'Avalie sua autodisciplina, foco e capacidade de adiar gratificação',
    icon: Brain,
    color: 'bg-primary',
    duration: '~5 minutos',
    questions: 15,
  },
  {
    id: 'reward',
    title: 'Perfil de Sensibilidade à Recompensa',
    description: 'Descubra o que realmente te motiva - recompensas internas ou externas',
    icon: Target,
    color: 'bg-accent',
    duration: '~5 minutos',
    questions: 15,
  },
  {
    id: 'sabotage',
    title: 'Inventário de Padrões de Autossabotagem',
    description: 'Identifique padrões inconscientes que podem estar te segurando',
    icon: Shield,
    color: 'bg-warning',
    duration: '~7 minutos',
    questions: 20,
  },
];

const Tests = () => {
  return (
    <div className="max-w-5xl space-y-6 animate-fade-in pb-20 md:pb-6">
      <div>
        <h1 className="text-3xl font-bold">Testes Comportamentais</h1>
        <p className="text-muted-foreground mt-1">
          Descubra seu perfil psicológico e entenda melhor como você funciona
        </p>
      </div>

      <Card className="bg-gradient-primary">
        <CardHeader>
          <CardTitle className="text-primary-foreground">Por que fazer os testes?</CardTitle>
        </CardHeader>
        <CardContent className="text-primary-foreground/90 space-y-4">
          <p>
            A neurociência comportamental demonstra que a mudança sustentável de hábitos não ocorre através 
            de força de vontade, mas sim pelo entendimento profundo dos mecanismos cerebrais que governam 
            nosso comportamento. Estes testes são instrumentos validados que mapeiam três sistemas neurais 
            fundamentais:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>Função Executiva (Córtex Pré-Frontal):</strong> Avalia sua capacidade de controle 
              inibitório, flexibilidade cognitiva e memória de trabalho - essenciais para sobrepor impulsos 
              automáticos
            </li>
            <li>
              <strong>Sistema de Recompensa (Dopaminérgico):</strong> Identifica seu perfil motivacional 
              dominante e como seu cérebro processa incentivos, permitindo design de estratégias alinhadas 
              ao seu sistema de recompensa natural
            </li>
            <li>
              <strong>Padrões de Autossabotagem (Viés Cognitivo):</strong> Detecta loops comportamentais 
              inconscientes arraigados em circuitos neurais habituais, revelando pontos cegos que impedem 
              o progresso
            </li>
          </ul>
          <p className="pt-2">
            Ao compreender seu perfil neuropsicológico único, você substitui tentativa-e-erro por 
            intervenções baseadas em evidências, maximizando a probabilidade de sucesso na formação 
            de novos hábitos através da neuroplasticidade direcionada.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TESTS.map((test) => {
          const IconComponent = test.icon;
          return (
            <Card key={test.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${test.color} flex items-center justify-center mb-4`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{test.title}</CardTitle>
                <CardDescription className="min-h-[3rem]">{test.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>⏱️ Duração: {test.duration}</p>
                  <p>📝 {test.questions} perguntas</p>
                </div>
                <Link to={`/tests/${test.id}`} className="w-full">
                  <Button className="w-full gap-2">
                    Iniciar Teste
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Como Funcionam os Testes?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <div>
            <h3 className="font-semibold text-foreground mb-2">📊 Sistema de Pontuação</h3>
            <p className="text-sm">
              Cada teste usa uma escala Likert de 5 pontos (Discordo Totalmente até Concordo Totalmente).
              Suas respostas são analisadas para gerar um perfil detalhado.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">🎭 Arquétipos</h3>
            <p className="text-sm">
              Ao final de cada teste, você receberá um arquétipo que representa seu perfil dominante,
              com explicações detalhadas e estratégias personalizadas.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">🔄 Reteste</h3>
            <p className="text-sm">
              Recomendamos refazer os testes a cada 3 meses para acompanhar sua evolução e ajustar
              suas estratégias conforme você desenvolve novos padrões.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Tests;
