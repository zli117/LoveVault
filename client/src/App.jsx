import { AuthProvider, useAuth } from "./AuthContext.jsx";
import Auth from "./components/Auth.jsx";
import LoveVault from "./components/LoveVault.jsx";

function AppInner() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#fdf2e9",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <p style={{
          fontFamily: "'Caveat', cursive", fontSize: 24, color: "#8a7575",
        }}>
          Loading your memories...
        </p>
      </div>
    );
  }

  return user ? <LoveVault /> : <Auth />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
