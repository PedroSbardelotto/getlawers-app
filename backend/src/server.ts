import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// IMPORTAÇÕES DAS ROTAS
import clientesRoutes from './routes/clientes.routes';
import areasRoutes from './routes/areas.routes';
import agendasRoutes from './routes/agendas.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// CONFIGURAÇÃO DOS ENDPOINTS
app.use('/api/clientes', clientesRoutes);
app.use('/api/areas', areasRoutes);
app.use('/api/agendas', agendasRoutes); // <-- 2. Adicione esta linha

app.get('/api/status', (req: Request, res: Response) => {
  res.json({ status: 'online', message: 'Servidor rodando liso!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});