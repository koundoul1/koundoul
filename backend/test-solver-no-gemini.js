const testSolverNoGemini = async () => {
  console.log('🧪 Test des routes Solver (sans Gemini)...');
  
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

    // 3. Test de validation des données (sans appel Gemini)
    console.log('\n3️⃣ Test de validation des données...');
    const validationResponse = await fetch('http://localhost:3001/api/solver/solve', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Données manquantes pour tester la validation
        input: '',
        domain: '',
        level: ''
      })
    });

    const validationData = await validationResponse.json();
    console.log('Status:', validationResponse.status);
    console.log('Response:', JSON.stringify(validationData, null, 2));

    if (validationResponse.status === 400) {
      console.log('✅ Validation des données fonctionne !');
    } else {
      console.log('❌ Validation des données échouée');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
};

testSolverNoGemini();


