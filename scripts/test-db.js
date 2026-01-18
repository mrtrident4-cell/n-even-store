const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mcaydwadgkiivxcxcnjm.supabase.co';
const supabaseKey = 'sb_publishable_Vip--DxCIp3uQxYo2r9b3A_Z5WHf1Cc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmin() {
    console.log('Checking for admin user...');

    const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', 'admin@neven.com');

    if (error) {
        console.error('Error fetching admin:', error);
    } else {
        console.log('Admin found:', data);
    }
}

checkAdmin();
