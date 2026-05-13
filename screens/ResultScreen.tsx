import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, Alert, TouchableOpacity,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { RiskBadge } from '../components/RiskBadge';
import { AnalysisAPI, AnalysisResult } from '../services/api';

interface Props { result: AnalysisResult; onBack: () => void; onNewScan: () => void; onHistory: () => void; }

export function ResultScreen({ result, onBack, onNewScan, onHistory }: Props) {
  const [feedbackSent, setFeedbackSent] = useState(false);

  const sendFeedback = async (correct: boolean) => {
    try {
      await AnalysisAPI.feedback(result.id, correct);
      setFeedbackSent(true);
      Alert.alert('Obrigado!', 'Seu feedback ajuda a melhorar o sistema.');
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar o feedback.');
    }
  };

  const riskColor = result.risk_level === 'high' ? Colors.danger
                  : result.risk_level === 'medium' ? Colors.warning
                  : Colors.success;

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Resultado" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Card de risco */}
        <View style={[styles.riskCard, { borderColor: riskColor }]}>
          <RiskBadge risk={result.risk_level} size="lg" />
          <Text style={styles.confidence}>Confiança: {result.confidence.toFixed(1)}%</Text>
          <View style={styles.confBar}>
            <View style={[styles.confFill, { width: `${result.confidence}%`, backgroundColor: riskColor }]} />
          </View>
        </View>

        {/* Condição */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>CONDIÇÃO IDENTIFICADA</Text>
          <Text style={styles.condition}>{result.condition}</Text>
          <Text style={styles.description}>{result.description}</Text>
        </View>

        {/* Recomendação */}
        <View style={[styles.card, result.risk_level === 'high' && styles.cardDanger]}>
          <Text style={styles.cardLabel}>⚕️ RECOMENDAÇÃO</Text>
          <Text style={styles.recommendation}>{result.recommendation}</Text>
        </View>

        {/* Aviso legal */}
        <View style={styles.legal}>
          <Text style={styles.legalText}>
            ⚠️ Este resultado é gerado por Inteligência Artificial e tem caráter informativo.
            Não substitui o diagnóstico de um médico ou dermatologista.
          </Text>
        </View>

        {/* Feedback */}
        {!feedbackSent ? (
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackTitle}>O resultado foi correto?</Text>
            <View style={styles.feedbackRow}>
              <TouchableOpacity style={[styles.fbBtn, styles.fbYes]} onPress={() => sendFeedback(true)}>
                <Text style={styles.fbText}>👍  Sim</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.fbBtn, styles.fbNo]} onPress={() => sendFeedback(false)}>
                <Text style={styles.fbText}>👎  Não</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.feedbackSent}>
            <Text style={styles.feedbackSentText}>✅ Feedback enviado! Obrigado.</Text>
          </View>
        )}

        <Button title="🔬  Nova Análise"   onPress={onNewScan} />
        <Button title="📋  Ver Histórico"  onPress={onHistory} variant="outline" />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: Colors.background },
  scroll:          { padding: 24, gap: 16 },
  riskCard:        { backgroundColor: Colors.white, borderRadius: 20, padding: 24,
                     alignItems: 'center', borderWidth: 2, gap: 12,
                     shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  confidence:      { fontSize: 15, color: Colors.textLight },
  confBar:         { width: '100%', height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden' },
  confFill:        { height: '100%', borderRadius: 4 },
  card:            { backgroundColor: Colors.white, borderRadius: 16, padding: 20,
                     borderWidth: 1, borderColor: Colors.border, gap: 8 },
  cardDanger:      { borderColor: Colors.danger, borderWidth: 2 },
  cardLabel:       { fontSize: 11, fontWeight: '700', color: Colors.textLight,
                     textTransform: 'uppercase', letterSpacing: 1 },
  condition:       { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  description:     { fontSize: 14, color: Colors.textLight, lineHeight: 21 },
  recommendation:  { fontSize: 15, color: Colors.text, lineHeight: 22 },
  legal:           { backgroundColor: '#FFF3CD', borderRadius: 14, padding: 16 },
  legalText:       { fontSize: 12, color: '#856404', textAlign: 'center', lineHeight: 18 },
  feedbackBox:     { backgroundColor: Colors.white, borderRadius: 16, padding: 20,
                     borderWidth: 1, borderColor: Colors.border, alignItems: 'center', gap: 12 },
  feedbackTitle:   { fontSize: 15, fontWeight: '600', color: Colors.text },
  feedbackRow:     { flexDirection: 'row', gap: 12, width: '100%' },
  fbBtn:           { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
  fbYes:           { backgroundColor: '#D1FAE5' },
  fbNo:            { backgroundColor: '#FEE2E2' },
  fbText:          { fontSize: 15, fontWeight: '600', color: Colors.text },
  feedbackSent:    { backgroundColor: '#D1FAE5', borderRadius: 14, padding: 16, alignItems: 'center' },
  feedbackSentText:{ fontSize: 14, color: '#065F46', fontWeight: '600' },
});