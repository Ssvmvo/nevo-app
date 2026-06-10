import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Animated, Image,
} from 'react-native';
import { AnalysisAPI, AnalysisResult } from '../services/api';

interface Props {
  result: AnalysisResult;
  image?: string | null;
  onBack: () => void;
  onNewScan: () => void;
  onHistory: () => void;
}

// Tradução das condições
const TRADUCOES: Record<string, string> = {
  'melanoma':                    'Melanoma',
  'nevus':                       'Nevo Benigno',
  'nevo benigno':                'Nevo Benigno',
  'basal cell carcinoma':        'Carcinoma Basocelular',
  'carcinoma basocelular':       'Carcinoma Basocelular',
  'dermatofibroma':              'Dermatofibroma',
  'actinic keratosis':           'Queratose Actínica',
  'queratose actínica':          'Queratose Actínica',
  'seborrheic keratosis':        'Ceratose Seborreica',
  'benign keratosis':            'Ceratose Benigna',
  'squamous cell carcinoma':     'Carcinoma Espinocelular',
  'vascular lesion':             'Lesão Vascular',
  'inconclusivo':                'Resultado Inconclusivo',
};

const DESCRICOES: Record<string, string> = {
  'melanoma':                'O melanoma é o tipo mais grave de câncer de pele. Origina-se nos melanócitos, células responsáveis pela pigmentação da pele. Pode se desenvolver em pintas existentes ou em pele normal. O diagnóstico precoce é fundamental para o sucesso do tratamento.',
  'nevo benigno':            'O nevo melanocítico, popularmente conhecido como "pinta", é uma lesão benigna formada por agrupamentos de melanócitos. Na grande maioria dos casos não representa risco à saúde, mas deve ser monitorado periodicamente.',
  'carcinoma basocelular':   'O carcinoma basocelular é o tipo mais comum de câncer de pele. Origina-se nas células basais da epiderme. Cresce lentamente e raramente se espalha para outras partes do corpo, mas requer tratamento adequado.',
  'dermatofibroma':          'O dermatofibroma é um nódulo benigno da pele, geralmente pequeno e firme. É mais comum nas pernas e costuma aparecer após pequenos traumas. Não requer tratamento na maioria dos casos, apenas acompanhamento.',
  'queratose actínica':      'A queratose actínica é uma lesão pré-maligna causada pela exposição crônica ao sol. Apresenta-se como manchas ásperas e escamosas. Requer atenção pois pode evoluir para carcinoma espinocelular se não tratada.',
  'ceratose seborreica':     'A ceratose seborreica é uma lesão benigna muito comum, especialmente em pessoas acima de 50 anos. Aparece como manchas escuras, verrucosas e com bordas bem definidas. Não tem relação com câncer de pele.',
  'carcinoma espinocelular': 'O carcinoma espinocelular é o segundo tipo mais comum de câncer de pele. Origina-se nas células escamosas da epiderme. Pode se disseminar para outros órgãos se não tratado precocemente.',
  'lesão vascular':          'As lesões vasculares são alterações nos vasos sanguíneos da pele. Podem incluir hemangiomas, manchas rubis e outras variações. A maioria é benigna, mas requer avaliação médica para diagnóstico preciso.',
  'resultado inconclusivo':  'Não foi possível identificar padrões com confiança suficiente para uma classificação. Isso pode ocorrer devido à qualidade da imagem, iluminação inadequada ou características atípicas da lesão.',
};

const RECOMENDACOES_DETALHADAS: Record<string, string> = {
  'low':    'Recomenda-se acompanhamento periódico com dermatologista (consulta anual) e autoexame mensal. Mantenha proteção solar diária e observe qualquer alteração na lesão.',
  'medium': 'Recomenda-se avaliação dermatológica para confirmação diagnóstica. Agende uma consulta nos próximos 30 dias. Não ignore alterações de cor, forma ou tamanho.',
  'high':   'Procure atendimento dermatológico o mais breve possível. Não adie esta consulta. O diagnóstico e tratamento precoce são fundamentais para o melhor prognóstico.',
};

const RISK_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; bar: string }> = {
  low:    { label: 'Baixo Risco',     color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', bar: '#10B981' },
  medium: { label: 'Risco Moderado',  color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', bar: '#F59E0B' },
  high:   { label: 'Alto Risco',      color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', bar: '#EF4444' },
};

function traduzir(condition: string): string {
  const lower = condition.toLowerCase().trim();
  return TRADUCOES[lower] || condition;
}

export function ResultScreen({ result, image, onBack, onNewScan, onHistory }: Props) {
  const [feedbackSent, setFeedbackSent] = useState(false);
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const confAnim  = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  const risk     = result?.risk_level ?? 'low';
  const config   = RISK_CONFIG[risk] ?? RISK_CONFIG.low;
  const conf     = result?.confidence ?? 0;
  const cond     = traduzir(result?.condition ?? '');
  const desc     = DESCRICOES[cond.toLowerCase()] || DESCRICOES[result?.condition?.toLowerCase() ?? ''] || 'Lesão identificada pelo sistema de Inteligência Artificial. Consulte um dermatologista para avaliação precisa.';
  const rec      = RECOMENDACOES_DETALHADAS[risk] ?? RECOMENDACOES_DETALHADAS.low;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      Animated.timing(checkAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      Animated.timing(confAnim,  { toValue: conf / 100, duration: 1400, useNativeDriver: false }).start();
    }, 400);
  }, []);

  const confWidth = confAnim.interpolate({ inputRange: [0,1], outputRange: ['0%','100%'] });

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return ''; }
  };

  const sendFeedback = async (correct: boolean) => {
    try { await AnalysisAPI.feedback(result.id, correct); } catch {}
    setFeedbackSent(true);
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
          <Text style={s.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Resultado</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Badge sucesso */}
        <Animated.View style={[s.successBadge, { opacity: checkAnim }]}>
          <View style={s.successDot} />
          <Text style={s.successText}>Análise concluída com sucesso</Text>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Preview da imagem */}
          {image && (
            <View style={s.imageWrapper}>
              <Image source={{ uri: image }} style={s.image} resizeMode="cover" />
              <View style={[s.imageBadge, { backgroundColor: config.color }]}>
                <Text style={s.imageBadgeText}>{config.label}</Text>
              </View>
            </View>
          )}

          {/* Card principal */}
          <View style={[s.riskCard, { backgroundColor: config.bg, borderColor: config.border }]}>
            <View style={s.riskCardHeader}>
              <View style={[s.riskBadge, { backgroundColor: config.color }]}>
                <Text style={s.riskBadgeText}>{config.label}</Text>
              </View>
              <Text style={[s.riskDate, { color: config.color }]}>
                {formatDate(result?.created_at ?? '')}
              </Text>
            </View>

            <Text style={[s.conditionName, { color: config.color }]}>{cond}</Text>

            {/* Barra de confiança */}
            <View style={s.confSection}>
              <View style={s.confLabelRow}>
                <Text style={s.confLabel}>Confiança do modelo</Text>
                <Text style={[s.confValue, { color: config.color }]}>{conf.toFixed(1)}%</Text>
              </View>
              <View style={s.confBarBg}>
                <Animated.View style={[s.confBarFill, { width: confWidth, backgroundColor: config.bar }]} />
              </View>
              <Text style={s.confHint}>
                {conf >= 80 ? 'Alta confiança' : conf >= 60 ? 'Confiança moderada' : 'Confiança baixa — interprete com cautela'}
              </Text>
            </View>
          </View>

          {/* O que é esta condição? */}
          <View style={s.infoCard}>
            <View style={s.infoCardHeader}>
              <View style={[s.infoCardDot, { backgroundColor: config.color }]} />
              <Text style={s.infoCardTitle}>O que é esta condição?</Text>
            </View>
            <Text style={s.infoCardText}>{desc}</Text>
          </View>

          {/* Recomendação */}
          <View style={[s.recCard, { borderLeftColor: config.color }]}>
            <Text style={s.recTitle}>Recomendação</Text>
            <Text style={s.recText}>{rec}</Text>
          </View>

          {/* Alerta alto risco */}
          {risk === 'high' && (
            <View style={s.alertCard}>
              <Text style={s.alertEmoji}>⚠️</Text>
              <View style={s.alertContent}>
                <Text style={s.alertTitle}>Atenção — Risco Elevado</Text>
                <Text style={s.alertText}>
                  Esta análise indica características que requerem avaliação médica urgente. Procure um dermatologista o quanto antes. Não adie esta consulta.
                </Text>
              </View>
            </View>
          )}

          {/* Importante */}
          <View style={s.importantCard}>
            <Text style={s.importantTitle}>Importante</Text>
            <Text style={s.importantText}>
              Este resultado é gerado por Inteligência Artificial com caráter exclusivamente informativo e de apoio diagnóstico. Não substitui a avaliação, diagnóstico ou tratamento de um médico ou dermatologista. Sempre consulte um profissional de saúde habilitado.
            </Text>
          </View>

          {/* Feedback */}
          {!feedbackSent ? (
            <View style={s.feedbackCard}>
              <Text style={s.feedbackTitle}>O resultado foi correto?</Text>
              <Text style={s.feedbackSub}>Seu feedback ajuda a melhorar o modelo</Text>
              <View style={s.feedbackRow}>
                <TouchableOpacity style={[s.fbBtn, s.fbYes]} onPress={() => sendFeedback(true)} activeOpacity={0.8}>
                  <Text style={s.fbBtnText}>👍  Sim, correto</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.fbBtn, s.fbNo]} onPress={() => sendFeedback(false)} activeOpacity={0.8}>
                  <Text style={s.fbBtnText}>👎  Não, incorreto</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={s.feedbackSent}>
              <Text style={s.feedbackSentText}>✓  Obrigado pelo seu feedback!</Text>
            </View>
          )}

          {/* Ações */}
          <TouchableOpacity style={s.primaryBtn} onPress={onNewScan} activeOpacity={0.85}>
            <Text style={s.primaryBtnText}>Nova Análise</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.secondaryBtn} onPress={onHistory} activeOpacity={0.85}>
            <Text style={s.secondaryBtnText}>Ver Histórico</Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: '#F0F4F8' },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, backgroundColor: '#F0F4F8' },
  backBtn:          { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backIcon:         { fontSize: 18, color: '#1B3A5C' },
  backText:         { fontSize: 15, color: '#1B3A5C', fontWeight: '600' },
  headerTitle:      { fontSize: 17, fontWeight: '700', color: '#1B3A5C' },
  scroll:           { padding: 20, gap: 14, paddingBottom: 40 },
  successBadge:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ECFDF5', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#A7F3D0' },
  successDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: '#059669' },
  successText:      { fontSize: 13, color: '#059669', fontWeight: '600' },
  imageWrapper:     { borderRadius: 20, overflow: 'hidden', position: 'relative', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  image:            { width: '100%', height: 220 },
  imageBadge:       { position: 'absolute', bottom: 12, right: 12, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  imageBadgeText:   { color: '#fff', fontSize: 12, fontWeight: '700' },
  riskCard:         { borderRadius: 20, padding: 20, borderWidth: 1.5, gap: 14 },
  riskCardHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  riskBadge:        { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  riskBadgeText:    { color: '#fff', fontSize: 13, fontWeight: '700' },
  riskDate:         { fontSize: 11, opacity: 0.7 },
  conditionName:    { fontSize: 24, fontWeight: '800', letterSpacing: -0.3 },
  confSection:      { gap: 6 },
  confLabelRow:     { flexDirection: 'row', justifyContent: 'space-between' },
  confLabel:        { fontSize: 12, color: '#64748B', fontWeight: '500' },
  confValue:        { fontSize: 13, fontWeight: '700' },
  confBarBg:        { height: 6, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 3, overflow: 'hidden' },
  confBarFill:      { height: '100%', borderRadius: 3 },
  confHint:         { fontSize: 11, color: '#94A3B8' },
  infoCard:         { backgroundColor: '#fff', borderRadius: 16, padding: 18, gap: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  infoCardHeader:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoCardDot:      { width: 10, height: 10, borderRadius: 5 },
  infoCardTitle:    { fontSize: 15, fontWeight: '700', color: '#1B3A5C' },
  infoCardText:     { fontSize: 14, color: '#475569', lineHeight: 22 },
  recCard:          { backgroundColor: '#fff', borderRadius: 16, padding: 18, gap: 8, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  recTitle:         { fontSize: 15, fontWeight: '700', color: '#1B3A5C' },
  recText:          { fontSize: 14, color: '#475569', lineHeight: 22 },
  alertCard:        { backgroundColor: '#FEF2F2', borderRadius: 16, padding: 18, flexDirection: 'row', gap: 12, borderWidth: 1.5, borderColor: '#FECACA' },
  alertEmoji:       { fontSize: 24 },
  alertContent:     { flex: 1, gap: 4 },
  alertTitle:       { fontSize: 15, fontWeight: '700', color: '#DC2626' },
  alertText:        { fontSize: 13, color: '#B91C1C', lineHeight: 20 },
  importantCard:    { backgroundColor: '#EEF6FF', borderRadius: 16, padding: 16, gap: 6 },
  importantTitle:   { fontSize: 13, fontWeight: '700', color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: 0.5 },
  importantText:    { fontSize: 12, color: '#2B6CB0', lineHeight: 18 },
  feedbackCard:     { backgroundColor: '#fff', borderRadius: 16, padding: 18, gap: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  feedbackTitle:    { fontSize: 15, fontWeight: '700', color: '#1B3A5C' },
  feedbackSub:      { fontSize: 12, color: '#94A3B8', marginBottom: 8 },
  feedbackRow:      { flexDirection: 'row', gap: 10 },
  fbBtn:            { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
  fbYes:            { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0' },
  fbNo:             { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  fbBtnText:        { fontSize: 13, fontWeight: '600', color: '#374151' },
  feedbackSent:     { backgroundColor: '#ECFDF5', borderRadius: 14, padding: 14, alignItems: 'center' },
  feedbackSentText: { fontSize: 14, color: '#059669', fontWeight: '600' },
  primaryBtn:       { backgroundColor: '#1B3A5C', borderRadius: 14, padding: 16, alignItems: 'center' },
  primaryBtnText:   { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondaryBtn:     { backgroundColor: '#fff', borderRadius: 14, padding: 15, alignItems: 'center', borderWidth: 1.5, borderColor: '#1B3A5C' },
  secondaryBtnText: { color: '#1B3A5C', fontSize: 15, fontWeight: '600' },
});
