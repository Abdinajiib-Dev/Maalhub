-- Migration: Add Identity Verification Document columns to profiles table
-- Date: 2026-10-13

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS id_document_type TEXT,
ADD COLUMN IF NOT EXISTS id_document_number TEXT,
ADD COLUMN IF NOT EXISTS id_document_url TEXT,
ADD COLUMN IF NOT EXISTS id_document_name TEXT,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

-- Add check constraint for verification status if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_verification_status_check'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_verification_status_check 
    CHECK (verification_status IN ('pending', 'verified', 'rejected'));
  END IF;
END $$;

-- Add check constraint for id_document_type if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_id_document_type_check'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_id_document_type_check 
    CHECK (id_document_type IS NULL OR id_document_type IN ('Passport', 'National ID', 'Birth Document'));
  END IF;
END $$;

-- Create Storage bucket for identity documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('identity-documents', 'identity-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for identity-documents bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Identity documents are viewable by everyone'
  ) THEN
    CREATE POLICY "Identity documents are viewable by everyone" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'identity-documents');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can upload identity documents'
  ) THEN
    CREATE POLICY "Anyone can upload identity documents" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'identity-documents');
  END IF;
END $$;
