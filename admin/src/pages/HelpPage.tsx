import React, { useState } from 'react';
import { 
  Book, 
  Phone, 
  Mail, 
  MessageCircle, 
  FileText, 
  Video, 
  Users, 
  Settings, 
  Download,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Search,
  HelpCircle
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface GuideSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: string[];
}

const HelpPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'Comment acheter un ticket de transport ?',
      answer: 'Pour acheter un ticket, ouvrez l\'application, sélectionnez votre destination, choisissez le type de transport et procédez au paiement via Mobile Money ou carte bancaire.',
      category: 'tickets'
    },
    {
      id: '2',
      question: 'Que faire si mon paiement a été débité mais je n\'ai pas reçu le ticket ?',
      answer: 'Si votre paiement a été débité sans recevoir le ticket, contactez notre support via l\'application ou par téléphone. Nous traiterons votre demande dans les 24h.',
      category: 'paiement'
    },
    {
      id: '3',
      question: 'Comment scanner un ticket QR code ?',
      answer: 'Ouvrez l\'application scanner, pointez la caméra vers le code QR du ticket. Le système vérifiera automatiquement la validité du ticket.',
      category: 'scanner'
    },
    {
      id: '4',
      question: 'Les horaires sont-ils mis à jour en temps réel ?',
      answer: 'Oui, tous les horaires affichés dans l\'application sont mis à jour en temps réel selon les informations fournies par les compagnies de transport.',
      category: 'horaires'
    },
    {
      id: '5',
      question: 'Comment ajouter un administrateur au système ?',
      answer: 'Seuls les super-administrateurs peuvent ajouter de nouveaux administrateurs. Allez dans la section Utilisateurs et cliquez sur "Nouvel Administrateur".',
      category: 'administration'
    }
  ];

  const guides: GuideSection[] = [
    {
      id: 'user',
      title: 'Guide Utilisateur',
      description: 'Comment utiliser l\'application pour acheter et gérer vos tickets',
      icon: <Users className="h-6 w-6" />,
      content: [
        'Créer un compte et se connecter',
        'Rechercher et sélectionner un trajet',
        'Effectuer un paiement sécurisé',
        'Gérer ses tickets actifs',
        'Consulter l\'historique des voyages'
      ]
    },
    {
      id: 'admin',
      title: 'Guide Administrateur',
      description: 'Administration du système et gestion des utilisateurs',
      icon: <Settings className="h-6 w-6" />,
      content: [
        'Tableau de bord et statistiques',
        'Gestion des utilisateurs',
        'Configuration des routes et tarifs',
        'Suivi des transactions',
        'Rapports et analyses'
      ]
    },
    {
      id: 'scanner',
      title: 'Guide Scanner',
      description: 'Utilisation de l\'application de scan pour valider les tickets',
      icon: <Video className="h-6 w-6" />,
      content: [
        'Installation et configuration',
        'Scanner et valider les tickets',
        'Gestion des erreurs de scan',
        'Rapports de validation',
        'Maintenance et mise à jour'
      ]
    }
  ];

  const contactInfo = {
    phone: '+228 XX XX XX XX',
    email: 'support@go-transport.tg',
    whatsapp: '+228 XX XX XX XX',
    address: 'Lomé, Togo'
  };

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const downloadGuide = (guideId: string) => {
    // TODO: Implémenter le téléchargement du guide PDF
    console.log(`Téléchargement du guide: ${guideId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Centre d'Aide</h1>
        <p className="mt-2 text-sm text-gray-600">
          Trouvez rapidement les réponses à vos questions et accédez aux guides d'utilisation
        </p>
      </div>

      {/* Navigation par onglets */}
      <div className="mb-8">
        <div className="flex space-x-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('faq')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'faq'
                ? 'border-[#065f46] text-[#065f46]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <HelpCircle className="h-5 w-5 inline mr-2" />
            FAQ
          </button>
          <button
            onClick={() => setActiveTab('guides')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'guides'
                ? 'border-[#065f46] text-[#065f46]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Book className="h-5 w-5 inline mr-2" />
            Guides
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'contact'
                ? 'border-[#065f46] text-[#065f46]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Phone className="h-5 w-5 inline mr-2" />
            Contact
          </button>
        </div>
      </div>

      {/* Contenu FAQ */}
      {activeTab === 'faq' && (
        <div>
          {/* Barre de recherche */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans la FAQ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46]"
              />
            </div>
          </div>

          {/* Liste FAQ */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Questions Fréquemment Posées ({filteredFAQs.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredFAQs.map((faq) => (
                <div key={faq.id} className="p-6">
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h4 className="text-lg font-medium text-gray-900">
                      {faq.question}
                    </h4>
                    {expandedFAQ === faq.id ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {expandedFAQ === faq.id && (
                    <div className="mt-4 text-gray-700">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contenu Guides */}
      {activeTab === 'guides' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => (
            <div key={guide.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#065f46] bg-opacity-10 rounded-lg flex items-center justify-center text-[#065f46]">
                  {guide.icon}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{guide.title}</h3>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{guide.description}</p>
              <div className="space-y-2 mb-6">
                {guide.content.map((item, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-[#065f46] rounded-full mr-3"></div>
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => downloadGuide(guide.id)}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-[#065f46] text-white text-sm rounded-lg hover:bg-[#10b981] transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </button>
                <button className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  En ligne
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contenu Contact */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informations de contact */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Nous Contacter</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-900">Téléphone</p>
                  <p className="text-gray-600">{contactInfo.phone}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-gray-600">{contactInfo.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-900">WhatsApp</p>
                  <p className="text-gray-600">{contactInfo.whatsapp}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Horaires et support */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Horaires de Support</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-[#065f46] pl-4">
                <p className="font-medium text-gray-900">Support Technique</p>
                <p className="text-gray-600">Lundi - Vendredi: 8h00 - 18h00</p>
                <p className="text-gray-600">Samedi: 9h00 - 15h00</p>
                <p className="text-gray-600">Dimanche: Fermé</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="font-medium text-gray-900">Urgences</p>
                <p className="text-gray-600">24h/24 - 7j/7</p>
                <p className="text-gray-600">Pour les problèmes critiques uniquement</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section ressources rapides */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ressources Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="#"
            className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-[#065f46] transition-colors"
          >
            <FileText className="h-8 w-8 text-[#065f46] mr-3" />
            <div>
              <p className="font-medium text-gray-900">Documentation API</p>
              <p className="text-sm text-gray-600">Guide technique complet</p>
            </div>
          </a>
          <a
            href="#"
            className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-[#065f46] transition-colors"
          >
            <Video className="h-8 w-8 text-[#065f46] mr-3" />
            <div>
              <p className="font-medium text-gray-900">Tutoriels Vidéo</p>
              <p className="text-sm text-gray-600">Formations pas à pas</p>
            </div>
          </a>
          <a
            href="#"
            className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-[#065f46] transition-colors"
          >
            <MessageCircle className="h-8 w-8 text-[#065f46] mr-3" />
            <div>
              <p className="font-medium text-gray-900">Communauté</p>
              <p className="text-sm text-gray-600">Forum d'entraide</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;