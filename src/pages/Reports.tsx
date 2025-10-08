import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { habitApi, checkInApi } from '@/services/api';
import { CheckIn } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Reports = () => {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const activeHabit = await habitApi.getActiveHabit(user.id);
      if (activeHabit) {
        const habitCheckIns = await checkInApi.getCheckIns(activeHabit.id);
        setCheckIns(habitCheckIns);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Balanço de Execução
  const getExecutionBalance = () => {
    if (checkIns.length === 0) return [];
    
    const completed = checkIns.filter(c => c.status === 'completed').length;
    const partial = checkIns.filter(c => c.status === 'partial').length;
    const missed = checkIns.filter(c => c.status === 'missed').length;

    return [
      { name: 'Completo', value: completed, color: 'hsl(var(--success))' },
      { name: 'Parcial', value: partial, color: 'hsl(var(--warning))' },
      { name: 'Não Cumprido', value: missed, color: 'hsl(var(--destructive))' },
    ].filter(item => item.value > 0);
  };

  // Momentos de Dificuldade
  const getTimeOfDayData = () => {
    const morning = checkIns.filter(c => c.timeOfDay === 'morning' && c.status === 'missed').length;
    const afternoon = checkIns.filter(c => c.timeOfDay === 'afternoon' && c.status === 'missed').length;
    const evening = checkIns.filter(c => c.timeOfDay === 'evening' && c.status === 'missed').length;

    return [
      { name: 'Manhã', value: morning },
      { name: 'Tarde', value: afternoon },
      { name: 'Noite', value: evening },
    ];
  };

  // Tipos de Sabotagem
  const getSabotageData = () => {
    const sabotageCount: Record<string, number> = {};
    
    checkIns.forEach(checkIn => {
      checkIn.sabotagePatterns?.forEach(pattern => {
        sabotageCount[pattern] = (sabotageCount[pattern] || 0) + 1;
      });
    });

    return Object.entries(sabotageCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  // Fonte de Motivação
  const getMotivationData = () => {
    const motivationCount: Record<string, number> = {};
    
    checkIns.forEach(checkIn => {
      checkIn.motivations.forEach(motivation => {
        motivationCount[motivation] = (motivationCount[motivation] || 0) + 1;
      });
    });

    return Object.entries(motivationCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Tipos de Desafios
  const getChallengesData = () => {
    const challengeCount: Record<string, number> = {};
    
    checkIns.forEach(checkIn => {
      checkIn.challenges.forEach(challenge => {
        challengeCount[challenge] = (challengeCount[challenge] || 0) + 1;
      });
    });

    return Object.entries(challengeCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (checkIns.length === 0) {
    return (
      <div className="max-w-6xl animate-fade-in pb-20 md:pb-6">
        <h1 className="text-3xl font-bold mb-6">Relatórios</h1>
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">
              Complete alguns check-ins para visualizar seus relatórios e análises detalhadas.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const executionData = getExecutionBalance();
  const timeData = getTimeOfDayData();
  const sabotageData = getSabotageData();
  const motivationData = getMotivationData();
  const challengesData = getChallengesData();

  const successRate = checkIns.length > 0 
    ? Math.round((checkIns.filter(c => c.status === 'completed' || c.status === 'partial').length / checkIns.length) * 100)
    : 0;

  return (
    <div className="max-w-6xl space-y-6 animate-fade-in pb-20 md:pb-6">
      <div>
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground mt-1">Análise detalhada dos seus padrões e progresso</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
              <p className="text-4xl font-bold mt-2 text-primary">{successRate}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total de Check-ins</p>
              <p className="text-4xl font-bold mt-2">{checkIns.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Check-ins Completos</p>
              <p className="text-4xl font-bold mt-2 text-success">
                {checkIns.filter(c => c.status === 'completed').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balanço de Execução */}
        <Card>
          <CardHeader>
            <CardTitle>Balanço de Execução</CardTitle>
            <CardDescription>Distribuição do cumprimento do hábito</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={executionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {executionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Momentos de Dificuldade */}
        {timeData.some(d => d.value > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Momentos de Dificuldade</CardTitle>
              <CardDescription>Quando você mais enfrenta desafios</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--destructive))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Tipos de Sabotagem */}
        {sabotageData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Padrões de Autossabotagem</CardTitle>
              <CardDescription>Seus principais bloqueios identificados</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sabotageData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--warning))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Fonte de Motivação */}
        <Card>
          <CardHeader>
            <CardTitle>Fontes de Motivação</CardTitle>
            <CardDescription>O que mais te impulsiona</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={motivationData}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Desafios Mais Comuns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Desafios Mais Comuns</CardTitle>
            <CardDescription>Os obstáculos que você enfrenta com mais frequência</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={challengesData}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="bg-gradient-primary">
        <CardHeader>
          <CardTitle className="text-primary-foreground">Insights dos Dados</CardTitle>
        </CardHeader>
        <CardContent className="text-primary-foreground/90 space-y-2">
          {challengesData.length > 0 && (
            <p>• Seu principal desafio é: <strong>{challengesData[0].name}</strong></p>
          )}
          {motivationData.length > 0 && (
            <p>• Você é mais motivado por: <strong>{motivationData[0].name}</strong></p>
          )}
          {successRate >= 80 && (
            <p>• Parabéns! Você está com uma taxa de sucesso excelente de {successRate}%!</p>
          )}
          {successRate < 50 && (
            <p>• Considere revisar sua estratégia. Talvez o hábito precise de ajustes para se encaixar melhor na sua rotina.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
