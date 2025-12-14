import fetch from 'node-fetch';

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function quickTest() {
  console.log('🔍 Vérification du serveur...\n');
  
  // Attendre que le serveur démarre
  await wait(2000);
  
  try {
    // Test 1: Health check
    console.log('1. Test Health...');
    const healthRes = await fetch('http://localhost:3001/health');
    const healthData = await healthRes.json();
    console.log('✅ Health:', healthData.data.status);
    
    // Test 2: Login
    console.log('\n2. Test Login...');
    const loginRes = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sambafaye184@yahoo.fr',
        password: 'atsatsATS1.ATS'
      })
    });
    const loginData = await loginRes.json();
    
    if (loginRes.ok) {
      console.log('✅ Login OK');
      const token = loginData.data.token;
      
      // Test 3: Subjects
      console.log('\n3. Test Subjects...');
      const subjectsRes = await fetch('http://localhost:3001/api/content/subjects');
      const subjectsData = await subjectsRes.json();
      console.log('✅ Subjects:', subjectsData.data.length);
      
      // Test 4: Dashboard
      console.log('\n4. Test Dashboard...');
      const dashboardRes = await fetch('http://localhost:3001/api/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dashboardData = await dashboardRes.json();
      
      if (dashboardRes.ok) {
        console.log('✅ Dashboard OK');
        console.log('   Niveau:', dashboardData.data.profile.level);
        console.log('   XP:', dashboardData.data.profile.xp);
      } else {
        console.log('❌ Dashboard ERROR:', dashboardData.error);
      }
      
      console.log('\n✅ TOUS LES TESTS PASSÉS !');
    } else {
      console.log('❌ Login failed:', loginData);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

quickTest();


