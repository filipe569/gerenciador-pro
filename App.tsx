
import React, { useState, useEffect } from 'react';
import { useClientManager } from './hooks/useClientManager';
import { Client, ClientWithStatus, FilterOption, SortOption, AppSettings } from './types';
import ClientTable from './components/ClientTable';
import ClientFormModal from './components/ClientFormModal';
import Dashboard from './components/Dashboard';
import LoginScreen from './components/LoginScreen';
import SettingsModal from './components/SettingsModal';
import HistoryModal from './components/HistoryModal';
import RecoveryModal from './components/RecoveryModal';
import ConfirmModal from './components/ui/ConfirmModal';
import { ToastProvider, useToast } from './components/ui/Toast';
import { exportToExcel } from './services/exportService';

import Button from './components/ui/Button';
import Input from './components/ui/Input';
import { AddIcon, SearchIcon, ExportIcon, LogoutIcon, AiIcon, SettingsIcon, HistoryIcon } from './components/icons';

const APP_PASSWORD_KEY = 'app_manager_password';
const APP_SETTINGS_KEY = 'app_manager_settings_v3';
const APP_DATA_KEY = 'client_manager_data_v2';
const DEFAULT_PANEL_TITLE = 'Gerenciador de Clientes Pro';

const AppContent: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  const [isRecoveryModalOpen, setRecoveryModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<ClientWithStatus | null>(null);

  const [clientToDelete, setClientToDelete] = useState<ClientWithStatus | null>(null);
  const [clientToRenew, setClientToRenew] = useState<ClientWithStatus | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [pendingRecoveryKey, setPendingRecoveryKey] = useState<string | null>(null);

  const { showToast } = useToast();
  const {
    clients,
    addClient,
    updateClient,
    deleteClient,
    renewClient,
    setSearchTerm,
    setFilter,
    filter,
    setSort,
    sort,
    dashboardStats,
    allClientsWithStatus,
    appState,
    history,
    restoreState,
  } = useClientManager();

  const [appPassword, setAppPassword] = useState(() => localStorage.getItem(APP_PASSWORD_KEY) || 'admin');
  const [settings, setSettings] = useState<AppSettings>(() => {
      try {
          const storedSettings = localStorage.getItem(APP_SETTINGS_KEY);
          if (storedSettings) {
              const parsed = JSON.parse(storedSettings);
              return {
                  panelTitle: parsed.panelTitle || DEFAULT_PANEL_TITLE,
                  logoUrl: parsed.logoUrl || '',
                  autoBackupEnabled: parsed.autoBackupEnabled !== false,
                  recoveryKey: parsed.recoveryKey || '',
              };
          }
      } catch { /* Use default */ }
      return { autoBackupEnabled: true, recoveryKey: '', panelTitle: DEFAULT_PANEL_TITLE, logoUrl: '' };
  });

  useEffect(() => {
    if (settings.autoBackupEnabled) {
      localStorage.setItem(APP_DATA_KEY, JSON.stringify(appState));
    }
  }, [appState, settings.autoBackupEnabled]);

  useEffect(() => {
    localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const handleOpenModal = (client: ClientWithStatus | null = null) => {
    setClientToEdit(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setClientToEdit(null);
  };

  const handleSaveClient = (clientData: Omit<Client, 'id'> | Client) => {
    if ('id' in clientData) {
      updateClient(clientData);
      showToast('success', 'Cliente atualizado com sucesso!');
    } else {
      addClient(clientData);
      showToast('success', 'Cliente adicionado com sucesso!');
    }
  };

  const handleDeleteRequest = (client: ClientWithStatus) => {
    setClientToDelete(client);
  };

  const handleConfirmDelete = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete.id);
      showToast('info', `Cliente ${clientToDelete.nome} foi excluído.`);
      setClientToDelete(null);
    }
  };
  
  const handleRenewRequest = (client: ClientWithStatus) => {
    setClientToRenew(client);
  };

  const handleConfirmRenew = () => {
    if (clientToRenew) {
      renewClient(clientToRenew.id);
      showToast('success', `Assinatura de ${clientToRenew.nome} foi renovada.`);
      setClientToRenew(null);
    }
  };

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);
  
  const handleAppReset = () => {
    localStorage.removeItem(APP_DATA_KEY);
    localStorage.removeItem(APP_PASSWORD_KEY);
    localStorage.removeItem(APP_SETTINGS_KEY);
    window.location.reload();
  };

  const handleForgotPassword = () => {
      if (settings.recoveryKey) {
          setRecoveryModalOpen(true);
      } else {
          setIsResetConfirmOpen(true);
      }
  };
  
  const handleConfirmReset = () => {
    handleAppReset();
    setIsResetConfirmOpen(false);
  };

  const handleExport = () => {
    exportToExcel(allClientsWithStatus);
    showToast('success', 'A lista de clientes foi exportada para Excel.');
  };

  const handlePasswordChange = (currentAttempt: string, newPassword: string) => {
    if (currentAttempt !== appPassword) {
      showToast('error', 'A senha atual está incorreta.');
      return;
    }
    setAppPassword(newPassword);
    localStorage.setItem(APP_PASSWORD_KEY, newPassword);
    showToast('success', 'Senha do painel alterada com sucesso!');
    setSettingsModalOpen(false);
  };

  const handleRecoveryKeySaveRequest = (key: string) => {
    const trimmedKey = key.trim();
    if(trimmedKey === settings.recoveryKey && trimmedKey !== '') {
        showToast('info', 'A chave de recuperação inserida é a mesma que a atual.');
        return;
    }
    if(!trimmedKey) {
        setSettings(s => ({ ...s, recoveryKey: '' }));
        showToast('info', 'Chave de recuperação removida.');
        return;
    }
    setPendingRecoveryKey(trimmedKey);
  }

  const handleConfirmRecoveryKeySave = () => {
    if (pendingRecoveryKey !== null) {
      setSettings(s => ({ ...s, recoveryKey: pendingRecoveryKey }));
      showToast('success', 'Chave de recuperação salva com sucesso!');
      setPendingRecoveryKey(null);
    }
  };

  const handlePasswordReset = (key: string, newPassword: string): boolean => {
      if (key && newPassword && key === settings.recoveryKey) {
          setAppPassword(newPassword);
          localStorage.setItem(APP_PASSWORD_KEY, newPassword);
          showToast('success', 'Senha redefinida com sucesso!');
          setRecoveryModalOpen(false);
          return true;
      }
      return false;
  };

  const handleManualBackup = () => {
      const dataStr = JSON.stringify(appState, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `backup_clientes_${new Date().toISOString().split('T')[0]}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      showToast('success', 'Backup gerado com sucesso.');
  };

  const handleRestoreBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type === "application/json") {
          const reader = new FileReader();
          reader.onload = (e) => {
              try {
                  const text = e.target?.result;
                  const data = JSON.parse(text as string);
                  if (data.clients && Array.isArray(data.clients) && data.history && Array.isArray(data.history)) {
                       restoreState(data);
                       showToast('success', 'Backup restaurado com sucesso!');
                       setSettingsModalOpen(false);
                  } else {
                     showToast('error', "Arquivo de backup inválido ou corrompido.");
                  }
              } catch (error) {
                  showToast('error', "Erro ao ler o arquivo de backup.");
                  console.error(error);
              }
          };
          reader.readAsText(file);
      } else if (file) {
          showToast('error', "Por favor, selecione um arquivo JSON válido.");
      }
      if(event.target) event.target.value = '';
  };

  return (
    <>
      {!isLoggedIn ? (
        <LoginScreen onLogin={handleLogin} appPassword={appPassword} onForgotPassword={handleForgotPassword} panelTitle={settings.panelTitle} logoUrl={settings.logoUrl}/>
      ) : (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <div className="flex items-center gap-3">
                 {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Logo" className="w-9 h-9 rounded-full object-cover"/>
                ) : (
                    <AiIcon className="w-8 h-8 text-brand-400"/>
                )}
                <h1 className="text-3xl font-bold text-gray-100">{settings.panelTitle}</h1>
              </div>
              <div className="flex items-center gap-1">
                  <Button onClick={() => setHistoryModalOpen(true)} variant="ghost" title="Histórico de Alterações">
                      <HistoryIcon className="w-5 h-5"/>
                      <span className="hidden md:inline ml-2">Histórico</span>
                  </Button>
                  <Button onClick={() => setSettingsModalOpen(true)} variant="ghost" title="Configurações">
                      <SettingsIcon className="w-5 h-5"/>
                      <span className="hidden md:inline ml-2">Configurações</span>
                  </Button>
                  <Button onClick={handleLogout} variant="secondary">
                    <LogoutIcon className="w-5 h-5 md:mr-2" />
                    <span className="hidden md:inline">Sair</span>
                  </Button>
              </div>
            </header>

            <Dashboard stats={dashboardStats} onFilterSelect={setFilter} />
            
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="lg:col-span-2">
                        <Input
                            id="search"
                            placeholder="Buscar por nome, login ou telefone..."
                            icon={<SearchIcon className="w-5 h-5"/>}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="filter-status" className="block text-sm font-medium text-gray-300 mb-1">Filtrar por Status</label>
                        <select
                            id="filter-status"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as FilterOption)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                        >
                            {Object.values(FilterOption).map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button onClick={handleExport} variant="secondary">
                            <ExportIcon className="mr-2" />
                            Exportar
                        </Button>
                        <Button onClick={() => handleOpenModal()} variant="primary">
                            <AddIcon className="mr-2"/>
                            Adicionar
                        </Button>
                    </div>
                </div>
            </div>

            <ClientTable
              clients={clients}
              onEdit={handleOpenModal}
              onDelete={handleDeleteRequest}
              onRenewRequest={handleRenewRequest}
              setSort={setSort as (sort: SortOption) => void}
              currentSort={sort}
            />
          </div>
        </div>
      )}

      <ClientFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveClient}
        clientToEdit={clientToEdit}
      />
      <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          onPasswordChange={handlePasswordChange}
          settings={settings}
          onSettingsChange={setSettings}
          onManualBackup={handleManualBackup}
          onRestoreBackup={handleRestoreBackup}
          onRecoveryKeySaveRequest={handleRecoveryKeySaveRequest}
      />
      <HistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setHistoryModalOpen(false)}
          history={history}
      />
      <RecoveryModal
          isOpen={isRecoveryModalOpen}
          onClose={() => setRecoveryModalOpen(false)}
          onReset={handlePasswordReset}
      />

      <ConfirmModal
        isOpen={!!clientToDelete}
        onClose={() => setClientToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        confirmText="Excluir"
        confirmVariant="danger"
      >
        <p>Tem certeza que deseja excluir o cliente <strong className="font-bold text-yellow-300">{clientToDelete?.nome}</strong>?</p>
        <p className="mt-2 text-sm text-gray-400">Esta ação não pode ser desfeita.</p>
      </ConfirmModal>

      <ConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="Confirmar Redefinição do Aplicativo"
        confirmText="Sim, apagar tudo"
        confirmVariant="danger"
      >
        <p>Nenhuma chave de recuperação foi configurada.</p>
        <p className="mt-2 font-bold text-yellow-300">ATENÇÃO: Isto irá APAGAR TODOS os seus dados (clientes, histórico, configurações) e restaurar a senha padrão para "admin".</p>
        <p className="mt-2">Esta ação não pode ser desfeita. Deseja continuar?</p>
      </ConfirmModal>

       <ConfirmModal
          isOpen={pendingRecoveryKey !== null}
          onClose={() => setPendingRecoveryKey(null)}
          onConfirm={handleConfirmRecoveryKeySave}
          title="Confirmar Chave de Recuperação"
          confirmText="Sim, salvar chave"
      >
          <p>Você está definindo uma nova chave de recuperação.</p>
          <p className="mt-2 font-bold text-yellow-300">Guarde esta chave em um local muito seguro. É a única forma de redefinir sua senha sem apagar todos os dados.</p>
          <p className="mt-2">Deseja continuar?</p>
      </ConfirmModal>
      
      <ConfirmModal
        isOpen={!!clientToRenew}
        onClose={() => setClientToRenew(null)}
        onConfirm={handleConfirmRenew}
        title="Confirmar Renovação"
        confirmText="Sim, Renovar"
        confirmVariant="primary"
      >
        <p>Tem certeza que deseja renovar a assinatura de <strong className="font-bold text-yellow-300">{clientToRenew?.nome}</strong> por 30 dias?</p>
      </ConfirmModal>
    </>
  );
};


const App: React.FC = () => (
  <ToastProvider>
    <AppContent />
  </ToastProvider>
);


export default App;
