import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://ftncdglerbogmsjgspsk.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_YpXlxVd04c8tkx9goqdt0Q_zHoBd-tA";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

window.supabase = supabase;

console.log("Supabase client berhasil diinisialisasi!");