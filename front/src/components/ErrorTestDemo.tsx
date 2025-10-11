import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useToast } from '../contexts/ToastContext';
import { mapAuthErrorToFriendly, normalizeErrorMessage } from '../utils/normalizeError';
import { theme } from '../styles/theme';

interface ErrorTestCase {
  id: string;
  title: string;
  description: string;
  mockError: any;
  expectedMessage: string;
}

const errorTestCases: ErrorTestCase[] = [
  {
    id: 'password_incorrect',
    title: 'Mot de passe incorrect',
    description: 'Simule une erreur de mot de passe incorrect',
    mockError: {
      response: {
        status: 401,
        data: {
          message: 'Invalid password'
        }
      }
    },
    expectedMessage: 'Mot de passe incorrect'
  },
  {
    id: 'user_not_found',
    title: 'Compte introuvable',
    description: 'Simule un compte qui n\'existe pas',
    mockError: {
      response: {
        status: 404,
        data: {
          message: 'User not found'
        }
      }
    },
    expectedMessage: 'Compte introuvable avec ce numéro de téléphone'
  },
  {
    id: 'account_unverified',
    title: 'Compte non vérifié',
    description: 'Simule un compte qui n\'a pas été vérifié',
    mockError: {
      response: {
        status: 403,
        data: {
          message: 'Account not verified'
        }
      }
    },
    expectedMessage: 'Compte non vérifié. Vérifiez votre email'
  },
  {
    id: 'too_many_attempts',
    title: 'Trop de tentatives',
    description: 'Simule une limitation de taux',
    mockError: {
      response: {
        status: 429,
        data: {
          message: 'Too many login attempts'
        }
      }
    },
    expectedMessage: 'Trop de tentatives'
  },
  {
    id: 'server_error',
    title: 'Erreur serveur',
    description: 'Simule une erreur serveur interne',
    mockError: {
      response: {
        status: 500,
        data: {
          message: 'Internal server error'
        }
      }
    },
    expectedMessage: 'Erreur serveur'
  },
  {
    id: 'network_timeout',
    title: 'Timeout réseau',
    description: 'Simule un timeout de connexion',
    mockError: {
      message: 'timeout of 10000ms exceeded'
    },
    expectedMessage: 'La requête a expiré'
  },
  {
    id: 'generic_connection',
    title: 'Erreur de connexion générique',
    description: 'Simule l\'ancien message générique',
    mockError: {
      message: 'Erreur de connexion'
    },
    expectedMessage: 'Numéro de téléphone ou mot de passe incorrect'
  }
];

export default function ErrorTestDemo() {
  const { showToast } = useToast();
  const [lastResult, setLastResult] = useState<string | null>(null);

  const testError = (testCase: ErrorTestCase) => {
    try {
      // Normaliser l'erreur comme le ferait le vrai système
      const normalized = normalizeErrorMessage(testCase.mockError);
      const friendly = mapAuthErrorToFriendly(normalized);

      // Afficher le toast avec le message amélioré
      showToast(friendly, 'error', 8000, 'top');

      // Mettre à jour le résultat pour affichage
      setLastResult(`✅ "${friendly}"`);

      console.log('Test:', testCase.title);
      console.log('Input:', testCase.mockError);
      console.log('Normalized:', normalized);
      console.log('Friendly:', friendly);
      console.log('Expected:', testCase.expectedMessage);
      console.log('Match:', friendly.includes(testCase.expectedMessage.split('.')[0]));
      console.log('---');

    } catch (error) {
      console.error('Erreur lors du test:', error);
      setLastResult(`❌ Erreur lors du test`);
    }
  };

  const testAllErrors = () => {
    Alert.alert(
      'Test de tous les cas',
      'Cela va afficher tous les types d\'erreurs un par un avec un délai de 2 secondes entre chaque.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Commencer',
          onPress: () => {
            errorTestCases.forEach((testCase, index) => {
              setTimeout(() => {
                testError(testCase);
              }, index * 2000);
            });
          }
        }
      ]
    );
  };

  const showInfo = () => {
    Alert.alert(
      'À propos',
      'Ce composant teste les améliorations des messages d\'erreur de connexion.\n\n' +
      'Avant: "Erreur de connexion" pour tout\n' +
      'Après: Messages spécifiques selon le type d\'erreur\n\n' +
      'Appuyez sur un bouton pour voir le message amélioré en toast.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Test des Messages d'Erreur</Text>
        <Text style={styles.subtitle}>
          Démonstration des améliorations apportées aux messages d'erreur de connexion
        </Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.infoButton} onPress={showInfo}>
            <Text style={styles.infoButtonText}>ℹ️ À propos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.testAllButton} onPress={testAllErrors}>
            <Text style={styles.testAllButtonText}>🧪 Tester tout</Text>
          </TouchableOpacity>
        </View>

        {lastResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>Dernier résultat:</Text>
            <Text style={styles.resultText}>{lastResult}</Text>
          </View>
        )}
      </View>

      <View style={styles.testCases}>
        {errorTestCases.map((testCase) => (
          <View key={testCase.id} style={styles.testCase}>
            <View style={styles.testCaseHeader}>
              <Text style={styles.testCaseTitle}>{testCase.title}</Text>
              <Text style={styles.testCaseDescription}>{testCase.description}</Text>
            </View>

            <TouchableOpacity
              style={styles.testButton}
              onPress={() => testError(testCase)}
            >
              <Text style={styles.testButtonText}>Tester</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Les messages s'affichent en toast en haut de l'écran
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondary[50],
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary[200],
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.secondary[900],
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[600],
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  infoButton: {
    backgroundColor: theme.colors.primary[100],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    flex: 1,
  },
  infoButtonText: {
    color: theme.colors.primary[700],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
  testAllButton: {
    backgroundColor: theme.colors.success[100],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    flex: 1,
  },
  testAllButtonText: {
    color: theme.colors.success[700],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
  resultContainer: {
    backgroundColor: theme.colors.secondary[100],
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  resultLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.secondary[600],
    fontWeight: theme.typography.fontWeight.medium,
  },
  resultText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[800],
    marginTop: 2,
  },
  testCases: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  testCase: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadows.sm,
  },
  testCaseHeader: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  testCaseTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.secondary[900],
    marginBottom: 2,
  },
  testCaseDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[600],
    lineHeight: 18,
  },
  testButton: {
    backgroundColor: theme.colors.error[600],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  testButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  footer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary[500],
    fontStyle: 'italic',
  },
});
