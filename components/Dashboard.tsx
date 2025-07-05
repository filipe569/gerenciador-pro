
import React, { useState } from 'react';
import { FilterOption } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { AiIcon } from './icons';
import { generateDashboardSummary } from '../services/geminiService';

interface DashboardProps {
  stats: {
    total: number;
    active: number;
    expired: number;
    expiringSoon: number;
  };
  onFilterSelect: (filter: FilterOption) => void;
}

const StatCard: React.FC<{ title: string; value: number; colorClass: string; onClick?: () => void }> = ({ title, value, colorClass, onClick }) => (
  <Card 
    onClick={onClick}
    className={`flex flex-col items-center justify-center text-center ${onClick ? 'cursor-pointer hover:bg-gray-700/80 transition-all transform hover:scale-105' : ''}`}
  >
    <span className={`text-4xl font-bold ${colorClass}`}>{value}</span>
    <p className="text-sm text-gray-400 mt-1">{title}</p>
  </Card>
);

const Dashboard: React.FC<DashboardProps> = ({ stats, onFilterSelect }) => {
  const [summary, setSummary] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const handleGenerateSummary = async () => {
    setIsLoadingSummary(true);
    const result = await generateDashboardSummary(stats);
    setSummary(result);
    setIsLoadingSummary(false);
  };

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Total de Clientes" value={stats.total} colorClass="text-brand-400" onClick={() => onFilterSelect(FilterOption.Todos)} />
        <StatCard title="Ativos" value={stats.active} colorClass="text-green-400" onClick={() => onFilterSelect(FilterOption.Ativos)} />
        <StatCard title="Vencidos" value={stats.expired} colorClass="text-red-400" onClick={() => onFilterSelect(FilterOption.Vencidos)} />
        <StatCard title="Vencimento Próximo" value={stats.expiringSoon} colorClass="text-yellow-400" onClick={() => onFilterSelect(FilterOption.ProximoVencimento)} />
      </div>
      <Card className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-100">Resumo Inteligente</h3>
          {isLoadingSummary ? (
            <p className="text-gray-400 italic mt-1 animate-pulse">Gerando análise com IA...</p>
          ) : summary ? (
            <p className="text-gray-300 mt-1">{summary}</p>
          ) : (
             <p className="text-gray-400 italic mt-1">Clique no botão para gerar um resumo da situação atual dos seus clientes usando IA.</p>
          )}
        </div>
        <Button onClick={handleGenerateSummary} disabled={isLoadingSummary}>
          <AiIcon className="mr-2" />
          {isLoadingSummary ? 'Analisando...' : 'Gerar Análise IA'}
        </Button>
      </Card>
    </div>
  );
};

export default Dashboard;
