import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.https://adkljqadhghboezfazxz.supabase.co;
const supabaseKey = 'sb_publishable_cEo9AM4ZL0T21rG-Fn1RlA_u2nW5vj6';
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function handler(event) {
  try {
    const { email } = JSON.parse(event.body);

    // Update user's metadata to approved
    const { error } = await supabase.auth.admin.updateUserByEmail(email, {
      user_metadata: { approved: true }
    });

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ approved: true, email })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ approved: false, error: err.message })
    };
  }
}
