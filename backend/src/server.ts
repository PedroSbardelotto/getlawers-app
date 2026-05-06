import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './supabase';

// IMPORTAÇÕES DAS ROTAS
// @ts-ignore
import clientesRoutes from './routes/clientes.routes';
// @ts-ignore
import areasRoutes from './routes/areas.routes';
// @ts-ignore
import agendasRoutes from './routes/agendas.routes';
// @ts-ignore
import pagamentosRoutes from './routes/pagamentos.routes';
import { iniciarCronLembretes } from './jobs/lembretes.job';
import reunioesRoutes from './routes/reunioes.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// CONFIGURAÇÃO DOS ENDPOINTS
app.use('/api/clientes', clientesRoutes);
app.use('/api/areas', areasRoutes);
app.use('/api/agendas', agendasRoutes);
app.use('/api/pagamentos', pagamentosRoutes);
app.use('/api/reunioes', reunioesRoutes);

app.get('/api/status', (req: Request, res: Response) => {
  res.json({ status: 'online', message: 'Servidor rodando liso!' });
});

// INICIA O SERVIDOR
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  
  // INICIA AS TAREFAS AUTOMÁTICAS (CRON)
  iniciarCronLembretes(); // <-- Adicione esta linha aqui dentro
});