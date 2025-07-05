import React from 'react';
import Modal from './ui/Modal';
import { HistoryEntry } from '../types';
import { EditIcon, AddIcon, DeleteIcon, RenewIcon, SettingsIcon } from './icons';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
}

const actionIcons: { [key in HistoryEntry['action']]: React.ReactNode } = {
    'Criado': <AddIcon className="w-4 h-4 text-green-400" />,
    'Atualizado': <EditIcon className="w-4 h-4 text-yellow-400" />,
    'Excluído': <DeleteIcon className="w-4 h-4 text-red-400" />,
    'Renovado': <RenewIcon className="w-4 h-4 text-blue-400" />,
    'Sistema': <SettingsIcon className="w-4 h-4 text-gray-400" />,
};

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Histórico de Alterações">
      <div className="max-h-[60vh] overflow-y-auto pr-2">
        {history.length > 0 ? (
          <ul className="space-y-4">
            {history.map((entry) => (
              <li key={entry.id} className="flex items-start gap-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex-shrink-0 mt-1">
                  {actionIcons[entry.action]}
                </div>
                <div>
                  <p className="font-semibold text-gray-200">
                    <span className="font-bold">{entry.action}</span> - {entry.clientName}
                  </p>
                  <p className="text-sm text-gray-400">{entry.details}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(entry.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>Nenhuma alteração registrada ainda.</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default HistoryModal;