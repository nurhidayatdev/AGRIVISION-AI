import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rliuwekrjwywymvtwmiz.supabase.co';
const supabaseKey = 'sb_publishable_WMMFMXX6ROlJw9JMdzBNhQ_nDQUxBbi';

export const supabase = createClient(supabaseUrl, supabaseKey);
