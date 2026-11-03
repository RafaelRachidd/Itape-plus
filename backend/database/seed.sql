-- Itape + — dados iniciais para desenvolvimento e testes
-- Executar com: npm run db:seed (também cria o administrador a partir do .env)
-- As senhas dos organizadores de exemplo são "senha1234" (hash bcrypt abaixo).

INSERT INTO categorias (nome, slug) VALUES
  ('Música',     'musica'),
  ('Teatro',     'teatro'),
  ('Dança',      'danca'),
  ('Exposição',  'exposicao'),
  ('Cinema',     'cinema'),
  ('Literatura', 'literatura'),
  ('Educação',   'educacao'),
  ('Festival',   'festival');

-- Dois organizadores, para testar a regra de dono do evento (RN06 / RF09).
INSERT INTO usuarios (nome, email, senha_hash, perfil, nome_publico, descricao, contato) VALUES
  ('Organizador A', 'organizador.a@exemplo.com', '$2b$10$LvguHuMkQw1E/l3JMPknweoazefkP128ohKa.3./aVLK.aRIKHaXS', 'organizador',
   'Coletivo Cultural A', 'Coletivo de teste do Itape +.', '(15) 99999-0001'),
  ('Organizador B', 'organizador.b@exemplo.com', '$2b$10$LvguHuMkQw1E/l3JMPknweoazefkP128ohKa.3./aVLK.aRIKHaXS', 'organizador',
   'Espaço Cultural B', 'Espaço de teste do Itape +.', 'contato@espacob.exemplo.com');

-- Eventos de exemplo cobrindo os cenários dos critérios de aceite:
-- aprovados futuros, pendente, rejeitado, passado, gratuito e pago.
-- As datas são relativas a hoje (horário de Brasília), para o seed continuar válido em qualquer dia.
INSERT INTO eventos
  (organizador_id, categoria_id, titulo, descricao, data_inicio, local_nome, endereco,
   gratuito, preco, link_inscricao, status, motivo_rejeicao)
VALUES
  (1, (SELECT id FROM categorias WHERE slug = 'musica'),
   'Estações da Nossa Gente', 'Apresentação musical com artistas da região.',
   (CURRENT_DATE + 5 + TIME '20:00') AT TIME ZONE 'America/Sao_Paulo',
   'Teatro Municipal', 'Rua de Exemplo, 100 - Centro', TRUE, NULL, NULL, 'aprovado', NULL),

  (1, (SELECT id FROM categorias WHERE slug = 'teatro'),
   'Mostra de Teatro Estudantil', 'Peças produzidas por estudantes de Itapetininga.',
   (CURRENT_DATE + 10 + TIME '19:00') AT TIME ZONE 'America/Sao_Paulo',
   'Centro Cultural', 'Avenida de Exemplo, 200 - Centro', FALSE, 20.00,
   'https://exemplo.com/inscricao', 'aprovado', NULL),

  (2, (SELECT id FROM categorias WHERE slug = 'educacao'),
   'Oficina de Fotografia com Celular', 'Oficina gratuita para iniciantes.',
   (CURRENT_DATE + 3 + TIME '14:00') AT TIME ZONE 'America/Sao_Paulo',
   'Biblioteca Municipal', 'Praça de Exemplo, 50 - Centro', TRUE, NULL,
   'https://exemplo.com/oficina', 'aprovado', NULL),

  (2, (SELECT id FROM categorias WHERE slug = 'danca'),
   'Festival de Danças Urbanas', 'Batalhas e apresentações de dança.',
   (CURRENT_DATE + 15 + TIME '18:00') AT TIME ZONE 'America/Sao_Paulo',
   'Praça Central', 'Praça de Exemplo, s/n - Centro', TRUE, NULL, NULL, 'pendente', NULL),

  (1, (SELECT id FROM categorias WHERE slug = 'exposicao'),
   'Exposição de Artes Visuais', 'Evento enviado com informações incompletas.',
   (CURRENT_DATE + 20 + TIME '10:00') AT TIME ZONE 'America/Sao_Paulo',
   'Galeria Exemplo', 'Rua de Exemplo, 300 - Centro', TRUE, NULL, NULL, 'rejeitado',
   'Informe o horário de funcionamento e o endereço completo da galeria.'),

  (2, (SELECT id FROM categorias WHERE slug = 'cinema'),
   'Cineclube: sessão passada', 'Evento já realizado, não deve aparecer na página inicial (RN09).',
   (CURRENT_DATE - 2 + TIME '19:00') AT TIME ZONE 'America/Sao_Paulo',
   'Centro Cultural', 'Avenida de Exemplo, 200 - Centro', TRUE, NULL, NULL, 'aprovado', NULL);
