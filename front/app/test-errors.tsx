import React from 'react';
import { View, StyleSheet } from 'react-native';
import ErrorTestDemo from '../src/components/ErrorTestDemo';
import { theme } from '../src/styles/theme';

export default function TestErrorsScreen() {
  return (
    <View style={styles.container}>
      <ErrorTestDemo />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondary[50],
  },
});
