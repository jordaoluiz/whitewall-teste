// Este arquivo DEVE ser importado antes de qualquer outro módulo que dependa de variáveis de ambiente
import dotenv from 'dotenv';

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

// Valida variáveis de ambiente obrigatórias
export const validateEnv = (): void => {
  if (!process.env.OPENWEATHER_API_KEY) {
    throw new Error(
      'OPENWEATHER_API_KEY não configurada nas variáveis de ambiente. ' +
      'Certifique-se de que o arquivo .env existe e contém a chave OPENWEATHER_API_KEY.'
    );
  }
};

