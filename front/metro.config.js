const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Ajouter les extensions de fichiers supportées
config.resolver.assetExts.push(
  // Ajouter d'autres extensions si nécessaire
  "bin",
);

config.resolver.sourceExts.push(
  // Ajouter TypeScript et JSX
  "jsx",
  "js",
  "ts",
  "tsx",
  "json",
);

// Configuration pour résoudre les modules natifs
config.resolver.platforms = ["ios", "android", "native", "web"];

// Résolveur de modules pour éviter les erreurs TurboModule
config.resolver.resolverMainFields = ["react-native", "browser", "main"];

// Configuration pour les modules node
config.resolver.nodeModulesPaths = ["node_modules"];

module.exports = config;
