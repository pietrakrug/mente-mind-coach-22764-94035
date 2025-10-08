import { User, Habit, CheckIn, TestResult, DailyQuote } from '@/types';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// LocalStorage keys
const STORAGE_KEYS = {
  USERS: 'menteviva_users',
  HABITS: 'menteviva_habits',
  CHECKINS: 'menteviva_checkins',
  CURRENT_USER: 'menteviva_current_user',
  TEST_RESULTS: 'menteviva_test_results',
  DAILY_QUOTES: 'menteviva_daily_quotes',
};

// Helper to get data from localStorage
const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Helper to save data to localStorage
const saveToStorage = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Auth API
export const authApi = {
  async login(email: string, password: string): Promise<User> {
    await delay(300);
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  },

  async signup(email: string, password: string, name: string): Promise<User> {
    await delay(300);
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    
    if (users.find(u => u.email === email)) {
      throw new Error('Email already exists');
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      avatar: '1',
      createdAt: new Date(),
      settings: {
        emailNotifications: true,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    
    return newUser;
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(200);
    const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  async logout(): Promise<void> {
    await delay(200);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    await delay(300);
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    users[userIndex] = { ...users[userIndex], ...updates };
    saveToStorage(STORAGE_KEYS.USERS, users);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(users[userIndex]));
    
    return users[userIndex];
  },
};

// Habit API
export const habitApi = {
  async createHabit(habit: Omit<Habit, 'id' | 'createdAt'>): Promise<Habit> {
    await delay(300);
    const habits = getFromStorage<Habit>(STORAGE_KEYS.HABITS);
    
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    habits.push(newHabit);
    saveToStorage(STORAGE_KEYS.HABITS, habits);
    
    return newHabit;
  },

  async getActiveHabit(userId: string): Promise<Habit | null> {
    await delay(200);
    const habits = getFromStorage<Habit>(STORAGE_KEYS.HABITS);
    return habits.find(h => h.userId === userId && h.isActive) || null;
  },

  async updateHabit(habitId: string, updates: Partial<Habit>): Promise<Habit> {
    await delay(300);
    const habits = getFromStorage<Habit>(STORAGE_KEYS.HABITS);
    const habitIndex = habits.findIndex(h => h.id === habitId);
    
    if (habitIndex === -1) {
      throw new Error('Habit not found');
    }

    habits[habitIndex] = { ...habits[habitIndex], ...updates };
    saveToStorage(STORAGE_KEYS.HABITS, habits);
    
    return habits[habitIndex];
  },

  async deleteHabit(habitId: string): Promise<void> {
    await delay(300);
    const habits = getFromStorage<Habit>(STORAGE_KEYS.HABITS);
    const filteredHabits = habits.filter(h => h.id !== habitId);
    saveToStorage(STORAGE_KEYS.HABITS, filteredHabits);
    
    // Also delete associated check-ins
    const checkIns = getFromStorage<CheckIn>(STORAGE_KEYS.CHECKINS);
    const filteredCheckIns = checkIns.filter(c => c.habitId !== habitId);
    saveToStorage(STORAGE_KEYS.CHECKINS, filteredCheckIns);
  },
};

// CheckIn API
export const checkInApi = {
  async createCheckIn(checkIn: Omit<CheckIn, 'id' | 'createdAt'>): Promise<CheckIn> {
    await delay(300);
    const checkIns = getFromStorage<CheckIn>(STORAGE_KEYS.CHECKINS);
    
    const newCheckIn: CheckIn = {
      ...checkIn,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    checkIns.push(newCheckIn);
    saveToStorage(STORAGE_KEYS.CHECKINS, checkIns);
    
    return newCheckIn;
  },

  async getCheckIns(habitId: string): Promise<CheckIn[]> {
    await delay(200);
    const checkIns = getFromStorage<CheckIn>(STORAGE_KEYS.CHECKINS);
    return checkIns.filter(c => c.habitId === habitId);
  },

  async getTodayCheckIn(habitId: string): Promise<CheckIn | null> {
    await delay(200);
    const checkIns = getFromStorage<CheckIn>(STORAGE_KEYS.CHECKINS);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return checkIns.find(c => {
      const checkInDate = new Date(c.date);
      checkInDate.setHours(0, 0, 0, 0);
      return c.habitId === habitId && checkInDate.getTime() === today.getTime();
    }) || null;
  },
};
