import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, Image, Alert, ScrollView,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Button } from '../components/Button';
import { Auth } from '../services/api';

interface Props { onLogin: () => void; onRegister: () => void; }

export function LoginScreen({ onLogin, onRegister }: Props) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Atenção', 'Preencha todos os campos.'); return; }
    setLoading(true);
    try {
      await Auth.login(email.trim(), password);
      onLogin();
    } catch (e: any) {
      Alert.alert('Erro', e.response?.data?.detail ?? 'Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.logoBox}>
            <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.appName}>Nevo</Text>
            <Text style={styles.tagline}>Análise inteligente de pele</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Entrar na sua conta</Text>
            <Text style={styles.label}>E-mail</Text>
            <TextInput style={styles.input} placeholder="seu@email.com" value={email}
              onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Text style={styles.label}>Senha</Text>
            <TextInput style={styles.input} placeholder="••••••••" value={password}
              onChangeText={setPassword} secureTextEntry />
            <Button title="Entrar" onPress={handleLogin} loading={loading} />
            <Button title="Criar conta" onPress={onRegister} variant="outline" />
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              ⚕️ Este app é uma ferramenta de apoio e não substitui o diagnóstico médico.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: Colors.background },
  kav:           { flex: 1 },
  scroll:        { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoBox:       { alignItems: 'center', marginBottom: 32 },
  logo:          { width: 120, height: 120, marginBottom: 8 },
  appName:       { fontSize: 36, fontWeight: 'bold', color: Colors.primary },
  tagline:       { fontSize: 15, color: Colors.textLight, marginTop: 4 },
  card:          { backgroundColor: Colors.white, borderRadius: 16, padding: 24,
                   shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  cardTitle:     { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginBottom: 20 },
  label:         { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 4, marginTop: 12 },
  input:         { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
                   borderRadius: 10, padding: 14, fontSize: 16, color: Colors.text },
  disclaimer:    { marginTop: 24, backgroundColor: '#E8F4FD', borderRadius: 12, padding: 14 },
  disclaimerText:{ fontSize: 12, color: '#1A6FA0', textAlign: 'center', lineHeight: 18 },
});