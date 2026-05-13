import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Auth, HistoryAPI, User, Stats } from '../services/api';

interface Props {
  onScan: () => void;
  onHistory: () => void;
  onLogout: () => void;
}

export function HomeScreen({ onScan, onHistory, onLogout }: Props) {
  const [user, setUser]   = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    Auth.getStoredUser().then(setUser);
    HistoryAPI.stats().then(setStats).catch(() => {});
  }, []);

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => { await Auth.logout(); onLogout(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0] ?? 'usuário'} 👋</Text>
            <Text style={styles.subtitle}>O que deseja fazer hoje?</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        {/* Card principal */}
        <TouchableOpacity style={styles.cardMain} onPress={onScan} activeOpacity={0.85}>
          <Text style={styles.cardMainIcon}>📷</Text>
          <Text style={styles.cardMainTitle}>Nova Análise</Text>
          <Text style={styles.cardMainSub}>Tire ou envie uma foto da pele para análise por IA</Text>
        </TouchableOpacity>

        {/* Stats */}
        {stats && stats.total > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{stats.total}</Text>
              <Text style={styles.statLabel}>Análises</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{stats.by_risk?.low ?? 0}</Text>
              <Text style={styles.statLabel}>Baixo risco</Text>
            </View>
            <View style={[styles.statCard, { borderColor: Colors.danger }]}>
              <Text style={[styles.statNum, { color: Colors.danger }]}>{stats.by_risk?.high ?? 0}</Text>
              <Text style={styles.statLabel}>Alto risco</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{stats.avg_confidence.toFixed(0)}%</Text>
              <Text style={styles.statLabel}>Confiança</Text>
            </View>
          </View>
        )}

        {/* Cards secundários */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.cardSec} onPress={onHistory} activeOpacity={0.8}>
            <Text style={styles.cardSecIcon}>📋</Text>
            <Text style={styles.cardSecTitle}>Histórico</Text>
            <Text style={styles.cardSecSub}>Ver análises anteriores</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cardSec} activeOpacity={0.8}>
            <Text style={styles.cardSecIcon}>👤</Text>
            <Text style={styles.cardSecTitle}>Perfil</Text>
            <Text style={styles.cardSecSub}>{user?.role === 'professional' ? 'Profissional' : 'Paciente'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚕️ O Nevo é uma ferramenta de apoio diagnóstico e não substitui a avaliação de um profissional de saúde.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: Colors.background },
  scroll:         { padding: 24, gap: 16 },
  headerRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  greeting:       { fontSize: 26, fontWeight: 'bold', color: Colors.text },
  subtitle:       { fontSize: 15, color: Colors.textLight, marginTop: 2 },
  logoutBtn:      { padding: 8 },
  logoutText:     { color: Colors.textLight, fontSize: 14 },
  cardMain:       { backgroundColor: Colors.primary, borderRadius: 20, padding: 28, alignItems: 'center', gap: 8,
                    shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  cardMainIcon:   { fontSize: 52 },
  cardMainTitle:  { fontSize: 24, fontWeight: 'bold', color: Colors.white },
  cardMainSub:    { fontSize: 14, color: Colors.white, opacity: 0.85, textAlign: 'center' },
  statsRow:       { flexDirection: 'row', gap: 10 },
  statCard:       { flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 14,
                    alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statNum:        { fontSize: 22, fontWeight: 'bold', color: Colors.primary },
  statLabel:      { fontSize: 11, color: Colors.textLight, marginTop: 2, textAlign: 'center' },
  row:            { flexDirection: 'row', gap: 14 },
  cardSec:        { flex: 1, backgroundColor: Colors.white, borderRadius: 16, padding: 20,
                    borderWidth: 1, borderColor: Colors.border, gap: 6 },
  cardSecIcon:    { fontSize: 30 },
  cardSecTitle:   { fontSize: 16, fontWeight: '600', color: Colors.text },
  cardSecSub:     { fontSize: 12, color: Colors.textLight },
  disclaimer:     { backgroundColor: '#E8F4FD', borderRadius: 14, padding: 16 },
  disclaimerText: { fontSize: 13, color: '#1A6FA0', textAlign: 'center', lineHeight: 20 },
});