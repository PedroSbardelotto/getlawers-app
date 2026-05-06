import { Router, Request, Response } from 'express';
import { supabase } from '../supabase';

const router = Router();

// Rota: Gerar Relatório Pós-Consulta (US C07)
// Exemplo: GET /api/reunioes/123/relatorio
router.get('/:id/relatorio', async (req: Request, res: Response): Promise<void> => {
  try {
    const agendamentoId = req.params.id;

    // 1. Busca os dados cruzando 4 tabelas de uma vez só (Agendamento + Cliente + Advogado + Pagamento)
    const { data: reuniao, error } = await supabase
      .from('agendamentos_calls')
      .select(`
        id,
        data_hora_agendada,
        status,
        clientes ( nome_razao_social, documento ),
        advogados ( nome, oab ),
        pagamentos ( valor )
      `)
      .eq('id', agendamentoId)
      .single();

    if (error || !reuniao) {
      res.status(404).json({ error: 'Reunião não encontrada ou erro ao buscar dados.', details: error?.message });
      return;
    }

    // 2. O Mock da Transcrição (Ata)
    // No futuro, isso virá de uma tabela 'transcricoes' alimentada por uma API de áudio/IA
    const ataMockada = `
      [00:00:15] Advogado: Olá, boa tarde! Como posso ajudar com o seu caso hoje?
      [00:00:30] Cliente: Boa tarde, doutor. Eu gostaria de tirar umas dúvidas sobre um contrato de prestação de serviços.
      [00:01:00] Advogado: Perfeito, pode me detalhar quais cláusulas estão gerando dúvida?
      ... (Fim da transcrição)
    `;

    // 3. Monta o objeto formatado para o Angular exibir no modal ou gerar o PDF
    const relatorioFinal = {
      id_reuniao: reuniao.id,
      data_hora: reuniao.data_hora_agendada,
      status_reuniao: reuniao.status,
      cliente: {
        nome: reuniao.clientes?.[0]?.nome_razao_social,
        documento: reuniao.clientes?.[0]?.documento
      },
      advogado: {
        nome: reuniao.advogados?.[0]?.nome,
        oab: reuniao.advogados?.[0]?.oab
      },
      financeiro: {
        valor_pago: reuniao.pagamentos?.[0]?.valor
      },
      ata_transcricao: ataMockada
    };

    res.status(200).json(relatorioFinal);

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao gerar o relatório.', details: err.message });
  }
});

export default router;