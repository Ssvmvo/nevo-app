import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, TextInput, RefreshControl, Alert,
} from 'react-native';
import { HistoryAPI, AnalysisResult } from '../services/api';

interface Props {
  onBack: () => void;
  onResult?: (r: AnalysisResult) => void;
}

const TRADUCOES: Record<string, string> = {
  'melanoma':                'Melanoma',
  'nevus':                   'Nevo Benigno',
  'basal cell carcinoma':    'Carcinoma Basocelular',
  'dermatofibroma':          'Dermatofibroma',
  'actinic keratosis':       'Queratose Actínica',
  'seborrheic keratosis':    'Ceratose Seborreica',
  'benign keratosis':        'Ceratose Benigna',
  'squamous cell carcinoma': 'Carcinoma Espinocelular',
  'vascular lesion':         'Lesão Vascular',
};

function traduzir(c: string) {
  return TRADUCOES[c.toLowerCase().trim()] || c;
}

const RISK_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  low:    { label: 'Baixo Risco',    color: '#059669', bg: '#ECFDF5' },
  medium: { label: 'Risco Moderado', color: '#D97706', bg: '#FFFBEB' },
  high:   { label: 'Alto Risco',     color: '#DC2626', bg: '#FEF2F2' },
};

type Filter = 'all' | 'low' | 'medium' | 'high';

export function HistoryScreen({ onBack, onResult }: Props) {
  const [analyses, setAnalyses]     = useState<AnalysisResult[]>([]);
  const [filtered, setFiltered]     = useState<AnalysisResult[]>([]);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState<Filter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading]       = useState(true);

  useEffect(() => { load(); }, []);
  useEffect(() => { applyFilters(); }, [search, filter, analyses]);

  const load = async () => {
    try {
      const data = await HistoryAPI.list();
      setAnalyses(data ?? []);
    } catch {} finally { setLoading(false); }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let result = [...analyses];
    if (filter !== 'all') result = result.filter(a => a.risk_level === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        traduzir(a.condition).toLowerCase().includes(q) ||
        a.condition.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  };

  const deleteItem = (id: number) => {
    Alert.alert('Excluir análise', 'Tem certeza que deseja excluir esta análise?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try {
          await HistoryAPI.delete(id);
          setAnalyses(prev => prev.filter(a => a.id !== id));
        } catch {}
      }}
    ]);
  };

  const stats = {
    total:  analyses.length,
    high:   analyses.filter(a => a.risk_level === 'high').length,
    medium: analyses.filter(a => a.risk_level === 'medium').length,
    low:    analyses.filter(a => a.risk_level === 'low').length,
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch { return ''; }
  };

  const renderItem = ({ item }: { item: AnalysisResult }) => {
    const rc = RISK_CONFIG[item.risk_level] ?? RISK_CONFIG.low;
    return (
      <TouchableOpacity
        style={s.card}
        onPress={() => onResult?.(item)}
        onLongPress={() => deleteItem(item.id)}
        activeOpacity={0.85}
      >
        {/* Indicador de cor */}
        <View style={[s.cardAccent, { backgroundColor: rc.color }]} />

        <View style={s.cardContent}>
          <View style={s.cardTop}>
            <View style={s.cardTitleRow}>
              <Text style={s.cardCondition}>{traduzir(item.condition)}</Text>
              <View style={[s.riskBadge, { backgroundColor: rc.bg }]}>
                <Text style={[s.riskBadgeText, { color: rc.color }]}>{rc.label}</Text>
              </View>
            </View>
            <Text style={s.cardDate}>{formatDate(item.created_at)}</Text>
          </View>

          <View style={s.cardBottom}>
            <View style={s.confRow}>
              <Text style={s.confLabel}>Confiança</Text>
              <View style={s.confBarBg}>
                <View style={[s.confBarFill, {
                  width: `${item.confidence ?? 0}%` as any,
                  backgroundColor: rc.color
                }]} />
              </View>
              <Text style={[s.confValue, { color: rc.color }]}>
                {(item.confidence ?? 0).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        <Text style={s.cardArrow}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Histórico</Text>
        <Text style={s.headerCount}>{analyses.length} análises</Text>
      </View>

      {/* Mini stats */}
      <View style={s.miniStats}>
        <View style={s.miniStat}>
          <Text style={s.miniStatNum}>{stats.total}</Text>
          <Text style={s.miniStatLabel}>Total</Text>
        </View>
        <View style={[s.miniStatDivider]} />
        <View style={s.miniStat}>
          <Text style={[s.miniStatNum, { color: '#DC2626' }]}>{stats.high}</Text>
          <Text style={s.miniStatLabel}>Alto</Text>
        </View>
        <View style={s.miniStatDivider} />
        <View style={s.miniStat}>
          <Text style={[s.miniStatNum, { color: '#D97706' }]}>{stats.medium}</Text>
          <Text style={s.miniStatLabel}>Moderado</Text>
        </View>
        <View style={s.miniStatDivider} />
        <View style={s.miniStat}>
          <Text style={[s.miniStatNum, { color: '#059669' }]}>{stats.low}</Text>
          <Text style={s.miniStatLabel}>Baixo</Text>
        </View>
      </View>

      {/* Busca */}
      <View style={s.searchBox}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Buscar por condição..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={s.searchClear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros */}
      <View style={s.filters}>
        {([['all','Todos'],['high','Alto'],['medium','Moderado'],['low','Baixo']] as [Filter,string][]).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[s.filterBtn, filter === key && s.filterBtnActive]}
            onPress={() => setFilter(key)}
            activeOpacity={0.8}
          >
            <Text style={[s.filterBtnText, filter === key && s.filterBtnTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      {loading ? (
        <View style={s.empty}>
          <Text style={s.emptyText}>Carregando...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>{analyses.length === 0 ? '🔬' : '🔍'}</Text>
          <Text style={s.emptyTitle}>
            {analyses.length === 0 ? 'Nenhuma análise ainda' : 'Nenhum resultado encontrado'}
          </Text>
          <Text style={s.emptyText}>
            {analyses.length === 0
              ? 'Realize sua primeira análise para ver o histórico aqui.'
              : 'Tente outros termos de busca ou remova os filtros.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1B3A5C" />}
        />
      )}

      <Text style={s.hint}>Pressione e segure para excluir uma análise</Text>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: '#F0F4F8' },
  header:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  backBtn:           { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  backIcon:          { fontSize: 18, color: '#1B3A5C' },
  headerTitle:       { fontSize: 18, fontWeight: '800', color: '#1B3A5C' },
  headerCount:       { fontSize: 13, color: '#94A3B8', fontWeight: '500' },
  miniStats:         { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  miniStat:          { flex: 1, alignItems: 'center' },
  miniStatNum:       { fontSize: 20, fontWeight: '800', color: '#1B3A5C' },
  miniStatLabel:     { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  miniStatDivider:   { width: 1, backgroundColor: '#F1F5F9', marginVertical: 4 },
  searchBox:         { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12, gap: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  searchIcon:        { fontSize: 16 },
  searchInput:       { flex: 1, fontSize: 14, color: '#1B3A5C', padding: 0 },
  searchClear:       { fontSize: 14, color: '#94A3B8', paddingHorizontal: 4 },
  filters:           { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 12 },
  filterBtn:         { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0' },
  filterBtnActive:   { backgroundColor: '#1B3A5C', borderColor: '#1B3A5C' },
  filterBtnText:     { fontSize: 13, fontWeight: '600', color: '#64748B' },
  filterBtnTextActive:{ color: '#fff' },
  list:              { paddingHorizontal: 20, paddingBottom: 24, gap: 10 },
  card:              { backgroundColor: '#fff', borderRadius: 16, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardAccent:        { width: 4, alignSelf: 'stretch' },
  cardContent:       { flex: 1, padding: 14, gap: 8 },
  cardTop:           { gap: 3 },
  cardTitleRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardCondition:     { fontSize: 15, fontWeight: '700', color: '#1B3A5C', flex: 1 },
  riskBadge:         { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  riskBadgeText:     { fontSize: 11, fontWeight: '700' },
  cardDate:          { fontSize: 12, color: '#94A3B8' },
  cardBottom:        {},
  confRow:           { flexDirection: 'row', alignItems: 'center', gap: 8 },
  confLabel:         { fontSize: 11, color: '#94A3B8', width: 60 },
  confBarBg:         { flex: 1, height: 4, backgroundColor: '#F1F5F9', borderRadius: 2, overflow: 'hidden' },
  confBarFill:       { height: '100%', borderRadius: 2 },
  confValue:         { fontSize: 12, fontWeight: '700', width: 40, textAlign: 'right' },
  cardArrow:         { fontSize: 22, color: '#CBD5E1', paddingHorizontal: 12 },
  empty:             { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyEmoji:        { fontSize: 48 },
  emptyTitle:        { fontSize: 18, fontWeight: '700', color: '#1B3A5C', textAlign: 'center' },
  emptyText:         { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 20 },
  hint:              { textAlign: 'center', fontSize: 11, color: '#CBD5E1', paddingVertical: 8 },
});
