import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Auth, HistoryAPI } from '../services/api';

interface Props {
  onBack: () => void;
  onLogout: () => void;
  onSettings: () => void;
}

export function ProfileScreen({ onBack, onLogout, onSettings }: Props) {
  const [user, setUser]   = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const u = await Auth.getStoredUser();
      setUser(u);
      const s = await HistoryAPI.stats();
      setStats(s);
    } catch {}
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja realmente sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => {
        await Auth.logout();
        onLogout();
      }}
    ]);
  };

  const firstName = user?.name?.split(' ')[0] || 'Usuário';
  const initials  = user?.name?.split(' ').map((n: string) => n[0]).slice(0,2).join('').toUpperCase() || 'U';
  const roleLabel = user?.role === 'professional' ? 'Profissional de Saúde' : 'Paciente';

  const menuSections = [
    {
      title: 'Conta',
      items: [
        { icon: '✏️', label: 'Editar perfil', onPress: () => {} },
        { icon: '🔑', label: 'Alterar senha', onPress: () => {} },
        { icon: '⚙️', label: 'Configurações', onPress: onSettings },
      ]
    },
    {
      title: 'Privacidade',
      items: [
        { icon: '🔒', label: 'Política de privacidade', onPress: () => {} },
        { icon: '📄', label: 'Termos de uso', onPress: () => {} },
      ]
    },
    {
      title: 'Suporte',
      items: [
        { icon: 'ℹ️', label: 'Sobre o Nevo', onPress: () => {} },
        { icon: '💬', label: 'Ajuda e suporte', onPress: () => {} },
      ]
    },
  ];

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Perfil</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Card do usuário */}
        <View style={s.profileCard}>
          <View style={s.avatarWrapper}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initials}</Text>
            </View>
            <View style={s.avatarBadge}>
              <Text style={s.avatarBadgeText}>
                {user?.role === 'professional' ? '⚕️' : '👤'}
              </Text>
            </View>
          </View>
          <Text style={s.profileName}>{user?.name || 'Usuário'}</Text>
          <Text style={s.profileEmail}>{user?.email || ''}</Text>
          <View style={s.roleBadge}>
            <Text style={s.roleBadgeText}>{roleLabel}</Text>
          </View>
        </View>

        {/* Estatísticas */}
        <Text style={s.sectionTitle}>Minhas Estatísticas</Text>
        <View style={s.statsGrid}>
          <View style={[s.statCard, { borderTopColor: '#1B3A5C' }]}>
            <Text style={s.statNum}>{stats?.total ?? 0}</Text>
            <Text style={s.statLabel}>Total de{'\n'}Análises</Text>
          </View>
          <View style={[s.statCard, { borderTopColor: '#DC2626' }]}>
            <Text style={[s.statNum, { color: '#DC2626' }]}>{stats?.by_risk?.high ?? 0}</Text>
            <Text style={s.statLabel}>Alto{'\n'}Risco</Text>
          </View>
          <View style={[s.statCard, { borderTopColor: '#D97706' }]}>
            <Text style={[s.statNum, { color: '#D97706' }]}>{stats?.by_risk?.medium ?? 0}</Text>
            <Text style={s.statLabel}>Risco{'\n'}Moderado</Text>
          </View>
          <View style={[s.statCard, { borderTopColor: '#059669' }]}>
            <Text style={[s.statNum, { color: '#059669' }]}>
              {stats?.avg_confidence ? `${stats.avg_confidence.toFixed(0)}%` : '--'}
            </Text>
            <Text style={s.statLabel}>Confiança{'\n'}Média</Text>
          </View>
        </View>

        {/* Menu */}
        {menuSections.map((section, si) => (
          <View key={si}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            <View style={s.menuCard}>
              {section.items.map((item, ii) => (
                <TouchableOpacity
                  key={ii}
                  style={[s.menuItem, ii < section.items.length - 1 && s.menuItemBorder]}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <Text style={s.menuIcon}>{item.icon}</Text>
                  <Text style={s.menuLabel}>{item.label}</Text>
                  <Text style={s.menuArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Sair */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={s.logoutIcon}>🚪</Text>
          <Text style={s.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        {/* Versão */}
        <Text style={s.version}>Nevo v2.0.0 · Ciência da Computação · 2026</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: '#F0F4F8' },
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  backBtn:         { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  backIcon:        { fontSize: 18, color: '#1B3A5C' },
  headerTitle:     { fontSize: 18, fontWeight: '800', color: '#1B3A5C' },
  scroll:          { padding: 20, paddingBottom: 40, gap: 0 },
  profileCard:     { backgroundColor: '#1B3A5C', borderRadius: 24, padding: 28, alignItems: 'center', marginBottom: 24, gap: 8 },
  avatarWrapper:   { position: 'relative', marginBottom: 4 },
  avatar:          { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  avatarText:      { color: '#fff', fontSize: 28, fontWeight: '800' },
  avatarBadge:     { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatarBadgeText: { fontSize: 14 },
  profileName:     { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  profileEmail:    { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  roleBadge:       { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  roleBadgeText:   { color: '#fff', fontSize: 12, fontWeight: '600' },
  sectionTitle:    { fontSize: 13, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 4 },
  statsGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  statCard:        { backgroundColor: '#fff', borderRadius: 14, padding: 14, flex: 1, minWidth: '44%', borderTopWidth: 3, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  statNum:         { fontSize: 24, fontWeight: '800', color: '#1B3A5C' },
  statLabel:       { fontSize: 11, color: '#94A3B8', marginTop: 2, lineHeight: 15 },
  menuCard:        { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  menuItem:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  menuItemBorder:  { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuIcon:        { fontSize: 18, width: 24, textAlign: 'center' },
  menuLabel:       { flex: 1, fontSize: 15, color: '#1B3A5C', fontWeight: '500' },
  menuArrow:       { fontSize: 20, color: '#CBD5E1' },
  logoutBtn:       { backgroundColor: '#FEF2F2', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#FECACA', marginBottom: 20 },
  logoutIcon:      { fontSize: 18 },
  logoutText:      { fontSize: 15, fontWeight: '700', color: '#DC2626' },
  version:         { textAlign: 'center', fontSize: 12, color: '#CBD5E1' },
});
