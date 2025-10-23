import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useHabitLimit = () => {
  const { user } = useAuth();
  const [activeHabitsCount, setActiveHabitsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const MAX_HABITS = 3;

  const loadHabitCount = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('habits')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setActiveHabitsCount(data?.length || 0);
    } catch (error) {
      console.error('Error loading habit count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHabitCount();
  }, [user]);

  const canCreateNewHabit = activeHabitsCount < MAX_HABITS;
  const remainingSlots = MAX_HABITS - activeHabitsCount;

  return {
    activeHabitsCount,
    maxHabits: MAX_HABITS,
    canCreateNewHabit,
    remainingSlots,
    isLoading,
    refreshCount: loadHabitCount,
  };
};
