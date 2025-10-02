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
  const [confirmAction, setConfirmAction] = React.useState<'suspend' | null>(null);

  if (!user) return null;



  const handleToggleSuspension = async () => {
    if (confirmAction !== 'suspend') {
      setConfirmAction('suspend');
      return;
    }

    try {
      setLoading(true);
      const res = await UserService.toggleUserSuspension(user.id);
      if (res.success) {
        const isSuspended = res.data && (res.data as any).is_suspended;
        toast.success(isSuspended ? 'Compte suspendu' : 'Compte réactivé');
        onActionComplete && onActionComplete();
        onClose();
      } else {
        toast.error('Impossible de modifier le statut du compte');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Erreur');
    } finally {
      setLoading(false);
      setConfirmAction(null);
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
        {confirmAction === 'suspend' ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {user.is_suspended ? 'Réactiver le compte' : 'Suspendre le compte'} ?
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    {user.is_suspended
                      ? 'Le compte utilisateur sera réactivé et pourra se connecter normalement.'
                      : 'Le compte utilisateur sera suspendu et ne pourra plus se connecter.'
                    }
                  </p>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={handleToggleSuspension}
                    className="bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700"
                    disabled={loading}
                  >
                    {user.is_suspended ? 'Réactiver' : 'Suspendre'}
                  </button>
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-400"
                    disabled={loading}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={() => setConfirmAction('suspend')}
              className={`w-full px-4 py-2 rounded-md font-medium ${user.is_suspended ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'}`}
              disabled={loading}
            >
              {user.is_suspended ? 'Réactiver le compte' : 'Suspendre le compte'}
            </button>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 rounded-md border border-gray-200 bg-white text-gray-700"
              disabled={loading}
            >
              Fermer
            </button>
          </>
        )}
      </div>
    </ConfirmModal>
  );
};

export default UserActionsModal;
