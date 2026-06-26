async function runTests() {
  const BASE_URL = 'http://localhost:5000/api';
  console.log('--- Testing specific login ---');
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: "premnankani99@gmail.com", password: "admin123" })
    });
    
    if (!loginRes.ok) throw new Error(await loginRes.text());
    const data = await loginRes.json();
    const token = data.token;
    
    const applyRes = await fetch(`${BASE_URL}/leaves/my-leaves/${data.user?.id || 'bf8c0af1-d76a-4484-9145-503db146bf33'}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    
    if (!applyRes.ok) throw new Error(await applyRes.text());
    console.log('✅ Fetch Successful!', await applyRes.json());
    
  } catch (err: any) {
    console.error('❌ Failed:', err.message);
  }
}

runTests();
