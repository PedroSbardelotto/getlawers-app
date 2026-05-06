import cron from 'node-cron';
import { supabase } from '../supabase';

// Função que será executada automaticamente
const verificarLembretes = async () => {
  try {
    console.log('⏰ [Cronjob] Verificando agendamentos para enviar lembretes...');

    // Pega o horário atual e soma 30 minutos
    const agora = new Date();
    const daquiA30Minutos = new Date(agora.getTime() + 30 * 60000);

    // Cria uma janela de tempo (ex: entre 29 e 31 minutos no futuro)
    // Isso evita que o sistema perca uma notificação por causa de milissegundos
    const janelaInicio = new Date(daquiA30Minutos.getTime() - 1 * 60000).toISOString();
    const janelaFim = new Date(daquiA30Minutos.getTime() + 1 * 60000).toISOString();

    const { data: agendamentos, error } = await supabase
      .from('agendamentos_calls')
      .select('id, cliente_id, data_hora_agendada')
      .eq('status', 'CONFIRMADO') // Só manda lembrete de call confirmada pelo advogado
      .gte('data_hora_agendada', janelaInicio)
      .lte('data_hora_agendada', janelaFim);

    if (error) {
      console.error('Erro na consulta do Cronjob:', error.message);
      return;
    }

    if (!agendamentos || agendamentos.length === 0) {
      return; // Nenhuma reunião para daqui a 30 minutos
    }

    // Se achou reuniões, dispara o "aviso" para cada uma
    agendamentos.forEach(call => {
      // Aqui entraria a integração real com WhatsApp/Email (Twilio, Nodemailer, etc.)
      console.log(`🚀 [NOTIFICAÇÃO DISPARADA] Lembrete enviado para o cliente ID: ${call.cliente_id}`);
      console.log(`Reunião ID: ${call.id} começa em 30 minutos (às ${new Date(call.data_hora_agendada).toLocaleTimeString()})!`);
    });

  } catch (err) {
    console.error('Erro crítico no Cronjob de Lembretes:', err);
  }
};

// Configura o Cron para rodar a cada 1 minuto
// Sintaxe do cron: '* * * * *' significa 'Todo minuto, toda hora, todo dia'
export const iniciarCronLembretes = () => {
  cron.schedule('* * * * *', verificarLembretes);
  console.log('⏳ Serviço de Cronjobs (Lembretes) iniciado com sucesso.');
};