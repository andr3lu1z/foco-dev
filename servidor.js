const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

app.use(express.json());
app.use(cors());

const bancoDeDados = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'foco_dev',
    password: 'admin123',
    port: 5432,
});

// ===== CATEGORIAS =====

// Lista todas as categorias (alimenta o seletor no front-end)
app.get('/categorias', async (requisicao, resposta) => {
    try {
        const todasAsCategorias = await bancoDeDados.query('SELECT * FROM categorias ORDER BY nome ASC');
        resposta.json(todasAsCategorias.rows);
    } catch (erro) {
        console.error("Erro no banco:", erro);
        resposta.status(500).json({ mensagem: 'Erro ao buscar as categorias' });
    }
});

// Cria uma nova categoria
app.post('/categorias', async (requisicao, resposta) => {
    try {
        const { nome, cor } = requisicao.body;
        const corFinal = cor || '#6B7280'; // sem cor enviada, usa o cinza padrao

        const sql = 'INSERT INTO categorias (nome, cor) VALUES ($1, $2) RETURNING *';
        const novaCategoria = await bancoDeDados.query(sql, [nome, corFinal]);

        resposta.status(201).json(novaCategoria.rows[0]);
    } catch (erro) {
        console.error("Erro no banco:", erro);
        resposta.status(500).json({ mensagem: 'Erro ao salvar a categoria' });
    }
});

// ===== METAS =====

// Cria uma meta, agora com vinculo opcional a uma categoria (POST)
app.post('/metas', async (requisicao, resposta) => {
    try {
        const { descricao, categoria_id } = requisicao.body;

        // categoria_id opcional; sem valor entra como NULL ("Sem categoria")
        const sql = 'INSERT INTO metas (descricao, categoria_id) VALUES ($1, $2) RETURNING *';
        const novaMeta = await bancoDeDados.query(sql, [descricao, categoria_id || null]);

        resposta.status(201).json(novaMeta.rows[0]);
    } catch (erro) {
        console.error("Erro no banco:", erro);
        resposta.status(500).json({ mensagem: 'Erro interno ao salvar a meta' });
    }
});

// Lista todas as metas trazendo nome e cor da categoria (GET)
app.get('/metas', async (requisicao, resposta) => {
    try {
        // LEFT JOIN mantem metas SEM categoria na lista (categoria_id = NULL)
        const sql = `
            SELECT
                m.id,
                m.descricao,
                m.status,
                m.data_criacao,
                m.categoria_id,
                c.nome AS categoria_nome,
                c.cor  AS categoria_cor
            FROM metas m
            LEFT JOIN categorias c ON m.categoria_id = c.id
            ORDER BY m.id DESC
        `;
        const todasAsMetas = await bancoDeDados.query(sql);
        resposta.json(todasAsMetas.rows);
    } catch (erro) {
        console.error("Erro no banco:", erro);
        resposta.status(500).json({ mensagem: 'Erro ao buscar as metas' });
    }
});

// Marca a meta como concluida sem apagar o historico (PUT)
app.put('/metas/:id', async (requisicao, resposta) => {
    try {
        const { id } = requisicao.params;

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

// Remove fisicamente o registro do banco (DELETE)
app.delete('/metas/:id', async (requisicao, resposta) => {
    try {
        const { id } = requisicao.params;

        const sql = 'DELETE FROM metas WHERE id = $1';
        const resultado = await bancoDeDados.query(sql, [id]);

        if (resultado.rowCount === 0) {
            return resposta.status(404).json({ mensagem: 'Meta não encontrada' });
        }

        resposta.status(204).send();
    } catch (erro) {
        console.error("Erro no banco:", erro);
        resposta.status(500).json({ mensagem: 'Erro ao excluir a meta' });
    }
});

app.listen(3000, () => {
    console.log('🚀 Servidor rodando perfeitamente na porta 3000!');
});
