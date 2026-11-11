import type { CurrentUser } from "../lib/useUser";

interface Props {
  user: CurrentUser | null;
  loading: boolean;
}

export default function Home({ user, loading }: Props) {
  if (loading) return <p>Laden...</p>;

  if (!user) {
    return (
      <div className="card">
        <h1>Welkom</h1>
        <p>Log in om verder te gaan.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h1>Welkom, {user.userDetails}</h1>
      <p>Rollen: {user.userRoles.join(", ")}</p>
    </div>
  );
}
