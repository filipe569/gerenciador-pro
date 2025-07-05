import { ClientWithStatus } from '../types';

declare var XLSX: any;

export const exportToExcel = (clients: ClientWithStatus[], fileName: string = 'clientes'): void => {
  const dataToExport = clients.map(client => ({
    'Nome': client.nome,
    'Login': client.login,
    'Servidor': client.servidor,
    'Telefone': client.telefone || 'N/A',
    'Vencimento': client.vencimento,
    'Status': client.status,
    'Dias Restantes': client.diasRestantes === null ? 'N/A' : client.diasRestantes
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');
  
  // Auto-size columns
  const cols = Object.keys(dataToExport[0] || {});
  const colWidths = cols.map(key => ({
      wch: Math.max(
          key.length,
          ...dataToExport.map(row => (row[key as keyof typeof row] ?? '').toString().length)
      ) + 2
  }));
  worksheet['!cols'] = colWidths;
  
  XLSX.writeFile(workbook, `${fileName}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`);
};
