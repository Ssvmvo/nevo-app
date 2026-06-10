import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Switch, TextInput, Alert,
} from 'react-native';

interface Props { onBack: () => void; }

export function SettingsScreen({ onBack }: Props) {
  const [notifAcomp,    setNotifAcomp]    = useState(true);
  const [notifNews,     setNotifNews]     = useState(false);
  const [darkMode,      setDarkMode]      = useState(false);

  const handleSaveAccount = () => {
    Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Configurações</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* CONTA */}
        <Text style={s.sectionTitle}>Conta</Text>
        <View style={s.card}>
          <View style={s.inputGroup}>
            <Text style={s.inputLabel}>Nome completo</Text>
            <TextInput style={s.input} placeholder="Seu nome" placeholderTextColor="#94A3B8" />
          </View>
          <View style={[s.inputGroup, s.inputBorder]}>
            <Text style={s.inputLabel}>E-mail</Text>
            <TextInput style={s.input} placeholder="seu@email.com" placeholderTextColor="#94A3B8" keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View style={[s.inputGroup, s.inputBorder]}>
            <Text style={s.inputLabel}>Nova senha</Text>
            <TextInput style={s.input} placeholder="Nova senha" placeholderTextColor="#94A3B8" secureTextEntry />
          </View>
          <View style={[s.inputGroup, s.inputBorder]}>
            <Text style={s.inputLabel}>Confirmar senha</Text>
            <TextInput style={s.input} placeholder="Confirmar senha" placeholderTextColor="#94A3B8" secureTextEntry />
          </View>
          <TouchableOpacity style={s.saveBtn} onPress={handleSaveAccount} activeOpacity={0.85}>
            <Text style={s.saveBtnText}>Salvar alterações</Text>
          </TouchableOpacity>
        </View>

        {/* NOTIFICAÇÕES */}
        <Text style={s.sectionTitle}>Notificações</Text>
        <View style={s.card}>
          <View style={s.toggleRow}>
            <View style={s.toggleInfo}>
              <Text style={s.toggleLabel}>Lembretes de acompanhamento</Text>
              <Text style={s.toggleSub}>Receba lembretes para consultas periódicas</Text>
            </View>
            <Switch
              value={notifAcomp}
              onValueChange={setNotifAcomp}
              trackColor={{ false: '#E2E8F0', true: '#1B3A5C' }}
              thumbColor="#fff"
            />
          </View>
          <View style={[s.toggleRow, s.toggleBorder]}>
            <View style={s.toggleInfo}>
              <Text style={s.toggleLabel}>Novas funcionalidades</Text>
              <Text style={s.toggleSub}>Alertas sobre atualizações do aplicativo</Text>
            </View>
            <Switch
              value={notifNews}
              onValueChange={setNotifNews}
              trackColor={{ false: '#E2E8F0', true: '#1B3A5C' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* APARÊNCIA */}
        <Text style={s.sectionTitle}>Aparência</Text>
        <View style={s.card}>
          <View style={s.toggleRow}>
            <View style={s.toggleInfo}>
              <Text style={s.toggleLabel}>Tema escuro</Text>
              <Text style={s.toggleSub}>Ativar modo escuro no aplicativo</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#E2E8F0', true: '#1B3A5C' }}
              thumbColor="#fff"
            />
          </View>
          <View style={[s.themeRow, s.toggleBorder]}>
            <TouchableOpacity style={[s.themeBtn, !darkMode && s.themeBtnActive]} onPress={() => setDarkMode(false)} activeOpacity={0.8}>
              <Text style={s.themeIcon}>☀️</Text>
              <Text style={[s.themeLabel, !darkMode && s.themeLabelActive]}>Claro</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.themeBtn, darkMode && s.themeBtnActive]} onPress={() => setDarkMode(true)} activeOpacity={0.8}>
              <Text style={s.themeIcon}>🌙</Text>
              <Text style={[s.themeLabel, darkMode && s.themeLabelActive]}>Escuro</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PRIVACIDADE */}
        <Text style={s.sectionTitle}>Privacidade</Text>
        <View style={s.card}>
          {[['🔒','Política de privacidade'],['📄','Termos de uso'],['🗑️','Excluir minha conta']].map(([icon, label], i) => (
            <TouchableOpacity
              key={i}
              style={[s.menuItem, i > 0 && s.menuBorder]}
              onPress={() => label === 'Excluir minha conta' && Alert.alert('Excluir conta', 'Funcionalidade disponível em breve.')}
              activeOpacity={0.7}
            >
              <Text style={s.menuIcon}>{icon}</Text>
              <Text style={[s.menuLabel, label === 'Excluir minha conta' && { color: '#DC2626' }]}>{label}</Text>
              <Text style={s.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SISTEMA */}
        <Text style={s.sectionTitle}>Sistema</Text>
        <View style={s.card}>
          {[
            ['📱','Versão do aplicativo','v2.0.0'],
            ['🤖','Modelo de IA','MobileNetV2 · ISIC Archive'],
            ['📧','Contato','nevo@suporte.com'],
            ['🎓','Sobre o projeto','TCC · Ciência da Computação · 2026'],
          ].map(([icon, label, value], i) => (
            <View key={i} style={[s.infoRow, i > 0 && s.menuBorder]}>
              <Text style={s.menuIcon}>{icon}</Text>
              <View style={s.infoContent}>
                <Text style={s.infoLabel}>{label}</Text>
                <Text style={s.infoValue}>{value}</Text>
              </View>
            </View>
          ))}
        </View>

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
  scroll:          { padding: 20, paddingBottom: 40 },
  sectionTitle:    { fontSize: 13, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 20 },
  card:            { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  inputGroup:      { paddingHorizontal: 16, paddingVertical: 12 },
  inputBorder:     { borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  inputLabel:      { fontSize: 12, fontWeight: '600', color: '#94A3B8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:           { fontSize: 15, color: '#1B3A5C', padding: 0 },
  saveBtn:         { margin: 16, backgroundColor: '#1B3A5C', borderRadius: 12, padding: 14, alignItems: 'center' },
  saveBtnText:     { color: '#fff', fontSize: 14, fontWeight: '700' },
  toggleRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  toggleBorder:    { borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  toggleInfo:      { flex: 1, gap: 2 },
  toggleLabel:     { fontSize: 15, fontWeight: '600', color: '#1B3A5C' },
  toggleSub:       { fontSize: 12, color: '#94A3B8' },
  themeRow:        { flexDirection: 'row', padding: 12, gap: 8 },
  themeBtn:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderRadius: 10, backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0' },
  themeBtnActive:  { backgroundColor: '#EEF6FF', borderColor: '#1B3A5C' },
  themeIcon:       { fontSize: 16 },
  themeLabel:      { fontSize: 13, fontWeight: '600', color: '#64748B' },
  themeLabelActive:{ color: '#1B3A5C' },
  menuItem:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  menuBorder:      { borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  menuIcon:        { fontSize: 18, width: 24, textAlign: 'center' },
  menuLabel:       { flex: 1, fontSize: 15, color: '#1B3A5C', fontWeight: '500' },
  menuArrow:       { fontSize: 20, color: '#CBD5E1' },
  infoRow:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  infoContent:     { flex: 1 },
  infoLabel:       { fontSize: 14, fontWeight: '600', color: '#1B3A5C' },
  infoValue:       { fontSize: 12, color: '#94A3B8', marginTop: 2 },
});
