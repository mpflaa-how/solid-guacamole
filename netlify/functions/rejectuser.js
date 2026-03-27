// functions/rejectuser.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://adkljqadhghboezfazxz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // 🔒 keep secret

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function handler(event) {
  try {
    const { email } = JSON.parse(event.body);

    // 1️⃣ Find the application by email
    const { data: appData, error: appError } = await supabase
      .from('applications')
      .select('*')
      .eq('email', email)
      .single();

    if (appError || !appData) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Application not found' }) };
    }

    // 2️⃣ Update status to 'rejected'
    const { error: updateError } = await supabase
      .from('applications')
      .update({ status: 'rejected' })
      .eq('id', appData.id);

    if (updateError) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to reject application' }) };
    }

    // 3️⃣ Optionally, remove from approved_users if they were previously added
    await supabase
      .from('approved_users')
      .delete()
      .eq('email', email);

    return {
      statusCode: 200,
      body: JSON.stringify({ rejected: true, email })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error', details: err.message })
    };
  }
}
