import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Troque pelo IP do seu PC quando testar no celular
// Ex: 'http://192.168.1.100:8000'
const BASE_URL = 'http://localhost:8000';

const api = axios.create({ baseURL: BASE_URL, timeout: 30000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('nevo_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('nevo_token');
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number; name: string; email: string; role: string;
}
export interface AnalysisResult {
  id: number; condition: string; risk_level: 'low' | 'medium' | 'high';
  confidence: number; description: string; recommendation: string; created_at: string;
}
export interface Stats {
  total: number; by_risk: Record<string, number>;
  by_condition: Record<string, number>; avg_confidence: number;
}

export const Auth = {
  async register(name: string, email: string, password: string, role = 'patient') {
    const res = await api.post('/auth/register', { name, email, password, role });
    return res.data;
  },
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem('nevo_token', res.data.access_token);
    await AsyncStorage.setItem('nevo_user', JSON.stringify(res.data.user));
    return { token: res.data.access_token, user: res.data.user };
  },
  async logout() {
    await AsyncStorage.removeItem('nevo_token');
    await AsyncStorage.removeItem('nevo_user');
  },
  async getStoredUser(): Promise<User | null> {
    const u = await AsyncStorage.getItem('nevo_user');
    return u ? JSON.parse(u) : null;
  },
};

export const AnalysisAPI = {
  async analyze(imageUri: string): Promise<AnalysisResult> {
    const form = new FormData();
    form.append('file', { uri: imageUri, type: 'image/jpeg', name: 'skin.jpg' } as any);
    const res = await api.post('/analyze/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  async feedback(analysisId: number, correct: boolean, label?: string) {
    const res = await api.post('/analyze/feedback', {
      analysis_id: analysisId, correct, correct_label: label,
    });
    return res.data;
  },
};

export const HistoryAPI = {
  async list(skip = 0, limit = 20): Promise<AnalysisResult[]> {
    const res = await api.get(`/history/?skip=${skip}&limit=${limit}`);
    return res.data;
  },
  async stats(): Promise<Stats> {
    const res = await api.get('/history/stats');
    return res.data;
  },
  async delete(id: number) {
    const res = await api.delete(`/history/${id}`);
    return res.data;
  },
};

export default api;