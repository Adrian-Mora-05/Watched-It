import { createClient } from '@supabase/supabase-js';
import process from 'process';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

//this client is used for public requests, it will be created with the user's token in the auth service
const supabase = createClient(supabaseUrl, supabaseKey);

//this client is used for admin requests, it has access to all the data in the database
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

//this client is used for authenticated requests, it will be created with the user's token in the auth service
export const createUserClient = (userToken: string) =>
  createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${userToken}`,
        apikey: supabaseKey,
      },
    },
  });

export { supabase, supabaseAdmin };