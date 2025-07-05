
import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import { LockIcon, KeyIcon, TagIcon, PhotoIcon } from './icons';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordChange: (currentAttempt: string, newPassword: string) => void;
  settings: AppSettings;
  onSettingsChange: (updater: (prev: AppSettings) => AppSettings) => void;
  onManualBackup: () => void;
  onRestoreBackup: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRecoveryKeySaveRequest: (key: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onPasswordChange,
  settings,
  onSettingsChange,
  onManualBackup,
  onRestoreBackup,
  onRecoveryKeySaveRequest,
}) => {
  const { register, handleSubmit, formState: { errors }, watch, reset: resetForm } = useForm();
  const newPassword = watch("newPassword");
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const onSubmitPassword = (data: any) => {
    onPasswordChange(data.currentPassword, data.newPassword);
  };
  
  React.useEffect(() => {
    if(isOpen) {
        resetForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  }, [isOpen, resetForm]);


  const handleRestoreClick = () => {
    restoreInputRef.current?.click();
  };

  const handleAutoBackupToggle = () => {
    onSettingsChange(s => ({ ...s, autoBackupEnabled: !s.autoBackupEnabled }));
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurações">
      <div className="max-h-[75vh] overflow-y-auto pr-4 space-y-8">
        
        {/* Personalization Section */}
        <section>
            <h3 className="text-lg font-semibold text-gray-100 border-b border-gray-700 pb-2 mb-4">Personalização do Painel</h3>
            <div className="space-y-4">
                <Input
                    id="panelTitle"
                    label="Nome do Painel"
                    icon={<TagIcon />}
                    value={settings.panelTitle}
                    onChange={(e) => onSettingsChange(s => ({ ...s, panelTitle: e.target.value }))}
                    placeholder="Ex: Meu Painel Pro"
                />
                <Input
                    id="logoUrl"
                    label="URL do Logo (Opcional)"
                    icon={<PhotoIcon />}
                    value={settings.logoUrl}
                    onChange={(e) => onSettingsChange(s => ({ ...s, logoUrl: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                />
            </div>
        </section>
        
        {/* Change Password Section */}
        <section>
          <h3 className="text-lg font-semibold text-gray-100 border-b border-gray-700 pb-2 mb-4">Alterar Senha do Painel</h3>
          <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
            <Input
              id="currentPassword"
              label="Senha Atual"
              type="password"
              icon={<LockIcon className="w-5 h-5"/>}
              {...register("currentPassword", { required: "Senha atual é obrigatória" })}
              autoComplete="current-password"
            />
            {errors.currentPassword && <p className="text-red-400 text-sm">{errors.currentPassword.message as string}</p>}
            
            <Input
              id="newPassword"
              label="Nova Senha"
              type="password"
              icon={<LockIcon className="w-5 h-5"/>}
              {...register("newPassword", { required: "Nova senha é obrigatória", minLength: { value: 4, message: "A senha deve ter no mínimo 4 caracteres" }})}
               autoComplete="new-password"
            />
             {errors.newPassword && <p className="text-red-400 text-sm">{errors.newPassword.message as string}</p>}

            <Input
              id="confirmPassword"
              label="Confirmar Nova Senha"
              type="password"
              icon={<LockIcon className="w-5 h-5"/>}
              {...register("confirmPassword", { required: "Confirmação é obrigatória", validate: value => value === newPassword || "As senhas não coincidem" })}
               autoComplete="new-password"
            />
            {errors.confirmPassword && <p className="text-red-400 text-sm">{errors.confirmPassword.message as string}</p>}

            <div className="text-right">
              <Button type="submit">Salvar Nova Senha</Button>
            </div>
          </form>
        </section>
        
        {/* Recovery Key Section */}
        <section>
          <h3 className="text-lg font-semibold text-gray-100 border-b border-gray-700 pb-2 mb-4">Recuperação de Conta</h3>
           <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Salve uma chave secreta para redefinir sua senha caso a esqueça. <strong>Guarde esta chave em um local seguro!</strong>
            </p>
             <Input
              id="recoveryKey"
              label="Chave de Recuperação Secreta"
              icon={<KeyIcon />}
              defaultValue={settings.recoveryKey}
              onBlur={(e) => onSettingsChange(s => ({ ...s, recoveryKey: e.target.value }))}
              placeholder="Digite ou cole sua chave secreta"
            />
             <div className="text-right">
                <Button onClick={() => onRecoveryKeySaveRequest(settings.recoveryKey)}>
                    Salvar Chave de Recuperação
                </Button>
            </div>
          </div>
        </section>

        {/* Backup Section */}
        <section>
          <h3 className="text-lg font-semibold text-gray-100 border-b border-gray-700 pb-2 mb-4">Backup e Restauração</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg">
              <div>
                <p className="font-medium text-gray-200">Backup Automático Local</p>
                <p className="text-xs text-gray-400">Salva automaticamente no seu navegador.</p>
              </div>
              <button
                onClick={handleAutoBackupToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.autoBackupEnabled ? 'bg-brand-600' : 'bg-gray-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.autoBackupEnabled ? 'translate-x-6' : 'translate-x-1'}`}/>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="secondary" onClick={onManualBackup}>Baixar Backup (JSON)</Button>
              <Button variant="secondary" onClick={handleRestoreClick}>Restaurar de Arquivo</Button>
              <input type="file" ref={restoreInputRef} onChange={onRestoreBackup} accept=".json" className="hidden" />
            </div>
             <p className="text-xs text-gray-500 text-center">A restauração substituirá todos os dados atuais. Use com cuidado.</p>
          </div>
        </section>

         <div className="flex justify-end pt-4 border-t border-gray-700">
            <Button variant="secondary" onClick={onClose}>Fechar</Button>
        </div>

      </div>
    </Modal>
  );
};

export default SettingsModal;
