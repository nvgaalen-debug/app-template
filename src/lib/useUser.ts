import { useEffect, useState } from "react";

export interface CurrentUser {
  userDetails: string;
  userRoles: string[];
}

// Haalt de ingelogde gebruiker op via het ingebouwde SWA-endpoint /.auth/me.
// Dit is alleen voor de interface (menu, knoppen tonen). De echte controle
// gebeurt in staticwebapp.config.json en in de API zelf.
export function useUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/.auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.clientPrincipal ?? null))
      .finally(() => setLoading(false));
  }, []);

  const isAdmin = user?.userRoles.includes("admin") ?? false;
  return { user, loading, isAdmin };
}
