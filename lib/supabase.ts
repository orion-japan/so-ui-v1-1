import { createClient } from '@supabase/supabase-js';

// ==============================
// ✅ サーバー専用 Supabase クライアント
// ==============================
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    '❌ Supabase 環境変数が未設定です！ SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を確認してください。'
  );
}

// Service Role Key を使用するので、このファイルは必ずサーバーサイドでのみ使用する
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
