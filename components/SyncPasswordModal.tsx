

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import { LockIcon, CloudLockIcon, CloudCheckIcon, KeyIcon, ClipboardCopyIcon } from './icons';

export type SyncModalMode = 'create' | 'connect' | 'display';

interface SyncPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: SyncModalMode;
  setMode: (mode: SyncModalMode) => void;
  onSetup: (password: string) => Promise<string>;
  onConnect: (syncId: string, password: string) => Promise<void>;
  syncId: string | null;
}

type FormData = {
  password: string;
  confirmPassword?: string;
  syncId?: string;
};

const SyncPasswordModal: React.FC<SyncPasswordModalProps> = ({ isOpen, onClose, mode, setMode, onSetup, onConnect, syncId }) => {
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>();
  const password = watch("password");
  const [error, setError] = useState('');
  const [newlyGeneratedSyncId, setNewlyGeneratedSyncId] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      reset();
      setError('');
      setNewlyGeneratedSyncId(null);
    }
  }, [isOpen, reset, mode]);

  const handleSetup: SubmitHandler<FormData> = async (data) => {
    setError('');
    try {
      const newId = await onSetup(data.password);
      setNewlyGeneratedSyncId(newId);
      setMode('display');
    } catch (e: any) {
      setError(e.message || 'Falha ao ativar a sincronização.');
    }
  };

  const handleConnect: SubmitHandler<FormData> = async (data) => {
    setError('');
    if (!data.syncId) {
        setError("O ID de Sincronização é obrigatório.");
        return;
    }
    try {
      await onConnect(data.syncId, data.password);
    } catch (e: any) {
      setError(e.message || 'Falha ao conectar. Verifique o ID e a senha.');
    }
  };

  const renderContent = () => {
    switch (mode) {
      case 'create':
        return (
          <form onSubmit={handleSubmit(handleSetup)} className="space-y-4">
            <CloudLockIcon className="w-12 h-12 mx-auto text-brand-400" />
            <h3 className="text-lg font-bold text-center text-gray-100">Ativar Sincronização na Nuvem</h3>
            <p className="text-sm text-gray-400 text-center">
              Crie uma senha de sincronização. Esta será sua nova senha de login e a chave para criptografar seus dados.
              <strong className="block mt-2 text-yellow-300">Guarde-a com segurança! Se você perdê-la, seus dados serão perdidos.</strong>
            </p>
            <Input
              id="password"
              label="Nova Senha de Sincronização"
              type="password"
              icon={<LockIcon className="w-5 h-5"/>}
              {...register("password", { required: "A senha é obrigatória", minLength: { value: 6, message: "A senha deve ter no mínimo 6 caracteres" }})}
            />
            {errors.password && <p className="text-red-400 text-sm">{errors.password.message}</p>}
            <Input
              id="confirmPassword"
              label="Confirmar Senha"
              type="password"
              icon={<LockIcon className="w-5 h-5"/>}
              {...register("confirmPassword", { required: "A confirmação é obrigatória", validate: value => value === password || "As senhas não coincidem" })}
            />
            {errors.confirmPassword && <p className="text-red-400 text-sm">{errors.confirmPassword.message}</p>}
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Ativando...' : 'Ativar'}</Button>
            </div>
          </form>
        );
      case 'connect':
        return (
          <form onSubmit={handleSubmit(handleConnect)} className="space-y-4">
            <CloudCheckIcon className="w-12 h-12 mx-auto text-brand-400" />
            <h3 className="text-lg font-bold text-center text-gray-100">Conectar a um Dispositivo</h3>
            <p className="text-sm text-gray-400 text-center">
              Insira o ID e a senha de sincronização do seu outro dispositivo para baixar seus dados.
            </p>
            <Input
              id="syncId"
              label="ID de Sincronização"
              icon={<KeyIcon />}
              {...register("syncId", { required: "O ID de Sincronização é obrigatório" })}
            />
            {errors.syncId && <p className="text-red-400 text-sm">{errors.syncId.message}</p>}
            <Input
              id="password"
              label="Senha de Sincronização"
              type="password"
              icon={<LockIcon className="w-5 h-5"/>}
              {...register("password", { required: "A senha é obrigatória" })}
            />
            {errors.password && <p className="text-red-400 text-sm">{errors.password.message}</p>}
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setMode('create')}>Voltar</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Conectando...' : 'Conectar'}</Button>
            </div>
          </form>
        );
      case 'display':
        const displayId = newlyGeneratedSyncId || syncId || '';
        return (
            <div className="space-y-4 text-center">
                <CloudCheckIcon className="w-12 h-12 mx-auto text-green-400" />
                <h3 className="text-lg font-bold text-gray-100">Sincronização Ativada!</h3>
                <p className="text-sm text-gray-400">
                    Seu cofre de dados na nuvem foi criado com sucesso.
                    <strong className="block mt-2 text-yellow-300">Guarde o ID de Sincronização abaixo em um local seguro.</strong>
                    Você precisará dele e da sua senha para conectar outros dispositivos.
                </p>
                <div>
                    <label className="text-sm font-medium text-gray-300">Seu ID de Sincronização</label>
                    <div className="mt-1 relative">
                        <Input id="displaySyncId" readOnly value={displayId} className="text-center bg-gray-800 pr-10" />
                        <button 
                            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white"
                            onClick={() => navigator.clipboard.writeText(displayId)}
                            title="Copiar ID"
                        >
                            <ClipboardCopyIcon />
                        </button>
                    </div>
                </div>
                 <div className="pt-4">
                    <Button onClick={onClose}>Entendi, fechar</Button>
                </div>
            </div>
        )
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sincronização na Nuvem">
      {renderContent()}
    </Modal>
  );
};

export default SyncPasswordModal;