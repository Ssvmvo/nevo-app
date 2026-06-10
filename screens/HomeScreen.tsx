import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Animated, RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryAPI, Auth } from '../services/api';

interface Props {
  onScan: () => void;
  onHistory: () => void;
  onProfile: () => void;
  onLogout: () => void;
}

const TIPS = [
  { icon: '☀️', title: 'Exposição solar', text: 'Use protetor solar FPS 30+ diariamente, mesmo em dias nublados.' },
  { icon: '🔍', title: 'Autoexame', text: 'Examine sua pele mensalmente em busca de alterações suspeitas.' },
  { icon: '📅', title: 'Consultas', text: 'Visite um dermatologista ao menos uma vez por ano.' },
  { icon: '💧', title: 'Hidratação', text: 'Mantenha a pele hidratada para preservar sua barreira natural.' },
];

export function HomeScreen({ onScan, onHistory, onProfile, onLogout }: Props) {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    loadData();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const loadData = async () => {
    try {
      const u = await Auth.getStoredUser();
      setUser(u);
      const s = await HistoryAPI.stats();
      setStats(s);
      const h = await HistoryAPI.list();
      if (h && h.length > 0) setLastAnalysis(h[0]);
    } catch (e) {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const firstName = user?.name?.split(' ')[0] || 'Usuário';

  const riskColor = (r: string) => r === 'high' ? '#DC2626' : r === 'medium' ? '#D97706' : '#059669';
  const riskLabel = (r: string) => r === 'high' ? 'Alto Risco' : r === 'medium' ? 'Moderado' : 'Baixo Risco';

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1B3A5C" />}
        contentContainerStyle={s.scroll}
      >
        {/* HEADER */}
        <Animated.View style={[s.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View>
            <Text style={s.greeting}>{greeting},</Text>
            <Text style={s.name}>{firstName}</Text>
          </View>
          <TouchableOpacity onPress={onProfile} style={s.avatar}>
            <Text style={s.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* CARD PRINCIPAL */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <TouchableOpacity style={s.mainCard} onPress={onScan} activeOpacity={0.9}>
            <View style={s.mainCardContent}>
              <View style={s.mainCardBadge}>
                <Text style={s.mainCardBadgeText}>IA Dermatológica</Text>
              </View>
              <Text style={s.mainCardTitle}>Analisar{'\n'}Lesão de Pele</Text>
              <Text style={s.mainCardSub}>Resultado em segundos com MobileNetV2</Text>
              <View style={s.mainCardBtn}>
                <Text style={s.mainCardBtnText}>Iniciar Análise →</Text>
              </View>
            </View>
            <View style={s.mainCardOrb} />
            <View style={s.mainCardOrb2} />
          </TouchableOpacity>
        </Animated.View>

        {/* ESTATÍSTICAS */}
        <Text style={s.sectionTitle}>Suas Estatísticas</Text>
        <View style={s.statsGrid}>
          <View style={[s.statCard, { borderTopColor: '#1B3A5C' }]}>
            <Text style={s.statNumber}>{stats?.total ?? 0}</Text>
            <Text style={s.statLabel}>Total de{'\n'}Análises</Text>
          </View>
          <View style={[s.statCard, { borderTopColor: '#DC2626' }]}>
            <Text style={[s.statNumber, { color: '#DC2626' }]}>{stats?.by_risk?.high ?? 0}</Text>
            <Text style={s.statLabel}>Alto{'\n'}Risco</Text>
          </View>
          <View style={[s.statCard, { borderTopColor: '#059669' }]}>
            <Text style={[s.statNumber, { color: '#059669' }]}>{stats?.by_risk?.low ?? 0}</Text>
            <Text style={s.statLabel}>Baixo{'\n'}Risco</Text>
          </View>
          <View style={[s.statCard, { borderTopColor: '#6366F1' }]}>
            <Text style={[s.statNumber, { color: '#6366F1' }]}>
              {stats?.avg_confidence ? `${stats.avg_confidence.toFixed(0)}%` : '--'}
            </Text>
            <Text style={s.statLabel}>Confiança{'\n'}Média</Text>
          </View>
        </View>

        {/* ÚLTIMA ANÁLISE */}
        {lastAnalysis && (
          <>
            <Text style={s.sectionTitle}>Última Análise</Text>
            <TouchableOpacity style={s.lastCard} onPress={onHistory} activeOpacity={0.85}>
              <View style={s.lastCardLeft}>
                <Text style={s.lastCondition}>{lastAnalysis.condition}</Text>
                <Text style={s.lastDate}>
                  {new Date(lastAnalysis.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  })}
                </Text>
                <Text style={s.lastConf}>Confiança: {lastAnalysis.confidence?.toFixed(1)}%</Text>
              </View>
              <View style={[s.riskPill, { backgroundColor: riskColor(lastAnalysis.risk_level) }]}>
                <Text style={s.riskPillText}>{riskLabel(lastAnalysis.risk_level)}</Text>
              </View>
            </TouchableOpacity>
          </>
        )}

        {/* ATALHOS */}
        <Text style={s.sectionTitle}>Acesso Rápido</Text>
        <View style={s.shortcuts}>
          <TouchableOpacity style={s.shortcut} onPress={onScan} activeOpacity={0.85}>
            <Text style={s.shortcutIcon}>🔬</Text>
            <Text style={s.shortcutLabel}>Nova{'\n'}Análise</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.shortcut} onPress={onHistory} activeOpacity={0.85}>
            <Text style={s.shortcutIcon}>📋</Text>
            <Text style={s.shortcutLabel}>Histórico</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.shortcut} onPress={onProfile} activeOpacity={0.85}>
            <Text style={s.shortcutIcon}>👤</Text>
            <Text style={s.shortcutLabel}>Perfil</Text>
          </TouchableOpacity>
        </View>

        {/* DICAS */}
        <Text style={s.sectionTitle}>Saúde da Pele</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tipsRow}>
          {TIPS.map((tip, i) => (
            <View key={i} style={s.tipCard}>
              <Text style={s.tipIcon}>{tip.icon}</Text>
              <Text style={s.tipTitle}>{tip.title}</Text>
              <Text style={s.tipText}>{tip.text}</Text>
            </View>
          ))}
        </ScrollView>

        {/* AVISO */}
        <View style={s.disclaimer}>
          <Text style={s.disclaimerText}>
            O Nevo é uma ferramenta de apoio diagnóstico. Os resultados não substituem a avaliação de um médico ou dermatologista.
          </Text>
        </View>

      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={s.bottomNav}>
        <TouchableOpacity style={s.navItem} onPress={() => {}} activeOpacity={0.7}>
          <Text style={[s.navIcon, s.navActive]}>🏠</Text>
          <Text style={[s.navLabel, s.navActiveLabel]}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navScanBtn} onPress={onScan} activeOpacity={0.85}>
          <Text style={s.navScanIcon}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem} onPress={onHistory} activeOpacity={0.7}>
          <Text style={s.navIcon}>📋</Text>
          <Text style={s.navLabel}>Histórico</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem} onPress={onProfile} activeOpacity={0.7}>
          <Text style={s.navIcon}>👤</Text>
          <Text style={s.navLabel}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: '#F0F4F8' },
  scroll:            { paddingBottom: 100 },
  header:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  greeting:          { fontSize: 14, color: '#64748B', fontWeight: '400' },
  name:              { fontSize: 24, color: '#1B3A5C', fontWeight: '800', letterSpacing: -0.5 },
  avatar:            { width: 46, height: 46, borderRadius: 23, backgroundColor: '#1B3A5C', alignItems: 'center', justifyContent: 'center' },
  avatarText:        { color: '#fff', fontSize: 18, fontWeight: '700' },
  mainCard:          { marginHorizontal: 20, marginTop: 12, borderRadius: 24, backgroundColor: '#1B3A5C', padding: 24, overflow: 'hidden', minHeight: 180 },
  mainCardContent:   { zIndex: 2 },
  mainCardBadge:     { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 12 },
  mainCardBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  mainCardTitle:     { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5, lineHeight: 34, marginBottom: 8 },
  mainCardSub:       { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 20 },
  mainCardBtn:       { backgroundColor: '#fff', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, alignSelf: 'flex-start' },
  mainCardBtnText:   { color: '#1B3A5C', fontSize: 14, fontWeight: '700' },
  mainCardOrb:       { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.05)', top: -40, right: -40 },
  mainCardOrb2:      { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.08)', bottom: -30, right: 60 },
  sectionTitle:      { fontSize: 16, fontWeight: '700', color: '#1B3A5C', marginHorizontal: 20, marginTop: 24, marginBottom: 12 },
  statsGrid:         { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8 },
  statCard:          { backgroundColor: '#fff', borderRadius: 16, padding: 16, flex: 1, minWidth: '44%', borderTopWidth: 3, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  statNumber:        { fontSize: 28, fontWeight: '800', color: '#1B3A5C', letterSpacing: -1 },
  statLabel:         { fontSize: 12, color: '#94A3B8', marginTop: 4, lineHeight: 16 },
  lastCard:          { marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  lastCardLeft:      { flex: 1, gap: 4 },
  lastCondition:     { fontSize: 16, fontWeight: '700', color: '#1B3A5C' },
  lastDate:          { fontSize: 12, color: '#94A3B8' },
  lastConf:          { fontSize: 12, color: '#64748B' },
  riskPill:          { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginLeft: 12 },
  riskPillText:      { color: '#fff', fontSize: 11, fontWeight: '700' },
  shortcuts:         { flexDirection: 'row', paddingHorizontal: 20, gap: 12 },
  shortcut:          { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  shortcutIcon:      { fontSize: 24, marginBottom: 8 },
  shortcutLabel:     { fontSize: 12, fontWeight: '600', color: '#1B3A5C', textAlign: 'center' },
  tipsRow:           { paddingLeft: 20 },
  tipCard:           { backgroundColor: '#fff', borderRadius: 16, padding: 16, width: 160, marginRight: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  tipIcon:           { fontSize: 28, marginBottom: 8 },
  tipTitle:          { fontSize: 13, fontWeight: '700', color: '#1B3A5C', marginBottom: 4 },
  tipText:           { fontSize: 12, color: '#64748B', lineHeight: 17 },
  disclaimer:        { marginHorizontal: 20, marginTop: 24, backgroundColor: '#EEF6FF', borderRadius: 14, padding: 14 },
  disclaimerText:    { fontSize: 12, color: '#2B6CB0', textAlign: 'center', lineHeight: 18 },
  bottomNav:         { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingBottom: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 8 },
  navItem:           { alignItems: 'center', flex: 1 },
  navIcon:           { fontSize: 20 },
  navLabel:          { fontSize: 10, color: '#94A3B8', marginTop: 2, fontWeight: '500' },
  navActive:         {},
  navActiveLabel:    { color: '#1B3A5C', fontWeight: '700' },
  navScanBtn:        { width: 56, height: 56, borderRadius: 28, backgroundColor: '#1B3A5C', alignItems: 'center', justifyContent: 'center', marginBottom: 10, shadowColor: '#1B3A5C', shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  navScanIcon:       { color: '#fff', fontSize: 28, fontWeight: '300', marginTop: -2 },
});
