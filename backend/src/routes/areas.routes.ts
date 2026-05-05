import { Router, Request, Response } from 'express';
import { supabase } from '../supabase';

const router = Router();

// Rota 1: Buscar todas as Áreas Principais (Passo 1 do formulário)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    // Busca na tabela 'areas' e ordena pelo nome em ordem alfabética
    const { data, error } = await supabase
      .from('areas')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      res.status(500).json({ error: 'Erro ao buscar áreas.', details: error.message });
      return;
    }

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// Rota 2: Buscar as Subáreas de uma Área Específica (Passo 2 do formulário - Cascata)
router.get('/:id/subareas', async (req: Request, res: Response): Promise<void> => {
  try {
    const areaId = req.params.id;

    // Busca na tabela 'subareas' filtrando pelo ID da área principal
    const { data, error } = await supabase
      .from('subareas')
      .select('*')
      .eq('area_id', areaId)
      .order('nome', { ascending: true });

    if (error) {
      res.status(500).json({ error: 'Erro ao buscar subáreas.', details: error.message });
      return;
    }

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

export default router;