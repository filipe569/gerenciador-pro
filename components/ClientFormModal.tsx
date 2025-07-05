
import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Client } from '../types';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import { AiIcon, PhoneIcon } from './icons';
import { generateStrongPassword } from '../services/geminiService';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Omit<Client, 'id'> | Client) => void;
  clientToEdit: Client | null;
}

type FormData = Omit<Client, 'id'>;

const ClientFormModal: React.FC<ClientFormModalProps> = ({ isOpen, onClose, onSave, clientToEdit }) => {
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>();
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);

  useEffect(() => {
    if (clientToEdit) {
      reset(clientToEdit);
    } else {
      reset({
        nome: '',
        login: '',
        senha: '',
        telefone: '',
        servidor: '',
        vencimento: new Date().toISOString().split('T')[0]
      });
    }
  }, [clientToEdit, isOpen, reset]);

  const onSubmit: SubmitHandler<FormData> = (data) => {
    if (clientToEdit) {
      onSave({ ...clientToEdit, ...data });
    } else {
      onSave(data);
    }
    onClose();
  };
  
  const handleGeneratePassword = async () => {
      setIsGeneratingPassword(true);
      const password = await generateStrongPassword();
      setValue('senha', password, { shouldValidate: true });
      setIsGeneratingPassword(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={clientToEdit ? 'Editar Cliente' : 'Adicionar Novo Cliente'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nome Completo"
          id="nome"
          {...register('nome', { required: 'O nome é obrigatório' })}
          placeholder="Ex: João da Silva"
          autoComplete="off"
        />
        {errors.nome && <p className="text-red-400 text-sm">{errors.nome.message}</p>}

        <Input
          label="Login"
          id="login"
          {...register('login', { required: 'O login é obrigatório' })}
          placeholder="Ex: joao.silva"
          autoComplete="off"
        />
        {errors.login && <p className="text-red-400 text-sm">{errors.login.message}</p>}

        <Input
          label="Telefone (Opcional)"
          id="telefone"
          icon={<PhoneIcon className="w-5 h-5"/>}
          {...register('telefone')}
          placeholder="Ex: (11) 99999-8888"
          autoComplete="off"
        />
        
        <div>
            <div className="flex justify-between items-center mb-1">
                 <label htmlFor="senha" className="block text-sm font-medium text-gray-300">Senha</label>
                 <Button type="button" variant="ghost" size="sm" onClick={handleGeneratePassword} disabled={isGeneratingPassword}>
                    <AiIcon className="mr-1 w-4 h-4" />
                    {isGeneratingPassword ? 'Gerando...' : 'Gerar Senha'}
                 </Button>
            </div>
            <Input
              id="senha"
              type="text"
              {...register('senha')}
              placeholder="Deixe em branco para não alterar ou gere uma"
              autoComplete="new-password"
            />
        </div>
        
        <Input
          label="Servidor"
          id="servidor"
          {...register('servidor', { required: 'O servidor é obrigatório' })}
          placeholder="Ex: Servidor BR-01"
          autoComplete="off"
        />
        {errors.servidor && <p className="text-red-400 text-sm">{errors.servidor.message}</p>}

        <Input
          label="Data de Vencimento"
          id="vencimento"
          type="date"
          {...register('vencimento', { required: 'A data de vencimento é obrigatória' })}
        />
        {errors.vencimento && <p className="text-red-400 text-sm">{errors.vencimento.message}</p>}

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Fechar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar Cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ClientFormModal;
