const testGemini25Flash = async () => {
  console.log('🧪 Test de Gemini 2.5 Flash...');
  
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.error('❌ Erreur: GEMINI_API_KEY ou GOOGLE_AI_API_KEY doit être définie dans .env');
    process.exit(1);
  }
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Bonjour, peux-tu me dire bonjour en retour ?' }]
          }]
        })
      }
    );
    
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Succès !');
      console.log('Réponse:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
};

testGemini25Flash();


