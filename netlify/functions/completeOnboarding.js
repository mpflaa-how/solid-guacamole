// /.netlify/functions/completeOnboarding.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://adkljqadhghboezfazxz.supabase.co';
const supabaseServiceRoleKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFka2xqcWFkaGdoYm9lemZhenh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQwNjQ1OSwiZXhwIjoyMDg5OTgyNDU5fQ.1N-mUaYN2R7eJCp2yTgLow1rIP7_JhdVNlLpg24R5no; // 🔒 Never expose in frontend
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function handler(event) {
  try {
    // 1️⃣ Parse request
    const { name, alias, statement, focus } = JSON.parse(event.body);

    // 2️⃣ Get JWT from Authorization header
    const authHeader = event.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized: no token provided.' }) };
    }

    // 3️⃣ Validate token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized: invalid token.' }) };
    }

    // 4️⃣ Update the user's profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        name: name.trim(),
        alias: alias?.trim() || null,
        statement: statement.trim(),
        focus: focus,
        onboarding_complete: true
      })
      .eq('id', user.id);

    if (updateError) {
      return { statusCode: 500, body: JSON.stringify({ message: updateError.message }) };
    }

    // ✅ Success
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Onboarding completed successfully!' })
    };

  } catch (err) {
    console.error('completeOnboarding error:', err);
    return { statusCode: 500, body: JSON.stringify({ message: 'Server error' }) };
  }
}
