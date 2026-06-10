import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = '3DskDiv68DikRsdqUIpXCe1mClZ_2dGJ2VCLu9LkqpCC93TmU';

export interface User {
  id: number; name: string; email: string; role: string;
}
export interface AnalysisResult {
  id: number;
  condition: string;
  risk_level: 'low' | 'medium' | 'high';
  confidence: number;
  description: string;
  recommendation: string;
  created_at: string;
}
export interface Stats {
  total: number;
  by_risk: Record<string, number>;
  by_condition: Record<string, number>;
  avg_confidence: number;
}

const headers = async (extra?: Record<string, string>) => {
  const token = await AsyncStorage.getItem('nevo_token');
  return {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

export const Auth = {
  async register(name: string, email: string, password: string, role = 'patient') {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: await headers(),
      body: JSON.stringify({ name, email, password, role }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: await headers(),
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw await res.json();
    const data = await res.json();
    await AsyncStorage.setItem('nevo_token', data.access_token);
    await AsyncStorage.setItem('nevo_user', JSON.stringify(data.user));
    return { token: data.access_token, user: data.user };
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
    const token = await AsyncStorage.getItem('nevo_token');
    const form  = new FormData();
    form.append('file', {
      uri:  imageUri,
      type: 'image/jpeg',
      name: 'skin.jpg',
    } as any);

    const res = await fetch(`${BASE_URL}/analyze/`, {
      method:  'POST',
      headers: {
        'Authorization':              `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: form,
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async feedback(analysisId: number, correct: boolean, label?: string) {
    const res = await fetch(`${BASE_URL}/analyze/feedback`, {
      method:  'POST',
      headers: await headers(),
      body: JSON.stringify({ analysis_id: analysisId, correct, correct_label: label }),
    });
    return res.json();
  },
};

export const HistoryAPI = {
  async list(): Promise<AnalysisResult[]> {
    const res = await fetch(`${BASE_URL}/history/`, { headers: await headers() });
    return res.json();
  },

  async stats(): Promise<Stats> {
    const res = await fetch(`${BASE_URL}/history/stats`, { headers: await headers() });
    return res.json();
  },

  async delete(id: number) {
    const res = await fetch(`${BASE_URL}/history/${id}`, {
      method: 'DELETE',
      headers: await headers(),
    });
    return res.json();
  },
};
