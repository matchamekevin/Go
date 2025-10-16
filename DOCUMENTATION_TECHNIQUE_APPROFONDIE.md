# 📚 DOCUMENTATION TECHNIQUE APPROFONDIE - GOSOTRAL
## Analyse Détaillée des Méthodes d'Intégration et Patterns Utilisés

---

## 📑 TABLE DES MATIÈRES

1. [Architecture et Patterns Fondamentaux](#1-architecture-et-patterns-fondamentaux)
2. [Intégration Frontend-Backend en Profondeur](#2-intégration-frontend-backend-en-profondeur)
3. [Gestion d'État et Synchronisation](#3-gestion-détat-et-synchronisation)
4. [Sécurité et Authentification Détaillée](#4-sécurité-et-authentification-détaillée)
5. [Base de Données et Optimisations](#5-base-de-données-et-optimisations)
6. [Intégrations Externes](#6-intégrations-externes)
7. [Performance et Monitoring](#7-performance-et-monitoring)
8. [Déploiement et DevOps](#8-déploiement-et-devops)
9. [Cas d'Usage Complets](#9-cas-dusage-complets)
10. [Problèmes Rencontrés et Solutions](#10-problèmes-rencontrés-et-solutions)

---

## 1. ARCHITECTURE ET PATTERNS FONDAMENTAUX

### 1.1 Architecture Hexagonale - Implémentation Complète

#### 🎯 Concept et Justification

L'architecture hexagonale (ou Ports & Adapters) sépare la logique métier des détails techniques. Dans GOSOTRAL, nous avons appliqué ce pattern pour :

**Avantages concrets obtenus :**
- ✅ Testabilité : Chaque couche peut être testée isolément
- ✅ Maintenabilité : Changement de DB ou API sans toucher la logique métier
- ✅ Évolutivité : Ajout de nouveaux adapters (REST, GraphQL, gRPC) facile
- ✅ Séparation des préoccupations : Équipes peuvent travailler en parallèle

#### 📐 Structure des Couches

```
┌─────────────────────────────────────────────────────────────┐
│                    COUCHE PRÉSENTATION                      │
│  (Controllers - Gestion des requêtes HTTP)                  │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │ Auth.controller│  │Ticket.controller│ │Admin.controller│ │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘  │
└──────────┼──────────────────┼──────────────────┼──────────┘
           │                  │                  │
           ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    COUCHE MÉTIER                            │
│  (Business Logic - Validation, Règles métier)               │
│  ┌─────────────────────────────────────────────────┐       │
│  │  - Validation des données (Zod)                 │       │
│  │  - Calcul des prix et remises                   │       │
│  │  - Règles de validation des tickets             │       │
│  │  - Logique d'expiration                         │       │
│  └─────────────────────────────────────────────────┘       │
└──────────┬──────────────────┬──────────────────┬──────────┘
           │                  │                  │
           ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    COUCHE DONNÉES                           │
│  (Repositories - Accès base de données)                     │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │User.repository│  │Ticket.repository│ │Payment.repository│ │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘  │
└──────────┼──────────────────┼──────────────────┼──────────┘
           │                  │                  │
           ▼                  ▼                  ▼
     ┌─────────────────────────────────────────────┐
     │         PostgreSQL Database                 │
     └─────────────────────────────────────────────┘
```

#### 🔧 Implémentation Détaillée par Couche

##### **COUCHE REPOSITORY (Data Access Layer)**

```typescript
// back/src/features/auth/User.repository.ts

import { pool } from '../../shared/database/client';
import { User, CreateUserInput, UpdateUserInput } from '../../types/database';

export class UserRepository {
  /**
   * Trouve un utilisateur par email
   * Pattern : Query Object avec paramètres sécurisés ($1, $2)
   * Sécurité : Protection contre SQL Injection
   */
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await pool.query(
        `SELECT 
          id, email, phone, name, password_hash, 
          role, is_verified, is_suspended, 
          created_at, updated_at
         FROM users 
         WHERE email = $1 AND deleted_at IS NULL`,
        [email]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('UserRepository.findByEmail error:', error);
      throw new Error('Database query failed');
    }
  }

  /**
   * Trouve un utilisateur par téléphone
   * Gère le format Togo : +228XXXXXXXX
   */
  static async findByPhone(phone: string): Promise<User | null> {
    const normalizedPhone = phone.startsWith('+228') 
      ? phone 
      : `+228${phone}`;
    
    const result = await pool.query(
      'SELECT * FROM users WHERE phone = $1 AND deleted_at IS NULL',
      [normalizedPhone]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Création d'utilisateur avec transaction
   * Pattern : Unit of Work - toutes les opérations réussissent ou échouent ensemble
   */
  static async create(userData: CreateUserInput): Promise<User> {
    const client = await pool.connect();
    
    try {
      // Début de la transaction
      await client.query('BEGIN');
      
      // 1. Insertion de l'utilisateur
      const userResult = await client.query(
        `INSERT INTO users (email, phone, name, password_hash, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          userData.email,
          userData.phone,
          userData.name,
          userData.passwordHash,
          userData.role || 'user'
        ]
      );
      
      const user = userResult.rows[0];
      
      // 2. Génération OTP de vérification email
      const otp = this.generateOTP();
      await client.query(
        `INSERT INTO email_otps (user_id, email, otp_code, expires_at)
         VALUES ($1, $2, $3, NOW() + INTERVAL '10 minutes')`,
        [user.id, user.email, otp]
      );
      
      // 3. Commit de la transaction
      await client.query('COMMIT');
      
      // 4. Envoi de l'email (asynchrone, hors transaction)
      this.sendVerificationEmail(user.email, otp).catch(err => 
        console.error('Email send failed:', err)
      );
      
      return user;
      
    } catch (error) {
      // Rollback en cas d'erreur
      await client.query('ROLLBACK');
      
      // Gestion des erreurs spécifiques PostgreSQL
      if (error.code === '23505') { // Unique violation
        if (error.constraint === 'users_email_key') {
          throw new Error('Email already exists');
        }
        if (error.constraint === 'users_phone_key') {
          throw new Error('Phone already exists');
        }
      }
      
      throw error;
    } finally {
      // Toujours libérer la connexion au pool
      client.release();
    }
  }

  /**
   * Mise à jour avec versioning optimiste
   * Pattern : Optimistic Locking
   */
  static async update(
    userId: number, 
    updates: UpdateUserInput, 
    expectedVersion?: number
  ): Promise<User> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Vérifier la version pour éviter les conflits
      if (expectedVersion) {
        const versionCheck = await client.query(
          'SELECT version FROM users WHERE id = $1 FOR UPDATE',
          [userId]
        );
        
        if (versionCheck.rows[0]?.version !== expectedVersion) {
          throw new Error('Concurrent modification detected');
        }
      }
      
      // Construction dynamique de la requête UPDATE
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = fields
        .map((field, idx) => `${field} = $${idx + 2}`)
        .join(', ');
      
      const result = await client.query(
        `UPDATE users 
         SET ${setClause}, 
             version = version + 1, 
             updated_at = NOW()
         WHERE id = $1 
         RETURNING *`,
        [userId, ...values]
      );
      
      await client.query('COMMIT');
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Pagination avec curseur pour performance
   * Pattern : Cursor-based Pagination
   */
  static async findAllPaginated(
    limit: number = 20,
    cursor?: number
  ): Promise<{ users: User[], nextCursor: number | null }> {
    const query = cursor
      ? 'SELECT * FROM users WHERE id > $1 ORDER BY id LIMIT $2'
      : 'SELECT * FROM users ORDER BY id LIMIT $1';
    
    const params = cursor ? [cursor, limit] : [limit];
    const result = await pool.query(query, params);
    
    const users = result.rows;
    const nextCursor = users.length === limit 
      ? users[users.length - 1].id 
      : null;
    
    return { users, nextCursor };
  }

  /**
   * Recherche full-text avec PostgreSQL
   * Pattern : Full-Text Search
   */
  static async search(searchTerm: string, limit: number = 10): Promise<User[]> {
    const result = await pool.query(
      `SELECT *, 
              ts_rank(
                to_tsvector('french', name || ' ' || email),
                plainto_tsquery('french', $1)
              ) AS rank
       FROM users
       WHERE to_tsvector('french', name || ' ' || email) 
             @@ plainto_tsquery('french', $1)
       ORDER BY rank DESC
       LIMIT $2`,
      [searchTerm, limit]
    );
    
    return result.rows;
  }

  // Méthode privée utilitaire
  private static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private static async sendVerificationEmail(
    email: string, 
    otp: string
  ): Promise<void> {
    // Implémentation Nodemailer
    // Voir section Intégrations Externes
  }
}
```

##### **COUCHE CONTROLLER (Presentation Layer)**

```typescript
// back/src/features/auth/Auth.controller.ts

import { Request, Response } from 'express';
import { UserRepository } from './User.repository';
import { loginSchema, registerSchema } from '../../types/validation';
import { generateTokens, hashPassword, comparePassword } from '../../shared/utils/crypto';
import { Logger } from '../../shared/utils/logger';

export class AuthController {
  /**
   * Inscription d'un nouvel utilisateur
   * Flow complet avec validation et gestion d'erreurs
   */
  static async register(req: Request, res: Response): Promise<Response> {
    const requestId = req.headers['x-request-id'] || crypto.randomUUID();
    
    try {
      Logger.info('Registration attempt', {
        requestId,
        email: req.body.email,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      // 1. VALIDATION DES DONNÉES
      const validationResult = registerSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        Logger.warn('Registration validation failed', {
          requestId,
          errors: validationResult.error.flatten()
        });
        
        return res.status(400).json({
          success: false,
          error: 'Données invalides',
          details: validationResult.error.flatten().fieldErrors
        });
      }

      const { email, password, phone, name } = validationResult.data;

      // 2. VÉRIFICATION UNICITÉ
      const [existingEmail, existingPhone] = await Promise.all([
        UserRepository.findByEmail(email),
        phone ? UserRepository.findByPhone(phone) : null
      ]);

      if (existingEmail) {
        Logger.warn('Registration failed - email exists', { requestId, email });
        return res.status(409).json({
          success: false,
          error: 'Cet email est déjà utilisé'
        });
      }

      if (existingPhone) {
        Logger.warn('Registration failed - phone exists', { requestId, phone });
        return res.status(409).json({
          success: false,
          error: 'Ce numéro de téléphone est déjà utilisé'
        });
      }

      // 3. HASHAGE DU MOT DE PASSE
      // bcrypt avec salt rounds = 12 (bon équilibre sécurité/performance)
      const passwordHash = await hashPassword(password);

      // 4. CRÉATION DE L'UTILISATEUR
      const user = await UserRepository.create({
        email,
        phone,
        name,
        passwordHash,
        role: 'user'
      });

      // 5. GÉNÉRATION DES TOKENS JWT
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // 6. LOGGING SUCCESS
      Logger.info('Registration successful', {
        requestId,
        userId: user.id,
        email: user.email
      });

      // 7. RÉPONSE STRUCTURÉE
      return res.status(201).json({
        success: true,
        message: 'Inscription réussie. Vérifiez votre email.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            isVerified: user.is_verified,
            role: user.role
          },
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: 900 // 15 minutes
          }
        }
      });

    } catch (error) {
      Logger.error('Registration error', error as Error, {
        requestId,
        email: req.body.email
      });

      // Gestion des erreurs spécifiques
      if (error.message.includes('Email already exists')) {
        return res.status(409).json({
          success: false,
          error: 'Cet email est déjà utilisé'
        });
      }

      // Erreur générique pour ne pas exposer les détails internes
      return res.status(500).json({
        success: false,
        error: 'Une erreur est survenue lors de l\'inscription'
      });
    }
  }

  /**
   * Connexion utilisateur
   * Supporte email OU téléphone
   */
  static async login(req: Request, res: Response): Promise<Response> {
    const requestId = req.headers['x-request-id'] || crypto.randomUUID();
    
    try {
      Logger.info('Login attempt', {
        requestId,
        identifier: req.body.email || req.body.phone,
        ip: req.ip
      });

      // 1. VALIDATION
      const { email, phone, password } = req.body;

      if (!password || (!email && !phone)) {
        return res.status(400).json({
          success: false,
          error: 'Email/téléphone et mot de passe requis'
        });
      }

      // 2. RECHERCHE UTILISATEUR
      const user = email
        ? await UserRepository.findByEmail(email)
        : await UserRepository.findByPhone(phone);

      if (!user) {
        // Message générique pour éviter l'énumération
        Logger.warn('Login failed - user not found', { requestId, email, phone });
        return res.status(401).json({
          success: false,
          error: 'Email/téléphone ou mot de passe incorrect'
        });
      }

      // 3. VÉRIFICATION MOT DE PASSE
      const isPasswordValid = await comparePassword(
        password, 
        user.password_hash
      );

      if (!isPasswordValid) {
        Logger.warn('Login failed - invalid password', {
          requestId,
          userId: user.id
        });
        
        // Incrémenter compteur de tentatives échouées
        await UserRepository.incrementFailedLoginAttempts(user.id);
        
        return res.status(401).json({
          success: false,
          error: 'Email/téléphone ou mot de passe incorrect'
        });
      }

      // 4. VÉRIFICATION SUSPENSION
      if (user.is_suspended) {
        Logger.warn('Login blocked - suspended account', {
          requestId,
          userId: user.id
        });
        
        return res.status(403).json({
          success: false,
          error: 'Votre compte a été suspendu. Contactez le support.'
        });
      }

      // 5. GÉNÉRATION TOKENS
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // 6. MISE À JOUR DERNIÈRE CONNEXION
      await UserRepository.updateLastLogin(user.id);

      // 7. RÉINITIALISATION TENTATIVES ÉCHOUÉES
      await UserRepository.resetFailedLoginAttempts(user.id);

      Logger.info('Login successful', {
        requestId,
        userId: user.id
      });

      return res.status(200).json({
        success: true,
        message: 'Connexion réussie',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            isVerified: user.is_verified,
            role: user.role
          },
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: 900
          }
        }
      });

    } catch (error) {
      Logger.error('Login error', error as Error, { requestId });
      
      return res.status(500).json({
        success: false,
        error: 'Une erreur est survenue lors de la connexion'
      });
    }
  }

  /**
   * Refresh token
   * Pattern : Silent Token Refresh
   */
  static async refreshToken(req: Request, res: Response): Promise<Response> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token requis'
        });
      }

      // Vérification et décodage du refresh token
      const decoded = await verifyRefreshToken(refreshToken);

      // Récupération utilisateur
      const user = await UserRepository.findById(decoded.userId);

      if (!user || user.is_suspended) {
        return res.status(401).json({
          success: false,
          error: 'Token invalide'
        });
      }

      // Génération nouveaux tokens
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      return res.status(200).json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: 900
        }
      });

    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Token invalide ou expiré'
      });
    }
  }
}
```

---

## 2. INTÉGRATION FRONTEND-BACKEND EN PROFONDEUR

### 2.1 Client API Centralisé avec Intercepteurs Axios

#### 🎯 Architecture du Client API

```typescript
// front/src/services/api.client.ts

import axios, { 
  AxiosInstance, 
  AxiosError, 
  InternalAxiosRequestConfig,
  AxiosResponse 
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Configuration des clés de stockage
 * Pattern : Constants centralisées
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@gosotral:accessToken',
  REFRESH_TOKEN: '@gosotral:refreshToken',
  USER_DATA: '@gosotral:userData',
  DEVICE_ID: '@gosotral:deviceId'
} as const;

/**
 * Configuration de base de l'API
 * Adapté selon l'environnement (dev/prod)
 */
const API_CONFIG = {
  baseURL: __DEV__ 
    ? Platform.select({
        ios: 'http://localhost:7000',
        android: 'http://10.0.2.2:7000', // Émulateur Android
        default: 'http://192.168.1.78:7000' // Appareil réel
      })
    : 'https://gosotral-api.railway.app',
  timeout: 15000, // 15 secondes
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Platform': Platform.OS,
    'X-Client-Version': '1.0.0'
  }
};

/**
 * Classe ApiClient - Singleton Pattern
 * Gère toutes les communications avec le backend
 */
class ApiClient {
  private client: AxiosInstance;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.client = axios.create(API_CONFIG);
    this.setupInterceptors();
  }

  /**
   * Configuration des intercepteurs Request
   * Automatise l'injection du token et le logging
   */
  private setupRequestInterceptor(): void {
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const requestId = this.generateRequestId();
        config.headers['X-Request-ID'] = requestId;

        // Injection automatique du token d'accès
        const accessToken = await AsyncStorage.getItem(
          STORAGE_KEYS.ACCESS_TOKEN
        );

        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Logging en développement
        if (__DEV__) {
          console.log('📤 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            params: config.params,
            data: config.data,
            requestId
          });
        }

        return config;
      },
      (error: AxiosError) => {
        console.error('❌ Request Interceptor Error:', error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Configuration des intercepteurs Response
   * Gère les erreurs, le refresh token automatique, et le retry
   */
  private setupResponseInterceptor(): void {
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Logging en développement
        if (__DEV__) {
          console.log('📥 API Response:', {
            status: response.status,
            url: response.config.url,
            requestId: response.config.headers['X-Request-ID'],
            data: response.data
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Erreur réseau (pas de réponse serveur)
        if (!error.response) {
          console.error('❌ Network Error:', error.message);
          throw {
            message: 'Erreur réseau. Vérifiez votre connexion.',
            code: 'NETWORK_ERROR',
            originalError: error
          };
        }

        const { status, data } = error.response;

        // 401 Unauthorized - Token expiré
        if (status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Tentative de refresh du token
            const newToken = await this.handleTokenRefresh();

            // Mise à jour du header Authorization
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            // Retry de la requête originale
            return this.client(originalRequest);

          } catch (refreshError) {
            // Échec du refresh - déconnexion
            await this.handleLogout();
            throw {
              message: 'Session expirée. Veuillez vous reconnecter.',
              code: 'SESSION_EXPIRED'
            };
          }
        }

        // 403 Forbidden - Accès refusé
        if (status === 403) {
          throw {
            message: data?.error || 'Accès refusé',
            code: 'FORBIDDEN'
          };
        }

        // 404 Not Found
        if (status === 404) {
          throw {
            message: 'Ressource non trouvée',
            code: 'NOT_FOUND'
          };
        }

        // 429 Too Many Requests - Rate limiting
        if (status === 429) {
          const retryAfter = error.response.headers['retry-after'] || 60;
          throw {
            message: `Trop de requêtes. Réessayez dans ${retryAfter} secondes.`,
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: parseInt(retryAfter)
          };
        }

        // 500+ Server Errors
        if (status >= 500) {
          throw {
            message: 'Erreur serveur. Veuillez réessayer plus tard.',
            code: 'SERVER_ERROR',
            status
          };
        }

        // Erreurs métier (400, 409, etc.)
        throw {
          message: data?.error || 'Une erreur est survenue',
          code: 'API_ERROR',
          status,
          details: data?.details
        };
      }
    );
  }

  /**
   * Gestion du refresh token avec file d'attente
   * Pattern : Request Queue pendant le refresh
   */
  private async handleTokenRefresh(): Promise<string> {
    // Si déjà en cours de refresh, attendre
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshSubscribers.push((token: string) => {
          resolve(token);
        });
      });
    }

    this.isRefreshing = true;

    try {
      const refreshToken = await AsyncStorage.getItem(
        STORAGE_KEYS.REFRESH_TOKEN
      );

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Appel API refresh token (sans intercepteur pour éviter boucle)
      const response = await axios.post(
        `${API_CONFIG.baseURL}/auth/refresh-token`,
        { refreshToken }
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;

      // Sauvegarde des nouveaux tokens
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken]
      ]);

      // Notifier tous les subscribers en attente
      this.refreshSubscribers.forEach(callback => callback(accessToken));
      this.refreshSubscribers = [];

      return accessToken;

    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Déconnexion - Nettoyage complet
   */
  private async handleLogout(): Promise<void> {
    try {
      // Suppression des données locales
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA
      ]);

      // Navigation vers login (via event ou navigation ref)
      // Voir section Context Pattern
    } catch (error) {
      console.error('Logout cleanup error:', error);
    }
  }

  /**
   * Méthodes HTTP publiques
   */
  public async get<T = any>(url: string, config?: any): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  public async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  public async put<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  public async patch<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  public async delete<T = any>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  /**
   * Upload de fichiers avec progression
   */
  public async uploadFile<T = any>(
    url: string,
    file: any,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      }
    });

    return response.data;
  }

  /**
   * Téléchargement de fichiers
   */
  public async downloadFile(
    url: string,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    const response = await this.client.get(url, {
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      }
    });

    return response.data;
  }

  /**
   * Health check API
   */
  public async checkHealth(): Promise<boolean> {
    try {
      await this.client.get('/health', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  // Utilitaires
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupInterceptors(): void {
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }
}

// Export singleton
export const apiClient = new ApiClient();
```

### 2.2 Services Layer - Abstraction API

```typescript
// front/src/services/authService.ts

import { apiClient } from './api.client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  User 
} from '../types/api';

/**
 * Service d'authentification
 * Pattern : Facade - simplifie l'accès à l'API
 */
class AuthService {
  private readonly STORAGE_KEYS = {
    ACCESS_TOKEN: '@gosotral:accessToken',
    REFRESH_TOKEN: '@gosotral:refreshToken',
    USER_DATA: '@gosotral:userData'
  };

  /**
   * Inscription utilisateur
   * Flow complet : validation -> API -> sauvegarde locale
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Validation côté client
      this.validateRegisterData(data);

      // Appel API
      const response = await apiClient.post<AuthResponse>(
        '/auth/register',
        {
          name: data.name.trim(),
          email: data.email.toLowerCase().trim(),
          phone: this.formatPhoneNumber(data.phone),
          password: data.password
        }
      );

      // Sauvegarde automatique des tokens et user
      if (response.success && response.data) {
        await this.saveAuthData(
          response.data.tokens.accessToken,
          response.data.tokens.refreshToken,
          response.data.user
        );
      }

      return response;

    } catch (error) {
      console.error('Register error:', error);
      throw this.formatError(error);
    }
  }

  /**
   * Connexion utilisateur
   * Supporte email OU téléphone
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/auth/login',
        {
          email: credentials.email?.toLowerCase().trim(),
          phone: credentials.phone ? this.formatPhoneNumber(credentials.phone) : undefined,
          password: credentials.password
        }
      );

      if (response.success && response.data) {
        await this.saveAuthData(
          response.data.tokens.accessToken,
          response.data.tokens.refreshToken,
          response.data.user
        );
      }

      return response;

    } catch (error) {
      console.error('Login error:', error);
      throw this.formatError(error);
    }
  }

  /**
   * Vérification OTP email
   */
  async verifyEmail(email: string, otp: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/auth/verify-email',
        { email: email.toLowerCase().trim(), otp }
      );

      // Mise à jour du user local si vérification réussie
      if (response.success && response.data) {
        const userData = await this.getUserData();
        if (userData) {
          userData.isVerified = true;
          await AsyncStorage.setItem(
            this.STORAGE_KEYS.USER_DATA,
            JSON.stringify(userData)
          );
        }
      }

      return response;

    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Renvoi OTP
   */
  async resendOTP(email: string): Promise<{ success: boolean }> {
    try {
      return await apiClient.post('/auth/resend-otp', {
        email: email.toLowerCase().trim()
      });
    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Mot de passe oublié
   */
  async forgotPassword(email: string): Promise<{ success: boolean }> {
    try {
      return await apiClient.post('/auth/forgot-password', {
        email: email.toLowerCase().trim()
      });
    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Réinitialisation mot de passe
   */
  async resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<{ success: boolean }> {
    try {
      return await apiClient.post('/auth/reset-password', {
        email: email.toLowerCase().trim(),
        otp,
        newPassword
      });
    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Récupération du profil utilisateur
   */
  async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get<{ success: boolean; data: User }>(
        '/auth/me'
      );
      
      // Mise à jour cache local
      if (response.success && response.data) {
        await AsyncStorage.setItem(
          this.STORAGE_KEYS.USER_DATA,
          JSON.stringify(response.data)
        );
      }

      return response.data;

    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Mise à jour du profil
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.patch<{ success: boolean; data: User }>(
        '/auth/profile',
        updates
      );

      if (response.success && response.data) {
        await AsyncStorage.setItem(
          this.STORAGE_KEYS.USER_DATA,
          JSON.stringify(response.data)
        );
      }

      return response.data;

    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Changement de mot de passe
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean }> {
    try {
      return await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      // Appel API pour invalider le token côté serveur
      await apiClient.post('/auth/logout').catch(() => {
        // Continuer même si l'appel échoue
      });

      // Nettoyage local
      await this.clearAuthData();

    } catch (error) {
      console.error('Logout error:', error);
      // Toujours nettoyer localement même en cas d'erreur
      await this.clearAuthData();
    }
  }

  /**
   * Vérification si l'utilisateur est authentifié
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(this.STORAGE_KEYS.ACCESS_TOKEN);
    return !!token;
  }

  /**
   * Récupération des données utilisateur depuis le cache
   */
  async getUserData(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Sauvegarde des données d'authentification
   * Pattern : Atomic Write - toutes les données ou aucune
   */
  private async saveAuthData(
    accessToken: string,
    refreshToken: string,
    user: User
  ): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [this.STORAGE_KEYS.ACCESS_TOKEN, accessToken],
        [this.STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
        [this.STORAGE_KEYS.USER_DATA, JSON.stringify(user)]
      ]);
    } catch (error) {
      console.error('Failed to save auth data:', error);
      throw new Error('Erreur de sauvegarde des données');
    }
  }

  /**
   * Nettoyage des données d'authentification
   */
  private async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.STORAGE_KEYS.ACCESS_TOKEN,
        this.STORAGE_KEYS.REFRESH_TOKEN,
        this.STORAGE_KEYS.USER_DATA
      ]);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  /**
   * Validation des données d'inscription
   */
  private validateRegisterData(data: RegisterData): void {
    if (!data.name || data.name.trim().length < 2) {
      throw new Error('Le nom doit contenir au moins 2 caractères');
    }

    if (!this.isValidEmail(data.email)) {
      throw new Error('Email invalide');
    }

    if (data.phone && !this.isValidTogoPhone(data.phone)) {
      throw new Error('Numéro de téléphone invalide (format: +228XXXXXXXX)');
    }

    if (data.password.length < 8) {
      throw new Error('Le mot de passe doit contenir au moins 8 caractères');
    }

    if (!/(?=.*[a-z])/.test(data.password)) {
      throw new Error('Le mot de passe doit contenir au moins une minuscule');
    }

    if (!/(?=.*[A-Z])/.test(data.password)) {
      throw new Error('Le mot de passe doit contenir au moins une majuscule');
    }

    if (!/(?=.*\d)/.test(data.password)) {
      throw new Error('Le mot de passe doit contenir au moins un chiffre');
    }
  }

  /**
   * Validation email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validation numéro Togo
   */
  private isValidTogoPhone(phone: string): boolean {
    const phoneRegex = /^(\+228)?[0-9]{8}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Formatage numéro de téléphone
   */
  private formatPhoneNumber(phone: string): string {
    // Retirer les espaces et caractères spéciaux
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    // Ajouter +228 si absent
    return cleaned.startsWith('+228') ? cleaned : `+228${cleaned}`;
  }

  /**
   * Formatage des erreurs
   */
  private formatError(error: any): Error {
    if (error.message) {
      return new Error(error.message);
    }
    
    if (error.code === 'NETWORK_ERROR') {
      return new Error('Erreur réseau. Vérifiez votre connexion internet.');
    }

    if (error.code === 'SESSION_EXPIRED') {
      return new Error('Votre session a expiré. Veuillez vous reconnecter.');
    }

    return new Error('Une erreur inattendue est survenue');
  }
}

// Export singleton
export const authService = new AuthService();
```

---

## 3. GESTION D'ÉTAT ET SYNCHRONISATION

### 3.1 Context Pattern avec React

```typescript
// front/src/contexts/AuthContext.tsx

import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback,
  ReactNode 
} from 'react';
import { authService } from '../services/authService';
import type { User } from '../types/api';
import { useRouter, useSegments } from 'expo-router';

/**
 * Interface du contexte d'authentification
 */
interface AuthContextValue {
  // État
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (otp: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

/**
 * Création du contexte avec valeur par défaut undefined
 * Pattern : Context avec TypeScript strict
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Props du Provider
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider d'authentification
 * Gère tout l'état d'authentification de l'application
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const segments = useSegments();

  /**
   * Initialisation - Récupération de l'état d'authentification
   * Exécuté au montage du composant
   */
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Protection des routes - Redirection automatique
   * Exécuté à chaque changement d'authentification ou de route
   */
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && inTabsGroup) {
      // Utilisateur non authentifié essaie d'accéder aux onglets -> redirect login
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Utilisateur authentifié sur login/register -> redirect home
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isLoading]);

  /**
   * Initialisation de l'authentification
   * Vérifie si un token existe et récupère les données utilisateur
   */
  const initializeAuth = async (): Promise<void> => {
    try {
      setIsLoading(true);

      // 1. Vérifier si un token existe
      const isAuth = await authService.isAuthenticated();

      if (!isAuth) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // 2. Récupérer les données utilisateur depuis le cache
      let userData = await authService.getUserData();

      // 3. Si pas de cache, récupérer depuis l'API
      if (!userData) {
        userData = await authService.getProfile();
      }

      // 4. Mettre à jour l'état
      setUser(userData);
      setIsAuthenticated(true);

    } catch (error) {
      console.error('Auth initialization error:', error);
      // En cas d'erreur, considérer comme non authentifié
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Connexion
   */
  const login = useCallback(async (
    email: string, 
    password: string
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.login({ email, password });

      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Navigation vers l'accueil gérée par useEffect
      } else {
        throw new Error(response.error || 'Erreur de connexion');
      }

    } catch (error: any) {
      const errorMessage = error.message || 'Erreur de connexion';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Inscription
   */
  const register = useCallback(async (data: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.register(data);

      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Si l'utilisateur n'est pas vérifié, rediriger vers la page de vérification
        if (!response.data.user.isVerified) {
          router.push('/verify-email');
        }
      } else {
        throw new Error(response.error || 'Erreur d\'inscription');
      }

    } catch (error: any) {
      const errorMessage = error.message || 'Erreur d\'inscription';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Vérification email
   */
  const verifyEmail = useCallback(async (otp: string): Promise<void> => {
    if (!user?.email) {
      throw new Error('Aucun utilisateur connecté');
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.verifyEmail(user.email, otp);

      if (response.success && response.data) {
        // Mettre à jour l'utilisateur avec le statut vérifié
        setUser({ ...user, isVerified: true });
        
        // Rediriger vers l'accueil
        router.replace('/(tabs)');
      } else {
        throw new Error(response.error || 'Code de vérification invalide');
      }

    } catch (error: any) {
      const errorMessage = error.message || 'Erreur de vérification';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Mise à jour du profil
   */
  const updateProfile = useCallback(async (
    updates: Partial<User>
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedUser = await authService.updateProfile(updates);
      setUser(updatedUser);

    } catch (error: any) {
      const errorMessage = error.message || 'Erreur de mise à jour';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Rafraîchissement des données utilisateur
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const userData = await authService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // Ne pas mettre à jour l'erreur pour ne pas perturber l'UX
    }
  }, []);

  /**
   * Déconnexion
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      await authService.logout();
      
      setUser(null);
      setIsAuthenticated(false);
      
      // Navigation vers login gérée par useEffect
      
    } catch (error) {
      console.error('Logout error:', error);
      // Déconnecter localement même en cas d'erreur
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Effacement de l'erreur
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  /**
   * Valeur du contexte
   */
  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    verifyEmail,
    updateProfile,
    refreshUser,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personnalisé pour utiliser le contexte
 * Pattern : Custom Hook avec validation
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

/**
 * Hook pour la protection des routes
 * Exemple d'usage dans un écran :
 * 
 * const MyProtectedScreen = () => {
 *   useRequireAuth();
 *   // Le reste du composant
 * };
 */
export const useRequireAuth = (): void => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading]);
};
```

### 3.2 React Query pour l'Admin Web

```typescript
// admin/src/hooks/useReactQuery.ts

import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions 
} from '@tanstack/react-query';
import { userService } from '../services/userService';
import { ticketService } from '../services/ticketService';
import type { User, Ticket, PaginatedResponse } from '../types/api';

/**
 * Hook pour récupérer la liste des utilisateurs
 * Pattern : Cache avec invalidation intelligente
 */
export const useUsersQuery = (
  page: number = 1,
  limit: number = 20,
  filters?: {
    search?: string;
    isVerified?: boolean;
    isSuspended?: boolean;
  }
) => {
  return useQuery({
    // Clé de cache incluant les paramètres
    queryKey: ['users', page, limit, filters],
    
    // Fonction de récupération des données
    queryFn: () => userService.getAllUsers({ page, limit, ...filters }),
    
    // Configuration du cache
    staleTime: 30000, // 30 secondes - données considérées fraîches
    cacheTime: 300000, // 5 minutes - durée de conservation en cache
    
    // Rafraîchissement automatique
    refetchOnWindowFocus: true, // Rafraîchir quand la fenêtre reprend le focus
    refetchInterval: 60000, // Rafraîchir toutes les 60 secondes
    
    // Retry policy
    retry: 2, // 2 tentatives en cas d'échec
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Options avancées
    keepPreviousData: true, // Garder les données précédentes pendant le chargement
    
    // Callback de succès
    onSuccess: (data) => {
      console.log('Users fetched successfully:', data.total);
    },
    
    // Callback d'erreur
    onError: (error) => {
      console.error('Failed to fetch users:', error);
    }
  });
};

/**
 * Hook pour récupérer un utilisateur spécifique
 */
export const useUserQuery = (userId: number | null) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUserById(userId!),
    enabled: userId !== null, // Ne s'exécute que si userId est défini
    staleTime: 60000
  });
};

/**
 * Hook pour récupérer les statistiques dashboard
 */
export const useDashboardStatsQuery = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => userService.getDashboardStats(),
    staleTime: 30000,
    refetchInterval: 30000 // Auto-refresh toutes les 30 secondes
  });
};

/**
 * Hook pour récupérer les tickets
 */
export const useTicketsQuery = (
  page: number = 1,
  limit: number = 20,
  filters?: {
    status?: string;
    lineId?: number;
    startDate?: string;
    endDate?: string;
  }
) => {
  return useQuery({
    queryKey: ['tickets', page, limit, filters],
    queryFn: () => ticketService.getAllTickets({ page, limit, ...filters }),
    staleTime: 20000,
    keepPreviousData: true
  });
};

/**
 * Mutations - Opérations de modification
 */

/**
 * Hook pour la suspension d'utilisateur
 * Pattern : Optimistic Updates
 */
export const useSuspendUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      userId, 
      reason 
    }: { 
      userId: number; 
      reason: string 
    }) => userService.suspendUser(userId, reason),
    
    // Optimistic update - mise à jour immédiate du cache
    onMutate: async ({ userId }) => {
      // Annuler les refetch en cours
      await queryClient.cancelQueries(['users']);
      
      // Snapshot des données actuelles
      const previousUsers = queryClient.getQueryData(['users']);
      
      // Mise à jour optimiste
      queryClient.setQueryData(['users'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          users: old.users.map((user: User) =>
            user.id === userId
              ? { ...user, isSuspended: true }
              : user
          )
        };
      });
      
      // Retourner le snapshot pour rollback en cas d'erreur
      return { previousUsers };
    },
    
    // En cas d'erreur - rollback
    onError: (error, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers);
      }
      console.error('Failed to suspend user:', error);
    },
    
    // En cas de succès - invalider et refetch
    onSuccess: (data, { userId }) => {
      // Invalider toutes les queries d'utilisateurs
      queryClient.invalidateQueries(['users']);
      
      // Invalider la query de l'utilisateur spécifique
      queryClient.invalidateQueries(['user', userId]);
      
      // Invalider les stats
      queryClient.invalidateQueries(['dashboard', 'stats']);
      
      console.log('User suspended successfully');
    },
    
    // Toujours exécuté
    onSettled: () => {
      queryClient.invalidateQueries(['users']);
    }
  });
};

/**
 * Hook pour la réactivation d'utilisateur
 */
export const useReactivateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => userService.reactivateUser(userId),
    
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['user', userId]);
      queryClient.invalidateQueries(['dashboard', 'stats']);
    }
  });
};

/**
 * Hook pour la suppression de ticket
 */
export const useDeleteTicketMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketId: number) => ticketService.deleteTicket(ticketId),
    
    onMutate: async (ticketId) => {
      await queryClient.cancelQueries(['tickets']);
      const previousTickets = queryClient.getQueryData(['tickets']);
      
      // Retirer le ticket du cache de manière optimiste
      queryClient.setQueryData(['tickets'], (old: any) => {
        if (!old) return old;
        return {
          
