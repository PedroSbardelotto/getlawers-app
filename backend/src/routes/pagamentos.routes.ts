import { Router, Request, Response } from 'express';
import { supabase } from '../supabase';

const router = Router();

// Rota: Processar Pagamento Falso (Mock) + Matchmaking
// Exemplo: POST /api/pagamentos/processar
router.post('/processar', async (req: Request, res: Response): Promise<void> => {
  try {
    // Dados recebidos do Frontend
    const { 
      cliente_id, 
      area_id, 
      data_hora_escolhida, 
      valor, 
      dados_cartao // { numero, nome, validade, cvv }
    } = req.body;

    // 1. O Mock: Simula o tempo de rede do Gateway de Pagamento (2 segundos)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. O Mock: Simula recusa do cartão se o CVV for '000' (Excelente para testar erros no Angular)
    if (dados_cartao?.cvv === '000') {
      res.status(400).json({ error: 'Transação recusada pela operadora do cartão.' });
      return;
    }

    // 3. AC 2: Grava o pagamento aprovado no Supabase
    const { data: pagamento, error: errPagamento } = await supabase
      .from('pagamentos')
      .insert({
        cliente_id,
        valor,
        status: 'APROVADO',
        data_pagamento: new Date().toISOString()
      })
      .select()
      .single();

    if (errPagamento) throw new Error('Erro ao registrar pagamento: ' + errPagamento.message);

    // 4. AC 3: Algoritmo de Match - Buscar advogado LIVRE para a área no horário
    const { data: disponiveis, error: errBusca } = await supabase
      .from('agenda_disponibilidade')
      .select(`
        id,
        advogado_id,
        advogados!inner ( aptidoes!inner ( area_id ) )
      `)
      .eq('status', 'LIVRE')
      .eq('data_hora_inicio', data_hora_escolhida)
      .eq('advogados.aptidoes.area_id', area_id)
      .limit(1); 

    // 5. AC 5: Tratamento de Falha no Match (Se não achar ninguém)
    if (errBusca || !disponiveis || disponiveis.length === 0) {
      res.status(200).json({
        status: 'FALHA_MATCH',
        pagamento_id: pagamento.id,
        mensagem: 'Ops, ocorreu uma alta demanda neste horário exato. Por favor, escolha um novo horário (seu pagamento já está garantido).'
      });
      return;
    }

    const slot = disponiveis[0];

    // 6. AC 3: Bloqueia a agenda para RESERVADO
    await supabase
      .from('agenda_disponibilidade')
      .update({ status: 'RESERVADO' })
      .eq('id', slot.id);

    // 7. AC 3: Grava o agendamento esperando o "Aceite" do advogado
    const { data: agendamento, error: errAgendamento } = await supabase
      .from('agendamentos_calls')
      .insert({
        cliente_id,
        advogado_id: slot.advogado_id,
        pagamento_id: pagamento.id,
        data_hora_agendada: data_hora_escolhida,
        status: 'PENDENTE_ACEITE'
      })
      .select()
      .single();

    if (errAgendamento) throw new Error('Erro ao criar o agendamento: ' + errAgendamento.message);

    // 8. AC 4: Sucesso Total
    res.status(200).json({
      status: 'SUCESSO',
      mensagem: 'Pagamento aprovado! Estamos conectando você com um de nossos especialistas.',
      agendamento_id: agendamento.id
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao processar.', details: err.message });
  }
});

// Rota: Solicitar Estorno (Mock do Gateway + Atualização no Banco)
// Exemplo: POST /api/pagamentos/estorno
router.post('/estorno', async (req: Request, res: Response): Promise<void> => {
  try {
    const { pagamento_id, agendamento_id } = req.body;

    if (!pagamento_id || !agendamento_id) {
      res.status(400).json({ error: 'IDs do pagamento e do agendamento são obrigatórios.' });
      return;
    }

    // 1. Busca os detalhes da reunião para sabermos qual horário na agenda devemos liberar
    const { data: agendamento, error: errBuscaAgendamento } = await supabase
      .from('agendamentos_calls')
      .select('advogado_id, data_hora_agendada')
      .eq('id', agendamento_id)
      .single();

    if (errBuscaAgendamento || !agendamento) {
      res.status(404).json({ error: 'Agendamento não encontrado.' });
      return;
    }

    // 2. O Mock: Simula o comando de estorno (refund) sendo enviado ao Gateway (1 segundo)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Atualiza o status na tabela 'pagamentos' para ESTORNADO
    const { error: errPagamento } = await supabase
      .from('pagamentos')
      .update({ status: 'ESTORNADO' })
      .eq('id', pagamento_id);

    if (errPagamento) throw new Error('Erro ao atualizar pagamento: ' + errPagamento.message);

    // 4. Atualiza o status na tabela 'agendamentos_calls' para CANCELADO
    const { error: errCancelamento } = await supabase
      .from('agendamentos_calls')
      .update({ status: 'CANCELADO' })
      .eq('id', agendamento_id);

    if (errCancelamento) throw new Error('Erro ao cancelar agendamento: ' + errCancelamento.message);

    // 5. A Correção: Devolve o horário para a vitrine do advogado!
    const { error: errAgenda } = await supabase
      .from('agenda_disponibilidade')
      .update({ status: 'LIVRE' })
      .eq('advogado_id', agendamento.advogado_id)
      .eq('data_hora_inicio', agendamento.data_hora_agendada);

    if (errAgenda) {
      console.error('Aviso: O estorno ocorreu, mas falhamos em liberar a agenda.', errAgenda.message);
      // Aqui não damos throw error para não dizer ao cliente que o estorno falhou, 
      // já que o dinheiro dele foi devolvido no passo 3.
    }

    // 6. Retorno de Sucesso para o Angular
    res.status(200).json({
      status: 'ESTORNADO',
      mensagem: 'Estorno processado com sucesso. O valor será devolvido na sua fatura.'
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao processar estorno.', details: err.message });
  }
});

export default router;