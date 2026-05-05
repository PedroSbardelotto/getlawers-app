import { Router, Request, Response } from 'express';
import { supabase } from '../supabase';

const router = Router();

// Rota: Buscar horários disponíveis filtrando por Área do Direito
// Exemplo de uso: GET /api/agendas/disponiveis?area_id=1
router.get('/disponiveis', async (req: Request, res: Response): Promise<void> => {
  try {
    const areaId = req.query.area_id;

    if (!areaId) {
      res.status(400).json({ error: 'O parâmetro area_id é obrigatório.' });
      return;
    }

    /* 
      Atenção: Esta é a estrutura da busca. 
      Dependendo de como você criou as chaves estrangeiras (Foreign Keys) 
      entre as tabelas 'agenda_disponibilidade', 'advogados' e 'aptidoes',
      pode ser necessário ajustar os nomes dentro do select() abaixo.
    */
    const { data, error } = await supabase
      .from('agenda_disponibilidade')
      .select(`
        data_hora_inicio,
        data_hora_fim,
        advogados!inner (
          aptidoes!inner ( area_id )
        )
      `)
      .eq('status', 'LIVRE')
      .eq('advogados.aptidoes.area_id', areaId)
      .order('data_hora_inicio', { ascending: true });

    if (error) {
      res.status(500).json({ error: 'Erro ao buscar horários disponíveis.', details: error.message });
      return;
    }

    // Como o cliente não precisa saber QUEM é o advogado agora (conforme sua US C03 AC 2),
    // vamos limpar a resposta para mandar apenas os horários para o Angular montar o calendário
    const horariosLimpos = data.map(item => ({
      inicio: item.data_hora_inicio,
      fim: item.data_hora_fim
    }));

    res.status(200).json(horariosLimpos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

export default router;