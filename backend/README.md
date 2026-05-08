# ⚖️ GetLawyers

<div align="center">
  <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</div>

<br/>

## 📖 Sobre o Projeto

O **GetLawyers** é uma plataforma inovadora de *matchmaking* jurídico que conecta clientes a advogados especialistas através de um modelo de alocação sob demanda (semelhante ao Uber). 

O sistema elimina o atrito da busca manual por profissionais, permitindo que o cliente relate seu problema, escolha um horário e seja automaticamente alocado a um especialista validado na área. Todo o atendimento ocorre via sala virtual integrada, com geração automatizada de relatórios e transcrição em texto (Speech-to-Text) pós-consulta para garantia jurídica de ambas as partes.

---

## ✨ Principais Funcionalidades

### 👤 Para o Cliente
* **Triagem Inteligente:** Formulário dinâmico para categorização do problema por Área e Subárea do direito.
* **Blind Booking (Matchmaking):** Visualização de agenda unificada por especialidade e alocação automática de um profissional disponível no horário escolhido.
* **Checkout Integrado:** Pagamento antecipado com bloqueio de agenda simultâneo.
* **Sala de Videoconferência:** Acesso seguro à sala virtual liberado apenas 5 minutos antes da consulta.
* **Relatório e Ata:** Recebimento da transcrição completa do atendimento e extrato financeiro em até 24 horas.
* **Sistema de Avaliação:** Classificação do atendimento para composição da nota do especialista.

### 💼 Para o Especialista (Advogado)
* **Onboarding e Aptidões:** Cadastro de OAB e seleção de requisitos/subáreas de domínio para direcionamento de casos.
* **Gestão de Agenda:** Controle de slots de 30 minutos em uma janela de disponibilidade de 15 dias.
* **Triagem de Aceite:** Autonomia para ler o escopo do caso pendente e aceitar ou recusar o atendimento.
* **Contexto em Tempo Real:** Visualização dos dados e descrição do problema do cliente diretamente na tela da videochamada.
* **Transparência Financeira:** Painel de relatórios contendo o cálculo de *split* de pagamento (valor bruto vs. taxa da plataforma).

---

## 🛠️ Tecnologias e Arquitetura

O projeto foi construído utilizando uma arquitetura baseada em microsserviços/API RESTful, com as seguintes tecnologias:

* **Front-end:** Angular (com Tailwind CSS para componentização minimalista e responsiva).
* **Back-end:** Node.js com Express/NestJS.
* **Banco de Dados & Auth:** Supabase (PostgreSQL relacional com Row Level Security).
* **Comunicação em Tempo Real:** WebRTC (para a sala virtual).
* **Processamento de Áudio:** Integração com API de Speech-to-Text (para geração de atas).
* **Pagamentos:** Integração com Gateway de Pagamento (Webhooks para confirmação de transação).

---

## 🗄️ Modelo de Dados (Resumo)

O banco de dados relacional foi modelado para garantir integridade e performance, estruturado nos seguintes domínios:
1. **Autenticação & Perfis:** `usuarios`, `clientes`, `advogados`.
2. **Motor de Match:** `areas_atuacao`, `requisitos_areas`, `advogado_aptidoes`.
3. **Core Business:** `agenda_disponibilidade`, `agendamentos_calls`.
4. **Financeiro & Qualidade:** `pagamentos`, `avaliacoes`.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
* Node.js (v18+)
* Angular CLI
* Conta no Supabase configurada com o schema do projeto.

### 1. Clonando o repositório
```bash
git clone [https://github.com/PedroSbardelotto/getlawers-app]
cd getlawyers