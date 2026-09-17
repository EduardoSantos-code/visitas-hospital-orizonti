-- =======================================================
-- SCHEMA SQL PARA SUPABASE / POSTGRESQL (HOSPITAL ORIZONTI)
-- =======================================================

-- 1. Criação da tabela de visitas
CREATE TABLE IF NOT EXISTS visitas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(50) NOT NULL,
  data DATE NOT NULL,
  horario VARCHAR(10), -- Opcional / Histórico
  tipo VARCHAR(50) DEFAULT 'Visita' NOT NULL, -- 'Visita', 'Acompanhante - Dia', ou 'Acompanhante - Noite'
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Script de migração para tabelas existentes no Supabase:
-- ALTER TABLE visitas ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'Visita' NOT NULL;
-- ALTER TABLE visitas ALTER COLUMN horario DROP NOT NULL;
-- ALTER TABLE visitas DROP CONSTRAINT IF EXISTS uq_visita_data_horario;

-- 2. Índice para consultas otimizadas por data
CREATE INDEX IF NOT EXISTS idx_visitas_data ON visitas(data);

-- 3. Função de verificação com limites independentes por modalidade
CREATE OR REPLACE FUNCTION check_limite_visitas_dia()
RETURNS TRIGGER AS $$
DECLARE
  total_visitas INTEGER;
  total_acomp_dia INTEGER;
  total_acomp_noite INTEGER;
BEGIN
  IF NEW.tipo = 'Visita' THEN
    SELECT COUNT(*) INTO total_visitas
    FROM visitas
    WHERE data = NEW.data AND tipo = 'Visita';

    IF total_visitas >= 4 THEN
      RAISE EXCEPTION 'LIMITE_VISITAS_EXCEDIDO: O dia % já possui o limite máximo de 4 visitas simultâneas.', NEW.data;
    END IF;

  ELSIF NEW.tipo = 'Acompanhante - Dia' THEN
    SELECT COUNT(*) INTO total_acomp_dia
    FROM visitas
    WHERE data = NEW.data AND tipo = 'Acompanhante - Dia';

    IF total_acomp_dia >= 1 THEN
      RAISE EXCEPTION 'LIMITE_ACOMPANHANTE_DIA_EXCEDIDO: O dia % já possui um acompanhante de dia (08h às 20h).', NEW.data;
    END IF;

  ELSIF NEW.tipo = 'Acompanhante - Noite' THEN
    SELECT COUNT(*) INTO total_acomp_noite
    FROM visitas
    WHERE data = NEW.data AND tipo = 'Acompanhante - Noite';

    IF total_acomp_noite >= 1 THEN
      RAISE EXCEPTION 'LIMITE_ACOMPANHANTE_NOITE_EXCEDIDO: O dia % já possui um acompanhante de noite (20h às 08h).', NEW.data;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger executado antes de cada inserção
DROP TRIGGER IF EXISTS trigger_check_limite_visitas ON visitas;

CREATE TRIGGER trigger_check_limite_visitas
BEFORE INSERT ON visitas
FOR EACH ROW
EXECUTE FUNCTION check_limite_visitas_dia();

-- Habilitar Row Level Security (RLS)
ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (permitir leitura e inserção por qualquer visitante da família)
CREATE POLICY "Permitir leitura publica de visitas" ON visitas
  FOR SELECT USING (true);

CREATE POLICY "Permitir insercao publica de visitas" ON visitas
  FOR INSERT WITH CHECK (true);
