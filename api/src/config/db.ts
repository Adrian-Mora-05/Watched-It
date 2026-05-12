import 'dotenv/config'; 
import { createClient } from '@supabase/supabase-js';
import process from 'process';
import ws from 'ws';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseOptions = {
  realtime: { transport: ws as any } 
};

const supabase = createClient(supabaseUrl, supabaseKey, supabaseOptions);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, supabaseOptions);

export const createUserClient = (userToken: string) =>
  createClient(supabaseUrl, supabaseKey, {
    ...supabaseOptions,
    global: {
      headers: {
        Authorization: `Bearer ${userToken}`,
        apikey: supabaseKey,
      },
    },
  });

export { supabase, supabaseAdmin };