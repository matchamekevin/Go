import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "auth_token";

export async function getProfile() {
  const token = await AsyncStorage.getItem(TOKEN_KEY);

  if (!token) {
    throw new Error("Token manquant");
  }

  console.log("🔍 Récupération du profil utilisateur...");

  const response = await fetch("https://go-j2rr.onrender.com/users/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  console.log("📡 Réponse API getProfile - status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Erreur API getProfile:", errorText);
    throw new Error(`Erreur récupération profil: ${response.status}`);
  }

  const responseData = await response.json();
  console.log("✅ Données profil reçues:", responseData);

  // Validation de la structure de réponse
  if (!responseData || !responseData.data) {
    console.error("❌ Structure de réponse invalide:", responseData);
    throw new Error("Structure de réponse invalide");
  }

  const user = responseData.data;
  console.log("👤 Profil utilisateur:", {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  });

  return user;
}

export async function updateProfile(
  userData: Partial<{ name: string; email: string; phone: string }>,
) {
  const token = await AsyncStorage.getItem(TOKEN_KEY);

  if (!token) {
    throw new Error("Token manquant");
  }

  console.log("🔄 Mise à jour du profil - userData:", userData);
  console.log("🔑 Token présent:", !!token);

  const response = await fetch("https://go-j2rr.onrender.com/users/profile", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  console.log("📡 Réponse API updateProfile - status:", response.status);
  console.log("📡 Réponse API updateProfile - ok:", response.ok);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Erreur API updateProfile:", errorText);
    throw new Error(`Erreur mise à jour profil: ${response.status}`);
  }

  const responseData = await response.json();
  console.log("✅ Données mise à jour reçues:", responseData);

  // Validation de la structure de réponse
  if (!responseData || !responseData.data) {
    console.error(
      "❌ Structure de réponse invalide pour updateProfile:",
      responseData,
    );
    throw new Error("Structure de réponse invalide");
  }

  const updatedUser = responseData.data;
  console.log("👤 Profil mis à jour:", {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone,
  });

  return updatedUser;
}
