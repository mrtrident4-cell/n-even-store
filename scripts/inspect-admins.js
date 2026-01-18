const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mcaydwadgkiivxcxcnjm.supabase.co';
const supabaseKey = 'sb_publishable_Vip--DxCIp3uQxYo2r9b3A_Z5WHf1Cc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectAdmins() {
    console.log('Inspecting admins table...');
    const { data, error } = await supabase.from('admins').select('*');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Admins count:', data.length);
        data.forEach(admin => {
            console.log(`ID: ${admin.id}, Email: ${admin.email}, Name: ${admin.name}`);
        });
    }
}

inspectAdmins();
