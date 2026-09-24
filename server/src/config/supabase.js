const { createClient } = require('@supabase/supabase-js');
const { supabaseUrl, supabaseServiceKey } = require('./env');

// Service-role client - server-side only, never expose this key to the frontend
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
