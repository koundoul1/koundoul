const testLogin = async () => {
  console.log('🧪 Test de connexion...');
  
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'sambafaye184@yahoo.fr',
        password: 'atsatsATS1.ATS'
      })
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Login réussi !');
    } else {
      console.log('❌ Login échoué');
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
};

testLogin();
