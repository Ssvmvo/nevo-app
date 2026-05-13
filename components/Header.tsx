import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  title: string;
  onBack?: () => void;
}

export function Header({ title, onBack }: Props) {
  return (
    <View style={styles.container}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.back}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 16, paddingBottom: 12, paddingHorizontal: 24,
               borderBottomWidth: 1, borderBottomColor: Colors.border,
               backgroundColor: Colors.white },
  back:      { marginBottom: 4 },
  backText:  { color: Colors.secondary, fontSize: 14 },
  title:     { fontSize: 22, fontWeight: 'bold', color: Colors.primary },
});