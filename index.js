
import { clienteSchema } from './src/schemas/clienteSchema.js';

const cliente = {
  nome: 'Cleison',
  email: 'cleison@email.com',
};

const resultado = clienteSchema.safeParse(cliente);

if (resultado.success) {
  console.log('Cliente válido:', resultado.data);
} else {
  console.log('Dados inválidos:', resultado.error.issues);
}
