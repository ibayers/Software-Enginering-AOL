-- ============================================
-- Voyager Go - Auth Migration Script
-- Jalankan di Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Tambahkan kolom user_id ke tabel reports
ALTER TABLE reports
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Buat index untuk performa query per user
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);

-- 3. Drop policy lama (anonymous access) sebelum membuat yang baru
DROP POLICY IF EXISTS "Allow public insert access on reports" ON reports;
DROP POLICY IF EXISTS "Allow public delete access on reports" ON reports;

-- 4. Policy: Hanya user yang login bisa insert report
CREATE POLICY "Hanya user login yang bisa insert report"
ON reports FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Policy: Hanya pemilik report yang bisa hapus
CREATE POLICY "Hanya pemilik report yang bisa hapus"
ON reports FOR DELETE
USING (user_id = auth.uid());

-- 6. Policy: Hanya pemilik report yang bisa update
CREATE POLICY "Hanya pemilik report yang bisa update"
ON reports FOR UPDATE
USING (user_id = auth.uid());

-- ============================================
-- Verifikasi (opsional, jalankan untuk cek)
-- ============================================
-- SELECT * FROM pg_policies WHERE tablename = 'reports';
