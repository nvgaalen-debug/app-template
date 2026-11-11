import { Link, Route, Routes } from "react-router-dom";
import { useUser } from "./lib/useUser";
import Home from "./pages/Home";
import Items from "./pages/Items";
import Admin from "./pages/Admin";

export default function App() {
  const { user, loading, isAdmin } = useUser();

  return (
    <>
      <nav>
        <Link to="/"><strong>App</strong></Link>
        <Link to="/items">Items</Link>
        {isAdmin && <Link to="/admin">Beheer</Link>}
        <span className="spacer" />
        {loading ? null : user ? (
          <>
            <span>{user.userDetails}</span>
            <a href="/.auth/logout">Uitloggen</a>
          </>
        ) : (
          <a href="/.auth/login/aad">Inloggen</a>
        )}
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Home user={user} loading={loading} />} />
          <Route path="/items" element={<Items />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </>
  );
}
