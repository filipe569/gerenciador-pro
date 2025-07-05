import { useState, useMemo, useCallback } from 'react';
import { Client, ClientWithStatus, ClientStatus, FilterOption, SortOption, HistoryEntry } from '../types';

const APP_DATA_KEY = 'client_manager_data_v2';

const getInitialState = (): { clients: Client[], history: HistoryEntry[] } => {
    try {
        const storedData = localStorage.getItem(APP_DATA_KEY);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (parsedData.clients && parsedData.history) {
                return parsedData;
            }
        }
    } catch (error) {
        console.error("Failed to load data from localStorage", error);
    }

    const today = new Date();
    const addDays = (date: Date, days: number) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result.toISOString().split('T')[0];
    };

    return {
        clients: [
            { id: '1', nome: 'João Silva', login: 'joao1', senha: '123', servidor: 'Servidor A', vencimento: addDays(today, 30), telefone: '(11) 99999-8888' },
            { id: '2', nome: 'Maria Oliveira', login: 'maria2', senha: 'abc', servidor: 'Servidor B', vencimento: addDays(today, -5), telefone: '(21) 98888-7777' },
            { id: '3', nome: 'Pedro Almeida', login: 'pedro3', senha: 'def', servidor: 'Servidor A', vencimento: addDays(today, 2) },
            { id: '4', nome: 'Ana Costa', login: 'ana4', senha: 'ghi', servidor: 'Servidor C', vencimento: addDays(today, 90), telefone: '(31) 97777-6666' },
            { id: '5', nome: 'Lucas Pereira', login: 'lucas5', senha: 'jkl', servidor: 'Servidor B', vencimento: addDays(today, 6) },
        ],
        history: []
    };
};

const EXPIRATION_THRESHOLD_DAYS = 7;

const createHistoryEntry = (action: HistoryEntry['action'], clientName: string, details: string): HistoryEntry => {
    return {
        id: new Date().toISOString() + Math.random(),
        timestamp: new Date().toISOString(),
        clientName,
        action,
        details,
    };
};


export const useClientManager = () => {
  const [appState, setAppState] = useState(getInitialState);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterOption>(FilterOption.Todos);
  const [sort, setSort] = useState<SortOption>(SortOption.Nome);
  
  const clientsWithStatus = useMemo<ClientWithStatus[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return appState.clients.map(client => {
      const vencimentoDate = new Date(client.vencimento + 'T00:00:00-03:00');
      vencimentoDate.setHours(0,0,0,0);
      
      const diffTime = vencimentoDate.getTime() - today.getTime();
      const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let status: ClientStatus;
      if (diasRestantes < 0) {
        status = ClientStatus.Vencido;
      } else if (diasRestantes <= EXPIRATION_THRESHOLD_DAYS) {
        status = ClientStatus.ProximoVencimento;
      } else {
        status = ClientStatus.Ativo;
      }
      
      return { ...client, status, diasRestantes: diasRestantes < 0 ? null : diasRestantes };
    });
  }, [appState.clients]);

  const filteredAndSortedClients = useMemo(() => {
    let processedClients = clientsWithStatus;

    if (filter !== FilterOption.Todos) {
      processedClients = processedClients.filter(c => {
        if (filter === FilterOption.Ativos) return c.status === ClientStatus.Ativo;
        if (filter === FilterOption.Vencidos) return c.status === ClientStatus.Vencido;
        if (filter === FilterOption.ProximoVencimento) return c.status === ClientStatus.ProximoVencimento;
        return true;
      });
    }

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      const numericTerm = lowercasedTerm.replace(/\D/g, '');
      
      processedClients = processedClients.filter(c => 
        c.nome.toLowerCase().includes(lowercasedTerm) || 
        c.login.toLowerCase().includes(lowercasedTerm) ||
        (c.telefone && c.telefone.replace(/\D/g, '').includes(numericTerm))
      );
    }

    processedClients.sort((a, b) => {
      if (sort === SortOption.Nome) return a.nome.localeCompare(b.nome);
      if (sort === SortOption.Vencimento) return new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime();
      if (sort === SortOption.Status) {
         const statusOrder = { [ClientStatus.ProximoVencimento]: 1, [ClientStatus.Vencido]: 2, [ClientStatus.Ativo]: 3 };
         return statusOrder[a.status] - statusOrder[b.status];
      }
      return 0;
    });

    return processedClients;
  }, [clientsWithStatus, filter, searchTerm, sort]);

  const addClient = useCallback((client: Omit<Client, 'id'>) => {
    const newClient = { ...client, id: new Date().toISOString() };
    const newEntry = createHistoryEntry('Criado', newClient.nome, `Cliente ${newClient.nome} foi adicionado.`);
    setAppState(prev => ({
        history: [newEntry, ...prev.history],
        clients: [...prev.clients, newClient],
    }));
  }, []);

  const updateClient = useCallback((updatedClient: Client) => {
    const newEntry = createHistoryEntry('Atualizado', updatedClient.nome, `Dados de ${updatedClient.nome} foram alterados.`);
    setAppState(prev => ({
        history: [newEntry, ...prev.history],
        clients: prev.clients.map(c => (c.id === updatedClient.id ? updatedClient : c)),
    }));
  }, []);

  const deleteClient = useCallback((id: string) => {
    setAppState(prev => {
        const clientToDelete = prev.clients.find(c => c.id === id);
        if (!clientToDelete) return prev;

        const newEntry = createHistoryEntry('Excluído', clientToDelete.nome, `Cliente ${clientToDelete.nome} foi removido.`);
        return {
            history: [newEntry, ...prev.history],
            clients: prev.clients.filter(c => c.id !== id),
        };
    });
  }, []);

  const renewClient = useCallback((id: string, days: number = 30) => {
    setAppState(prev => {
        let clientToRenew: Client | undefined;
        const updatedClients = prev.clients.map(c => {
          if (c.id === id) {
            clientToRenew = c;
            const today = new Date();
            const currentVencimento = new Date(c.vencimento + 'T00:00:00');
            const startDate = currentVencimento > today ? currentVencimento : today;
            
            startDate.setDate(startDate.getDate() + days);
            const newVencimento = startDate.toISOString().split('T')[0];
            return { ...c, vencimento: newVencimento };
          }
          return c;
        });

        if (clientToRenew) {
          const renewedClient = updatedClients.find(c => c.id === id)!;
          const newEntry = createHistoryEntry('Renovado', clientToRenew.nome, `Assinatura renovada por ${days} dias. Novo vencimento: ${new Date(renewedClient.vencimento+'T00:00:00').toLocaleDateString('pt-BR')}.`);
          return {
            history: [newEntry, ...prev.history],
            clients: updatedClients,
          };
        }
        return prev;
      });
  }, []);

  const restoreState = useCallback((data: { clients: Client[], history: HistoryEntry[] }) => {
    const newEntry = createHistoryEntry('Sistema', 'Sistema', 'Backup restaurado com sucesso.');
    setAppState({
        clients: data.clients,
        history: [newEntry, ...data.history],
    });
  }, []);
  
  const dashboardStats = useMemo(() => {
    return {
        total: appState.clients.length,
        active: clientsWithStatus.filter(c => c.status === ClientStatus.Ativo).length,
        expired: clientsWithStatus.filter(c => c.status === ClientStatus.Vencido).length,
        expiringSoon: clientsWithStatus.filter(c => c.status === ClientStatus.ProximoVencimento).length,
    }
  }, [appState.clients.length, clientsWithStatus]);

  return {
    clients: filteredAndSortedClients,
    allClientsWithStatus: clientsWithStatus,
    history: appState.history,
    appState,
    addClient,
    updateClient,
    deleteClient,
    renewClient,
    restoreState,
    setSearchTerm,
    setFilter,
    filter,
    setSort,
    sort,
    dashboardStats,
  };
};