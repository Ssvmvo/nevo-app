import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, SafeAreaView,
  KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { Auth } from '../services/api';

interface Props { onBack: () => void; onSuccess: () => void; }

export function RegisterScreen({ onBack, onSuccess }: Props) {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState<'patient' | 'professional'>('patient');
  const [loading, setLoading]   = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) { Alert.alert('Atenção', 'Preencha todos os campos.'); return; }
    setLoading(true);
    try {
      await Auth.register(name.trim(), email.trim(), password, role);
      Alert.alert('Sucesso!', 'Conta criada. Faça login.', [{ text: 'OK', onPress: onSuccess }]);
    } catch (e: any) {
      Alert.alert('Erro', e.response?.data?.detail ?? 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Criar Conta" onBack={onBack} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.card}>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput style={styles.input} placeholder="Seu nome" value={name} onChangeText={setName} />
            <Text style={styles.label}>E-mail</Text>
            <TextInput style={styles.input} placeholder="seu@email.com" value={email}
              onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <Text style={styles.label}>Senha (mínimo 8 caracteres com número)</Text>
            <TextInput style={styles.input} placeholder="••••••••" value={password}
              onChangeText={setPassword} secureTextEntry />
            <Text style={styles.label}>Perfil</Text>
            <View style={styles.roleRow}>
              {(['patient', 'professional'] as const).map(r => (
                <View key={r} style={[styles.roleBtn, role === r && styles.roleBtnActive]}>
                  <Button title={r === 'patient' ? 'Paciente' : 'Profissional'}
                    onPress={() => setRole(r)}
                    variant={role === r ? 'primary' : 'outline'} />
                </View>
              ))}
            </View>
            <Button title="Criar Conta" onPress={handleRegister} loading={loading} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.background },
  kav:          { flex: 1 },
  scroll:       { padding: 24 },
  card:         { backgroundColor: Colors.white, borderRadius: 16, padding: 24,
                  shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  label:        { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 4, marginTop: 14 },
  input:        { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
                  borderRadius: 10, padding: 14, fontSize: 16, color: Colors.text },
  roleRow:      { flexDirection: 'row', gap: 12, marginTop: 8 },
  roleBtn:      { flex: 1 },
  roleBtnActive:{ opacity: 1 },
});