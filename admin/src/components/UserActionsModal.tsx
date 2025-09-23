import React from 'react';
import { User } from '../types/api';
import ConfirmModal from './ConfirmModal';
import { UserService } from '../services/userService';
import { toast } from 'react-hot-toast';

interface Props {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onActionComplete?: () => void;
}

const UserActionsModal: React.FC<Props> = ({ user, isOpen, onClose, onActionComplete }) => {
  const [loading, setLoading] = React.useState(false);

  if (!user) return null;

  const handleToggle = async () => {
    try {
      setLoading(true);
      const res = await UserService.toggleUserStatus(user.id);
      if (res.success) {
        toast.success('Statut modifié');
        onActionComplete && onActionComplete();
        onClose();
      } else {
        toast.error('Impossible de modifier le statut');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await UserService.deleteUser(user.id);
      if (res.success) {
        toast.success('Utilisateur supprimé');
        onActionComplete && onActionComplete();
        onClose();
      } else {
        toast.error('Impossible de supprimer');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSuspension = async () => {
    try {
      setLoading(true);
      const res = await UserService.toggleUserSuspension(user.id);
      if (res.success) {
        const suspended = res.data && (res.data as any).is_suspended;
        toast.success(suspended ? 'Utilisateur suspendu' : 'Utilisateur réactivé');
        onActionComplete && onActionComplete();
        onClose();
      } else {
        toast.error('Impossible de modifier la suspension');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      title={`Actions pour ${user.name}`}
      description={''}
      onClose={onClose}
    >
      <div className="flex flex-col gap-3 mt-3">
        <button
          onClick={handleToggleSuspension}
          className={`w-full px-4 py-2 rounded-md font-medium ${user.is_suspended ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-yellow-600 text-white hover:bg-yellow-700'}`}
          disabled={loading}
        >
          {user.is_suspended ? 'Réactiver l\'utilisateur' : 'Suspendre l\'utilisateur'}
        </button>

        <button
          onClick={handleDelete}
          className="w-full px-4 py-2 rounded-md font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
          disabled={loading}
        >
          Supprimer l'utilisateur
        </button>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 rounded-md border border-gray-200 bg-white text-gray-700"
          disabled={loading}
        >
          Fermer
        </button>
      </div>
    </ConfirmModal>
  );
};

export default UserActionsModal;
