-- =======================================================
-- SCHEMA SQL PARA SUPABASE / POSTGRESQL (HOSPITAL ORIZONTI)
-- =======================================================

-- 1. Criação da tabela de visitas
CREATE TABLE IF NOT EXISTS visitas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(50) NOT NULL,
  data DATE NOT NULL,
  horario VARCHAR(10) NOT NULL, -- Formato: '11:00', '12:00', etc.
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraint de unicidade: Garante no máximo 1 visita por horário em cada data
  CONSTRAINT uq_visita_data_horario UNIQUE (data, horario)
);

-- 2. Índice para consultas otimizadas por data
CREATE INDEX IF NOT EXISTS idx_visitas_data ON visitas(data);

-- 3. Função de verificação para limitar estritamente a 4 visitas por dia
CREATE OR REPLACE FUNCTION check_limite_visitas_dia()
RETURNS TRIGGER AS $$
DECLARE
  total_visitas INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_visitas
  FROM visitas
  WHERE data = NEW.data;

  IF total_visitas >= 4 THEN
    RAISE EXCEPTION 'LIMITE_EXCEDIDO: O dia % já possui o número máximo de 4 visitas confirmadas.', NEW.data;
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
