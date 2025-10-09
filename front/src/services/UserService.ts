import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getProfile() {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch('https://go-j2rr.onrender.com/users/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Erreur récupération profil');
  return (await response.json()).data.user;
}

export async function updateProfile(userData: Partial<{ name: string; email: string; phone: string }>) {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch('https://go-j2rr.onrender.com/users/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw new Error('Erreur mise à jour profil');
  return (await response.json()).data.user;
}