import React, { useState, useEffect } from 'react';
import { Send, Search, Filter, Trash2, Eye, Reply, MessageCircle, UserCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  subject: string;
  content: string;
  type: 'support' | 'complaint' | 'suggestion' | 'question';
  status: 'new' | 'read' | 'replied' | 'closed';
  created_at: string;
  updated_at: string;
}

const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [messages, searchTerm, statusFilter, typeFilter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      // TODO: Remplacer par l'appel API réel
      // const response = await MessageService.getAllMessages();
      
      // Données mockées pour l'instant
      const mockMessages: Message[] = [
        {
          id: '1',
          user_id: 'user_1',
          user_name: 'Jean Dupont',
          user_email: 'jean.dupont@email.com',
          subject: 'Problème avec l\'achat de ticket',
          content: 'Bonjour, j\'ai un problème lors de l\'achat de mon ticket de bus. Le paiement a été débité mais je n\'ai pas reçu le ticket.',
          type: 'support',
          status: 'new',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          user_id: 'user_2',
          user_name: 'Marie Martin',
          user_email: 'marie.martin@email.com',
          subject: 'Suggestion d\'amélioration',
          content: 'Il serait bien d\'avoir une option pour sauvegarder ses trajets favoris dans l\'application.',
          type: 'suggestion',
          status: 'read',
          created_at: '2024-01-14T14:20:00Z',
          updated_at: '2024-01-14T15:45:00Z'
        },
        {
          id: '3',
          user_id: 'user_3',
          user_name: 'Paul Johnson',
          user_email: 'paul.johnson@email.com',
          subject: 'Question sur les horaires',
          content: 'Bonjour, pouvez-vous me dire si les horaires sont mis à jour en temps réel ?',
          type: 'question',
          status: 'replied',
          created_at: '2024-01-13T09:15:00Z',
          updated_at: '2024-01-13T16:30:00Z'
        }
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      toast.error('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const filterMessages = () => {
    let filtered = messages;

    if (searchTerm) {
      filtered = filtered.filter(message =>
        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(message => message.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(message => message.type === typeFilter);
    }

    setFilteredMessages(filtered);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      new: 'bg-red-100 text-red-800',
      read: 'bg-blue-100 text-blue-800',
      replied: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    const labels = {
      new: 'Nouveau',
      read: 'Lu',
      replied: 'Répondu',
      closed: 'Fermé'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      support: 'bg-orange-100 text-orange-800',
      complaint: 'bg-red-100 text-red-800',
      suggestion: 'bg-purple-100 text-purple-800',
      question: 'bg-blue-100 text-blue-800'
    };
    const labels = {
      support: 'Support',
      complaint: 'Plainte',
      suggestion: 'Suggestion',
      question: 'Question'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[type as keyof typeof styles]}`}>
        {labels[type as keyof typeof labels]}
      </span>
    );
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      // TODO: Appel API pour marquer comme lu
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, status: 'read' } : msg
      ));
      toast.success('Message marqué comme lu');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      try {
        // TODO: Appel API pour supprimer
        setMessages(messages.filter(msg => msg.id !== messageId));
        toast.success('Message supprimé');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleReply = (message: Message) => {
    setSelectedMessage(message);
    setShowReplyModal(true);
  };

  const sendReply = async () => {
    if (!replyContent.trim() || !selectedMessage) return;

    try {
      // TODO: Appel API pour envoyer la réponse
      setMessages(messages.map(msg => 
        msg.id === selectedMessage.id ? { ...msg, status: 'replied' } : msg
      ));
      setShowReplyModal(false);
      setReplyContent('');
      setSelectedMessage(null);
      toast.success('Réponse envoyée');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#065f46]"></div>
        <span className="ml-2 text-gray-600">Chargement des messages...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Messages & Support</h1>
        <p className="mt-2 text-sm text-gray-600">
          Gérez les messages des utilisateurs et les demandes de support
        </p>
      </div>

      {/* Filtres et recherche */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, sujet ou contenu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46]"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46]"
            >
              <option value="all">Tous les statuts</option>
              <option value="new">Nouveau</option>
              <option value="read">Lu</option>
              <option value="replied">Répondu</option>
              <option value="closed">Fermé</option>
            </select>
          </div>
          <div>
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46]"
            >
              <option value="all">Tous les types</option>
              <option value="support">Support</option>
              <option value="complaint">Plainte</option>
              <option value="suggestion">Suggestion</option>
              <option value="question">Question</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des messages */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Messages ({filteredMessages.length})
            </h3>
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {messages.filter(m => m.status === 'new').length} nouveaux
              </span>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredMessages.map((message) => (
            <div key={message.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">
                      {message.subject}
                    </h4>
                    {getStatusBadge(message.status)}
                    {getTypeBadge(message.type)}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center">
                      <UserCheck className="h-4 w-4 mr-1" />
                      {message.user_name}
                    </span>
                    <span>{message.user_email}</span>
                    <span>{new Date(message.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {message.content}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {message.status === 'new' && (
                    <button
                      onClick={() => handleMarkAsRead(message.id)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Marquer comme lu"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleReply(message)}
                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                    title="Répondre"
                  >
                    <Reply className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(message.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de réponse */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Répondre à: {selectedMessage.subject}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                De: {selectedMessage.user_name} ({selectedMessage.user_email})
              </p>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Message original:</h4>
                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                  {selectedMessage.content}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votre réponse:
                </label>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065f46] resize-none"
                  placeholder="Tapez votre réponse ici..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyContent('');
                  setSelectedMessage(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={sendReply}
                disabled={!replyContent.trim()}
                className="px-4 py-2 bg-[#065f46] text-white rounded-lg hover:bg-[#10b981] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Send className="h-4 w-4 mr-2" />
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;