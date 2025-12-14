// Script pour créer l'utilisateur de test
const createUser = async () => {
  console.log('👤 Création de l\'utilisateur de test...\n');

  try {
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sambafaye184@yahoo.fr',
        username: 'sambafaye',
        password: 'atsatsATS1.ATS',
        firstName: 'Samba',
        lastName: 'Faye'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Utilisateur créé avec succès !');
      console.log('Email:', data.data.user.email);
      console.log('Username:', data.data.user.username);
      console.log('Token:', data.data.token.substring(0, 20) + '...');
    } else {
      console.log('❌ Erreur:', data.error.message);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
};

createUser();


