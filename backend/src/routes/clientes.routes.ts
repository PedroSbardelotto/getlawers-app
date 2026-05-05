import { Router, Request, Response } from 'express';
import { supabase } from '../supabase';

const router = Router();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      email, password, 
      tipo_pessoa, nome_razao_social, documento, telefone, 
      cep, rua, numero, complemento, bairro, cidade, estado 
    } = req.body;

    // 1. Validação Básica
    if (!email || !password || !tipo_pessoa || !nome_razao_social || !documento || !telefone) {
      res.status(400).json({ error: 'Campos obrigatórios em falta.' });
      return;
    }

    // 2. Verificar duplicidade de Documento (US C01 - AC 5)
    const { data: docExistente } = await supabase
      .from('clientes')
      .select('id')
      .eq('documento', documento)
      .single();

    if (docExistente) {
      res.status(409).json({ error: 'Dados já cadastrados. Deseja fazer login?' });
      return;
    }

    // 3. Criar o utilizador no Supabase Auth (Gera o UUID e encripta a senha)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true // Pula a confirmação de email para facilitar o MVP
    });

    if (authError || !authData.user) {
      res.status(400).json({ error: authError?.message || 'Erro ao criar autenticação.' });
      return;
    }

    const userId = authData.user.id;

    // 4. Inserir na tabela 'usuarios'
    const { error: userError } = await supabase
      .from('usuarios')
      .insert({
        id: userId,
        email: email,
        tipo_perfil: 'CLIENTE'
      });

    if (userError) {
      // Rollback manual caso falhe (apaga do Auth)
      await supabase.auth.admin.deleteUser(userId);
      res.status(500).json({ error: 'Erro ao gravar perfil de utilizador.' });
      return;
    }

    // 5. Inserir na tabela 'clientes'
    const { error: clienteError } = await supabase
      .from('clientes')
      .insert({
        usuario_id: userId,
        tipo_pessoa,
        nome_razao_social,
        documento,
        telefone,
        cep, rua, numero, complemento, bairro, cidade, estado
      });

    if (clienteError) {
      res.status(500).json({ error: 'Erro ao gravar dados do cliente.' });
      return;
    }

    // 6. Sucesso!
    res.status(201).json({ 
      message: 'Cliente cadastrado com sucesso!', 
      cliente_id: userId 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

export default router;