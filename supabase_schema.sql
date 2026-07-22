-- HARVOX AI — Supabase Database Schema
-- Run this in the Supabase SQL Editor to initialize all tables, indexes, RLS, and storage.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------
-- 1. SYSTEM SETTINGS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jazz_cash_number text DEFAULT '',
  jazz_cash_name text DEFAULT '',
  easy_paisa_number text DEFAULT '',
  easy_paisa_name text DEFAULT '',
  announcement text DEFAULT '',
  groq_key text DEFAULT '',
  gemini_key text DEFAULT '',
  cerebras_key text DEFAULT '',
  maintenance_mode boolean DEFAULT false,
  pro_price_monthly numeric DEFAULT 500,
  pro_price_yearly numeric DEFAULT 5000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------
-- 2. USERS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY, -- References auth.users(id)
  email text NOT NULL UNIQUE,
  role text DEFAULT 'free' CHECK (role IN ('admin', 'pro', 'free')),
  subscription text DEFAULT 'free' CHECK (subscription IN ('free', 'pro')),
  is_banned boolean DEFAULT false,
  usage_chats integer DEFAULT 0,
  usage_code_gen integer DEFAULT 0,
  usage_files integer DEFAULT 0,
  usage_projects integer DEFAULT 0,
  daily_usage integer DEFAULT 0,
  last_usage_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------
-- 3. PROFILES
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  avatar text DEFAULT '',
  bio text DEFAULT '',
  location text DEFAULT '',
  developer_role text DEFAULT 'Full Stack Developer',
  experience_level text DEFAULT 'Intermediate' CHECK (experience_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  skills text[] DEFAULT '{}',
  social_links jsonb DEFAULT '{"github": "", "twitter": "", "linkedin": "", "website": ""}'::jsonb,
  level integer DEFAULT 1,
  total_xp integer DEFAULT 0,
  badges jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------
-- 4. SUBSCRIPTIONS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  plan text DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'pending', 'expired', 'cancelled')),
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  payment_history jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------
-- 5. SETTINGS (User Settings)
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  appearance jsonb DEFAULT '{"mode": "dark", "theme": "Cyberpunk Neon", "accentColor": "purple", "fontSize": "medium", "uiDensity": "comfortable"}'::jsonb,
  ai jsonb DEFAULT '{"provider": "cerebras", "model": "llama-3.3-70b-versatile", "creativity": 0.7, "responseLength": "medium", "codingMode": "standard", "expertiseLevel": "intermediate", "streaming": true, "personalityMode": "professional"}'::jsonb,
  voice jsonb DEFAULT '{"enabled": false, "speed": 1, "voiceSelection": "female", "wakeWord": "Hey Harvox", "autoReplies": false, "language": "en-US"}'::jsonb,
  notifications jsonb DEFAULT '{"email": true, "aiAlerts": true, "soundEffects": true, "desktop": false, "security": true}'::jsonb,
  memory jsonb DEFAULT '{"rememberConversations": true, "projectMemory": true, "smartSuggestions": true, "memoryDepth": 5}'::jsonb,
  workspace jsonb DEFAULT '{"sidebarCollapsed": false, "layoutType": "default", "hiddenModules": []}'::jsonb,
  api_keys jsonb DEFAULT '{"groq": "", "gemini": "", "openrouter": "", "openai": "", "huggingface": "", "ollamaUrl": "", "cerebras": ""}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------
-- 6. PROJECTS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  framework text DEFAULT '',
  content text DEFAULT '',
  path text DEFAULT '',
  file_tree jsonb DEFAULT '{}'::jsonb,
  settings jsonb DEFAULT '{"theme": "cyberpunk", "layout": []}'::jsonb,
  memory jsonb DEFAULT '{"contextSummary": "", "recentErrors": [], "dependencies": []}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------
-- 7. CHAT SESSIONS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  title text DEFAULT 'New Chat',
  pinned boolean DEFAULT false,
  archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------
-- 8. CHAT MESSAGES
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  bookmarked boolean DEFAULT false,
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------
-- 9. VOICE SESSIONS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.voice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  transcript text NOT NULL,
  speaking_style text DEFAULT 'professional',
  voice_preferences jsonb DEFAULT '{}'::jsonb,
  duration_seconds integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------
-- 10. AUTOMATION HISTORY
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.automation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  description text DEFAULT '',
  args jsonb DEFAULT '[]'::jsonb,
  execution_time_ms integer DEFAULT 0,
  success boolean DEFAULT true,
  error text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------
-- 11. BRAIN MEMORY (User Memory Core + Vector RAG)
-- ----------------------------------------------------
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.brain_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('identity', 'preferences', 'project', 'conversation', 'activity', 'notes', 'automation', 'goals', 'coding_style')),
  key text NOT NULL,
  value jsonb NOT NULL,
  title text DEFAULT '',
  content text DEFAULT '',
  tags text[] DEFAULT '{}',
  embedding vector(1536),
  importance_score numeric DEFAULT 0.5 CHECK (importance_score >= 0 AND importance_score <= 1.0),
  confidence_score numeric DEFAULT 0.8 CHECK (confidence_score >= 0 AND confidence_score <= 1.0),
  is_pinned boolean DEFAULT false,
  archived boolean DEFAULT false,
  source text DEFAULT 'manual' CHECK (source IN ('manual', 'chat_auto', 'file_import', 'system_telemetry', 'historical_import')),
  related_memories uuid[] DEFAULT '{}',
  last_accessed timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------
-- 12. DEVELOPER HISTORY (Command History)
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.developer_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  command text NOT NULL,
  output text DEFAULT '',
  exit_code integer,
  success boolean,
  ai_explanation text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------
-- 13. NOTIFICATIONS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------
-- 14. ACTIVITY LOGS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action_type text NOT NULL CHECK (action_type IN ('chat', 'code_gen', 'debug', 'upload', 'project', 'login')),
  details text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------
-- 15. DOCUMENTS (Notes)
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text DEFAULT 'Untitled Note',
  content text DEFAULT '',
  source text DEFAULT 'manual' CHECK (source IN ('manual', 'code', 'chat', 'file')),
  tags text[] DEFAULT '{}',
  pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------
-- 16. UPLOADED FILES (Files)
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.uploaded_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text DEFAULT '',
  mime_type text DEFAULT '',
  analysis text DEFAULT '',
  extracted_text text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------
-- 17. SYSTEM LOGS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_level text DEFAULT 'info' CHECK (log_level IN ('info', 'warn', 'error', 'debug')),
  message text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------
-- 18. USER PREFERENCES (Automation Preferences)
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  preferred_music_service text DEFAULT 'auto' CHECK (preferred_music_service IN ('spotify', 'youtube', 'youtube_music', 'auto')),
  favorite_contacts jsonb DEFAULT '[]'::jsonb,
  frequent_apps jsonb DEFAULT '[]'::jsonb,
  frequent_sites jsonb DEFAULT '[]'::jsonb,
  saved_workflows jsonb DEFAULT '[]'::jsonb,
  pomodoro_minutes integer DEFAULT 25,
  break_minutes integer DEFAULT 5,
  stats jsonb DEFAULT '{"totalRuns": 0, "successCount": 0, "failureCount": 0}'::jsonb,
  permissions jsonb DEFAULT '{"allowWhatsAppSend": false, "allowFileDeletion": false, "allowGitPush": false, "allowShellCommands": false}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------
-- 19. SAVED PROMPTS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  prompt text NOT NULL,
  category text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------
-- 20. API KEYS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  key_name text NOT NULL,
  key_value text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------
-- 21. LEARNING TRACKS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject text NOT NULL CHECK (subject IN ('AI', 'Database', 'Software Engineering', 'Assembly Language')),
  hours numeric DEFAULT 0,
  notes text DEFAULT '',
  last_studied timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_subject UNIQUE (user_id, subject)
);

-- ----------------------------------------------------
-- 22. TASKS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  deadline timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------
-- 23. AI CALL LOGS
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_call_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  chat_id uuid REFERENCES public.chat_sessions(id) ON DELETE SET NULL,
  provider text NOT NULL,
  model text NOT NULL,
  prompt_tokens integer DEFAULT 0,
  completion_tokens integer DEFAULT 0,
  total_tokens integer DEFAULT 0,
  latency_ms integer DEFAULT 0,
  cost numeric DEFAULT 0.0,
  status text DEFAULT 'success',
  is_failover boolean DEFAULT false,
  failover_from_provider text,
  failover_from_model text,
  created_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------
-- INDEXES FOR PERFORMANCE
-- ----------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_brain_memory_user_id_category ON public.brain_memory(user_id, category);
CREATE INDEX IF NOT EXISTS idx_brain_memory_user_id_pinned ON public.brain_memory(user_id, is_pinned DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id ON public.uploaded_files(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_tracks_user_id ON public.learning_tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_call_logs_user_id ON public.ai_call_logs(user_id);

-- ----------------------------------------------------
-- AUTOMATIC UPDATE FOR updated_at TIMESTAMP
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_chat_sessions_updated_at BEFORE UPDATE ON public.chat_sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_brain_memory_updated_at BEFORE UPDATE ON public.brain_memory FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_uploaded_files_updated_at BEFORE UPDATE ON public.uploaded_files FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_saved_prompts_updated_at BEFORE UPDATE ON public.saved_prompts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_learning_tracks_updated_at BEFORE UPDATE ON public.learning_tracks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tr_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- ----------------------------------------------------

-- Admin detection helper function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on user-scoped tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developer_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_call_logs ENABLE ROW LEVEL SECURITY;

-- Policies for public.users
CREATE POLICY users_all_policy ON public.users FOR ALL USING (auth.uid() = id OR public.is_admin(auth.uid()));

-- Policies for public.profiles
CREATE POLICY profiles_all_policy ON public.profiles FOR ALL USING (auth.uid() = id OR public.is_admin(auth.uid()));

-- Policies for public.subscriptions
CREATE POLICY subscriptions_all_policy ON public.subscriptions FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Policies for public.settings
CREATE POLICY settings_all_policy ON public.settings FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Policies for public.projects
CREATE POLICY projects_all_policy ON public.projects FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Policies for public.chat_sessions
CREATE POLICY chat_sessions_all_policy ON public.chat_sessions FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Policies for public.chat_messages
CREATE POLICY chat_messages_all_policy ON public.chat_messages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.chat_sessions
    WHERE chat_sessions.id = session_id AND (chat_sessions.user_id = auth.uid() OR public.is_admin(auth.uid()))
  )
);

-- Policies for public.voice_sessions
CREATE POLICY voice_sessions_all_policy ON public.voice_sessions FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Policies for public.automation_history
CREATE POLICY automation_history_all_policy ON public.automation_history FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Policies for public.brain_memory
CREATE POLICY brain_memory_all_policy ON public.brain_memory FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Policies for public.developer_history
CREATE POLICY developer_history_all_policy ON public.developer_history FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Policies for public.notifications
CREATE POLICY notifications_all_policy ON public.notifications FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Policies for public.activity_logs
CREATE POLICY activity_logs_all_policy ON public.activity_logs FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Policies for public.documents
CREATE POLICY documents_all_policy ON public.documents FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Policies for public.uploaded_files
CREATE POLICY uploaded_files_all_policy ON public.uploaded_files FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Policies for public.user_preferences
CREATE POLICY user_preferences_all_policy ON public.user_preferences FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Policies for public.saved_prompts
CREATE POLICY saved_prompts_all_policy ON public.saved_prompts FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Policies for public.api_keys
CREATE POLICY api_keys_all_policy ON public.api_keys FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Policies for public.learning_tracks
CREATE POLICY learning_tracks_all_policy ON public.learning_tracks FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Policies for public.tasks
CREATE POLICY tasks_all_policy ON public.tasks FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Policies for public.ai_call_logs
CREATE POLICY ai_call_logs_all_policy ON public.ai_call_logs FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));


-- ----------------------------------------------------
-- STORAGE BUCKETS DEFINITIONS (if storage schema exists)
-- ----------------------------------------------------
-- Create storage buckets under storage schema
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('documents', 'documents', false),
  ('voice-recordings', 'voice-recordings', false),
  ('screenshots', 'screenshots', false),
  ('ai-files', 'ai-files', false),
  ('exports', 'exports', false),
  ('presentations', 'presentations', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (bucket security)
CREATE POLICY "Avatars Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Avatars User All" ON storage.objects FOR ALL USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Documents User All" ON storage.objects FOR ALL USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Voice Recordings User All" ON storage.objects FOR ALL USING (bucket_id = 'voice-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Screenshots User All" ON storage.objects FOR ALL USING (bucket_id = 'screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "AI Files User All" ON storage.objects FOR ALL USING (bucket_id = 'ai-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Exports User All" ON storage.objects FOR ALL USING (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Presentations User All" ON storage.objects FOR ALL USING (bucket_id = 'presentations' AND auth.uid()::text = (storage.foldername(name))[1]);


-- ----------------------------------------------------
-- VECTOR SEARCH RPC FUNCTION FOR BRAIN MEMORY (RAG)
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION public.match_memories(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.2,
  match_count int DEFAULT 10,
  filter_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  category text,
  key text,
  value jsonb,
  title text,
  content text,
  tags text[],
  importance_score numeric,
  confidence_score numeric,
  is_pinned boolean,
  archived boolean,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bm.id,
    bm.category,
    bm.key,
    bm.value,
    bm.title,
    bm.content,
    bm.tags,
    bm.importance_score,
    bm.confidence_score,
    bm.is_pinned,
    bm.archived,
    1 - (bm.embedding <=> query_embedding) AS similarity
  FROM public.brain_memory bm
  WHERE bm.user_id = filter_user_id
    AND bm.archived = false
    AND 1 - (bm.embedding <=> query_embedding) > match_threshold
  ORDER BY bm.is_pinned DESC, (1 - (bm.embedding <=> query_embedding)) DESC
  LIMIT match_count;
END;
$$;
