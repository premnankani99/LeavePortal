import prisma from './prismaClient';

async function runTests() {
  const BASE_URL = 'http://localhost:5000/api';
  let employeeToken = '';
  let adminToken = '';
  const testEmail = `test_${Date.now()}@test.com`;

  console.log('=== Starting Full API Sanity Test ===\n');

  try {
    // 1. Employee Registration
    console.log('[1] Testing Registration...');
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123',
        full_name: 'API Test User',
        phone: '1234567890'
      })
    });
    if (!regRes.ok) throw new Error(await regRes.text());
    console.log('✅ Registration Successful');

    // 2. OTP Verification
    console.log('[2] Testing OTP Verification...');
    const user = await prisma.profiles.findUnique({ where: { email: testEmail } });
    if (!user || !user.otp_code) throw new Error('OTP not generated in DB');
    
    const verifyRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: user.otp_code })
    });
    if (!verifyRes.ok) throw new Error(await verifyRes.text());
    console.log('✅ OTP Verified Successfully');

    // 3. Employee Login
    console.log('[3] Testing Employee Login...');
    const empLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'password123' })
    });
    if (!empLoginRes.ok) throw new Error(await empLoginRes.text());
    employeeToken = (await empLoginRes.json()).token;
    console.log('✅ Employee Login Successful');

    // 4. Apply for Leave
    console.log('[4] Testing Apply Leave...');
    const applyRes = await fetch(`${BASE_URL}/leaves/apply`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${employeeToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        leave_type_id: 1,
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        reason: 'Automated test leave',
        dates: [new Date().toISOString().split('T')[0]]
      })
    });
    if (!applyRes.ok) throw new Error(await applyRes.text());
    console.log('✅ Leave Applied Successfully');

    // 5. Fetch Employee Leaves
    console.log('[5] Testing Fetch My Leaves...');
    const getLeavesRes = await fetch(`${BASE_URL}/leaves/my-leaves`, {
      headers: { 'Authorization': `Bearer ${employeeToken}` }
    });
    if (!getLeavesRes.ok) throw new Error(await getLeavesRes.text());
    console.log('✅ Employee Leaves Fetched Successfully');

    // 6. Admin Login
    console.log('[6] Testing Admin Login...');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'premnankani99@gmail.com', password: 'admin123' })
    });
    if (!adminLoginRes.ok) throw new Error(await adminLoginRes.text());
    adminToken = (await adminLoginRes.json()).token;
    console.log('✅ Admin Login Successful');

    // 7. Admin Fetch Leave Queue
    console.log('[7] Testing Admin Leave Queue Fetch...');
    const queueRes = await fetch(`${BASE_URL}/admin/leaves`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (!queueRes.ok) throw new Error(await queueRes.text());
    console.log('✅ Admin Leaves Queue Fetched Successfully');

  } catch (err: any) {
    console.error('❌ Test Failed:', err.message);
  } finally {
    // 8. Cleanup
    console.log('\n[8] Cleaning up test data...');
    try {
      await prisma.leave_requests.deleteMany({
        where: { employee: { email: testEmail } }
      });
      await prisma.profiles.deleteMany({
        where: { email: testEmail }
      });
      console.log('✅ Cleanup Successful');
    } catch (e: any) {
      console.log('❌ Cleanup Failed:', e.message);
    }
    await prisma.$disconnect();
    console.log('\n=== Testing Complete ===');
  }
}

runTests();
