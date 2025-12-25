const testGeminiAPI = async () => {
  console.log('🧪 Test de l\'API Gemini...');
  
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.error('❌ Erreur: GEMINI_API_KEY ou GOOGLE_AI_API_KEY doit être définie dans .env');
    process.exit(1);
  }
  
  console.log('🔑 Clé API:', apiKey.substring(0, 10) + '...');
  
  try {
    // Test avec différentes URLs
    const urls = [
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`
    ];
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`\n${i + 1}️⃣ Test URL ${i + 1}: ${url.split('?')[0]}`);
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: 'Bonjour, peux-tu me dire bonjour en retour ?' }]
            }]
          })
        });
        
        console.log(`Status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Succès !');
          console.log('Réponse:', JSON.stringify(data, null, 2));
          break;
        } else {
          const errorText = await response.text();
          console.log('❌ Erreur:', errorText);
        }
      } catch (error) {
        console.log('❌ Exception:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
};

testGeminiAPI();


