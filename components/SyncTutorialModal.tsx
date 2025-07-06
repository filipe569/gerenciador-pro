import React from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { ComputerDesktopIcon, DevicePhoneMobileIcon, ClipboardCopyIcon, CloudCheckIcon } from './icons';

interface SyncTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TutorialStep: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
        <div className="flex-shrink-0 text-brand-400 mt-1">{icon}</div>
        <div>
            <h4 className="font-bold text-gray-100 text-lg">{title}</h4>
            <div className="mt-1 text-gray-300 space-y-2 text-sm">{children}</div>
        </div>
    </div>
);


const SyncTutorialModal: React.FC<SyncTutorialModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Como Sincronizar Seus Dispositivos">
        <div className="space-y-6">
            <p className="text-center text-gray-400">Siga estes passos para acessar seus dados de qualquer lugar com segurança.</p>
            
            <TutorialStep 
                icon={<ComputerDesktopIcon className="w-8 h-8"/>} 
                title="Passo 1: Ative no seu Dispositivo Principal"
            >
                <p>No seu primeiro dispositivo (ex: computador), vá em <strong>Configurações</strong> e clique em <strong>"Ativar Sincronização"</strong>.</p>
                <p>Crie uma senha forte. Esta será sua chave mestra para acessar e proteger seus dados.</p>
                <p>O sistema irá gerar um <strong className="text-yellow-300">ID de Sincronização</strong> único. Copie <ClipboardCopyIcon className="w-4 h-4 inline-block mx-1"/> e guarde este ID em um local seguro!</p>
            </TutorialStep>
            
            <TutorialStep 
                icon={<DevicePhoneMobileIcon className="w-8 h-8"/>} 
                title="Passo 2: Conecte seus Outros Dispositivos"
            >
                <p>No seu segundo dispositivo (ex: celular), vá em <strong>Configurações</strong> e clique em <strong>"Conectar a um Dispositivo"</strong>.</p>
                <p>Insira o <strong className="text-yellow-300">ID de Sincronização</strong> que você guardou e a mesma senha criada no passo anterior.</p>
            </TutorialStep>
            
            <TutorialStep 
                icon={<CloudCheckIcon className="w-8 h-8"/>} 
                title="Passo 3: Pronto!"
            >
                 <p>Seus dados serão baixados e, a partir de agora, qualquer alteração será sincronizada automaticamente entre todos os seus dispositivos conectados.</p>
            </TutorialStep>
            
            <div className="flex justify-end pt-4">
                <Button onClick={onClose}>Entendi!</Button>
            </div>
        </div>
    </Modal>
  );
};

export default SyncTutorialModal;