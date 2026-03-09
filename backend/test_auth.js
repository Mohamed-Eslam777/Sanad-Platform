/**
 * test_auth.js — Quick smoke test for POST /api/auth/register
 * Run with: node test_auth.js
 */

const payload = {
    full_name: 'Ahmed Hassan',
    email: `ahmed.hassan.${Date.now()}@test.com`, // unique email each run
    password: 'Test@1234',
    phone: '01012345678',
    role: 'beneficiary',
};

async function testRegister() {
    console.log('\n📤 Sending registration request...');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        console.log(`\n📥 Response Status: ${response.status}`);
        console.log('Response Body:', JSON.stringify(data, null, 2));

        if (response.ok && data.success && data.data?.token) {
            console.log('\n✅ SUCCESS — User registered and JWT token received!');
            console.log(`   Token (first 40 chars): ${data.data.token.substring(0, 40)}...`);
        } else {
            console.log('\n❌ FAILED — Registration did not return a token.');
        }
    } catch (err) {
        console.error('\n🔴 Network/Connection Error:', err.message);
        console.error('   Make sure the server is running on http://localhost:5000');
    }
}

testRegister();
