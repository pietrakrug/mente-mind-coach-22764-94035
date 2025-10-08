import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { habitApi, checkInApi } from '@/services/api';
import { CheckIn } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { CheckCircle2, AlertCircle, XCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const History = () => {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCheckIns();
  }, [user]);

  const loadCheckIns = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const activeHabit = await habitApi.getActiveHabit(user.id);
      if (activeHabit) {
        const habitCheckIns = await checkInApi.getCheckIns(activeHabit.id);
        const sorted = habitCheckIns.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setCheckIns(sorted);
      }
    } catch (error) {
      console.error('Failed to load check-ins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: CheckIn['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'partial':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'missed':
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getStatusText = (status: CheckIn['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'partial':
        return 'Partial';
      case 'missed':
        return 'Missed';
    }
  };

  const getStatusBadgeClass = (status: CheckIn['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'partial':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'missed':
        return 'bg-destructive/10 text-destructive border-destructive/20';
    }
  };

  const getMoodTrend = (mood: number) => {
    if (mood >= 7) return <TrendingUp className="h-4 w-4 text-success" />;
    if (mood <= 4) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
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
      <div className="max-w-4xl animate-fade-in pb-20 md:pb-6">
        <h1 className="text-3xl font-bold mb-6">Check-In History</h1>
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">No check-ins yet. Complete your first check-in to see your history!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in pb-20 md:pb-6">
      <div>
        <h1 className="text-3xl font-bold">Check-In History</h1>
        <p className="text-muted-foreground mt-1">Review your journey and progress</p>
      </div>

      <div className="space-y-4">
        {checkIns.map((checkIn) => (
          <Card key={checkIn.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(checkIn.status)}
                  <div>
                    <CardTitle className="text-lg">
                      {format(new Date(checkIn.date), 'EEEE, MMMM d, yyyy')}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(checkIn.status)}`}>
                        {getStatusText(checkIn.status)}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {checkIn.reflection && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium mb-1">Reflection</p>
                  <p className="text-sm text-muted-foreground">{checkIn.reflection}</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Energy</p>
                    <p className="text-sm font-semibold">{checkIn.energy.level}/10</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Satisfaction</p>
                    <p className="text-sm font-semibold">{checkIn.energy.satisfaction}/10</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getMoodTrend(checkIn.energy.mood)}
                  <div>
                    <p className="text-xs text-muted-foreground">Mood</p>
                    <p className="text-sm font-semibold">{checkIn.energy.mood}/10</p>
                  </div>
                </div>
              </div>

              {checkIn.challenges.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Challenges</p>
                  <div className="flex flex-wrap gap-2">
                    {checkIn.challenges.map((challenge, index) => (
                      <span key={index} className="px-2 py-1 bg-muted rounded-md text-xs">
                        {challenge}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {checkIn.motivations.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Motivations</p>
                  <div className="flex flex-wrap gap-2">
                    {checkIn.motivations.map((motivation, index) => (
                      <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                        {motivation}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default History;
