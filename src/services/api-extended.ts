import { TestResult, DailyQuote } from '@/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const STORAGE_KEYS = {
  TEST_RESULTS: 'menteviva_test_results',
  DAILY_QUOTES: 'menteviva_daily_quotes',
};

const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveToStorage = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Test Results API
export const testResultApi = {
  async saveTestResult(result: Omit<TestResult, 'id' | 'completedAt'>): Promise<TestResult> {
    await delay(300);
    const results = getFromStorage<TestResult>(STORAGE_KEYS.TEST_RESULTS);
    
    const newResult: TestResult = {
      ...result,
      id: crypto.randomUUID(),
      completedAt: new Date(),
    };

    results.push(newResult);
    saveToStorage(STORAGE_KEYS.TEST_RESULTS, results);
    
    return newResult;
  },

  async getUserTestResults(userId: string): Promise<TestResult[]> {
    await delay(200);
    const results = getFromStorage<TestResult>(STORAGE_KEYS.TEST_RESULTS);
    return results.filter(r => r.userId === userId);
  },

  async getLatestTestResult(userId: string, testType: TestResult['testType']): Promise<TestResult | null> {
    await delay(200);
    const results = getFromStorage<TestResult>(STORAGE_KEYS.TEST_RESULTS);
    const userResults = results.filter(r => r.userId === userId && r.testType === testType);
    
    if (userResults.length === 0) return null;
    
    return userResults.sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )[0];
  },
};

// Daily Quote API
export const dailyQuoteApi = {
  async getTodayQuote(userId: string): Promise<DailyQuote | null> {
    await delay(200);
    const quotes = getFromStorage<DailyQuote>(STORAGE_KEYS.DAILY_QUOTES);
    const today = new Date().toISOString().split('T')[0];
    
    return quotes.find(q => q.userId === userId && q.date === today) || null;
  },

  async saveDailyQuote(userId: string, content: string): Promise<DailyQuote> {
    await delay(300);
    const quotes = getFromStorage<DailyQuote>(STORAGE_KEYS.DAILY_QUOTES);
    const today = new Date().toISOString().split('T')[0];
    
    const newQuote: DailyQuote = {
      id: crypto.randomUUID(),
      content,
      date: today,
      userId,
    };

    quotes.push(newQuote);
    saveToStorage(STORAGE_KEYS.DAILY_QUOTES, quotes);
    
    return newQuote;
  },
};
