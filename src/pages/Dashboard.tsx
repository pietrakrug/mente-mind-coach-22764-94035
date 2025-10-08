import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { habitApi, checkInApi } from '@/services/api';
import { geminiService } from '@/services/geminiService';
import { Habit, CheckIn } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CreateHabitModal from '@/components/CreateHabitModal';
import CheckInModal from '@/components/CheckInModal';
import { Plus, Flame, Target, Calendar, TrendingUp, Sparkles, Medal, Zap } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import heroImage from '@/assets/hero-illustration.png';

const Dashboard = () => {
  const { user } = useAuth();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [todayCheckIn, setTodayCheckIn] = useState<CheckIn | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const activeHabit = await habitApi.getActiveHabit(user.id);
      setHabit(activeHabit);
      
      if (activeHabit) {
        const habitCheckIns = await checkInApi.getCheckIns(activeHabit.id);
        setCheckIns(habitCheckIns);
        const today = await checkInApi.getTodayCheckIn(activeHabit.id);
        setTodayCheckIn(today);
        
        // Load AI insight if we have enough check-ins
        if (habitCheckIns.length >= 3) {
          loadAiInsight(habitCheckIns);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAiInsight = async (checkIns: CheckIn[]) => {
    setIsLoadingInsight(true);
    try {
      const insight = await geminiService.generateInsight(checkIns);
      setAiInsight(insight);
    } catch (error) {
      console.error('Failed to load insight:', error);
    } finally {
      setIsLoadingInsight(false);
    }
  };

  const calculateStreak = () => {
    if (checkIns.length === 0) return 0;
    
    const sortedCheckIns = [...checkIns].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const checkIn of sortedCheckIns) {
      const checkInDate = new Date(checkIn.date);
      checkInDate.setHours(0, 0, 0, 0);
      
      if (checkInDate.getTime() === currentDate.getTime()) {
        if (checkIn.status !== 'missed') {
          streak++;
        } else {
          break;
        }
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (checkInDate.getTime() < currentDate.getTime()) {
        break;
      }
    }
    
    return streak;
  };

  const getCalendarDays = () => {
    const today = new Date();
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    return eachDayOfInterval({ start, end });
  };

  const getCheckInForDate = (date: Date) => {
    return checkIns.find((checkIn) => {
      const checkInDate = new Date(checkIn.date);
      return isSameDay(checkInDate, date);
    });
  };

  const getSuccessRate = () => {
    if (checkIns.length === 0) return 0;
    const completed = checkIns.filter(c => c.status === 'completed' || c.status === 'partial').length;
    return Math.round((completed / checkIns.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/30">
        <div className="max-w-2xl w-full animate-fade-in">
          <Card className="overflow-hidden shadow-xl">
            <div className="h-48 overflow-hidden">
              <img src={heroImage} alt="Start your journey" className="w-full h-full object-cover" />
            </div>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-3xl font-bold">Welcome to Mente Viva</CardTitle>
              <CardDescription className="text-base mt-2">
                Your journey to better habits starts with a single step. Let's create your first habit together.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <Button onClick={() => setIsCreateModalOpen(true)} size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Create Your First Habit
              </Button>
            </CardContent>
          </Card>
        </div>
        <CreateHabitModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onHabitCreated={loadData}
        />
      </div>
    );
  }

  const streak = calculateStreak();
  const successRate = getSuccessRate();
  const calendarDays = getCalendarDays();
  const weeklyData = checkIns.slice(0, 7).reverse().map((c, i) => ({
    day: format(new Date(c.date), 'EEE'),
    value: c.status === 'completed' ? 3 : c.status === 'partial' ? 2 : 1,
    status: c.status,
  }));

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{habit.name}</h1>
          <p className="text-muted-foreground mt-1">{habit.motivation}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold mt-1">{streak}</p>
              </div>
              <Flame className="h-8 w-8 text-warning animate-streak-pulse" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Check-ins</p>
                <p className="text-2xl font-bold mt-1">{checkIns.length}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold mt-1">{successRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Days Active</p>
                <p className="text-2xl font-bold mt-1">
                  {Math.floor((new Date().getTime() - new Date(habit.startDate).getTime()) / (1000 * 60 * 60 * 24))}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Check-in Card */}
      {!todayCheckIn && (
        <Card className="bg-gradient-primary shadow-lg animate-scale-in">
          <CardHeader>
            <CardTitle className="text-primary-foreground">Complete Today's Check-In</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Take a moment to reflect on your progress today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsCheckInModalOpen(true)} variant="secondary" size="lg" className="w-full sm:w-auto">
              Start Check-In
            </Button>
          </CardContent>
        </Card>
      )}

      {todayCheckIn && (
        <Card className="border-success">
          <CardHeader>
            <CardTitle className="text-success flex items-center gap-2">
              ✓ Check-In Complete!
            </CardTitle>
            <CardDescription>
              Great work today! Come back tomorrow to continue your streak.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* AI Insight */}
      {aiInsight && checkIns.length >= 3 && (
        <Card className="bg-gradient-purple shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent-foreground">
              <Sparkles className="h-5 w-5" />
              Insight da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-accent-foreground/90 leading-relaxed">{aiInsight}</p>
          </CardContent>
        </Card>
      )}

      {/* Weekly Consistency */}
      {weeklyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Consistência Semanal
            </CardTitle>
            <CardDescription>Últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" />
                <YAxis hide domain={[0, 3]} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {weeklyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.status === 'completed'
                          ? 'hsl(var(--success))'
                          : entry.status === 'partial'
                          ? 'hsl(var(--warning))'
                          : 'hsl(var(--destructive))'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>This Month's Progress</CardTitle>
          <CardDescription>{format(new Date(), 'MMMM yyyy')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
            {calendarDays.map((day) => {
              const checkIn = getCheckInForDate(day);
              const isPast = day < new Date() && !isToday(day);
              const isTodayDate = isToday(day);
              
              let bgColor = 'bg-muted/30';
              if (checkIn) {
                if (checkIn.status === 'completed') bgColor = 'bg-success';
                else if (checkIn.status === 'partial') bgColor = 'bg-warning';
                else bgColor = 'bg-destructive';
              } else if (isTodayDate) {
                bgColor = 'border-2 border-primary';
              }

              return (
                <div
                  key={day.toISOString()}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${bgColor} ${
                    checkIn ? 'text-white' : isPast ? 'text-muted-foreground' : 'text-foreground'
                  }`}
                >
                  {format(day, 'd')}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <CreateHabitModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onHabitCreated={loadData}
      />

      {habit && (
        <CheckInModal
          open={isCheckInModalOpen}
          onOpenChange={setIsCheckInModalOpen}
          habitId={habit.id}
          userId={user!.id}
          onCheckInComplete={loadData}
        />
      )}
    </div>
  );
};

export default Dashboard;
