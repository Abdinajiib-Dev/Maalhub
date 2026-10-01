-- Migration: 20261001_investment_phases.sql
-- Description: Add investment phases (funding tranches) for projects and support in investment requests

-- 1. Create project_investment_phases table
CREATE TABLE IF NOT EXISTS public.project_investment_phases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    phase_number INT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_amount NUMERIC NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC DEFAULT 0 CHECK (current_amount >= 0),
    status TEXT NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Active', 'Funded', 'Completed')),
    start_date DATE,
    target_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by project
CREATE INDEX IF NOT EXISTS idx_phases_project_id ON public.project_investment_phases(project_id);

-- 2. Add phase_id to investment_requests if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'investment_requests' 
        AND column_name = 'phase_id'
    ) THEN
        ALTER TABLE public.investment_requests 
        ADD COLUMN phase_id UUID REFERENCES public.project_investment_phases(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE public.project_investment_phases ENABLE ROW LEVEL SECURITY;

-- 4. Policies
DO $$
BEGIN
    -- Public / All authenticated users can view phases of projects
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'project_investment_phases' 
        AND policyname = 'Investment phases are viewable by everyone'
    ) THEN
        CREATE POLICY "Investment phases are viewable by everyone" 
        ON public.project_investment_phases FOR SELECT 
        USING (true);
    END IF;

    -- Project owners can manage their phases
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'project_investment_phases' 
        AND policyname = 'Entrepreneurs can manage phases for their projects'
    ) THEN
        CREATE POLICY "Entrepreneurs can manage phases for their projects" 
        ON public.project_investment_phases FOR ALL 
        USING (
            EXISTS (
                SELECT 1 FROM public.projects 
                WHERE projects.id = project_investment_phases.project_id 
                AND projects.entrepreneur_id = auth.uid()
            )
        );
    END IF;
END $$;

-- 5. Trigger for updated_at
DROP TRIGGER IF EXISTS update_phases_updated_at ON public.project_investment_phases;
CREATE TRIGGER update_phases_updated_at 
BEFORE UPDATE ON public.project_investment_phases 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
