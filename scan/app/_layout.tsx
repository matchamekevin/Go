import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen 
        name="scanner" 
        options={{ 
          title: 'Scanner QR Code',
          headerBackTitle: 'Retour'
        }} 
      />
      <Stack.Screen 
        name="history" 
        options={{ 
          title: 'Historique',
          headerBackTitle: 'Retour'
        }} 
      />
    </Stack>
  )
}
