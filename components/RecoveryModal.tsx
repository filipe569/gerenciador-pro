
import React, { useState } from 'react';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import { KeyIcon, LockIcon } from './icons';
import { useToast } from './ui/Toast';

interface RecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: (key: string, newPassword: string) => boolean;
}

const RecoveryModal: React.FC<RecoveryModalProps> = ({ isOpen, onClose, onReset }) => {
  const [recoveryKey, setRecoveryKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const { showToast } = useToast();

  const handleReset = () => {
    setError('');
    if (!recoveryKey || !newPassword) {
        setError('Ambos os campos são obrigatórios.');
        return;
    }
    setIsResetting(true);
    const success = onReset(recoveryKey, newPassword);
    if (!success) {
      setError('A chave de recuperação está incorreta.');
      showToast('error', 'A chave de recuperação está incorreta.');
    }
    setIsResetting(false);
  };
  
  const handleClose = () => {
    setError('');
    setRecoveryKey('');
    setNewPassword('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Recuperar Senha">
      <div className="space-y-4">
        <p className="text-sm text-gray-400">
          Digite sua chave de recuperação secreta e defina uma nova senha para acessar o painel.
        </p>
        <Input
          id="recoveryKey"
          label="Chave de Recuperação"
          icon={<KeyIcon />}
          value={recoveryKey}
          onChange={(e) => setRecoveryKey(e.target.value)}
          placeholder="Sua chave secreta"
        />
        <Input
          id="newPassword"
          label="Nova Senha"
          type="password"
          icon={<LockIcon className="w-5 h-5" />}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Digite a nova senha"
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Fechar
          </Button>
          <Button type="button" variant="primary" onClick={handleReset} disabled={isResetting}>
            {isResetting ? 'Redefinindo...' : 'Redefinir Senha'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RecoveryModal;
