-- Tabela de categorias (criada ANTES de metas, pois metas referencia ela)
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cor VARCHAR(7) DEFAULT '#6B7280'
);

-- Tabela de metas, agora com vínculo opcional a uma categoria
CREATE TABLE metas (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pendente',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL
);

-- Categorias iniciais para o sistema já nascer usável
INSERT INTO categorias (nome, cor) VALUES
    ('Estudos',  '#3B82F6'),
    ('Trabalho', '#10B981'),
    ('Pessoal',  '#F59E0B'),
    ('Saúde',    '#EF4444');
