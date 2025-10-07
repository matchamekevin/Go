import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import Scanner from './src/Scanner';

export default function App() {
  return (
    <View style={styles.container}>
      <Scanner />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
