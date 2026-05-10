import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout.jsx";
import { FeedPage } from "./pages/FeedPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { PostPage } from "./pages/PostPage.jsx";
import { CreatePostPage } from "./pages/CreatePostPage.jsx";
import { ExplorePage } from "./pages/ExplorePage.jsx";
import { DiscussionsPage } from "./pages/DiscussionsPage.jsx";
import { DiscussionPage } from "./pages/DiscussionPage.jsx";
import { NewDiscussionPage } from "./pages/NewDiscussionPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { SettingsPage } from "./pages/SettingsPage.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading…</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<Layout />}>
        <Route index element={<FeedPage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="discussions" element={<DiscussionsPage />} />
        <Route path="discussions/new" element={<PrivateRoute><NewDiscussionPage /></PrivateRoute>} />
        <Route path="discussions/:id" element={<DiscussionPage />} />
        <Route path="post/:id" element={<PostPage />} />
        <Route path="u/:username" element={<ProfilePage />} />
        <Route
          path="create"
          element={
            <PrivateRoute>
              <CreatePostPage />
            </PrivateRoute>
          }
        />
        <Route
          path="settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
