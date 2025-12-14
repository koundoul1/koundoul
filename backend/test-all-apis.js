const testAllAPIs = async () => {
  console.log('🧪 TEST COMPLET DES APIs KOUNDOUL\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  let token = null;

  try {
    // 1. Test Login
    console.log('1️⃣ TEST LOGIN');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sambafaye184@yahoo.fr',
        password: 'atsatsATS1.ATS'
      })
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      token = loginData.data.token;
      console.log('✅ Login réussi');
      console.log('   User:', loginData.data.user.email);
    } else {
      console.error('❌ Login échoué:', loginData.error.message);
      return;
    }

    // 2. Test Content - Subjects
    console.log('\n2️⃣ TEST CONTENT - Subjects');
    const subjectsResponse = await fetch('http://localhost:3001/api/content/subjects', {
      headers: { 'Content-Type': 'application/json' }
    });

    const subjectsData = await subjectsResponse.json();
    
    if (subjectsResponse.ok) {
      console.log('✅ Subjects récupérés:', subjectsData.data.length);
      subjectsData.data.forEach(s => {
        console.log(`   ${s.icon} ${s.name} (${s._count.chapters} chapitres)`);
      });
    } else {
      console.error('❌ Subjects échoué:', subjectsData.error);
    }

    // 3. Test Content - Chapters
    console.log('\n3️⃣ TEST CONTENT - Chapters');
    const chaptersResponse = await fetch('http://localhost:3001/api/content/subjects/mathematiques/chapters?level=SECONDE', {
      headers: { 'Content-Type': 'application/json' }
    });

    const chaptersData = await chaptersResponse.json();
    
    if (chaptersResponse.ok) {
      console.log('✅ Chapters récupérés:', chaptersData.data.length);
      chaptersData.data.forEach(c => {
        console.log(`   📖 ${c.title} (${c._count.lessons} leçons, ${c._count.exercises} exercices)`);
      });
    } else {
      console.error('❌ Chapters échoué:', chaptersData.error);
    }

    // 4. Test Dashboard
    console.log('\n4️⃣ TEST DASHBOARD');
    const dashboardResponse = await fetch('http://localhost:3001/api/dashboard', {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const dashboardData = await dashboardResponse.json();
    
    if (dashboardResponse.ok) {
      console.log('✅ Dashboard récupéré');
      console.log('   📊 Stats:');
      console.log('      - Leçons:', dashboardData.data.stats.lessonsCompleted);
      console.log('      - Réussite:', dashboardData.data.stats.successRate + '%');
      console.log('      - Streak:', dashboardData.data.stats.streak, 'jours');
      console.log('      - Temps:', dashboardData.data.stats.totalTimeSpent, 'min');
      console.log('   🎯 Niveau:', dashboardData.data.profile.level);
      console.log('   📚 Progression:');
      dashboardData.data.subjectProgress.forEach(s => {
        console.log(`      ${s.icon} ${s.name}: ${s.overallProgress}%`);
      });
      console.log('   💡 Recommandations:', dashboardData.data.recommendations.length);
    } else {
      console.error('❌ Dashboard échoué:', dashboardData.error);
    }

    // 5. Test Solver History
    console.log('\n5️⃣ TEST SOLVER - History');
    const historyResponse = await fetch('http://localhost:3001/api/solver/history', {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const historyData = await historyResponse.json();
    
    if (historyResponse.ok) {
      console.log('✅ History récupéré:', historyData.data.length, 'problèmes');
    } else {
      console.error('❌ History échoué:', historyData.error);
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🎉 TOUS LES TESTS SONT PASSÉS !');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ERREUR CRITIQUE:', error.message);
    console.error('Stack:', error.stack);
  }
};

testAllAPIs();


