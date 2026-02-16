// Supabase configuration file
const supabaseConfig = {
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_SERVICE_KEY || '',
  isEnabled: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_KEY
};

export default supabaseConfig;