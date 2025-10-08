import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { dailyQuoteApi } from '@/services/api-extended';
import { geminiService } from '@/services/geminiService';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Copy, Loader2, Gift, Lock } from 'lucide-react';

const DailyQuote = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [quote, setQuote] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasUsedToday, setHasUsedToday] = useState(false);

  useEffect(() => {
    loadQuote();
  }, [user]);

  const loadQuote = async () => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      const todayQuote = await dailyQuoteApi.getTodayQuote(user.id);
      
      if (todayQuote) {
        setQuote(todayQuote.content);
        setIsRevealed(true);
        setHasUsedToday(true);
      } else {
        setIsRevealed(false);
        setHasUsedToday(false);
      }
    } catch (error) {
      console.error('Failed to load quote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const revealQuote = async () => {
    if (!user || hasUsedToday) return;
    setIsGenerating(true);

    try {
      const newQuote = await geminiService.generateDailyQuote();
      await dailyQuoteApi.saveDailyQuote(user.id, newQuote);
      setQuote(newQuote);
      setIsRevealed(true);
      setHasUsedToday(true);
      
      toast({
        title: 'Frase revelada! 🎉',
        description: 'Volte amanhã para desbloquear uma nova frase do dia.',
      });
    } catch (error) {
      console.error('Failed to generate quote:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível gerar a frase. Tente novamente.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(quote);
    toast({
      title: 'Copiado!',
      description: 'Frase copiada para a área de transferência.',
    });
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-20 md:pb-6">
      <div>
        <h1 className="text-3xl font-bold">Frase do Dia</h1>
        <p className="text-muted-foreground mt-1">
          Inspiração diária com ciência e humor
        </p>
      </div>

      <Card className="bg-gradient-purple shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent-foreground">
            <Sparkles className="h-6 w-6" />
            {isRevealed ? 'Sua Dose Diária de Sabedoria' : 'Baú da Sabedoria Diária'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isRevealed ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="relative">
                <Gift className="h-32 w-32 text-accent-foreground/80 animate-pulse" />
                {hasUsedToday && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="h-16 w-16 text-accent-foreground" />
                  </div>
                )}
              </div>
              
              {hasUsedToday ? (
                <div className="text-center space-y-2">
                  <p className="text-lg font-semibold text-accent-foreground">
                    Frase do dia já utilizada!
                  </p>
                  <p className="text-accent-foreground/80">
                    Volte amanhã para desbloquear uma nova frase inspiradora
                  </p>
                </div>
              ) : (
                <Button
                  onClick={revealQuote}
                  size="lg"
                  disabled={isGenerating}
                  className="gap-2 bg-background/20 hover:bg-background/30"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Revelando...
                    </>
                  ) : (
                    <>
                      <Gift className="h-5 w-5" />
                      Revelar Frase do Dia
                    </>
                  )}
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="bg-background/10 backdrop-blur-sm rounded-lg p-6">
                <p className="text-lg leading-relaxed text-accent-foreground">
                  {quote}
                </p>
              </div>

              <Button
                onClick={handleCopy}
                variant="secondary"
                className="w-full gap-2"
              >
                <Copy className="h-4 w-4" />
                Copiar Frase
              </Button>

              <div className="text-center pt-2 border-t border-accent-foreground/20">
                <p className="text-sm text-accent-foreground/70">
                  ✨ Volte amanhã para uma nova frase inspiradora
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Como Funciona o Baú Diário?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Cada dia você pode revelar uma nova frase gerada especialmente para você 
            usando inteligência artificial, combinando conceitos de neurociência com 
            uma abordagem prática e, às vezes, bem-humorada.
          </p>
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <Gift className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Uma frase por dia</h3>
                <p className="text-sm">
                  Clique no baú para revelar sua frase diária. Após revelar, você precisará 
                  esperar até o próximo dia para uma nova frase.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Conteúdo único</h3>
                <p className="text-sm">
                  Cada frase é única e gerada no momento, trazendo insights frescos sobre 
                  hábitos, motivação e mudança de comportamento.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Copy className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Salve e compartilhe</h3>
                <p className="text-sm">
                  Copie a frase e use-a como lembrete durante o dia, compartilhe com amigos 
                  ou cole em seu mural de motivação!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyQuote;
