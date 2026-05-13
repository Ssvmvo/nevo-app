import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, Alert, RefreshControl,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Header } from '../components/Header';
import { RiskBadge } from '../components/RiskBadge';
import { HistoryAPI, AnalysisResult } from '../services/api';

interface Props { onBack: () => void; }

export function HistoryScreen({ onBack }: Props) {
  const [items, setItems]         = useState<AnalysisResult[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await HistoryAPI.list();
      setItems(data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar o histórico.');
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (id: number) => {
    Alert.alert('Excluir', 'Deseja remover esta análise?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try {
          await HistoryAPI.delete(id);
          setItems(prev => prev.filter(i => i.id !== id));
        } catch { Alert.alert('Erro', 'Não foi possível excluir.'); }
      }},
    ]);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Histórico" onBack={onBack} />
      <FlatList
        data={items}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[Colors.primary]} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>Nenhuma análise realizada ainda.</Text>
              <Text style={styles.emptyHint}>Vá para "Nova Análise" para começar.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onLongPress={() => handleDelete(item.id)} activeOpacity={0.8}>
            <View style={styles.cardLeft}>
              <Text style={styles.condition}>{item.condition}</Text>
              <Text style={styles.date}>{formatDate(item.created_at)}</Text>
              <Text style={styles.confidence}>Confiança: {item.confidence.toFixed(1)}%</Text>
            </View>
            <RiskBadge risk={item.risk_level} />
          </TouchableOpacity>
        )}
      />
      {items.length > 0 && (
        <View style={styles.hint}>
          <Text style={styles.hintText}>Segure um item para excluir</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.background },
  list:       { padding: 20, gap: 12, flexGrow: 1 },
  card:       { backgroundColor: Colors.white, borderRadius: 16, padding: 18,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                borderWidth: 1, borderColor: Colors.border,
                shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardLeft:   { flex: 1, gap: 4 },
  condition:  { fontSize: 16, fontWeight: '600', color: Colors.text },
  date:       { fontSize: 12, color: Colors.textLight },
  confidence: { fontSize: 12, color: Colors.textLight },
  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyIcon:  { fontSize: 52 },
  emptyText:  { fontSize: 18, color: Colors.text, fontWeight: '500' },
  emptyHint:  { fontSize: 14, color: Colors.textLight },
  hint:       { padding: 12, alignItems: 'center' },
  hintText:   { fontSize: 12, color: Colors.textLight },
});