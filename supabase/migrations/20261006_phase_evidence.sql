-- Migration: 20261006_phase_evidence.sql
-- Description: Add evidence columns to project_investment_phases for phase completion ZIP file proof

ALTER TABLE public.project_investment_phases 
ADD COLUMN IF NOT EXISTS evidence_url TEXT,
ADD COLUMN IF NOT EXISTS evidence_name TEXT,
ADD COLUMN IF NOT EXISTS evidence_submitted_at TIMESTAMPTZ;

-- Ensure public storage bucket policy notes (or RLS permissions for evidence)
COMMENT ON COLUMN public.project_investment_phases.evidence_url IS 'URL of uploaded ZIP evidence file for completed phase';
COMMENT ON COLUMN public.project_investment_phases.evidence_name IS 'Original filename of uploaded ZIP evidence file';
