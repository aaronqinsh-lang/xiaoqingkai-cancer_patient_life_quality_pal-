
import { createClient } from '@supabase/supabase-js';

/**
 * 从 Vite/Netlify 的环境变量读取 Supabase 配置
 * 在 Netlify 中添加环境变量:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 *
 * 说明：
 * - VITE_ 前缀使变量在 Vite 构建时注入到客户端代码中。
 * - 请在 Netlify 的 Site settings → Build & deploy → Environment → Environment variables 添加上述变量。
 */

const env = import.meta.env as Record<string, string | undefined>;
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables. ' +
      'Set them in Netlify (Site settings → Build & deploy → Environment → Environment variables).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
