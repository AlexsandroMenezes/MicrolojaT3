import { CATEGORIAS, REGIOES, TIPOS_CUPOM } from '../config/regras.js';
import { FimDaEntrada, fecharEntrada, perguntar } from './entrada.js';
import { brl, imprimirRelatorio, imprimirResumoPedido, lerData, mostrar } from './formatadores.js';

// O menu SÓ lê do teclado e mostra na tela. Quem decide tudo é o Marketplace.

// Mostra um menu numerado e executa a opção escolhida até o usuário voltar/sair.
