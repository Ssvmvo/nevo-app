import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface Props { risk: 'low' | 'medium' | 'high'; size?: 'sm' | 'lg'; }

const config = {
  low:    { label: 'Baixo Risco',    color: Colors.success, emoji: '✅' },
  medium: { label: 'Risco Moderado', color: Colors.warning, emoji: '⚠️' },
  high:   { label: 'Alto Risco',     color: Colors.danger,  emoji: '🚨' },
};

export function RiskBadge({ risk, size = 'sm' }: Props) {
  const c = config[risk] ?? config['medium'];
  return (
    <View style={[styles.badge, { backgroundColor: c.color }, size === 'lg' && styles.lg]}>
      <Text style={[styles.text, size === 'lg' && styles.textLg]}>
        {c.emoji} {c.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge:  { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, alignSelf: 'flex-start' },
  lg:     { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30, alignSelf: 'center' },
  text:   { color: Colors.white, fontSize: 12, fontWeight: '600' },
  textLg: { fontSize: 18 },
});