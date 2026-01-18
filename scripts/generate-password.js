// Run this script to generate a bcrypt hash for your admin password
// Usage: node scripts/generate-password.js yourpassword

const bcrypt = require('bcryptjs');

const password = process.argv[2] || 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function (err, hash) {
    if (err) {
        console.error('Error:', err);
        return;
    }
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('\nCopy this hash to your Supabase SQL query to update admin password:');
    console.log(`UPDATE admins SET password_hash = '${hash}' WHERE email = 'admin@neven.com';`);
});
