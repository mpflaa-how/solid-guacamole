import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFka2xqcWFkaGdoYm9lemZhenh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQwNjQ1OSwiZXhwIjoyMDg5OTgyNDU5fQ.1N-mUaYN2R7eJCp2yTgLow1rIP7_JhdVNlLpg24R5no;
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
