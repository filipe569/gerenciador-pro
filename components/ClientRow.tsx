
import React, { useState } from 'react';
import { ClientWithStatus, ClientStatus } from '../types';
import { EditIcon, DeleteIcon, RenewIcon, AiIcon, PhoneIcon } from './icons';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { generateRenewalReminder } from '../services/geminiService';

interface ClientRowProps {
  client: ClientWithStatus;
  onEdit: (client: ClientWithStatus) => void;
  onDelete: (client: ClientWithStatus) => void;
  onRenewRequest: (client: ClientWithStatus) => void;
}

const statusClasses = {
  [ClientStatus.Ativo]: 'bg-green-500/20 text-green-300 border-green-500/30',
  [ClientStatus.ProximoVencimento]: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  [ClientStatus.Vencido]: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const ClientRow: React.FC<ClientRowProps> = ({ client, onEdit, onDelete, onRenewRequest }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isReminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [isLoadingReminder, setIsLoadingReminder] = useState(false);

  const handleGenerateReminder = async () => {
    setIsLoadingReminder(true);
    const message = await generateRenewalReminder(client.nome, client.vencimento);
    setReminderMessage(message);
    setIsLoadingReminder(false);
  };

  const openReminderModal = () => {
    setReminderModalOpen(true);
    handleGenerateReminder();
  };


  return (
    <>
      <tr className="bg-gray-800/50 hover:bg-gray-800 border-b border-gray-700 transition-colors">
        <td className="p-4 whitespace-nowrap">
          <div className="font-medium text-gray-100">{client.nome}</div>
          <div className="text-sm text-gray-400">{client.login}</div>
        </td>
        <td className="p-4 whitespace-nowrap">
          <div 
            className="flex items-center cursor-pointer" 
            onMouseEnter={() => setShowPassword(true)} 
            onMouseLeave={() => setShowPassword(false)}
          >
            {showPassword ? (
              <span className="font-mono text-gray-300">{client.senha || 'N/A'}</span>
            ) : (
              <span className="font-mono text-gray-300">{'*'.repeat(8)}</span>
            )}
          </div>
        </td>
        <td className="p-4 whitespace-nowrap text-gray-300">{client.servidor}</td>
        <td className="p-4 whitespace-nowrap text-gray-300">{client.telefone || 'N/A'}</td>
        <td className="p-4 whitespace-nowrap">
          <div className="text-gray-100">{new Date(client.vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
          {client.status !== ClientStatus.Vencido && client.diasRestantes !== null && (
             <div className="text-xs text-gray-400">{client.diasRestantes} dias restantes</div>
          )}
        </td>
        <td className="p-4 whitespace-nowrap">
          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusClasses[client.status]}`}>
            {client.status}
          </span>
        </td>
        <td className="p-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end gap-2">
            {(client.status === ClientStatus.ProximoVencimento || client.status === ClientStatus.Vencido) && (
              <Button variant="ghost" size="sm" onClick={openReminderModal} title="Gerar lembrete de renovação com IA">
                <AiIcon />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => onRenewRequest(client)} title="Renovar por 30 dias">
              <RenewIcon />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(client)} title="Editar cliente">
              <EditIcon />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(client)} className="text-red-400 hover:bg-red-500/20 hover:text-red-300" title="Excluir cliente">
              <DeleteIcon />
            </Button>
          </div>
        </td>
      </tr>

      <Modal isOpen={isReminderModalOpen} onClose={() => setReminderModalOpen(false)} title={`Lembrete para ${client.nome}`}>
          {isLoadingReminder ? (
              <div className="flex items-center justify-center h-24">
                  <p className="text-gray-300 animate-pulse">Gerando mensagem com IA...</p>
              </div>
          ) : (
              <div className="space-y-4">
                  <p className="text-gray-300 bg-gray-900 p-4 rounded-md border border-gray-700 whitespace-pre-wrap">{reminderMessage}</p>
                  <Button onClick={() => navigator.clipboard.writeText(reminderMessage)}>Copiar Mensagem</Button>
              </div>
          )}
      </Modal>
    </>
  );
};

export default ClientRow;
