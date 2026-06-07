-- Migração para bancos que JÁ existem (preserva as metas atuais)
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cor VARCHAR(7) DEFAULT '#6B7280'
);

ALTER TABLE metas
    ADD COLUMN categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL;

INSERT INTO categorias (nome, cor) VALUES
    ('Estudos',  '#3B82F6'),
    ('Trabalho', '#10B981'),
    ('Pessoal',  '#F59E0B'),
    ('Saúde',    '#EF4444');
