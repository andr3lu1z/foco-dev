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

// Rota 3: Marca a meta como concluída sem apagar o histórico (PUT)
app.put('/metas/:id', async (requisicao, resposta) => {
    try {
        const { id } = requisicao.params;

        // Atualiza apenas o status, preservando todos os outros dados da meta
        const sql = 'UPDATE metas SET status = $1 WHERE id = $2 RETURNING *';
        const metaAtualizada = await bancoDeDados.query(sql, ['Concluída', id]);

        if (metaAtualizada.rowCount === 0) {
            return resposta.status(404).json({ mensagem: 'Meta não encontrada' });
        }

        resposta.json(metaAtualizada.rows[0]);
    } catch (erro) {
        console.error("Erro no banco:", erro);
        resposta.status(500).json({ mensagem: 'Erro ao atualizar a meta' });
    }
});

// Rota 4: Remove fisicamente o registro do banco (DELETE)
app.delete('/metas/:id', async (requisicao, resposta) => {
    try {
        const { id } = requisicao.params;

        // Exclusão permanente — sem soft delete, conforme requisito
        const sql = 'DELETE FROM metas WHERE id = $1';
        const resultado = await bancoDeDados.query(sql, [id]);

        if (resultado.rowCount === 0) {
            return resposta.status(404).json({ mensagem: 'Meta não encontrada' });
        }

        // 204 No Content: sucesso sem corpo de resposta
        resposta.status(204).send();
    } catch (erro) {
        console.error("Erro no banco:", erro);
        resposta.status(500).json({ mensagem: 'Erro ao excluir a meta' });
    }
});

// Liga o servidor na porta 3000
app.listen(3000, () => {
    console.log('🚀 Servidor rodando perfeitamente na porta 3000!');
});