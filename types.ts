export enum ClientStatus {
  Ativo = 'Ativo',
  Vencido = 'Vencido',
  ProximoVencimento = 'Próximo Vencimento',
}

export interface Client {
  id: string;
  nome: string;
  login: string;
  senha?: string;
  servidor: string;
  vencimento: string; // YYYY-MM-DD
  telefone?: string;
}

export type ClientWithStatus = Client & {
  status: ClientStatus;
  diasRestantes: number | null;
};

export enum FilterOption {
  Todos = 'Todos',
  Ativos = 'Ativos',
  Vencidos = 'Vencidos',
  ProximoVencimento = 'Próximo Vencimento',
}

export enum SortOption {
  Nome = 'nome',
  Vencimento = 'vencimento',
  Status = 'status',
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  clientName: string;
  action: 'Criado' | 'Atualizado' | 'Excluído' | 'Renovado' | 'Sistema';
  details: string;
}

export interface AppSettings {
    autoBackupEnabled: boolean;
    recoveryKey: string;
    panelTitle: string;
    logoUrl: string;
}