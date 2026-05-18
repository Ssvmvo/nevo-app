import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, Animated, TouchableOpacity, Image,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Header } from '../components/Header';
import { AnalysisAPI, AnalysisResult } from '../services/api';

interface Props {
  result: AnalysisResult;
  image?: string | null;
  onBack: () => void;
  onNewScan: () => void;
  onHistory: () => void;
}

const RISK_CONFIG = {
  low: {
    label:      'Baixo Risco',
    color:      '#059669',
    bg:         '#ECFDF5',
    border:     '#A7F3D0',
    barColor:   '#10B981',
  },
  medium: {
    label:      'Risco Moderado',
    color:      '#D97706',
    bg:         '#FFFBEB',
    border:     '#FDE68A',
    barColor:   '#F59E0B',
  },
  high: {
    label:      'Alto Risco',
    color:      '#DC2626',
    bg:         '#FEF2F2',
    border:     '#FECACA',
    barColor:   '#EF4444',
  },
};

export function ResultScreen({ result, image, onBack, onNewScan, onHistory }: Props) {
  const [feedbackSent, setFeedbackSent] = useState(false);
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const slideAnim   = useRef(new Animated.Value(30)).current;
  const checkAnim   = useRef(new Animated.Value(0)).current;
  const confAnim    = useRef(new Animated.Value(0)).current;

  const risk   = result?.risk_level ?? 'low';
  const config = RISK_CONFIG[risk as keyof typeof RISK_CONFIG] ?? RISK_CONFIG.low;
  const conf   = result?.confidence ?? 0;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.timing(checkAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      Animated.timing(confAnim,  { toValue: conf / 100, duration: 1200, useNativeDriver: false }).start();
    }, 300);
  }, []);

  const confWidth = confAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
  });

  const sendFeedback = async (correct: boolean) => {
    try {
      await AnalysisAPI.feedback(result.id, correct);
      setFeedbackSent(true);
    } catch {
      setFeedbackSent(true);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return ''; }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Resultado" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Badge de sucesso */}
        <Animated.View style={[styles.successBadge, { opacity: checkAnim }]}>
          <View style={styles.successDot} />
          <Text style={styles.successText}>Imagem analisada com sucesso</Text>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Preview da imagem + badge de risco */}
          {image && (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: image }} style={styles.image} />
              <View style={[styles.riskOverlayBadge, { backgroundColor: config.color }]}>
                <Text style={styles.riskOverlayText}>{config.label}</Text>
              </View>
            </View>
          )}

          {/* Card principal de risco */}
          <View style={[styles.riskCard, { backgroundColor: config.bg, borderColor: config.border }]}>
            <View style={styles.riskHeader}>
              <View style={[styles.riskBadge, { backgroundColor: config.color }]}>
                <Text style={styles.riskBadgeText}>{config.label}</Text>
              </View>
              <Text style={[styles.riskDate, { color: config.color }]}>
                {formatDate(result?.created_at ?? '')}
              </Text>
            </View>

            <Text style={[styles.conditionName, { color: config.color }]}>
              {result?.condition ?? 'Não identificado'}
            </Text>

            {/* Barra de confiança */}
            <View style={styles.confSection}>
              <View style={styles.confLabelRow}>
                <Text style={styles.confLabel}>Confiança do modelo</Text>
                <Text style={[styles.confValue, { color: config.color }]}>
                  {conf.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.confBarBg}>
                <Animated.View
                  style={[styles.confBarFill, { width: confWidth, backgroundColor: config.barColor }]}
                />
              </View>
              <Text style={styles.confHint}>
                {conf >= 80 ? 'Alta confiança' : conf >= 60 ? 'Confiança moderada' : 'Confiança baixa — interprete com cautela'}
              </Text>
            </View>
          </View>

          {/* Descrição */}
          {result?.description ? (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Sobre a condição</Text>
              <Text style={styles.infoText}>{result.description}</Text>
            </View>
          ) : null}

          {/* Recomendação */}
          {result?.recommendation ? (
            <View style={[styles.infoCard, styles.recCard, { borderLeftColor: config.color }]}>
              <Text style={styles.infoLabel}>Recomendação</Text>
              <Text style={styles.infoText}>{result.recommendation}</Text>
            </View>
          ) : null}

          {/* Alerta alto risco */}
          {risk === 'high' && (
            <View style={styles.alertCard}>
              <Text style={styles.alertTitle}>Atenção — Risco Elevado</Text>
              <Text style={styles.alertText}>
                Esta análise indica características que requerem avaliação médica urgente.
                Procure um dermatologista o quanto antes.
              </Text>
            </View>
          )}

          {/* Aviso legal */}
          <View style={styles.legalCard}>
            <Text style={styles.legalText}>
              Este resultado é gerado por Inteligência Artificial e tem caráter informativo.
              Não substitui o diagnóstico de um médico ou dermatologista.
            </Text>
          </View>

          {/* Feedback */}
          {!feedbackSent ? (
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackTitle}>O resultado foi correto?</Text>
              <Text style={styles.feedbackSubtitle}>Seu feedback melhora o modelo</Text>
              <View style={styles.feedbackRow}>
                <TouchableOpacity
                  style={[styles.fbBtn, styles.fbYes]}
                  onPress={() => sendFeedback(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.fbBtnText}>Sim, correto</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.fbBtn, styles.fbNo]}
                  onPress={() => sendFeedback(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.fbBtnText}>Não, incorreto</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.feedbackSent}>
              <Text style={styles.feedbackSentText}>Obrigado pelo feedback!</Text>
            </View>
          )}

          {/* Ações */}
          <TouchableOpacity style={styles.primaryBtn} onPress={onNewScan} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Nova Análise</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={onHistory} activeOpacity={0.85}>
            <Text style={styles.secondaryBtnText}>Ver Histórico</Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: Colors.background },
  scroll:            { padding: 20, gap: 14, paddingBottom: 40 },

  successBadge:      { flexDirection: 'row', alignItems: 'center', gap: 8,
                       backgroundColor: '#ECFDF5', borderRadius: 20, paddingHorizontal: 14,
                       paddingVertical: 8, alignSelf: 'flex-start',
                       borderWidth: 1, borderColor: '#A7F3D0' },
  successDot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: '#059669' },
  successText:       { fontSize: 13, color: '#059669', fontWeight: '600' },

  imageWrapper:      { borderRadius: 20, overflow: 'hidden', position: 'relative',
                       shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  image:             { width: '100%', height: 220 },
  riskOverlayBadge:  { position: 'absolute', bottom: 12, right: 12,
                       paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  riskOverlayText:   { color: '#fff', fontSize: 12, fontWeight: '700' },

  riskCard:          { borderRadius: 20, padding: 20, borderWidth: 1.5, gap: 14 },
  riskHeader:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  riskBadge:         { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  riskBadgeText:     { color: '#fff', fontSize: 13, fontWeight: '700' },
  riskDate:          { fontSize: 11, opacity: 0.7 },
  conditionName:     { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },

  confSection:       { gap: 6 },
  confLabelRow:      { flexDirection: 'row', justifyContent: 'space-between' },
  confLabel:         { fontSize: 12, color: Colors.textLight, fontWeight: '500' },
  confValue:         { fontSize: 13, fontWeight: '700' },
  confBarBg:         { height: 6, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 3, overflow: 'hidden' },
  confBarFill:       { height: '100%', borderRadius: 3 },
  confHint:          { fontSize: 11, color: Colors.textLight },

  infoCard:          { backgroundColor: Colors.white, borderRadius: 16, padding: 18, gap: 8,
                       borderWidth: 1, borderColor: Colors.border },
  recCard:           { borderLeftWidth: 4, borderLeftColor: Colors.primary },
  infoLabel:         { fontSize: 11, fontWeight: '700', color: Colors.textLight,
                       textTransform: 'uppercase', letterSpacing: 0.8 },
  infoText:          { fontSize: 14, color: Colors.text, lineHeight: 22 },

  alertCard:         { backgroundColor: '#FEF2F2', borderRadius: 16, padding: 18, gap: 8,
                       borderWidth: 1.5, borderColor: '#FECACA' },
  alertTitle:        { fontSize: 15, fontWeight: '700', color: '#DC2626' },
  alertText:         { fontSize: 13, color: '#B91C1C', lineHeight: 20 },

  legalCard:         { backgroundColor: '#EEF6FF', borderRadius: 14, padding: 14 },
  legalText:         { fontSize: 12, color: '#2B6CB0', textAlign: 'center', lineHeight: 18 },

  feedbackCard:      { backgroundColor: Colors.white, borderRadius: 16, padding: 18,
                       borderWidth: 1, borderColor: Colors.border, gap: 4 },
  feedbackTitle:     { fontSize: 15, fontWeight: '700', color: Colors.text },
  feedbackSubtitle:  { fontSize: 12, color: Colors.textLight, marginBottom: 8 },
  feedbackRow:       { flexDirection: 'row', gap: 10 },
  fbBtn:             { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
  fbYes:             { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0' },
  fbNo:              { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  fbBtnText:         { fontSize: 13, fontWeight: '600', color: Colors.text },

  feedbackSent:      { backgroundColor: '#ECFDF5', borderRadius: 14, padding: 14, alignItems: 'center' },
  feedbackSentText:  { fontSize: 14, color: '#059669', fontWeight: '600' },

  primaryBtn:        { backgroundColor: Colors.primary, borderRadius: 14, padding: 16,
                       alignItems: 'center' },
  primaryBtnText:    { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondaryBtn:      { backgroundColor: Colors.white, borderRadius: 14, padding: 15,
                       alignItems: 'center', borderWidth: 1.5, borderColor: Colors.primary },
  secondaryBtnText:  { color: Colors.primary, fontSize: 15, fontWeight: '600' },
});
