// Application GoSOTRAL Scan - Validation de tickets QR
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

export default function App() {
  console.log('🚀 GoSOTRAL Scan - Application de validation de tickets');
  return <ExpoRoot />;
}

registerRootComponent(App);