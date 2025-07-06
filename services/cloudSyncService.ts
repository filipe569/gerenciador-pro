
import { database, checkFirebaseConfig } from './firebaseService';
import { ref, set, get, child } from 'firebase/database';

let createCloudBin: (encryptedData: string) => Promise<string>;
let getCloudBin: (binId: string) => Promise<string>;
let updateCloudBin: (binId: string, encryptedData: string) => Promise<void>;


if (!checkFirebaseConfig()) {
  const errorMessage = "A configuração do Firebase está ausente. A sincronização na nuvem está desativada.";
  // Cria funções stub que lançam um erro se chamadas
  const createDisabledFunction = (name: string) => () => {
    console.error(errorMessage);
    return Promise.reject(new Error(errorMessage));
  };
  
  createCloudBin = createDisabledFunction('createCloudBin') as any;
  getCloudBin = createDisabledFunction('getCloudBin') as any;
  updateCloudBin = createDisabledFunction('updateCloudBin') as any;
  
} else {
  
  /**
   * Cria um novo "cofre" na nuvem com os dados criptografados iniciais.
   * @param encryptedData A string de dados criptografados para armazenar.
   * @returns O ID único (chave do caminho do Firebase) do "cofre" criado.
   */
  createCloudBin = async (encryptedData: string): Promise<string> => {
    try {
      // Usa um timestamp + string aleatória para criar uma chave única
      const newBinRef = ref(database, 'bins/' + Date.now() + Math.random().toString(36).substring(2));
      await set(newBinRef, { data: encryptedData });
      
      const binId = newBinRef.key;
      if (!binId) {
        throw new Error('Não foi possível obter a chave do Firebase após a criação.');
      }
      return binId;
    } catch (error: any) {
      console.error("Erro ao criar no Firebase:", error);
      throw new Error(`Falha ao criar cofre na nuvem (Firebase): ${error.message}`);
    }
  };

  /**
   * Recupera os dados criptografados de um "cofre" na nuvem.
   * @param binId O ID (chave do caminho do Firebase) do "cofre" a ser recuperado.
   * @returns A string de dados criptografados.
   */
  getCloudBin = async (binId: string): Promise<string> => {
    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `bins/${binId}`));
      if (snapshot.exists()) {
        const result = snapshot.val();
        if (!result || typeof result.data !== 'string') {
          throw new Error('Formato de dados inválido no cofre da nuvem (Firebase).');
        }
        return result.data;
      } else {
        throw new Error('ID de Sincronização não encontrado no Firebase. Verifique o ID.');
      }
    } catch (error: any) {
      console.error("Erro ao buscar no Firebase:", error);
      throw new Error(`Falha ao buscar dados da nuvem (Firebase): ${error.message}`);
    }
  };

  /**
   * Atualiza um "cofre" na nuvem existente com novos dados criptografados.
   * @param binId O ID (chave do caminho do Firebase) do "cofre" a ser atualizado.
   * @param encryptedData A nova string de dados criptografados.
   */
  updateCloudBin = async (binId: string, encryptedData: string): Promise<void> => {
    try {
      const binRef = ref(database, `bins/${binId}`);
      await set(binRef, { data: encryptedData });
    } catch (error: any) {
      console.error("Erro ao atualizar no Firebase:", error);
      throw new Error(`Falha ao atualizar dados na nuvem (Firebase): ${error.message}`);
    }
  };
}

export { createCloudBin, getCloudBin, updateCloudBin };
