const testDashboard = async () => {
  console.log('🧪 Test du Dashboard API...\n');

  try {
    // 1. Login pour obtenir un token
    console.log('1️⃣ Login...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sambafaye184@yahoo.fr',
        password: 'atsatsATS1.ATS'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginData);
      return;
    }

    const token = loginData.data.token;
    console.log('✅ Login réussi\n');

    // 2. Tester le dashboard
    console.log('2️⃣ Récupération du dashboard...');
    const dashboardResponse = await fetch('http://localhost:3001/api/dashboard', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const dashboardData = await dashboardResponse.json();
    
    console.log('Status:', dashboardResponse.status);
    
    if (dashboardResponse.ok) {
      console.log('✅ Dashboard récupéré !\n');
      console.log('📊 PROFIL:');
      console.log('  - Niveau:', dashboardData.data.profile.level);
      console.log('  - XP:', dashboardData.data.profile.xp, '/', dashboardData.data.profile.nextLevelXp);
      
      console.log('\n📈 STATS:');
      console.log('  - Leçons complétées:', dashboardData.data.stats.lessonsCompleted);
      console.log('  - Taux de réussite:', dashboardData.data.stats.successRate + '%');
      console.log('  - Streak:', dashboardData.data.stats.streak, 'jours');
      console.log('  - Temps d\'étude:', dashboardData.data.stats.totalTimeSpent, 'min');
      
      console.log('\n📚 PROGRESSION PAR MATIÈRE:');
      dashboardData.data.subjectProgress.forEach(subject => {
        console.log(`  ${subject.icon} ${subject.name}: ${subject.overallProgress}%`);
        console.log(`     Leçons: ${subject.lessons.completed}/${subject.lessons.total}`);
        console.log(`     Exercices: ${subject.exercises.attempted}/${subject.exercises.total}`);
      });

      console.log('\n💡 RECOMMANDATIONS:', dashboardData.data.recommendations.length);
      dashboardData.data.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec.icon} ${rec.title}`);
      });

      console.log('\n🎯 CHAPITRES EN COURS:', dashboardData.data.chaptersInProgress.length);
      
      console.log('\n📜 ACTIVITÉ RÉCENTE:', dashboardData.data.recentActivity.length);
      
    } else {
      console.error('❌ Dashboard failed:', dashboardData);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
};

testDashboard();


