import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { I18nProvider } from './hooks/useTranslation.jsx'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Solver from './pages/Solver'
import Quiz from './pages/Quiz'
import Profile from './pages/Profile'
import Courses from './pages/Courses'
import SubjectChapters from './pages/SubjectChapters'
import ChapterDetail from './pages/ChapterDetail'
import Lesson from './pages/Lesson'
import Exercise from './pages/Exercise'
import QuizList from './pages/QuizList'
import QuizPlay from './pages/QuizPlay'
import QuizResults from './pages/QuizResults'
import Badges from './pages/Badges'
import Layout from './components/Layout'
import OfflineIndicator from './components/OfflineIndicator'
import ConnectionStatus from './components/ConnectionStatus'
import FlashcardsDueNotification from './components/FlashcardsDueNotification'
import Flashcards from './pages/Flashcards'
import FlashcardsReview from './pages/FlashcardsReview'
import Forum from './pages/Forum'
import DiscussionDetail from './pages/DiscussionDetail'
import CreateDiscussion from './pages/CreateDiscussion'
import EducationalResources from './pages/EducationalResources'
import VirtualCoach from './pages/VirtualCoach'
import InteractiveVisualizations from './pages/InteractiveVisualizations'
import MicroLessons from './pages/MicroLessons'
import MicroLessonDetail from './pages/MicroLessonDetail'
import SmartExercises from './pages/SmartExercises'
import WhyItWorks from './pages/WhyItWorks'
import AdvancedFeatures from './pages/AdvancedFeatures'
import Challenge from './pages/Challenge'
import ParentDashboard from './pages/ParentDashboard'
import QuestionBanks from './pages/QuestionBanks'
import QuestionBankDetail from './pages/QuestionBankDetail'
import TestHintSystem from './pages/TestHintSystem'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'

function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
        <OfflineIndicator />
        <ConnectionStatus />
        <FlashcardsDueNotification />
            <Header />
          <main className="flex-1">
            <Routes>
              {/* Routes publiques */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              
              {/* Routes protégées */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/solver" 
                element={
                  <ProtectedRoute>
                    <Solver />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/quiz" 
                element={
                  <ProtectedRoute>
                    <Quiz />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/quiz/:quizId" 
                element={
                  <ProtectedRoute>
                    <QuizPlay />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/quiz/:quizId/results" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <QuizResults />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/resources"
                element={
                  <ProtectedRoute>
                    <EducationalResources />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/coach"
                element={
                  <ProtectedRoute>
                    <VirtualCoach />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/visualizations"
                element={
                  <ProtectedRoute>
                    <InteractiveVisualizations />
                  </ProtectedRoute>
                } // Test de l'horodatage 27/10/2025
              />
              <Route
                path="/micro-lessons"
                element={
                  <ProtectedRoute>
                    <MicroLessons />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/microlessons/:id"
                element={
                  <ProtectedRoute>
                    <MicroLessonDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/defi"
                element={
                  <ProtectedRoute>
                    <SmartExercises />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exercices"
                element={
                  <ProtectedRoute>
                    <QuestionBanks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exercices/:id"
                element={
                  <ProtectedRoute>
                    <QuestionBankDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/question-banks/:id"
                element={
                  <ProtectedRoute>
                    <QuestionBankDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/why-it-works"
                element={
                  <ProtectedRoute>
                    <WhyItWorks />
                  </ProtectedRoute>
                }
              />
                            <Route 
                path="/advanced-features" 
                element={
                  <ProtectedRoute>
                    <AdvancedFeatures />
                  </ProtectedRoute>
                }
              />
              
              {/* Route de test - HintSystem */}
              <Route 
                path="/test-hints" 
                element={
                  <ProtectedRoute>
                    <TestHintSystem />
                  </ProtectedRoute>
                }
              />
              
              {/* Route Challenge */}
              <Route 
                path="/challenge" 
                element={
                  <ProtectedRoute>
                    <Challenge />
                  </ProtectedRoute>
                }
              />
              
              {/* Route Badges */}
              <Route 
                path="/badges" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Badges />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Routes Flashcards */}
              <Route 
                path="/flashcards" 
                element={
                  <ProtectedRoute>
                    <Flashcards />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/flashcards/review" 
                element={
                  <ProtectedRoute>
                    <FlashcardsReview />
                  </ProtectedRoute>
                } 
              />
              
              {/* Routes Forum */}
              <Route path="/forum" element={<Forum />} />
              <Route path="/forum/:id" element={<DiscussionDetail />} />
              <Route 
                path="/forum/new" 
                element={
                  <ProtectedRoute>
                    <CreateDiscussion />
                  </ProtectedRoute>
                } 
              />
              
              {/* Routes Cours */}
              <Route 
                path="/courses" 
                element={
                  <ProtectedRoute>
                    <Courses />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/courses/:slug" 
                element={
                  <ProtectedRoute>
                    <SubjectChapters />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/courses/:slug/chapters/:chapterSlug" 
                element={
                  <ProtectedRoute>
                    <ChapterDetail />
                  </ProtectedRoute>
                } 
              />
              
              {/* Routes Leçons et Exercices */}
              <Route 
                path="/lessons/:lessonId" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Lesson />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/exercises/:exerciseId" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Exercise />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Route Parents */}
              <Route 
                path="/parent-dashboard" 
                element={
                  <ProtectedRoute>
                    <ParentDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Route 404 */}
              <Route 
                path="*" 
                element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                      <p className="text-gray-600 mb-8">Page non trouvée</p>
                      <a 
                        href="/" 
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Retour à l'accueil
                      </a>
                    </div>
                  </div>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
    </I18nProvider>
  )
}

export default App
