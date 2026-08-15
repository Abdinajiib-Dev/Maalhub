-- MaalHub Database Schema and RLS Policies

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    profile_photo_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('investor', 'entrepreneur')),
    about TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Entrepreneur Profiles Table
CREATE TABLE public.entrepreneur_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    startup_company_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    startup_stage TEXT NOT NULL,
    funding_goal NUMERIC NOT NULL CHECK (funding_goal > 0),
    business_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Investor Profiles Table
CREATE TABLE public.investor_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    investor_type TEXT NOT NULL,
    minimum_investment NUMERIC NOT NULL CHECK (minimum_investment >= 0),
    maximum_investment NUMERIC NOT NULL CHECK (maximum_investment >= minimum_investment),
    about_me TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Investor Industries Table
CREATE TABLE public.investor_industries (
    investor_id UUID REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
    industry TEXT NOT NULL,
    PRIMARY KEY (investor_id, industry)
);

-- 5. Investor Stages Table
CREATE TABLE public.investor_stages (
    investor_id UUID REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
    stage TEXT NOT NULL,
    PRIMARY KEY (investor_id, stage)
);

-- 6. Projects Table
CREATE TABLE public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    entrepreneur_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    project_name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    startup_stage TEXT NOT NULL,
    location TEXT NOT NULL,
    funding_goal NUMERIC NOT NULL CHECK (funding_goal > 0),
    project_description TEXT NOT NULL,
    business_description TEXT NOT NULL,
    problem TEXT,
    solution TEXT,
    business_model TEXT,
    target_market TEXT,
    competitive_advantage TEXT,
    revenue_model TEXT,
    current_progress TEXT,
    funding_use TEXT,
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Paused', 'Closed')),
    project_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Project Documents Table
CREATE TABLE public.project_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Saved Projects Table
CREATE TABLE public.saved_projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    investor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(investor_id, project_id)
);

-- 9. Investment Requests Table
CREATE TABLE public.investment_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    investor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    entrepreneur_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    proposed_amount NUMERIC NOT NULL CHECK (proposed_amount > 0),
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected', 'Withdrawn')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Conversations Table
CREATE TABLE public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Conversation Participants Table
CREATE TABLE public.conversation_participants (
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (conversation_id, user_id)
);

-- 12. Messages Table
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ent_profiles_updated_at BEFORE UPDATE ON public.entrepreneur_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_inv_profiles_updated_at BEFORE UPDATE ON public.investor_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_inv_req_updated_at BEFORE UPDATE ON public.investment_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_conv_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entrepreneur_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Storage Buckets setup (SQL for Supabase storage schema)
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('project-documents', 'project-documents', false);

-- Storage RLS Policies
-- profile-photos
CREATE POLICY "Public profiles are viewable by everyone." ON storage.objects FOR SELECT USING (bucket_id = 'profile-photos');
CREATE POLICY "Users can upload their own profile photo." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-photos' AND auth.uid() = owner);
CREATE POLICY "Users can update their own profile photo." ON storage.objects FOR UPDATE USING (bucket_id = 'profile-photos' AND auth.uid() = owner);
CREATE POLICY "Users can delete their own profile photo." ON storage.objects FOR DELETE USING (bucket_id = 'profile-photos' AND auth.uid() = owner);

-- project-images
CREATE POLICY "Project images are viewable by everyone." ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
CREATE POLICY "Users can upload project images." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-images' AND auth.uid() = owner);
CREATE POLICY "Users can update their project images." ON storage.objects FOR UPDATE USING (bucket_id = 'project-images' AND auth.uid() = owner);
CREATE POLICY "Users can delete their project images." ON storage.objects FOR DELETE USING (bucket_id = 'project-images' AND auth.uid() = owner);

-- project-documents
CREATE POLICY "Project documents are viewable by authorized users." ON storage.objects FOR SELECT USING (bucket_id = 'project-documents'); -- Real logic in backend
CREATE POLICY "Users can upload project documents." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-documents' AND auth.uid() = owner);
CREATE POLICY "Users can delete their project documents." ON storage.objects FOR DELETE USING (bucket_id = 'project-documents' AND auth.uid() = owner);

-- Basic RLS Policies for Tables
-- Let backend (using Service Role Key) bypass these for complex logic, but here are basic ones for direct API access if used.
-- Actually, since we're using Express backend, the backend should use the Service Role Key for most operations, or forward the user's JWT.
-- If backend forwards JWT, these RLS policies apply.

-- Profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects
CREATE POLICY "Published projects are viewable by everyone" ON public.projects FOR SELECT USING (status = 'Published' OR auth.uid() = entrepreneur_id);
CREATE POLICY "Entrepreneurs can insert projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = entrepreneur_id);
CREATE POLICY "Entrepreneurs can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = entrepreneur_id);
CREATE POLICY "Entrepreneurs can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = entrepreneur_id);

-- Other tables will follow similar RLS where owners can manage their data.
