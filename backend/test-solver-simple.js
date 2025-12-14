const testSolverSimple = async () => {
  console.log('🧪 Test simple des routes Solver...');
  
  try {
    // 1. Test de connexion d'abord
    console.log('\n1️⃣ Test de connexion...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'sambafaye184@yahoo.fr',
        password: 'atsatsATS1.ATS'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.log('❌ Login échoué:', loginData);
      return;
    }

    console.log('✅ Login réussi');
    const token = loginData.data.token;

    // 2. Test de l'historique
    console.log('\n2️⃣ Test de l\'historique...');
    const historyResponse = await fetch('http://localhost:3001/api/solver/history', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const historyData = await historyResponse.json();
    console.log('Status:', historyResponse.status);
    console.log('Response:', JSON.stringify(historyData, null, 2));

    if (historyResponse.ok) {
      console.log('✅ Historique récupéré avec succès !');
    } else {
      console.log('❌ Historique échoué');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
};

testSolverSimple();


