import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  disabled?: boolean;
}

const variants: Record<string, ViewStyle> = {
  primary:   { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.secondary },
  outline:   { backgroundColor: 'transparent', borderWidth: 2, borderColor: Colors.primary },
  danger:    { backgroundColor: Colors.danger },
};

export function Button({ title, onPress, loading = false, variant = 'primary', disabled = false }: Props) {
  return (
    <TouchableOpacity
      style={[styles.btn, variants[variant], (disabled || loading) && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator color={Colors.white} size="small" />
        : <Text style={[styles.text, variant === 'outline' && styles.textOutline]}>{title}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn:         { padding: 15, borderRadius: 12, alignItems: 'center', marginVertical: 6 },
  disabled:    { opacity: 0.6 },
  text:        { color: Colors.white, fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },
  textOutline: { color: Colors.primary },
});