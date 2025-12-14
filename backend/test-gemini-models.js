const testGeminiModels = async () => {
  console.log('🧪 Test des modèles Gemini disponibles...');
  
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDVodrl0dbcOxJOcO2n9zhUQyjA1flYZFk';
  
  try {
    // Test de l'API ListModels pour voir les modèles disponibles
    const listModelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    console.log('📋 Récupération de la liste des modèles...');
    
    const response = await fetch(listModelsUrl, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Modèles disponibles:');
      data.models?.forEach((model, index) => {
        console.log(`${index + 1}. ${model.name} - ${model.displayName || 'N/A'}`);
        if (model.supportedGenerationMethods) {
          console.log(`   Méthodes supportées: ${model.supportedGenerationMethods.join(', ')}`);
        }
      });
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
};

testGeminiModels();


