
import React from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { FirebaseIcon } from './icons';

interface FirebaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TutorialStep: React.FC<{ number: number; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-brand-600 text-white font-bold">{number}</div>
        <div className="mt-1">
            <h4 className="font-bold text-gray-100 text-lg">{title}</h4>
            <div className="mt-1 text-gray-300 space-y-2 text-sm">{children}</div>
        </div>
    </div>
);

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-gray-900 p-3 rounded-md border border-gray-700 text-xs text-gray-300 overflow-x-auto">
        <code>{children}</code>
    </pre>
)


const FirebaseSetupModal: React.FC<FirebaseSetupModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurando a Sincronização com Firebase">
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            <div className="text-center mb-4">
                <FirebaseIcon className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                <p className="text-gray-400">Para ativar a sincronização, conecte o painel a um projeto Firebase. É gratuito para o nível de uso deste aplicativo.</p>
            </div>
            
            <TutorialStep 
                number={1} 
                title="Crie um Projeto no Firebase"
            >
                <p>Acesse o <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">Firebase Console</a> com sua conta Google.</p>
                <p>Clique em <strong>'Adicionar projeto'</strong> e siga as instruções para criar um novo projeto.</p>
            </TutorialStep>
            
            <TutorialStep 
                number={2}
                title="Ative o Realtime Database"
            >
                <p>No menu do seu novo projeto, vá em <strong>Build &gt; Realtime Database</strong>.</p>
                <p>Clique em <strong>'Criar banco de dados'</strong> e escolha um local (pode ser o padrão).</p>
                <p>Selecione <strong>'Iniciar em modo de teste'</strong>. Isso permite que o aplicativo leia e escreva dados. <strong className="text-yellow-300">Atenção:</strong> Para dados sensíveis em produção, você deve configurar regras de segurança mais rígidas.</p>
            </TutorialStep>
            
             <TutorialStep 
                number={3}
                title="Obtenha as Credenciais"
            >
                <p>No menu, clique no ícone de engrenagem <strong>(Configurações do projeto)</strong>.</p>
                <p>Na aba <strong>Geral</strong>, role para baixo até <strong>'Seus apps'</strong> e clique no ícone de aplicativo da Web (<code>&lt;/&gt;</code>).</p>
                <p>Dê um apelido ao app (ex: 'Painel Clientes') e clique em <strong>'Registrar app'</strong>.</p>
                <p>O Firebase exibirá um objeto de configuração <code>firebaseConfig</code>. Você precisará dos valores deste objeto.</p>
            </TutorialStep>
            
            <TutorialStep 
                number={4}
                title="Configure as Variáveis de Ambiente"
            >
                <p>Este aplicativo lê as credenciais do Firebase a partir de variáveis de ambiente. Você deve configurá-las na plataforma onde você hospeda este painel (ex: Vercel, Netlify, etc.).</p>
                <p>Defina as seguintes variáveis com os valores do seu <code>firebaseConfig</code>:</p>
                <CodeBlock>{`REACT_APP_FIREBASE_API_KEY="AIzaSy..."
REACT_APP_FIREBASE_AUTH_DOMAIN="seu-projeto.firebaseapp.com"
REACT_APP_FIREBASE_DATABASE_URL="https://seu-projeto.firebasedatabase.app"
REACT_APP_FIREBASE_PROJECT_ID="seu-projeto"
REACT_APP_FIREBASE_STORAGE_BUCKET="seu-projeto.appspot.com"
REACT_APP_FIREBASE_MESSAGING_SENDER_ID="1234567890"
REACT_APP_FIREBASE_APP_ID="1:1234567890:web:abcdef123456"`}</CodeBlock>
                <p>Após configurar as variáveis, <strong className="text-yellow-300">recarregue esta página</strong>. A opção de sincronização na nuvem deverá estar disponível.</p>
            </TutorialStep>

            <div className="flex justify-end pt-4 border-t border-gray-700">
                <Button onClick={onClose}>Entendi!</Button>
            </div>
        </div>
    </Modal>
  );
};

export default FirebaseSetupModal;
