import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Image,
  ScrollView, Animated, TouchableOpacity, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';
import { Header } from '../components/Header';
import { AnalysisResult } from '../services/api';

const BASE_URL = 'https://tightwad-startup-womanlike.ngrok-free.dev';

interface Props { onBack: () => void; onResult: (r: AnalysisResult, img?: string) => void; }

type State = 'idle' | 'uploading' | 'analyzing' | 'error' | 'connection_error' | 'low_confidence';

const LOADING_TEXTS = [
  'Analisando padrões da pele...',
  'Aplicando IA dermatológica...',
  'Processando imagem...',
  'Verificando características da lesão...',
  'Extraindo features visuais...',
  'Classificando com MobileNetV2...',
];

const MOCK_RESULT: AnalysisResult = {
  id: 1,
  condition: 'Nevus',
  risk_level: 'low',
  confidence: 87.5,
  description: 'Nevo melanocítico benigno. Sem características suspeitas no momento.',
  recommendation: 'Acompanhe periodicamente. Consulte um dermatologista na próxima visita de rotina.',
  created_at: new Date().toISOString(),
};

export function ScanScreen({ onBack, onResult }: Props) {
  const [image, setImage]       = useState<string | null>(null);
  const [state, setState]       = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingText, setLoadingText] = useState(LOADING_TEXTS[0]);
  const [progress, setProgress] = useState(0);

  const fadeAnim    = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim   = useRef(new Animated.Value(1)).current;
  const textIdxRef  = useRef(0);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (state === 'analyzing') {
      // Texto alternando
      intervalRef.current = setInterval(() => {
        textIdxRef.current = (textIdxRef.current + 1) % LOADING_TEXTS.length;
        Animated.sequence([
          Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
        setLoadingText(LOADING_TEXTS[textIdxRef.current]);
      }, 1800);

      // Barra de progresso
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: false,
      }).start();

      // Pulso
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      clearInterval(intervalRef.current);
      progressAnim.setValue(0);
      pulseAnim.setValue(1);
    }
    return () => clearInterval(intervalRef.current);
  }, [state]);

  const pickGallery = async () => {
    setState('idle');
    setErrorMsg('');
    const r = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!r.canceled) setImage(r.assets[0].uri);
  };

  const handleAnalyze = async () => {
    if (!image) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      onResult(MOCK_RESULT, image ?? undefined);
      return;
    }

    setState('analyzing');
    setErrorMsg('');

    try {
      const token = await AsyncStorage.getItem('nevo_token');

      // Converter imagem para blob na web
      const imageResponse = await fetch(image);
      const blob = await imageResponse.blob();

      const form = new FormData();
      form.append('file', blob, 'skin.jpg');

      const response = await fetch(`${BASE_URL}/analyze/`, {
        method: 'POST',
        headers: {
          'Authorization':              `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: form,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail ?? `Erro ${response.status}`);
      }

      const result: AnalysisResult = await response.json();

      if (!result || result.confidence === undefined) {
        throw new Error('Resposta inválida da API');
      }

      if ((result.confidence ?? 0) < 30) {
        setState('low_confidence');
        return;
      }

      setState('idle');
      onResult(result, image ?? undefined);

  
      } catch (e: any) {
      const msg = e?.message ?? '';
      if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed')) {
        setState('connection_error');
        setErrorMsg('Não foi possível conectar à API de IA.');
      } else if (msg.includes('422') || msg.includes('formato') || msg.includes('inválid')) {
        setState('error');
        setErrorMsg('Imagem inválida ou formato não suportado.');
      } else {
        setState('error');
        setErrorMsg(msg || 'Não foi possível analisar a imagem.');
      }
    }
  };

  const reset = () => {
    setState('idle');
    setErrorMsg('');
    setImage(null);
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '95%'],
  });

  const isAnalyzing = state === 'analyzing';

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Nova Análise" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Preview da imagem */}
        <Animated.View style={[styles.imageContainer, isAnalyzing && { transform: [{ scale: pulseAnim }] }]}>
          {image ? (
            <>
              <Image source={{ uri: image }} style={styles.image} />
              {isAnalyzing && <View style={styles.imageOverlay}><View style={styles.scanLine} /></View>}
            </>
          ) : (
            <TouchableOpacity style={styles.imagePlaceholder} onPress={pickGallery} activeOpacity={0.8}>
              <View style={styles.uploadIcon}>
                <Text style={styles.uploadIconText}>+</Text>
              </View>
              <Text style={styles.uploadTitle}>Selecionar imagem</Text>
              <Text style={styles.uploadSubtitle}>Toque para escolher da galeria</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Estado: Analisando */}
        {state === 'analyzing' && (
          <View style={styles.analyzingCard}>
            <View style={styles.analyzingHeader}>
              <View style={styles.aiDot} />
              <Text style={styles.analyzingTitle}>IA processando</Text>
            </View>
            <Animated.Text style={[styles.analyzingText, { opacity: fadeAnim }]}>
              {loadingText}
            </Animated.Text>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            </View>
            <Text style={styles.progressLabel}>MobileNetV2 · CNN · Transfer Learning</Text>
          </View>
        )}

        {/* Estado: Erro */}
        {(state === 'error' || state === 'connection_error' || state === 'low_confidence') && (
          <View style={[styles.statusCard, styles.errorCard]}>
            <View style={styles.statusHeader}>
              <View style={[styles.statusIcon, styles.errorIcon]}>
                <Text style={styles.statusIconText}>!</Text>
              </View>
              <View style={styles.statusTitleBox}>
                <Text style={styles.statusTitle}>
                  {state === 'connection_error' ? 'Falha de conexão' :
                   state === 'low_confidence'   ? 'Análise inconclusiva' :
                   'Erro na análise'}
                </Text>
                <Text style={styles.statusSubtitle}>
                  {state === 'connection_error' ? 'Verifique sua conexão com a internet' :
                   state === 'low_confidence'   ? 'A IA não identificou padrões com segurança' :
                   errorMsg || 'Não foi possível processar a imagem'}
                </Text>
              </View>
            </View>

            <View style={styles.suggestionsBox}>
              <Text style={styles.suggestionsTitle}>Sugestões</Text>
              {state === 'connection_error' ? (
                <>
                  <Text style={styles.suggestion}>• Verifique sua conexão com a internet</Text>
                  <Text style={styles.suggestion}>• Tente novamente em alguns segundos</Text>
                </>
              ) : (
                <>
                  <Text style={styles.suggestion}>• Use uma foto mais próxima da lesão</Text>
                  <Text style={styles.suggestion}>• Melhore a iluminação do ambiente</Text>
                  <Text style={styles.suggestion}>• Evite sombras sobre a lesão</Text>
                  <Text style={styles.suggestion}>• Centralize a lesão na imagem</Text>
                  <Text style={styles.suggestion}>• Use uma imagem mais nítida e em foco</Text>
                </>
              )}
            </View>

            <TouchableOpacity style={styles.retryBtn} onPress={reset}>
              <Text style={styles.retryBtnText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Botões de ação */}
        {state !== 'analyzing' && state !== 'error' && state !== 'connection_error' && state !== 'low_confidence' && (
          <>
            <TouchableOpacity style={styles.galleryBtn} onPress={pickGallery} activeOpacity={0.8}>
              <Text style={styles.galleryBtnText}>Escolher da Galeria</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.analyzeBtn, !image && styles.analyzeBtnDemo]}
              onPress={handleAnalyze}
              activeOpacity={0.85}
            >
              <Text style={styles.analyzeBtnText}>
                {image ? 'Analisar com IA' : 'Simular Análise'}
              </Text>
              {!image && <Text style={styles.analyzeBtnSub}>Demonstração</Text>}
            </TouchableOpacity>
          </>
        )}

        {/* Dicas */}
        {state === 'idle' && (
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Dicas para uma boa análise</Text>
            <View style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>Boa iluminação natural ou artificial</Text>
            </View>
            <View style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>Foto nítida e em foco</Text>
            </View>
            <View style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>Lesão ocupando a maior parte da imagem</Text>
            </View>
            <View style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>Evite sombras sobre a lesão</Text>
            </View>
          </View>
        )}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Este app é uma ferramenta de apoio diagnóstico e não substitui a avaliação de um médico ou dermatologista.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: Colors.background },
  scroll:            { padding: 20, gap: 16, paddingBottom: 40 },

  imageContainer:    { width: '100%', aspectRatio: 1, borderRadius: 24, overflow: 'hidden',
                       shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16, elevation: 6 },
  image:             { width: '100%', height: '100%' },
  imageOverlay:      { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(27,58,92,0.15)',
                       justifyContent: 'center', alignItems: 'center' },
  scanLine:          { width: '80%', height: 2, backgroundColor: Colors.secondary, opacity: 0.8 },

  imagePlaceholder:  { flex: 1, backgroundColor: Colors.white, alignItems: 'center',
                       justifyContent: 'center', gap: 12, borderWidth: 2,
                       borderColor: Colors.border, borderStyle: 'dashed', borderRadius: 24 },
  uploadIcon:        { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.card,
                       alignItems: 'center', justifyContent: 'center' },
  uploadIconText:    { fontSize: 28, color: Colors.primary, fontWeight: '300' },
  uploadTitle:       { fontSize: 16, fontWeight: '600', color: Colors.text },
  uploadSubtitle:    { fontSize: 13, color: Colors.textLight },

  analyzingCard:     { backgroundColor: Colors.white, borderRadius: 18, padding: 20,
                       borderWidth: 1, borderColor: Colors.border, gap: 12 },
  analyzingHeader:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiDot:             { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.secondary },
  analyzingTitle:    { fontSize: 15, fontWeight: '600', color: Colors.primary },
  analyzingText:     { fontSize: 14, color: Colors.textLight },
  progressBar:       { height: 4, backgroundColor: Colors.card, borderRadius: 2, overflow: 'hidden' },
  progressFill:      { height: '100%', backgroundColor: Colors.secondary, borderRadius: 2 },
  progressLabel:     { fontSize: 11, color: Colors.textLight, textAlign: 'center' },

  statusCard:        { borderRadius: 18, padding: 20, gap: 16 },
  errorCard:         { backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FFD0D0' },
  statusHeader:      { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  statusIcon:        { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  errorIcon:         { backgroundColor: '#FFE0E0' },
  statusIconText:    { fontSize: 20, fontWeight: 'bold', color: Colors.danger },
  statusTitleBox:    { flex: 1, gap: 4 },
  statusTitle:       { fontSize: 16, fontWeight: '700', color: Colors.text },
  statusSubtitle:    { fontSize: 13, color: Colors.textLight, lineHeight: 19 },

  suggestionsBox:    { backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 12, padding: 14, gap: 8 },
  suggestionsTitle:  { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  suggestion:        { fontSize: 13, color: Colors.textLight, lineHeight: 20 },

  retryBtn:          { backgroundColor: Colors.primary, borderRadius: 12, padding: 14, alignItems: 'center' },
  retryBtnText:      { color: '#fff', fontSize: 15, fontWeight: '600' },

  galleryBtn:        { backgroundColor: Colors.white, borderRadius: 14, padding: 15,
                       alignItems: 'center', borderWidth: 1.5, borderColor: Colors.primary },
  galleryBtnText:    { color: Colors.primary, fontSize: 15, fontWeight: '600' },

  analyzeBtn:        { backgroundColor: Colors.secondary, borderRadius: 14, padding: 15,
                       alignItems: 'center', gap: 2 },
  analyzeBtnDemo:    { backgroundColor: Colors.primary },
  analyzeBtnText:    { color: '#fff', fontSize: 15, fontWeight: '700' },
  analyzeBtnSub:     { color: 'rgba(255,255,255,0.75)', fontSize: 11 },

  tipsCard:          { backgroundColor: Colors.white, borderRadius: 18, padding: 18, gap: 10,
                       borderWidth: 1, borderColor: Colors.border },
  tipsTitle:         { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  tipRow:            { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tipDot:            { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.secondary },
  tipText:           { fontSize: 13, color: Colors.textLight, flex: 1 },

  disclaimer:        { backgroundColor: '#EEF6FF', borderRadius: 14, padding: 14 },
  disclaimerText:    { fontSize: 12, color: '#2B6CB0', textAlign: 'center', lineHeight: 18 },
});
