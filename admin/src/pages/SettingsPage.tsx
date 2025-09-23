import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Shield, 
  Bell, 
  Database, 
  Phone,
  DollarSign,
  Users,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Settings {
  general: {
    app_name: string;
    app_description: string;
    contact_email: string;
    contact_phone: string;
    address: string;
    timezone: string;
    language: string;
  };
  payment: {
    default_currency: string;
    payment_methods: string[];
    commission_rate: number;
    min_transaction: number;
    max_transaction: number;
  };
  security: {
    session_timeout: number;
    max_login_attempts: number;
    password_min_length: number;
    require_2fa: boolean;
    auto_logout: boolean;
  };
  notifications: {
    email_notifications: boolean;
    sms_notifications: boolean;
    push_notifications: boolean;
    admin_alerts: boolean;
    user_registration_alert: boolean;
  };
  system: {
    maintenance_mode: boolean;
    debug_mode: boolean;
    api_rate_limit: number;
    backup_frequency: string;
    log_retention_days: number;
  };
}

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // TODO: Remplacer par l'appel API réel
      // const response = await SettingsService.getSettings();
      
      // Données mockées pour l'instant
      const mockSettings: Settings = {
        general: {
          app_name: 'GO Transport',
          app_description: 'Plateforme de transport public au Togo',
          contact_email: 'support@go-transport.tg',
          contact_phone: '+228 XX XX XX XX',
          address: 'Lomé, Togo',
          timezone: 'Africa/Lome',
          language: 'fr'
        },
        payment: {
          default_currency: 'FCFA',
          payment_methods: ['mobile_money', 'card'],
          commission_rate: 5,
          min_transaction: 100,
          max_transaction: 50000
        },
        security: {
          session_timeout: 30,
          max_login_attempts: 5,
          password_min_length: 8,
          require_2fa: false,
          auto_logout: true
        },
        notifications: {
          email_notifications: true,
          sms_notifications: true,
          push_notifications: true,
          admin_alerts: true,
          user_registration_alert: true
        },
        system: {
          maintenance_mode: false,
          debug_mode: false,
          api_rate_limit: 100,
          backup_frequency: 'daily',
          log_retention_days: 30
        }
      };
      
      setSettings(mockSettings);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (category: keyof Settings, key: string, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    });
    setUnsavedChanges(true);
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      // TODO: Appel API pour sauvegarder
      // await SettingsService.updateSettings(settings);
      
      setUnsavedChanges(false);
      toast.success('Paramètres sauvegardés avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Êtes-vous sûr de vouloir restaurer les paramètres par défaut ?')) {
      fetchSettings();
      setUnsavedChanges(false);
      toast.success('Paramètres restaurés par défaut');
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#065f46]"></div>
        <span className="ml-2 text-gray-600">Chargement des paramètres...</span>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'Général', icon: <Users className="h-5 w-5" /> },
    { id: 'payment', label: 'Paiements', icon: <DollarSign className="h-5 w-5" /> },
    { id: 'security', label: 'Sécurité', icon: <Shield className="h-5 w-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-5 w-5" /> },
    { id: 'system', label: 'Système', icon: <Database className="h-5 w-5" /> }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Paramètres Système</h1>
            <p className="mt-2 text-sm text-gray-600">
              Configurez les paramètres globaux de l'application
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={resetToDefaults}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réinitialiser
            </button>
            <button
              onClick={saveSettings}
              disabled={!unsavedChanges || saving}
              className="flex items-center px-4 py-2 bg-[#065f46] text-white rounded-lg hover:bg-[#10b981] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
        
        {unsavedChanges && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800">Vous avez des modifications non sauvegardées</span>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation par onglets */}
        <div className="lg:w-64">
          <div className="bg-white rounded-lg border border-gray-200 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#065f46] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                <span className="ml-3">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contenu des paramètres */}
        <div className="flex-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            
            {/* Paramètres Généraux */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informations Générales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de l'application
                      </label>
                      <input
                        type="text"
                        value={settings.general.app_name}
                        onChange={(e) => updateSetting('general', 'app_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Langue par défaut
                      </label>
                      <select
                        value={settings.general.language}
                        onChange={(e) => updateSetting('general', 'language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46]"
                      >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={settings.general.app_description}
                        onChange={(e) => updateSetting('general', 'app_description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46] resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <Phone className="h-5 w-5 mr-2" />
                    Contact
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email de contact
                      </label>
                      <input
                        type="email"
                        value={settings.general.contact_email}
                        onChange={(e) => updateSetting('general', 'contact_email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={settings.general.contact_phone}
                        onChange={(e) => updateSetting('general', 'contact_phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46]"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse
                      </label>
                      <input
                        type="text"
                        value={settings.general.address}
                        onChange={(e) => updateSetting('general', 'address', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Paramètres Paiements */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Configuration des Paiements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Devise par défaut
                    </label>
                    <select
                      value={settings.payment.default_currency}
                      onChange={(e) => updateSetting('payment', 'default_currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46]"
                    >
                      <option value="FCFA">FCFA (Franc CFA)</option>
                      <option value="EUR">EUR (Euro)</option>
                      <option value="USD">USD (Dollar)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taux de commission (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={settings.payment.commission_rate}
                      onChange={(e) => updateSetting('payment', 'commission_rate', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction minimum (FCFA)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={settings.payment.min_transaction}
                      onChange={(e) => updateSetting('payment', 'min_transaction', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction maximum (FCFA)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={settings.payment.max_transaction}
                      onChange={(e) => updateSetting('payment', 'max_transaction', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Paramètres Sécurité */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Paramètres de Sécurité</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timeout de session (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="480"
                      value={settings.security.session_timeout}
                      onChange={(e) => updateSetting('security', 'session_timeout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tentatives de connexion max
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="10"
                      value={settings.security.max_login_attempts}
                      onChange={(e) => updateSetting('security', 'max_login_attempts', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longueur minimum mot de passe
                    </label>
                    <input
                      type="number"
                      min="6"
                      max="20"
                      value={settings.security.password_min_length}
                      onChange={(e) => updateSetting('security', 'password_min_length', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46]"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.security.require_2fa}
                      onChange={(e) => updateSetting('security', 'require_2fa', e.target.checked)}
                      className="rounded border-gray-300 text-[#065f46] focus:ring-[#065f46]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Exiger l'authentification à deux facteurs</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.security.auto_logout}
                      onChange={(e) => updateSetting('security', 'auto_logout', e.target.checked)}
                      className="rounded border-gray-300 text-[#065f46] focus:ring-[#065f46]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Déconnexion automatique</span>
                  </label>
                </div>
              </div>
            )}

            {/* Paramètres Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Paramètres des Notifications</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notifications.email_notifications}
                      onChange={(e) => updateSetting('notifications', 'email_notifications', e.target.checked)}
                      className="rounded border-gray-300 text-[#065f46] focus:ring-[#065f46]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Notifications par email</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notifications.sms_notifications}
                      onChange={(e) => updateSetting('notifications', 'sms_notifications', e.target.checked)}
                      className="rounded border-gray-300 text-[#065f46] focus:ring-[#065f46]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Notifications SMS</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notifications.push_notifications}
                      onChange={(e) => updateSetting('notifications', 'push_notifications', e.target.checked)}
                      className="rounded border-gray-300 text-[#065f46] focus:ring-[#065f46]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Notifications push</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notifications.admin_alerts}
                      onChange={(e) => updateSetting('notifications', 'admin_alerts', e.target.checked)}
                      className="rounded border-gray-300 text-[#065f46] focus:ring-[#065f46]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Alertes administrateur</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notifications.user_registration_alert}
                      onChange={(e) => updateSetting('notifications', 'user_registration_alert', e.target.checked)}
                      className="rounded border-gray-300 text-[#065f46] focus:ring-[#065f46]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Alertes d'inscription utilisateur</span>
                  </label>
                </div>
              </div>
            )}

            {/* Paramètres Système */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Paramètres Système</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Limite API (req/min)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="1000"
                      value={settings.system.api_rate_limit}
                      onChange={(e) => updateSetting('system', 'api_rate_limit', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rétention logs (jours)
                    </label>
                    <input
                      type="number"
                      min="7"
                      max="365"
                      value={settings.system.log_retention_days}
                      onChange={(e) => updateSetting('system', 'log_retention_days', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fréquence de sauvegarde
                    </label>
                    <select
                      value={settings.system.backup_frequency}
                      onChange={(e) => updateSetting('system', 'backup_frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46]"
                    >
                      <option value="hourly">Toutes les heures</option>
                      <option value="daily">Quotidienne</option>
                      <option value="weekly">Hebdomadaire</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.system.maintenance_mode}
                      onChange={(e) => updateSetting('system', 'maintenance_mode', e.target.checked)}
                      className="rounded border-gray-300 text-[#065f46] focus:ring-[#065f46]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Mode maintenance</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.system.debug_mode}
                      onChange={(e) => updateSetting('system', 'debug_mode', e.target.checked)}
                      className="rounded border-gray-300 text-[#065f46] focus:ring-[#065f46]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Mode debug</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;