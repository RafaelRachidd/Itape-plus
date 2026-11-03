-- Itape + — schema do banco (PostgreSQL / Neon)
-- Executar com: npm run db:schema
-- ATENÇÃO: apaga e recria as tabelas (use apenas em desenvolvimento).

DROP TABLE IF EXISTS eventos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;

-- Organizadores e administrador (RF06, RF07, RF16, RN07, RN08)
CREATE TABLE usuarios (
  id            SERIAL PRIMARY KEY,
  nome          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  senha_hash    VARCHAR(100) NOT NULL,                 -- bcrypt (RNF02)
  perfil        VARCHAR(20)  NOT NULL DEFAULT 'organizador'
                CHECK (perfil IN ('organizador', 'admin')),
  nome_publico  VARCHAR(100),                          -- exibido nos eventos (RF15)
  descricao     TEXT,
  contato       VARCHAR(150),                          -- telefone, e-mail ou rede social
  criado_em     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Categorias usadas nos filtros (RF04). Educação reúne cursos e oficinas.
CREATE TABLE categorias (
  id    SERIAL PRIMARY KEY,
  nome  VARCHAR(50) NOT NULL UNIQUE,
  slug  VARCHAR(50) NOT NULL UNIQUE
);

-- Eventos (RF01–RF05, RF08–RF14, RN01–RN09)
CREATE TABLE eventos (
  id               SERIAL PRIMARY KEY,
  organizador_id   INTEGER      NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  categoria_id     INTEGER      NOT NULL REFERENCES categorias(id),
  titulo           VARCHAR(150) NOT NULL,
  descricao        TEXT         NOT NULL,
  data_inicio      TIMESTAMPTZ  NOT NULL,              -- data e horário
  data_fim         TIMESTAMPTZ,
  local_nome       VARCHAR(150) NOT NULL,              -- ex.: Teatro Municipal
  endereco         VARCHAR(255) NOT NULL,
  cidade           VARCHAR(100) NOT NULL DEFAULT 'Itapetininga',
  gratuito         BOOLEAN      NOT NULL DEFAULT TRUE,
  preco            NUMERIC(10,2),
  link_inscricao   VARCHAR(500),
  imagem_url       VARCHAR(500),                       -- URL informada pelo organizador
  status           VARCHAR(20)  NOT NULL DEFAULT 'pendente'      -- RN01
                   CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  motivo_rejeicao  TEXT,
  criado_em        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  atualizado_em    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  -- Evento pago precisa de preço; gratuito não tem preço.
  CONSTRAINT preco_coerente CHECK (
    (gratuito AND preco IS NULL) OR (NOT gratuito AND preco IS NOT NULL AND preco > 0)
  ),
  -- RN04: rejeição exige motivo.
  CONSTRAINT rejeicao_com_motivo CHECK (
    status <> 'rejeitado' OR (motivo_rejeicao IS NOT NULL AND length(trim(motivo_rejeicao)) > 0)
  ),
  CONSTRAINT datas_coerentes CHECK (data_fim IS NULL OR data_fim >= data_inicio)
);

-- Índices para as consultas do catálogo e do painel.
CREATE INDEX idx_eventos_status_data ON eventos (status, data_inicio);
CREATE INDEX idx_eventos_categoria   ON eventos (categoria_id);
CREATE INDEX idx_eventos_organizador ON eventos (organizador_id);
