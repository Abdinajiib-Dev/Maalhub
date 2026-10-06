-- Migration: Add progress_percentage column to public.projects and sync with current_progress
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projects' 
        AND column_name = 'progress_percentage'
    ) THEN
        ALTER TABLE public.projects ADD COLUMN progress_percentage INTEGER DEFAULT 0;
        
        -- Backfill from current_progress (e.g. '25%' -> 25)
        UPDATE public.projects
        SET progress_percentage = COALESCE(NULLIF(regexp_replace(current_progress, '[^0-9]', '', 'g'), '')::INTEGER, 0)
        WHERE current_progress IS NOT NULL;
    END IF;
END $$;
