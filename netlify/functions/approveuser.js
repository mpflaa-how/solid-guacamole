import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.https://adkljqadhghboezfazxz.supabase.co;
const anon public = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFka2xqcWFkaGdoYm9lemZhenh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MDY0NTksImV4cCI6MjA4OTk4MjQ1OX0.tpZ1yo58-46mtD88ZC2pdD5_uZIjL-fjXPU1fSsqnOA
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
