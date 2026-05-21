-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dest_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    message TEXT NOT NULL,
    severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 5),
    report_type TEXT NOT NULL,
    time_label TEXT DEFAULT 'Baru saja',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow public read access on reports" 
ON public.reports 
FOR SELECT 
USING (true);

-- Allow anonymous insert access (for prototype purposes)
CREATE POLICY "Allow public insert access on reports" 
ON public.reports 
FOR INSERT 
WITH CHECK (true);

-- Allow anonymous delete access (for prototype purposes)
CREATE POLICY "Allow public delete access on reports" 
ON public.reports 
FOR DELETE 
USING (true);
