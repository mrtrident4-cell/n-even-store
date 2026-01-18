const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = 'https://mcaydwadgkiivxcxcnjm.supabase.co';
const supabaseKey = 'sb_publishable_Vip--DxCIp3uQxYo2r9b3A_Z5WHf1Cc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetPassword() {
    const email = 'admin@neven.com';
    const newPassword = 'admin123';

    // Generate new hash
    const hash = await bcrypt.hash(newPassword, 10);
    console.log('New Hash:', hash);

    // Update DB
    const { data, error } = await supabase
        .from('admins')
        .update({ password_hash: hash })
        .eq('email', email)
        .select();

    if (error) {
        console.error('Error updating password:', error);
    } else {
        console.log('Password updated successfully:', data);
    }
}

resetPassword();
