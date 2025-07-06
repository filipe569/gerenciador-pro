
import React, { useState } from 'react';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import { UserIcon, LockIcon, AiIcon, CloudIcon } from './icons';

interface LoginScreenProps {
  onLogin: (password: string) => void;
  isCloudSyncConfigured: boolean;
  onForgotPassword: () => void;
  panelTitle: string;
  logoUrl: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isCloudSyncConfigured, onForgotPassword, panelTitle, logoUrl }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await onLogin(password);
    } catch(err: any) {
        setError(err.message || 'Usuário ou senha inválidos.');
        setIsLoading(false);
    }
    // No need to set loading to false on success as the component will unmount
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3">
                {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-9 h-9 rounded-full object-cover"/>
                ) : (
                    isCloudSyncConfigured ? <CloudIcon className="w-8 h-8 text-brand-400"/> : <AiIcon className="w-8 h-8 text-brand-400"/>
                )}
                <h1 className="text-3xl font-bold text-gray-100">{panelTitle}</h1>
            </div>
             <p className="text-gray-400 mt-2">
                {isCloudSyncConfigured
                    ? "Sincronização na nuvem ativa. Insira sua senha."
                    : "Faça login para acessar seu painel."
                }
            </p>
        </div>
        <Card>
          <form onSubmit={handleLogin} className="space-y-6">
            {!isCloudSyncConfigured && (
                <Input
                  id="username"
                  label="Usuário"
                  value="admin"
                  readOnly
                  icon={<UserIcon className="w-5 h-5"/>}
                  className="cursor-not-allowed bg-gray-800"
                />
            )}
            <Input
              id="password"
              label={isCloudSyncConfigured ? "Senha de Sincronização" : "Senha"}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<LockIcon className="w-5 h-5"/>}
              placeholder="Digite sua senha"
              required
              autoFocus
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
            {!isCloudSyncConfigured && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-sm text-brand-400 hover:text-brand-300 hover:underline focus:outline-none"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
            )}
          </form>
        </Card>
        {!isCloudSyncConfigured && (
            <p className="text-center text-gray-500 text-sm mt-6">
              Usuário padrão: <code className="bg-gray-700 p-1 rounded">admin</code>.
              <br/>
              Senha padrão: <code className="bg-gray-700 p-1 rounded">admin</code> (pode ser alterada nas configurações).
            </p>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;