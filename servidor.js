const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Habilita o JSON e o CORS para o Front-end conseguir conversar com o Back-end sem bloqueios
app.use(express.json());
app.use(cors());

// Configuração de conexão com o Banco de Dados PostgreSQL
const bancoDeDados = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'foco_dev',
    password: 'admin123', 
    port: 5432,
});

// Rota 1: Recebe o texto do Front-end e salva no Banco (POST)
app.post('/metas', async (requisicao, resposta) => {
    try {
        const { descricao } = requisicao.body;
        
        const sql = 'INSERT INTO metas (descricao) VALUES ($1) RETURNING *';
        const novaMeta = await bancoDeDados.query(sql, [descricao]);
        
        // Retorna a meta salva confirmando o sucesso
        resposta.status(201).json(novaMeta.rows[0]);
    } catch (erro) {
        console.error("Erro no banco:", erro);
        resposta.status(500).json({ mensagem: 'Erro interno ao salvar a meta' });
    }
});

// Rota 2: Busca todas as metas salvas para mostrar na tela (GET)
app.get('/metas', async (requisicao, resposta) => {
    try {
        const todasAsMetas = await bancoDeDados.query('SELECT * FROM metas ORDER BY id DESC');
        resposta.json(todasAsMetas.rows);
    } catch (erro) {
        console.error("Erro no banco:", erro);
        resposta.status(500).json({ mensagem: 'Erro ao buscar as metas' });
    }
});

// Liga o servidor na porta 3000
app.listen(3000, () => {
    console.log('🚀 Servidor rodando perfeitamente na porta 3000!');
});