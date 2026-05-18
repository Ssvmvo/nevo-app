import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  Image, Alert, ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/colors';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { AnalysisAPI, AnalysisResult } from '../services/api';

interface Props { onBack: () => void; onResult: (r: AnalysisResult) => void; }

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
  const [image, setImage]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickCamera = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Câmera', 'Use a opção Escolher da Galeria na versão web.');
      return;
    }
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permissão', 'Permita o acesso à câmera.'); return; }
    const r = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1,1], quality: 0.8 });
    if (!r.canceled) setImage(r.assets[0].uri);
  };

  const pickGallery = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1,1], quality: 0.8,
    });
    if (!r.canceled) setImage(r.assets[0].uri);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      let result: AnalysisResult;
      if (Platform.OS === 'web' && !image) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        result = MOCK_RESULT;
      } else if (image) {
        result = await AnalysisAPI.analyze(image);
      } else {
        Alert.alert('Atenção', 'Selecione uma imagem primeiro.');
        setLoading(false);
        return;
      }
      onResult(result);
    } catch (e: any) {
      Alert.alert(
        'Usando demonstração',
        'API indisponível. Exibindo resultado de demonstração.',
        [{ text: 'OK', onPress: () => onResult(MOCK_RESULT) }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Nova Análise" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.instruction}>
          Envie uma foto clara e bem iluminada da lesão de pele que deseja analisar.
        </Text>

        <View style={styles.imageBox}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.phText}>Nenhuma imagem selecionada</Text>
              <Text style={styles.phHint}>
                {Platform.OS === 'web'
                  ? 'Escolha uma imagem ou use a simulação'
                  : 'Use a câmera ou escolha da galeria'}
              </Text>
            </View>
          )}
        </View>

        {Platform.OS !== 'web' && (
          <Button title="Tirar Foto" onPress={pickCamera} />
        )}
        <Button title="Escolher da Galeria" onPress={pickGallery} variant="outline" />
        <Button
          title={image ? "Analisar com IA" : "Simular Análise"}
          onPress={handleAnalyze}
          loading={loading}
          variant="secondary"
        />

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>
              {image ? 'Analisando com IA...' : 'Gerando simulação...'}
            </Text>
          </View>
        )}

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Dicas para uma boa análise</Text>
          <Text style={styles.tip}>• Boa iluminação natural ou artificial</Text>
          <Text style={styles.tip}>• Foto nítida e em foco</Text>
          <Text style={styles.tip}>• A lesão deve ocupar a maior parte da imagem</Text>
          <Text style={styles.tip}>• Evite sombras sobre a lesão</Text>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Este app é uma ferramenta de apoio e não substitui o diagnóstico médico profissional.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: Colors.background },
  scroll:         { padding: 24, gap: 16 },
  instruction:    { fontSize: 15, color: Colors.textLight, lineHeight: 22 },
  imageBox:       { width: '100%', aspectRatio: 1, borderRadius: 20, overflow: 'hidden',
                    borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed' },
  image:          { width: '100%', height: '100%' },
  placeholder:    { flex: 1, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: Colors.white, gap: 8 },
  phText:         { fontSize: 16, color: Colors.textLight, fontWeight: '500' },
  phHint:         { fontSize: 13, color: Colors.textLight, textAlign: 'center', paddingHorizontal: 24 },
  loadingBox:     { alignItems: 'center', padding: 20, gap: 12 },
  loadingText:    { fontSize: 15, color: Colors.textLight },
  tips:           { backgroundColor: Colors.card, borderRadius: 14, padding: 16, gap: 6 },
  tipsTitle:      { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  tip:            { fontSize: 13, color: Colors.textLight, lineHeight: 20 },
  disclaimer:     { backgroundColor: '#E8F4FD', borderRadius: 14, padding: 16 },
  disclaimerText: { fontSize: 13, color: '#1A6FA0', textAlign: 'center', lineHeight: 20 },
});