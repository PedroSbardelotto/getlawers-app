import dotenv from 'dotenv';
// 1. O config() PRECISA vir antes de qualquer menção ao process.env
dotenv.config(); 

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// 2. Debug temporário: se falhar, ele vai te dizer qual das duas sumiu
if (!supabaseUrl) {
  throw new Error('Erro: SUPABASE_URL não encontrada no .env');
}

if (!supabaseKey) {
  throw new Error('Erro: SUPABASE_SERVICE_KEY não encontrada no .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔌 Conexão com o Supabase inicializada!');