import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginScreen }    from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { HomeScreen }     from './screens/HomeScreen';
import { ScanScreen }     from './screens/ScanScreen';
import { ResultScreen }   from './screens/ResultScreen';
import { HistoryScreen }  from './screens/HistoryScreen';
import { ProfileScreen }  from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AnalysisResult } from './services/api';

type Screen = 'loading' | 'login' | 'register' | 'home' | 'scan' | 'result' | 'history' | 'profile' | 'settings';

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [image,  setImage]  = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('nevo_token').then(token => {
      setScreen(token ? 'home' : 'login');
    });
  }, []);

  const go = (s: Screen) => setScreen(s);

  if (screen === 'loading') return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#1B3A5C" />
    </View>
  );

  if (screen === 'login')    return <LoginScreen    onLogin={() => go('home')} onRegister={() => go('register')} />;
  if (screen === 'register') return <RegisterScreen onBack={() => go('login')} onSuccess={() => go('login')} />;

  if (screen === 'home') return (
    <HomeScreen
      onScan={() => go('scan')}
      onHistory={() => go('history')}
      onProfile={() => go('profile')}
      onLogout={() => go('login')}
    />
  );

  if (screen === 'scan') return (
    <ScanScreen
      onBack={() => go('home')}
      onResult={(r, img) => { setResult(r); setImage(img ?? null); go('result'); }}
    />
  );

  if (screen === 'result' && result) return (
    <ResultScreen
      result={result}
      image={image}
      onBack={() => go('home')}
      onNewScan={() => go('scan')}
      onHistory={() => go('history')}
    />
  );

  if (screen === 'history') return (
    <HistoryScreen
      onBack={() => go('home')}
      onResult={(r) => { setResult(r); setImage(null); go('result'); }}
    />
  );

  if (screen === 'profile') return (
    <ProfileScreen
      onBack={() => go('home')}
      onLogout={() => go('login')}
      onSettings={() => go('settings')}
    />
  );

  if (screen === 'settings') return (
    <SettingsScreen onBack={() => go('profile')} />
  );

  return null;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F4F8' },
});
