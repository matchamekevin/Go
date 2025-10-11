// Normalise différentes formes d'erreurs réseau/API pour affichage utilisateur
export function normalizeErrorMessage(raw: any): string {
  if (!raw) return "Une erreur est survenue";

  // IMPORTANT: Pour les erreurs Axios, extraire d'abord le message de la réponse API
  let msg = "";
  if (raw.response?.data) {
    // Priorité: error > message > msg
    msg =
      raw.response.data.error ||
      raw.response.data.message ||
      raw.response.data.msg ||
      "";
  }

  // Si pas de message dans la réponse, prendre le message de l'erreur Axios
  if (!msg) {
    msg =
      typeof raw === "string"
        ? raw
        : raw.message || raw.error || JSON.stringify(raw);
  }

  let parsedJson: any = null;

  // Retirer préfixes de logs internes
  msg = msg
    .replace(/^❌\s*API Response Error:?\s*/i, "")
    .replace(/^API Response Error:?\s*/i, "")
    .replace(/^Error:\s*/i, "");

  // Extraire JSON si présent après un préfixe quelconque
  const jsonMatch = msg.match(/({".*)/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      parsedJson = parsed;
      const extracted = parsed.error || parsed.message || parsed.msg;
      if (extracted) msg = extracted;
    } catch {}
  } else if (msg.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(msg.trim());
      parsedJson = parsed;
      const extracted = parsed.error || parsed.message || parsed.msg;
      if (extracted) msg = extracted;
    } catch {}
  }

  // IMPORTANT: Garder les messages spécifiques avant la transformation générique
  // Cas spécifique: "Email déjà utilisé" - ne pas transformer en "requête invalide"
  if (
    msg.toLowerCase().includes("email déjà") ||
    msg.toLowerCase().includes("already exist") ||
    msg.toLowerCase().includes("already used")
  ) {
    return "Email déjà utilisé.";
  }

  // Cas spécifique: endpoint de vérification OTP -> message explicite
  try {
    const p = parsedJson || (typeof raw === "object" ? raw : null);
    if (p) {
      const url = (p.url || p.config?.url || "") as string;
      const err = String(p.error || p.message || "").toLowerCase();
      if (
        url.includes("/auth/verify-reset-otp") ||
        /\botp\b/.test(err) ||
        (/code/.test(err) && /invalide|invalid|incorrect/.test(err))
      ) {
        return "Code de vérification invalide. Vérifiez le code reçu par email.";
      }
    }
  } catch {}

  // Timeout réseau (ex: Axios "timeout of 10000ms exceeded") -> message clair
  try {
    const msgLower = String(msg).toLowerCase();
    if (
      /timeout of \d+ms exceeded/i.test(msgLower) ||
      /timeout.*exceeded/i.test(msgLower) ||
      (/timeout/i.test(msgLower) && /exceed|expir/i.test(msgLower))
    ) {
      return "La requête a expiré. Vérifiez votre connexion Internet et réessayez.";
    }
  } catch {}

  // Cas fréquents de statut Axios - NE PAS transformer si c'est déjà un message spécifique
  if (/request failed with status code/i.test(msg)) {
    // Vérifier le code de statut pour un message plus spécifique
    const statusMatch = msg.match(/status code (\d+)/i);
    if (statusMatch) {
      const statusCode = parseInt(statusMatch[1]);
      switch (statusCode) {
        case 404:
          return "Service non trouvé. L'endpoint demandé n'existe pas sur le serveur.";
        case 403:
          return "Accès refusé. Vous n'avez pas les permissions nécessaires.";
        case 401:
          return "Authentification requise. Veuillez vous reconnecter.";
        case 500:
          return "Erreur serveur. Le service est temporairement indisponible.";
        case 502:
        case 503:
        case 504:
          return "Service indisponible. Réessayez dans quelques instants.";
        case 400:
          // Pour 400, ne pas transformer automatiquement - laisser le message original
          // sauf si c'est vraiment générique
          if (
            msg.toLowerCase().includes("bad request") ||
            msg.toLowerCase().includes("invalid request")
          ) {
            return "Requête invalide. Vérifiez vos informations et réessayez.";
          }
          // Sinon, retourner le message tel quel
          return msg;
        default:
          return "Requête invalide. Vérifiez vos informations et réessayez.";
      }
    }
    // si on a déjà parsé JSON et qu'il y a un message d'erreur spécifique, l'avoir pris en compte
    // sinon renvoyer un message plus utile
    return "Requête invalide. Vérifiez vos informations et réessayez.";
  }

  // Nettoyage final (trop long / bruit technique)
  if (msg.length > 140) {
    msg = msg.slice(0, 137) + "…";
  }

  return msg;
}

export function mapAuthErrorToFriendly(msg: string): string {
  const lower = msg.toLowerCase();
  const raw = String(msg || "");
  const upper = raw.toUpperCase();

  // Messages exacts du backend AuthService - TRAITER EN PREMIER POUR PRÉCISION MAXIMALE
  if (lower.includes("utilisateur introuvable")) {
    return "Compte introuvable avec ce numéro de téléphone.";
  }
  if (lower.includes("mot de passe invalide")) {
    return "Mot de passe incorrect.";
  }
  if (lower.includes("compte non vérifié")) {
    return "Compte non vérifié. Vérifiez votre email.";
  }
  if (lower.includes("compte suspendu")) {
    return "Compte suspendu. Contactez le support.";
  }

  // Messages anglais équivalents
  if (lower.includes("user not found")) {
    return "Compte introuvable avec ce numéro de téléphone.";
  }
  if (lower.includes("invalid password")) {
    return "Mot de passe incorrect.";
  }
  if (lower.includes("account not verified")) {
    return "Compte non vérifié. Vérifiez votre email.";
  }
  if (lower.includes("account suspended")) {
    return "Compte suspendu. Contactez le support.";
  }

  // Codes d'erreur génériques
  if (
    upper.includes("USER_NOT_FOUND") ||
    upper.includes("INVALID_CREDENTIALS") ||
    upper.includes("INVALID_PASSWORD")
  ) {
    return "Numéro de téléphone ou mot de passe incorrect.";
  }
  if (
    upper.includes("ACCOUNT_NOT_VERIFIED") ||
    upper.includes("ACCOUNT_UNVERIFIED")
  ) {
    return "Compte non vérifié. Vérifiez votre email.";
  }
  if (
    upper.includes("EMAIL_ALREADY_EXISTS") ||
    upper.includes("EMAIL_ALREADY_EXIST") ||
    upper.includes("EMAIL_ALREADY")
  ) {
    return "Email déjà utilisé.";
  }
  if (upper.includes("INVALID_EMAIL")) {
    return "Adresse email invalide.";
  }

  // Messages génériques de type "requête invalide" -> probable erreur d'identifiants
  if (
    lower.includes("requête invalide") ||
    lower.includes("request invalid") ||
    lower.includes("requete invalide") ||
    /request failed with status code \d+/.test(lower) ||
    /status code 400/.test(lower) ||
    (/400/.test(lower) &&
      (lower.includes("login") ||
        lower.includes("/auth") ||
        lower.includes("auth")))
  ) {
    return "Numéro de téléphone ou mot de passe incorrect. Vérifiez vos informations et réessayez.";
  }
  if (lower.includes("email déjà") || lower.includes("already exist")) {
    return "Email déjà utilisé.";
  }

  // Fallback pour erreurs de connexion génériques
  if (
    lower.includes("erreur de connexion") ||
    lower.includes("connection error")
  ) {
    return "Vérifiez vos informations de connexion.";
  }

  return msg;
}
