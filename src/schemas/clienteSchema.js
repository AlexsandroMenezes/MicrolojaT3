
import { z } from 'zod';

export const clienteSchema = z.object({
  nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.email('Informe um e-mail válido'),
});
