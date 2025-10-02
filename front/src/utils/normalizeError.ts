// Normalise différentes formes d'erreurs réseau/API pour affichage utilisateur
export function normalizeErrorMessage(raw: any): string {
  if (!raw) return 'Une erreur est survenue';
  let msg = typeof raw === 'string' ? raw : (raw.message || raw.error || JSON.stringify(raw));
  let parsedJson: any = null;

  // Retirer préfixes de logs internes
  msg = msg.replace(/^❌\s*API Response Error:?\s*/i, '')
           .replace(/^API Response Error:?\s*/i, '')
           .replace(/^Error:\s*/i, '');

  // Extraire JSON si présent après un préfixe quelconque
  const jsonMatch = msg.match(/({".*)/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      parsedJson = parsed;
      const extracted = parsed.error || parsed.message || parsed.msg;
      if (extracted) msg = extracted;
    } catch {}
  } else if (msg.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(msg.trim());
      parsedJson = parsed;
      const extracted = parsed.error || parsed.message || parsed.msg;
      if (extracted) msg = extracted;
    } catch {}
  }

  // IMPORTANT: Garder les messages spécifiques avant la transformation générique
  // Cas spécifique: "Email déjà utilisé" - ne pas transformer en "requête invalide"
  if (msg.toLowerCase().includes('email déjà') || msg.toLowerCase().includes('already exist')) {
    return 'Email déjà utilisé.';
  }

  // Cas spécifique: endpoint de vérification OTP -> message explicite
  try {
    const p = parsedJson || (typeof raw === 'object' ? raw : null);
    if (p) {
      const url = (p.url || p.config?.url || '') as string;
      const err = String(p.error || p.message || '').toLowerCase();
      if (url.includes('/auth/verify-reset-otp') || /\botp\b/.test(err) || /code/.test(err) && /invalide|invalid|incorrect/.test(err)) {
        return 'Code de vérification invalide. Vérifiez le code reçu par email.';
      }
    }
  } catch {}

  // Timeout réseau (ex: Axios "timeout of 10000ms exceeded") -> message clair
  try {
    const msgLower = String(msg).toLowerCase();
    if (/timeout of \d+ms exceeded/i.test(msgLower) || /timeout.*exceeded/i.test(msgLower) || /timeout/i.test(msgLower) && /exceed|expir/i.test(msgLower)) {
      return 'La requête a expiré. Vérifiez votre connexion Internet et réessayez.';
    }
  } catch {}

  // Cas fréquents de statut Axios
  if (/request failed with status code/i.test(msg)) {
    // Vérifier le code de statut pour un message plus spécifique
    const statusMatch = msg.match(/status code (\d+)/i);
    if (statusMatch) {
      const statusCode = parseInt(statusMatch[1]);
      switch (statusCode) {
        case 404:
          return 'Service non trouvé. L\'endpoint demandé n\'existe pas sur le serveur.';
        case 403:
          return 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
        case 401:
          return 'Authentification requise. Veuillez vous reconnecter.';
        case 500:
          return 'Erreur serveur. Le service est temporairement indisponible.';
        case 502:
        case 503:
        case 504:
          return 'Service indisponible. Réessayez dans quelques instants.';
        default:
          return 'Requête invalide. Vérifiez vos informations et réessayez.';
      }
    }
    // si on a déjà parsé JSON et qu'il y a un message d'erreur spécifique, l'avoir pris en compte
    // sinon renvoyer un message plus utile
    return 'Requête invalide. Vérifiez vos informations et réessayez.';
  }

  // Nettoyage final (trop long / bruit technique)
  if (msg.length > 140) {
    msg = msg.slice(0, 137) + '…';
  }

  return msg;
}

export function mapAuthErrorToFriendly(msg: string): string {
  const lower = msg.toLowerCase();
  const raw = String(msg || '');
  const upper = raw.toUpperCase();

  // Codes d'erreur renvoyés par les services
  if (upper.includes('USER_NOT_FOUND') || upper.includes('USER NOT FOUND') || upper.includes('USER_NOT_FOUND')) {
    return 'Utilisateur introuvable.';
  }
  if (upper.includes('INVALID_CREDENTIALS') || upper.includes('INVALID CREDENTIALS')) {
    return 'Email ou mot de passe incorrect.';
  }
  if (upper.includes('ACCOUNT_NOT_VERIFIED') || upper.includes('ACCOUNT NOT VERIFIED')) {
    return 'Compte non vérifié. Vérifiez votre email.';
  }
  if (upper.includes('EMAIL_ALREADY_EXISTS') || upper.includes('EMAIL_ALREADY_EXIST') || upper.includes('EMAIL_ALREADY') ) {
    return 'Email déjà utilisé.';
  }
  if (lower.includes('compte non vérifié') || lower.includes('not verified')) {
    return 'Compte non vérifié. Vérifiez votre email.';
  }
  if (lower.includes('utilisateur introuvable') || lower.includes('user not found')) {
    return 'Utilisateur introuvable.';
  }
  if (lower.includes('credential') || lower.includes('mot de passe') || lower.includes('password')) {
    return 'Email ou mot de passe incorrect.';
  }
  // Messages génériques de type "requête invalide" -> probable erreur d'identifiants
  if (
    lower.includes('requête invalide') ||
    lower.includes('request invalid') ||
    lower.includes('requete invalide') ||
    /request failed with status code \d+/.test(lower) ||
    /status code 400/.test(lower) ||
    (/400/.test(lower) && (lower.includes('login') || lower.includes('/auth') || lower.includes('auth')))
  ) {
    return 'Email ou mot de passe incorrect. Vérifiez vos informations et réessayez.';
  }
  if (lower.includes('email déjà') || lower.includes('already exist')) {
    return 'Email déjà utilisé.';
  }
  return msg;
}
