import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useHabitLimit } from '@/hooks/useHabitLimit';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateHabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHabitCreated: () => void;
}

const DAYS_OF_WEEK = [
  { id: 0, label: 'Dom', fullLabel: 'Domingo' },
  { id: 1, label: 'Seg', fullLabel: 'Segunda' },
  { id: 2, label: 'Ter', fullLabel: 'Terça' },
  { id: 3, label: 'Qua', fullLabel: 'Quarta' },
  { id: 4, label: 'Qui', fullLabel: 'Quinta' },
  { id: 5, label: 'Sex', fullLabel: 'Sexta' },
  { id: 6, label: 'Sáb', fullLabel: 'Sábado' },
];

const DURATION_OPTIONS = [
  { value: '7', label: '7 dias' },
  { value: '15', label: '15 dias' },
  { value: '30', label: '30 dias' },
];

const CreateHabitModal = ({ open, onOpenChange, onHabitCreated }: CreateHabitModalProps) => {
  const [name, setName] = useState('');
  const [motivation, setMotivation] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]); // All days by default
  const [duration, setDuration] = useState('30');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { canCreateNewHabit, activeHabitsCount, maxHabits, refreshCount } = useHabitLimit();

  const toggleDay = (dayId: number) => {
    setSelectedDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId].sort()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!canCreateNewHabit) {
      toast({
        variant: 'destructive',
        title: 'Limite Atingido',
        description: `Você já tem ${maxHabits} hábitos ativos. Complete ou resete um hábito para criar um novo.`,
      });
      return;
    }

    if (selectedDays.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Selecione pelo menos um dia da semana',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          name,
          motivation,
          days_of_week: selectedDays,
          duration_days: parseInt(duration),
          reminder_time: reminderTime,
          start_date: new Date().toISOString().split('T')[0],
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: 'Hábito Criado!',
        description: 'Sua jornada começa agora. Vamos construir esse hábito juntos!',
      });

      await refreshCount();
      onHabitCreated();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Falha ao criar hábito',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setMotivation('');
    setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    setDuration('30');
    setReminderTime('09:00');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Crie Seu Hábito ({activeHabitsCount}/{maxHabits})
          </DialogTitle>
          <DialogDescription>
            {canCreateNewHabit 
              ? 'Defina um hábito que você deseja construir. Seja específico e pense no porquê isso é importante para você.'
              : `Você atingiu o limite de ${maxHabits} hábitos consecutivos. Complete ou resete um hábito existente para criar um novo.`
            }
          </DialogDescription>
        </DialogHeader>

        {!canCreateNewHabit ? (
          <div className="py-4 text-center">
            <p className="text-muted-foreground">
              Você já tem {maxHabits} hábitos ativos. Para criar um novo hábito, complete ou resete um dos hábitos existentes.
            </p>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="mt-4"
            >
              Entendi
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Hábito *</Label>
            <Input
              id="name"
              placeholder="ex: Meditação Matinal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              required
            />
            <p className="text-xs text-muted-foreground">{name.length}/60 caracteres</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivation">Por que isso é importante para você? *</Label>
            <Textarea
              id="motivation"
              placeholder="Compartilhe sua motivação mais profunda para construir esse hábito..."
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Dias da Semana *</Label>
            <p className="text-xs text-muted-foreground">
              Selecione os dias em que você deseja receber lembretes e fazer check-in
            </p>
            <div className="flex gap-2 flex-wrap">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleDay(day.id)}
                  className={cn(
                    "flex-1 min-w-[60px] py-3 px-2 rounded-lg border-2 transition-all font-medium text-sm",
                    selectedDays.includes(day.id)
                      ? "bg-primary border-primary text-primary-foreground shadow-md"
                      : "bg-background border-border text-muted-foreground hover:border-primary/50"
                  )}
                  title={day.fullLabel}
                >
                  {day.label}
                </button>
              ))}
            </div>
            {selectedDays.length === 0 && (
              <p className="text-xs text-destructive">Selecione pelo menos um dia</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duração do Desafio *</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {DURATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Escolha por quanto tempo você quer se comprometer com esse hábito
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminderTime">Horário do Lembrete *</Label>
            <Input
              id="reminderTime"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Escolha o horário que você receberá lembretes via WhatsApp
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || selectedDays.length === 0} className="flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Hábito
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateHabitModal;
