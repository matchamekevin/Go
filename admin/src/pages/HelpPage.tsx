import React, { useState } from 'react';
import {
  Book,
  Phone,
  Mail,
  MessageCircle,
  Users,
  Download,
  ExternalLink,
  ChevronDown,
  HelpCircle,
  Shield,
  Database,
  BarChart3,
  Ticket,
  AlertTriangle,
  CheckCircle,
  Zap,
  Clock,
  Star,
  Lightbulb,
  UserCog,
  TrendingUp,
  Building,
  Target,
  ShieldCheck,
  Lock,
  Cookie,
  Home,
  MapPin,
  ChevronUp,
  Info,
  UserCheck,
  Share2,
  Search as SearchIcon
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
}

interface GuideSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  content: {
    introduction: string;
    steps: string[];
    tips: string[];
    warnings?: string[];
  };
  relatedLinks: string[];
}

interface PrivacySection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
  details?: string[];
}

const HelpPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);
  const [expandedPrivacy, setExpandedPrivacy] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      id: 'admin-access',
      question: 'Comment accéder au panneau d\'administration ?',
      answer: 'Pour accéder au panneau d\'administration, utilisez vos identifiants super-admin ou admin. L\'URL d\'accès est fournie lors de la configuration initiale. Si vous avez perdu vos identifiants, contactez le support technique.',
      category: 'administration',
      tags: ['connexion', 'accès', 'admin'],
      priority: 'high'
    },
    {
      id: 'user-management',
      question: 'Comment gérer les utilisateurs du système ?',
      answer: 'Dans la section "Utilisateurs", vous pouvez voir tous les comptes, les filtrer par statut (vérifié, suspendu, etc.), modifier les informations, changer les rôles, ou suspendre/réactiver des comptes. Utilisez les filtres pour une recherche efficace.',
      category: 'utilisateurs',
      tags: ['utilisateurs', 'gestion', 'comptes'],
      priority: 'high'
    },
    {
      id: 'ticket-validation',
      question: 'Comment fonctionne la validation des tickets ?',
      answer: 'Les tickets sont validés via l\'application scanner. Le système vérifie automatiquement la validité, l\'expiration et l\'usage unique. En cas d\'erreur, le scanner affiche un message d\'erreur avec le code spécifique.',
      category: 'tickets',
      tags: ['tickets', 'validation', 'scanner'],
      priority: 'medium'
    },
    {
      id: 'payment-issues',
      question: 'Que faire en cas de problème de paiement ?',
      answer: 'Vérifiez d\'abord le statut de la transaction dans la section "Paiements". Si le paiement est en attente, attendez la confirmation. En cas d\'échec définitif, contactez le support avec l\'ID de transaction pour un remboursement.',
      category: 'paiements',
      tags: ['paiements', 'transactions', 'remboursement'],
      priority: 'high'
    },
    {
      id: 'route-management',
      question: 'Comment ajouter ou modifier une ligne de transport ?',
      answer: 'Dans la section "Lignes de Transport", cliquez sur "Nouvelle Ligne" pour ajouter une route. Remplissez les informations (numéro, nom, arrêts, tarifs). Pour modifier, sélectionnez la ligne et cliquez sur "Modifier". Les changements sont appliqués immédiatement.',
      category: 'routes',
      tags: ['routes', 'lignes', 'transport'],
      priority: 'medium'
    },
    {
      id: 'reports-generation',
      question: 'Comment générer des rapports personnalisés ?',
      answer: 'Utilisez la section "Rapports" pour sélectionner le type (financier, utilisateurs, tickets, lignes). Choisissez la période et exportez en PDF. Les données sont calculées en temps réel depuis la base de données.',
      category: 'rapports',
      tags: ['rapports', 'export', 'pdf', 'statistiques'],
      priority: 'medium'
    },
    {
      id: 'system-backup',
      question: 'Comment effectuer une sauvegarde du système ?',
      answer: 'Les sauvegardes sont automatiques toutes les 24h. Pour une sauvegarde manuelle, contactez l\'équipe technique. Les fichiers sont stockés sur le serveur sécurisé.',
      category: 'maintenance',
      tags: ['sauvegarde', 'backup', 'maintenance'],
      priority: 'high'
    },
    {
      id: 'api-integration',
      question: 'Comment intégrer l\'API dans une application tierce ?',
      answer: 'Consultez la documentation API dans la section "Développeurs". Obtenez une clé API en contactant l\'équipe technique. Utilisez les endpoints RESTful avec authentification JWT. Des exemples de code sont disponibles.',
      category: 'developpement',
      tags: ['api', 'integration', 'jwt'],
      priority: 'low'
    },
    {
      id: 'privacy-rights',
      question: 'Quels sont mes droits concernant mes données personnelles ?',
      answer: 'Vous disposez du droit d\'accès, de rectification, d\'effacement, de limitation du traitement, de portabilité et d\'opposition concernant vos données personnelles. Contactez-nous à privacy@gosotral.tg pour exercer ces droits.',
      category: 'donnees-personnelles',
      tags: ['données', 'RGPD', 'droits', 'confidentialité'],
      priority: 'high'
    },
    {
      id: 'data-retention',
      question: 'Combien de temps conservons-nous vos données ?',
      answer: 'Les données de paiement sont conservées 7 ans (obligation légale), les logs techniques 1 an, et les données de compte utilisateur jusqu\'à suppression du compte ou demande d\'effacement.',
      category: 'donnees-personnelles',
      tags: ['conservation', 'durée', 'RGPD'],
      priority: 'medium'
    }
  ];

  const guides: GuideSection[] = [
    {
      id: 'getting-started',
      title: 'Premiers Pas - Administration',
      description: 'Guide complet pour débuter avec le panneau d\'administration',
      icon: <Zap className="h-6 w-6" />,
      color: 'bg-yellow-100 text-yellow-600',
      content: {
        introduction: 'Ce guide vous accompagne dans la prise en main du système d\'administration GoSOTRAL.',
        steps: [
          'Connectez-vous avec vos identifiants administrateur',
          'Explorez le tableau de bord pour comprendre les métriques',
          'Explorez le tableau de bord pour comprendre les métriques',
          'Familiarisez-vous avec les principales sections',
          'Testez les fonctionnalités de base'
        ],
        tips: [
          'Utilisez les raccourcis clavier pour une navigation rapide',
          'Activez les notifications pour rester informé des événements importants',
          'Personnalisez le tableau de bord selon vos besoins',
          'Sauvegardez régulièrement vos configurations'
        ],
        warnings: [
          'Ne partagez jamais vos identifiants administrateur',
          'Vérifiez toujours les permissions avant d\'effectuer des actions sensibles'
        ]
      },
      relatedLinks: ['user-management', 'dashboard-overview', 'security-settings']
    },
    {
      id: 'user-management',
      title: 'Gestion des Utilisateurs',
      description: 'Administration complète des comptes utilisateur',
      icon: <UserCog className="h-6 w-6" />,
      color: 'bg-blue-100 text-blue-600',
      content: {
        introduction: 'Apprenez à gérer efficacement tous les aspects des comptes utilisateurs.',
        steps: [
          'Accéder à la section Utilisateurs depuis le menu principal',
          'Utiliser les filtres pour rechercher des utilisateurs spécifiques',
          'Modifier les informations de profil et rôles',
          'Gérer les statuts de vérification et suspension',
          'Exporter les données utilisateur si nécessaire'
        ],
        tips: [
          'Utilisez la recherche avancée pour filtrer par email, nom ou téléphone',
          'Les suspensions temporaires sont préférables aux suppressions définitives',
          'Vérifiez toujours l\'historique avant de modifier un statut',
          'Communiquez les changements importants aux utilisateurs concernés'
        ]
      },
      relatedLinks: ['user-verification', 'bulk-actions', 'user-import']
    },
    {
      id: 'financial-reports',
      title: 'Rapports Financiers Détaillés',
      description: 'Maîtriser l\'analyse financière et les rapports de revenus',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'bg-green-100 text-green-600',
      content: {
        introduction: 'Comprendre et analyser les performances financières de la plateforme.',
        steps: [
          'Sélectionner le type de rapport (financier, utilisateurs, tickets)',
          'Choisir la période d\'analyse appropriée',
          'Examiner les métriques clés et tendances',
          'Exporter les rapports en PDF avec le branding',
          'Archiver les rapports importants pour référence future'
        ],
        tips: [
          'Comparez les périodes pour identifier les tendances',
          'Utilisez les totaux pour un aperçu rapide des performances',
          'Les données proviennent directement de la base de données',
          'Programmez des rapports réguliers pour un suivi continu'
        ]
      },
      relatedLinks: ['report-customization', 'data-export', 'financial-metrics']
    },
    {
      id: 'system-security',
      title: 'Sécurité et Maintenance',
      description: 'Assurer la sécurité et la stabilité du système',
      icon: <Shield className="h-6 w-6" />,
      color: 'bg-red-100 text-red-600',
      content: {
        introduction: 'Maintenir un environnement sécurisé et performant.',
        steps: [
          'Régulièrement mettre à jour les mots de passe',
          'Surveiller les logs de sécurité et les tentatives de connexion',
          'Effectuer des sauvegardes régulières du système',
          'Vérifier les permissions des utilisateurs',
          'Mettre à jour le système et les dépendances'
        ],
        tips: [
          'Activez l\'authentification à deux facteurs pour les comptes admin',
          'Surveillez les connexions suspectes dans les logs',
          'Testez les restaurations de sauvegarde régulièrement',
          'Gardez une liste des accès d\'urgence sécurisée'
        ],
        warnings: [
          'Ne désactivez jamais la journalisation de sécurité',
          'Les sauvegardes doivent être testées régulièrement',
          'Signalez immédiatement toute activité suspecte'
        ]
      },
      relatedLinks: ['backup-procedures', 'security-logs', 'emergency-access']
    },
    {
      id: 'troubleshooting',
      title: 'Dépannage Avancé',
      description: 'Résoudre les problèmes techniques courants',
      icon: <AlertTriangle className="h-6 w-6" />,
      color: 'bg-orange-100 text-orange-600',
      content: {
        introduction: 'Guide de résolution des problèmes les plus fréquents.',
        steps: [
          'Identifier le symptôme et la gravité du problème',
          'Consulter les logs système pour des informations détaillées',
          'Vérifier la connectivité réseau et base de données',
          'Appliquer la solution appropriée selon le guide',
          'Tester la résolution et documenter la procédure'
        ],
        tips: [
          'Les logs contiennent souvent la solution au problème',
          'Redémarrez les services un par un pour isoler les problèmes',
          'Documentez toutes les résolutions pour référence future',
          'Contactez le support si le problème persiste'
        ]
      },
      relatedLinks: ['error-codes', 'system-logs', 'support-contact']
    }
  ];

  const privacySections: PrivacySection[] = [
    {
      id: 'responsible',
      title: 'Responsable du traitement',
      icon: <Building className="h-5 w-5" />,
      content: 'GoSOTRAL (Société de Transport Go) est responsable du traitement de vos données personnelles.',
      details: [
        'Adresse: Lomé, Togo',
        'Contact: privacy@gosotral.tg',
        'Téléphone: +228 70 47 24 36 / +228 96 73 22 47'
      ]
    },
    {
      id: 'collected-data',
      title: 'Données collectées',
      icon: <Database className="h-5 w-5" />,
      content: 'Nous collectons uniquement les données nécessaires au fonctionnement du service de transport.',
      details: [
        'Données d\'identification: nom, prénom, email, téléphone',
        'Données de paiement: informations de carte (tokenisées), historique des transactions',
        'Données d\'usage: historique des achats, préférences de voyage',
        'Données techniques: adresse IP, logs de connexion, type d\'appareil'
      ]
    },
    {
      id: 'purposes',
      title: 'Finalités du traitement',
      icon: <Target className="h-5 w-5" />,
      content: 'Vos données sont utilisées exclusivement pour fournir et améliorer nos services.',
      details: [
        'Gestion des comptes utilisateur et authentification',
        'Traitement des paiements et validation des tickets',
        'Communication sur les services et support client',
        'Amélioration de l\'expérience utilisateur',
        'Conformité légale et sécurité'
      ]
    },
    {
      id: 'retention',
      title: 'Durée de conservation',
      icon: <Clock className="h-5 w-5" />,
      content: 'Nous conservons vos données pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées.',
      details: [
        'Données de compte: jusqu\'à suppression du compte',
        'Données de paiement: 7 ans (obligation légale)',
        'Logs techniques: 1 an maximum',
        'Données marketing: 3 ans après dernier contact'
      ]
    },
    {
      id: 'rights',
      title: 'Vos droits',
      icon: <ShieldCheck className="h-5 w-5" />,
      content: 'Vous disposez de droits étendus sur vos données personnelles.',
      details: [
        'Droit d\'accès à vos données',
        'Droit de rectification des données inexactes',
        'Droit à l\'effacement (droit à l\'oubli)',
        'Droit à la limitation du traitement',
        'Droit à la portabilité des données',
        'Droit d\'opposition au traitement'
      ]
    },
    {
      id: 'security',
      title: 'Mesures de sécurité',
      icon: <Lock className="h-5 w-5" />,
      content: 'Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données.',
      details: [
        'Chiffrement des données en transit (TLS 1.3)',
        'Chiffrement des données au repos',
        'Contrôle d\'accès strict (principe du moindre privilège)',
        'Sauvegardes régulières et sécurisées',
        'Surveillance continue des accès',
        'Formation du personnel à la protection des données'
      ]
    },
    {
      id: 'sharing',
      title: 'Partage de données',
      icon: <Share2 className="h-5 w-5" />,
      content: 'Vos données ne sont partagées qu\'avec des partenaires de confiance et uniquement lorsque nécessaire.',
      details: [
        'Prestataires de paiement (Stripe, Wave, etc.)',
        'Services d\'hébergement cloud sécurisés',
        'Autorités légales sur réquisition judiciaire',
        'Sous-traitants techniques (avec contrat RGPD)'
      ]
    },
    {
      id: 'cookies',
      title: 'Cookies et traceurs',
      icon: <Cookie className="h-5 w-5" />,
      content: 'Nous utilisons des cookies essentiels au fonctionnement du service.',
      details: [
        'Cookies essentiels: authentification, sécurité',
        'Cookies analytiques: statistiques d\'usage (anonymisées)',
        'Cookies de préférences: langue, thème',
        'Durée maximale: 13 mois'
      ]
    }
  ];

  const contactInfo = {
    phone: '+228 70 47 24 36',
    phone2: '+228 96 73 22 47',
    email: 'matchamegnatikevin894@gmail.com',
    email2: '2003gnati24@gmail.com',
    whatsapp: '+228 70 47 24 36',
    address: 'Lomé, Quartier Administratif, Togo',
    emergency: '+228 96 73 22 47',
    privacy: 'privacy@gosotral.tg'
  };

  const categories = [
    { id: 'all', name: 'Toutes les catégories', count: faqs.length },
    { id: 'administration', name: 'Administration', count: faqs.filter(f => f.category === 'administration').length },
    { id: 'utilisateurs', name: 'Utilisateurs', count: faqs.filter(f => f.category === 'utilisateurs').length },
    { id: 'tickets', name: 'Tickets', count: faqs.filter(f => f.category === 'tickets').length },
    { id: 'paiements', name: 'Paiements', count: faqs.filter(f => f.category === 'paiements').length },
    { id: 'routes', name: 'Lignes', count: faqs.filter(f => f.category === 'routes').length },
    { id: 'rapports', name: 'Rapports', count: faqs.filter(f => f.category === 'rapports').length },
    { id: 'maintenance', name: 'Maintenance', count: faqs.filter(f => f.category === 'maintenance').length },
    { id: 'developpement', name: 'Développement', count: faqs.filter(f => f.category === 'developpement').length },
    { id: 'donnees-personnelles', name: 'Données personnelles', count: faqs.filter(f => f.category === 'donnees-personnelles').length }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const toggleGuide = (id: string) => {
    setExpandedGuide(expandedGuide === id ? null : id);
  };

  const togglePrivacy = (id: string) => {
    setExpandedPrivacy(expandedPrivacy === id ? null : id);
  };

  const downloadGuide = (guideId: string) => {
    console.log(`Téléchargement du guide: ${guideId}`);
    // TODO: Implémenter le téléchargement du guide PDF
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Info className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <HelpCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Header avec recherche */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <HelpCircle className="h-8 w-8 text-[#065f46] mr-3" />
              Centre d'Aide GoSOTRAL
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Votre guide complet pour maîtriser l'administration du système de transport
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 border-b border-gray-200">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: <Home className="h-5 w-5" /> },
            { id: 'faq', label: 'FAQ', icon: <HelpCircle className="h-5 w-5" /> },
            { id: 'guides', label: 'Guides', icon: <Book className="h-5 w-5" /> },
            { id: 'privacy', label: 'Données personnelles', icon: <Shield className="h-5 w-5" /> },
            { id: 'contact', label: 'Contact', icon: <Phone className="h-5 w-5" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-[#065f46] text-[#065f46] bg-[#065f46] bg-opacity-5'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Vue d'ensemble */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Sections principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="h-6 w-6 text-[#065f46] mr-2" />
                Démarrage Rapide
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Connexion administrateur</p>
                    <p className="text-sm text-gray-600">Accédez au panneau avec vos identifiants</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Tableau de bord</p>
                    <p className="text-sm text-gray-600">Découvrez les métriques principales</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Première configuration</p>
                    <p className="text-sm text-gray-600">Paramétrez vos préférences</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="h-6 w-6 text-[#065f46] mr-2" />
                Fonctionnalités Clés
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-500 mr-3" />
                  <span className="text-gray-700">Gestion complète des utilisateurs</span>
                </div>
                <div className="flex items-center">
                  <Ticket className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Validation temps réel des tickets</span>
                </div>
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-purple-500 mr-3" />
                  <span className="text-gray-700">Rapports détaillés et export PDF</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-red-500 mr-3" />
                  <span className="text-gray-700">Sécurité et sauvegardes automatiques</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ */}
      {activeTab === 'faq' && (
        <div>
          {/* Filtres par catégorie */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-[#065f46] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>

          {/* Liste FAQ */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <HelpCircle className="h-6 w-6 text-[#065f46] mr-2" />
                Questions Fréquemment Posées ({filteredFAQs.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredFAQs.map((faq) => (
                <div key={faq.id} className="p-6">
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="flex items-center justify-between w-full text-left group"
                  >
                    <div className="flex items-center">
                      {getPriorityIcon(faq.priority)}
                      <h4 className="text-lg font-medium text-gray-900 ml-3 group-hover:text-[#065f46] transition-colors">
                        {faq.question}
                      </h4>
                    </div>
                    {expandedFAQ === faq.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {expandedFAQ === faq.id && (
                    <div className="mt-4 text-gray-700 leading-relaxed">
                      {faq.answer}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {faq.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Guides */}
      {activeTab === 'guides' && (
        <div className="space-y-6">
          {guides.map((guide) => (
            <div key={guide.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleGuide(guide.id)}
                className="w-full px-6 py-4 text-left border-b border-gray-200 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 ${guide.color} rounded-lg flex items-center justify-center mr-4`}>
                      {guide.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-[#065f46] transition-colors">
                        {guide.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{guide.description}</p>
                    </div>
                  </div>
                  {expandedGuide === guide.id ? (
                    <ChevronUp className="h-6 w-6 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-gray-500" />
                  )}
                </div>
              </button>

              {expandedGuide === guide.id && (
                <div className="px-6 py-6 border-t border-gray-200">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 mb-6">{guide.content.introduction}</p>

                    <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Étapes à suivre
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 mb-6 text-gray-700">
                      {guide.content.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>

                    <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                      <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
                      Conseils pratiques
                    </h4>
                    <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700">
                      {guide.content.tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>

                    {guide.content.warnings && (
                      <>
                        <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                          Points d'attention
                        </h4>
                        <ul className="list-disc list-inside space-y-2 mb-6 text-red-700">
                          {guide.content.warnings.map((warning) => (
                            <li key={warning}>{warning}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-gray-600">Liens connexes:</span>
                      {guide.relatedLinks.map((link) => (
                        <span key={link} className="px-3 py-1 bg-[#065f46] bg-opacity-10 text-[#065f46] text-sm rounded-full">
                          {link}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Temps de lecture estimé: {Math.ceil(guide.content.steps.length * 0.5 + guide.content.tips.length * 0.3)} min
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => downloadGuide(guide.id)}
                        className="flex items-center px-4 py-2 bg-[#065f46] text-white text-sm rounded-lg hover:bg-[#10b981] transition-colors"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger PDF
                      </button>
                      <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Version web
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Données personnelles */}
      {activeTab === 'privacy' && (
        <div className="space-y-8">
          {/* Introduction */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <Shield className="h-6 w-6 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-blue-800">Protection de vos données personnelles</h3>
                <p className="text-blue-700 mt-1">
                  Chez GoSOTRAL, la protection de vos données personnelles est notre priorité.
                  Cette section détaille comment nous collectons, utilisons et protégeons vos informations.
                </p>
              </div>
            </div>
          </div>

          {/* Sections de confidentialité */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {privacySections.map((section) => (
              <div key={section.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => togglePrivacy(section.id)}
                  className="w-full px-6 py-4 text-left border-b border-gray-200 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[#065f46] bg-opacity-10 rounded-lg flex items-center justify-center text-[#065f46] mr-4">
                        {section.icon}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-[#065f46] transition-colors">
                        {section.title}
                      </h3>
                    </div>
                    {expandedPrivacy === section.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </button>

                {expandedPrivacy === section.id && (
                  <div className="px-6 py-4">
                    <p className="text-gray-700 mb-4">{section.content}</p>
                    {section.details && (
                      <ul className="space-y-2">
                        {section.details.map((detail, index) => (
                          <li key={index} className="flex items-start text-gray-700">
                            <span className="text-[#065f46] mr-2">•</span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions pour les droits */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserCheck className="h-6 w-6 text-[#065f46] mr-2" />
              Exercer vos droits
            </h3>
            <p className="text-gray-700 mb-6">
              Pour exercer vos droits concernant vos données personnelles, contactez-nous :
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Par email</h4>
                <p className="text-gray-600">{contactInfo.privacy}</p>
                <p className="text-sm text-gray-500 mt-1">Réponse sous 30 jours</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Par courrier</h4>
                <p className="text-gray-600">{contactInfo.address}</p>
                <p className="text-sm text-gray-500 mt-1">Joignez une copie de votre pièce d'identité</p>
              </div>
            </div>
          </div>

          {/* Téléchargement de la politique */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Politique de confidentialité complète</h3>
                <p className="text-gray-600 mt-1">
                  Téléchargez la version complète de notre politique de confidentialité (PDF)
                </p>
              </div>
              <button className="flex items-center px-6 py-3 bg-[#065f46] text-white rounded-lg hover:bg-[#10b981] transition-colors">
                <Download className="h-5 w-5 mr-2" />
                Télécharger PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact */}
      {activeTab === 'contact' && (
        <div className="space-y-8">
          {/* Informations de contact principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <Phone className="h-6 w-6 text-[#065f46] mr-2" />
                Support Technique
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Phone className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">Téléphone</p>
                    <p className="text-gray-600">{contactInfo.phone}</p>
                    <p className="text-xs text-gray-500 mt-1">Lundi - Vendredi: 8h00 - 18h00</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-gray-600">{contactInfo.email}</p>
                    <p className="text-xs text-gray-500 mt-1">Réponse sous 24h</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">WhatsApp</p>
                    <p className="text-gray-600">{contactInfo.whatsapp}</p>
                    <p className="text-xs text-gray-500 mt-1">Support rapide disponible</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                Support d'Urgence
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-red-500 pl-4">
                  <p className="font-medium text-gray-900">Urgences Système</p>
                  <p className="text-gray-600 text-lg font-mono">{contactInfo.emergency}</p>
                  <p className="text-gray-600 text-sm">24h/24 - 7j/7 pour les pannes critiques</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <p className="font-medium text-gray-900">Support Commercial</p>
                  <p className="text-gray-600">Lundi - Samedi: 8h00 - 20h00</p>
                  <p className="text-gray-600 text-sm">Pour les questions business</p>
                </div>
              </div>
            </div>
          </div>

          {/* Adresse et horaires détaillés */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
              <MapPin className="h-6 w-6 text-[#065f46] mr-2" />
              Informations Complémentaires
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Adresse</h4>
                <p className="text-gray-600">{contactInfo.address}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Horaires d'Ouverture</h4>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Lundi - Vendredi:</span>
                    <span>8h00 - 18h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Samedi:</span>
                    <span>9h00 - 15h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimanche:</span>
                    <span>Fermé</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de contact rapide */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contactez-nous rapidement</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:border-[#065f46] transition-colors">
                <Phone className="h-6 w-6 text-[#065f46] mr-3" />
                <span className="font-medium">Appeler maintenant</span>
              </button>
              <button className="flex items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:border-[#065f46] transition-colors">
                <MessageCircle className="h-6 w-6 text-[#065f46] mr-3" />
                <span className="font-medium">WhatsApp</span>
              </button>
              <button className="flex items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:border-[#065f46] transition-colors">
                <Mail className="h-6 w-6 text-[#065f46] mr-3" />
                <span className="font-medium">Email</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HelpPage;
