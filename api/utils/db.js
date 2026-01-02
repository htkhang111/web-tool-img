// api/utils/db.js
import { createClient } from '@supabase/supabase-js';

// Lấy key từ biến môi trường
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Thiếu SUPABASE_URL hoặc SUPABASE_KEY!");
}

// Khởi tạo client (Dùng cho server-side nên sài key nào cũng được, tốt nhất là Service Role nếu muốn full quyền, hoặc Anon Key cũng ok với bảng public)
export const supabase = createClient(supabaseUrl, supabaseKey);