-- Migration: 20261002_project_reports.sql
-- Description: Create project_reports table for progress updates from entrepreneurs to investors

-- 1. Create project_reports table
CREATE TABLE IF NOT EXISTS public.project_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    entrepreneur_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    phase_id UUID REFERENCES public.project_investment_phases(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    key_achievements TEXT,
    next_steps TEXT,
    report_type TEXT NOT NULL DEFAULT 'Progress' CHECK (report_type IN ('Progress', 'Achievements', 'Financial')),
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by project and entrepreneur
CREATE INDEX IF NOT EXISTS idx_reports_project_id ON public.project_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_reports_entrepreneur_id ON public.project_reports(entrepreneur_id);

-- 2. Enable RLS
ALTER TABLE public.project_reports ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DO $$
BEGIN
    -- Anyone viewable or investors/owners viewable
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'project_reports' 
        AND policyname = 'Reports are viewable by authenticated users'
    ) THEN
        CREATE POLICY "Reports are viewable by authenticated users" 
        ON public.project_reports FOR SELECT 
        USING (true);
    END IF;

    -- Project owners can manage (insert, update, delete) reports for their projects
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'project_reports' 
        AND policyname = 'Entrepreneurs can manage reports for their projects'
    ) THEN
        CREATE POLICY "Entrepreneurs can manage reports for their projects" 
        ON public.project_reports FOR ALL 
        USING (
            auth.uid() = entrepreneur_id OR
            EXISTS (
                SELECT 1 FROM public.projects 
                WHERE projects.id = project_reports.project_id 
                AND projects.entrepreneur_id = auth.uid()
            )
        );
    END IF;
END $$;

-- 4. Trigger for updated_at
DROP TRIGGER IF EXISTS update_reports_updated_at ON public.project_reports;
CREATE TRIGGER update_reports_updated_at 
BEFORE UPDATE ON public.project_reports 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
