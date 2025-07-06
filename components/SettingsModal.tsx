
import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import { LockIcon, KeyIcon, TagIcon, PhotoIcon, RestoreSessionIcon, CalendarRestoreIcon, ExportIcon, ImportIcon, CloudIcon, CloudOffIcon, CloudCheckIcon, QuestionMarkCircleIcon, ClipboardCopyIcon, FirebaseIcon } from './icons';
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
  onRestoreSessionRequest: () => void;
  dailyBackups: string[];
  onRestoreFromDailyBackupRequest: (date: string) => void;
  onEnableSyncRequest: () => void;
  onConnectSyncRequest: () => void;
  onDisconnectRequest: () => void;
  onOpenTutorial: () => void;
  isFirebaseConfigured: boolean;
  onOpenFirebaseSetup: () => void;
}

const formatDateLabel = (dateStr: string): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const backupDate = new Date(dateStr + 'T00:00:00Z'); // Use Z for UTC
    backupDate.setHours(0,0,0,0);
    
    const diffTime = today.getTime() - backupDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        return `Ontem (${backupDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })})`;
    }
    return `Há ${diffDays} dias (${backupDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })})`;
};


const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onPasswordChange,
  settings,
  onSettingsChange,
  onManualBackup,
  onRestoreBackup,
  onRecoveryKeySaveRequest,
  onRestoreSessionRequest,
  dailyBackups,
  onRestoreFromDailyBackupRequest,
  onEnableSyncRequest,
  onConnectSyncRequest,
  onDisconnectRequest,
  onOpenTutorial,
  isFirebaseConfigured,
  onOpenFirebaseSetup
}) => {
  const { register, handleSubmit, formState: { errors }, watch, reset: resetForm } = useForm();
  const newPassword = watch("newPassword");
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const isCloudSyncEnabled = settings.cloudSyncEnabled && !!settings.cloudSyncId;

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
        
        {/* Cloud Sync Section */}
        <section>
             <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-100">Sincronização na Nuvem</h3>
                    {isFirebaseConfigured && <FirebaseIcon className="w-5 h-5 text-yellow-400" />}
                </div>
                {isFirebaseConfigured && (
                    <button onClick={onOpenTutorial} className="text-gray-400 hover:text-brand-300 transition-colors" title="Como funciona a sincronização?">
                        <QuestionMarkCircleIcon />
                    </button>
                )}
             </div>
             <div className="bg-gray-900/50 p-4 rounded-lg border border-brand-700/50 space-y-4">
                {!isFirebaseConfigured ? (
                    <div>
                         <div className="flex items-center gap-3 mb-3">
                            <FirebaseIcon className="w-8 h-8 text-red-400"/>
                            <div>
                                <h4 className="font-bold text-lg text-red-300">Firebase Não Configurado</h4>
                                <p className="text-sm text-gray-400">A sincronização na nuvem está desativada.</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-300 mb-4">Para ativar a sincronização na nuvem de forma segura e robusta, você precisa primeiro configurar a integração com o Firebase.</p>
                        <Button variant="primary" onClick={onOpenFirebaseSetup} className="w-full">
                            <QuestionMarkCircleIcon className="mr-2" />
                            Como Configurar o Firebase?
                        </Button>
                    </div>
                ) : isCloudSyncEnabled ? (
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <CloudCheckIcon className="w-8 h-8 text-green-400"/>
                            <div>
                                <h4 className="font-bold text-lg text-green-300">Sincronização Ativa</h4>
                                <p className="text-sm text-gray-400">Seus dados estão sendo salvos na nuvem via Firebase.</p>
                            </div>
                        </div>
                        <div>
                             <label className="text-sm font-medium text-gray-300">Seu ID de Sincronização</label>
                             <div className="mt-1 relative">
                                <Input id="displaySyncId" readOnly value={settings.cloudSyncId || ''} className="text-center bg-gray-800 pr-10" />
                                <button 
                                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white"
                                    onClick={() => navigator.clipboard.writeText(settings.cloudSyncId || '')}
                                    title="Copiar ID"
                                >
                                    <ClipboardCopyIcon />
                                </button>
                            </div>
                        </div>
                         <Button variant="danger" onClick={onDisconnectRequest} className="w-full mt-4">Desconectar da Nuvem</Button>
                    </div>
                ) : (
                     <div>
                        <div className="flex items-center gap-3 mb-3">
                            <CloudOffIcon className="w-8 h-8 text-yellow-400"/>
                            <div>
                                <h4 className="font-bold text-lg text-yellow-300">Sincronização Desativada</h4>
                                <p className="text-sm text-gray-400">Seus dados estão salvos apenas neste navegador.</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-300 mb-4">Ative para acessar seus dados em qualquer dispositivo com segurança.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button variant="primary" onClick={onEnableSyncRequest} className="w-full">Ativar Sincronização</Button>
                            <Button variant="secondary" onClick={onConnectSyncRequest} className="w-full">Conectar a um Dispositivo</Button>
                        </div>
                    </div>
                )}
             </div>
        </section>

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
        
        {/* Local Security Section */}
        <fieldset disabled={isCloudSyncEnabled && isFirebaseConfigured}>
             <section className={`transition-opacity ${(isCloudSyncEnabled && isFirebaseConfigured) ? 'opacity-50' : ''}`}>
              <h3 className="text-lg font-semibold text-gray-100 border-b border-gray-700 pb-2 mb-4">Segurança (Modo Local)</h3>
                {(isCloudSyncEnabled && isFirebaseConfigured) && (
                    <p className="text-sm text-yellow-400 bg-yellow-500/10 p-3 rounded-md mb-4">A alteração de senha e a chave de recuperação são desativadas quando a sincronização na nuvem está ativa. Sua senha de sincronização é agora a sua única chave.</p>
                )}
              <div className="space-y-8">
                {/* Change Password Section */}
                <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
                    <h4 className="font-medium text-gray-200">Alterar Senha Local</h4>
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
                
                {/* Recovery Key Section */}
                <div>
                   <h4 className="font-medium text-gray-200">Recuperação de Conta Local</h4>
                   <div className="space-y-4 mt-2">
                    <p className="text-sm text-gray-400">
                      Salve uma chave secreta para redefinir sua senha local. <strong>Guarde esta chave em um local seguro!</strong>
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
                </div>
              </div>
            </section>
        </fieldset>
        

        {/* Sync and Backup Section */}
        <section>
            <h3 className="text-lg font-semibold text-gray-100 border-b border-gray-700 pb-2 mb-4">Backups e Recuperação Local</h3>
            <div className="space-y-6">

                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                    <h4 className="font-medium text-brand-300 mb-3">Backup Manual (Exportar/Importar)</h4>
                    <p className="text-sm text-gray-400 mb-4">Use para criar um arquivo de backup local ou para migrar seus dados se desativar a sincronização na nuvem.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="secondary" onClick={onManualBackup} className="flex-1 justify-center">
                            <ExportIcon className="mr-2" />
                            Exportar Dados (.json)
                        </Button>
                        <Button variant="secondary" onClick={handleRestoreClick} className="flex-1 justify-center">
                             <ImportIcon className="mr-2" />
                            Importar Dados (.json)
                        </Button>
                        <input type="file" ref={restoreInputRef} onChange={onRestoreBackup} accept=".json" className="hidden" />
                    </div>
                     <p className="text-xs text-gray-500 text-center mt-3">Atenção: A importação substituirá todos os dados atuais neste dispositivo.</p>
                </div>


                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                    <h4 className="font-medium text-gray-200 mb-2">Restauração de Backup Diário Local</h4>
                    <p className="text-sm text-gray-400 mb-4">Restaure de um backup automático dos últimos 3 dias. Esta ação substituirá todos os dados atuais.</p>
                    <div className="space-y-2">
                        {dailyBackups.length > 0 ? (
                            dailyBackups.map(date => (
                                <Button
                                    key={date}
                                    variant="secondary"
                                    className="w-full justify-start text-left"
                                    onClick={() => onRestoreFromDailyBackupRequest(date)}
                                >
                                    <CalendarRestoreIcon className="mr-3 flex-shrink-0" />
                                    <span>Restaurar de <strong className="font-semibold">{formatDateLabel(date)}</strong></span>
                                </Button>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-2">Nenhum backup diário disponível.</p>
                        )}
                    </div>
                </div>

                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                    <h4 className="font-medium text-gray-200 mb-2">Outras Ações de Recuperação</h4>
                     <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-300">Desfazer todas as alterações da sessão atual.</p>
                        <Button variant="secondary" onClick={onRestoreSessionRequest}>
                            <RestoreSessionIcon className="mr-2" />
                            Restaurar Sessão
                        </Button>
                    </div>
                </div>
                
                 <fieldset disabled={isCloudSyncEnabled}>
                    <div className={`flex items-center justify-between bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 transition-opacity ${isCloudSyncEnabled ? 'opacity-50' : ''}`}>
                        <div>
                            <p className="font-medium text-gray-200">Salvamento Automático Local</p>
                            <p className="text-xs text-gray-400">Salva alterações neste navegador automaticamente.</p>
                        </div>
                        <button
                            onClick={handleAutoBackupToggle}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.autoBackupEnabled ? 'bg-brand-600' : 'bg-gray-600'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.autoBackupEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                 </fieldset>

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