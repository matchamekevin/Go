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

// Configuration pour résoudre les conflits de dépendances
config.resolver = {
  ...config.resolver,
  // Désactiver les exports problématiques pour éviter les conflits
  unstable_enablePackageExports: false,
  // Configuration des alias pour résoudre les modules problématiques
  alias: {
    'whatwg-url-without-unicode': require.resolve('whatwg-url-without-unicode'),
  },
  // Ignorer les exports conditionnels problématiques
  unstable_conditionNames: ['require', 'default'],
};

// Configuration pour résoudre les modules natifs
config.resolver.platforms = ["ios", "android", "native", "web"];

// Résolveur de modules pour éviter les erreurs TurboModule
config.resolver.resolverMainFields = ["react-native", "browser", "main"];

// Configuration pour les modules node
config.resolver.nodeModulesPaths = ["node_modules"];

// Configuration du transformer pour éviter les problèmes de cache
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
  allowOptionalDependencies: true,
  // Désactiver les optimisations problématiques
  minifierConfig: {
    ...config.transformer.minifierConfig,
    compress: {
      ...config.transformer.minifierConfig?.compress,
      drop_console: false,
    },
  },
};

module.exports = config;
