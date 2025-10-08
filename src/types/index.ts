export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  createdAt: Date;
  settings: {
    emailNotifications: boolean;
    timezone: string;
  };
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  motivation: string;
  frequency: {
    type: 'daily' | 'weekly' | 'custom';
    daysOfWeek?: number[];
    timesPerDay?: number;
  };
  duration: {
    value: number;
    unit: 'days' | 'weeks' | 'months';
  };
  reminders: {
    enabled: boolean;
    times: string[];
    days?: number[];
  };
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface CheckIn {
  id: string;
  habitId: string;
  userId: string;
  date: Date;
  status: 'completed' | 'partial' | 'missed';
  challenges: string[];
  sabotagePatterns: string[];
  motivations: string[];
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  energy: {
    level: number;
    satisfaction: number;
    mood: number;
  };
  reflection: string;
  learnings?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CheckInFormData {
  status: 'completed' | 'partial' | 'missed';
  challenges: string[];
  motivations: string[];
  sabotagePatterns: string[];
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  energy: {
    level: number;
    satisfaction: number;
    mood: number;
  };
  reflection: string;
}

export interface TestResult {
  id: string;
  userId: string;
  testType: 'executive' | 'reward' | 'sabotage';
  score: number;
  archetype: string;
  answers: Record<string, number>;
  completedAt: Date;
}

export interface DailyQuote {
  id: string;
  content: string;
  date: string;
  userId: string;
}
