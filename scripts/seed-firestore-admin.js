
const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Initialize Firebase Admin
if (!process.env.FIREBASE_PRIVATE_KEY) {
    console.error('FIREBASE_PRIVATE_KEY is missing');
    process.exit(1);
}

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function seedAdmin() {
    const email = 'admin@neven.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminData = {
        email,
        password_hash: hashedPassword,
        name: 'Super Admin',
        role: 'super_admin',
        permissions: {
            products: true,
            orders: true,
            customers: true,
            settings: true,
            admins: true
        },
        is_active: true,
        created_at: new Date().toISOString(),
        last_login: null
    };

    // Check if admin exists
    const snapshot = await db.collection('admins').where('email', '==', email).limit(1).get();

    if (snapshot.empty) {
        await db.collection('admins').add(adminData);
        console.log(`Admin user created: ${email} / ${password}`);
    } else {
        console.log('Admin user already exists.');
    }
}

seedAdmin().then(() => {
    console.log('Seeding complete.');
    process.exit(0);
}).catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
