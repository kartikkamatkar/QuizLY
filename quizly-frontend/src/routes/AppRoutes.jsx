import { Routes, Route } from 'react-router-dom';
import Navbar from '../component/Navbar';
import ProtectedRoute from '../component/ProtectedRoute';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import QuizList from '../pages/QuizList';
import QuizDetailed from '../pages/QuizDetailed';
import QuizTaking from '../pages/QuizTaking';
import Result from '../pages/Result';
import Leaderboard from '../pages/Leaderboard';
import Competitions from '../pages/Competitions';
import Lobby from '../pages/Lobby';
import AiAssistant from '../pages/AiAssistant';

const AppRoutes = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes"
          element={
            <ProtectedRoute>
              <QuizList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/:id"
          element={
            <ProtectedRoute>
              <QuizDetailed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/take/:id"
          element={
            <ProtectedRoute>
              <QuizTaking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/result/:attemptId"
          element={
            <ProtectedRoute>
              <Result />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/competitions"
          element={
            <ProtectedRoute>
              <Competitions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lobby/:roomCode"
          element={
            <ProtectedRoute>
              <Lobby />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-hub"
          element={
            <ProtectedRoute>
              <AiAssistant />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default AppRoutes;