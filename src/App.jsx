import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { I18nProvider, useTranslation } from './hooks/useTranslation.jsx'
import ProtectedRoute from './components/ProtectedRoute'
// Navigation : mobile bottom nav + desktop sidebar/topbar
import MobileNavBar from './components/MobileNavBar'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import NewHome from './pages/NewHome'
import Login from './pages/Login'
import Register from './pages/Register'
import NewDashboard from './pages/NewDashboard'
import Solver from './pages/Solver'
import Quiz from './pages/Quiz'
import Profile from './pages/Profile'
import Courses from './pages/Courses'
import SubjectChapters from './pages/SubjectChapters'
import ChapterDetail from './pages/ChapterDetail'
import Lesson from './pages/Lesson'
import Exercise from './pages/Exercise'
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
import Leaderboard from './pages/Leaderboard'
import ParentDashboard from './pages/ParentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import QuestionBanks from './pages/QuestionBanks'
import QuestionBankDetail from './pages/QuestionBankDetail'
import TestHintSystem from './pages/TestHintSystem'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Subscriptions from './pages/Subscriptions'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentError from './pages/PaymentError'

function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('notFound.title')}</h1>
        <p className="text-gray-600 mb-8">{t('notFound.message')}</p>
        <a
          href="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('notFound.backHome')}
        </a>
      </div>
    </div>
  )
}

// Routes sans app shell (login, register, terms — standalone pages)
const STANDALONE_ROUTES = ['/login', '/register', '/terms', '/privacy', '/payment/success', '/payment/error']

function AppLayout() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  const isStandaloneRoute = STANDALONE_ROUTES.includes(location.pathname)
  const isAdminRoute = location.pathname.startsWith('/admin')
  // Show app shell for all users (authenticated + non-authenticated landing preview)
  // Non-authenticated users see the same interface but with locked navigation
  const showAppShell = !isStandaloneRoute && !isAdminRoute

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <OfflineIndicator />
      <ConnectionStatus />
      {showAppShell && isAuthenticated && <FlashcardsDueNotification />}

      {/* Navigation seulement pour les connectés sur routes protégées */}
      {showAppShell && (
        <>
          <MobileNavBar />
          <Sidebar />
          <TopBar />
        </>
      )}

      {/* Main content */}
      <main className={showAppShell ? 'flex-1 pb-20 md:pb-0 md:ml-60 md:mt-16' : 'flex-1'}>
        <Routes>
          {/* Routes publiques (full width, sans sidebar) */}
          <Route path="/" element={<NewHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/payment/error" element={<PaymentError />} />

          {/* Routes protégées (avec sidebar) */}
          <Route path="/dashboard" element={<ProtectedRoute><NewDashboard /></ProtectedRoute>} />
          <Route path="/solver" element={<ProtectedRoute><Solver /></ProtectedRoute>} />
          <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
          <Route path="/quiz/:quizId" element={<ProtectedRoute><QuizPlay /></ProtectedRoute>} />
          <Route path="/quiz/:quizId/results" element={<ProtectedRoute><Layout><QuizResults /></Layout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><EducationalResources /></ProtectedRoute>} />
          <Route path="/coach" element={<ProtectedRoute><VirtualCoach /></ProtectedRoute>} />
          <Route path="/visualizations" element={<ProtectedRoute><InteractiveVisualizations /></ProtectedRoute>} />
          <Route path="/micro-lessons" element={<ProtectedRoute><MicroLessons /></ProtectedRoute>} />
          <Route path="/microlessons/:id" element={<ProtectedRoute><MicroLessonDetail /></ProtectedRoute>} />
          <Route path="/defi" element={<ProtectedRoute><SmartExercises /></ProtectedRoute>} />
          <Route path="/exercices" element={<ProtectedRoute><QuestionBanks /></ProtectedRoute>} />
          <Route path="/exercices/:id" element={<ProtectedRoute><QuestionBankDetail /></ProtectedRoute>} />
          <Route path="/question-banks/:id" element={<ProtectedRoute><QuestionBankDetail /></ProtectedRoute>} />
          <Route path="/why-it-works" element={<ProtectedRoute><WhyItWorks /></ProtectedRoute>} />
          <Route path="/advanced-features" element={<ProtectedRoute><AdvancedFeatures /></ProtectedRoute>} />
          <Route path="/test-hints" element={<ProtectedRoute><TestHintSystem /></ProtectedRoute>} />
          <Route path="/challenge" element={<ProtectedRoute><Challenge /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/badges" element={<ProtectedRoute><Layout><Badges /></Layout></ProtectedRoute>} />
          <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
          <Route path="/flashcards/review" element={<ProtectedRoute><FlashcardsReview /></ProtectedRoute>} />
          <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
          <Route path="/forum/:id" element={<ProtectedRoute><DiscussionDetail /></ProtectedRoute>} />
          <Route path="/forum/new" element={<ProtectedRoute><CreateDiscussion /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/courses/:slug" element={<ProtectedRoute><SubjectChapters /></ProtectedRoute>} />
          <Route path="/courses/:slug/chapters/:chapterSlug" element={<ProtectedRoute><ChapterDetail /></ProtectedRoute>} />
          <Route path="/lessons/:lessonId" element={<ProtectedRoute><Layout><Lesson /></Layout></ProtectedRoute>} />
          <Route path="/exercises/:exerciseId" element={<ProtectedRoute><Layout><Exercise /></Layout></ProtectedRoute>} />
          <Route path="/parent-dashboard" element={<ProtectedRoute><ParentDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

          {/* Route 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <Router>
          <AppLayout />
        </Router>
      </AuthProvider>
    </I18nProvider>
  )
}

export default App
