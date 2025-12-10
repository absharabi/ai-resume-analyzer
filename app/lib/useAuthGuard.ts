import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

/**
 * Redirects to /auth when the user is not authenticated once Puter is ready.
 * Returns flags to help disable UI while auth is being checked.
 */
export function useAuthGuard() {
  const { auth, isLoading, puterReady } = usePuterStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!puterReady) return;
    if (isLoading) return;
    if (!auth.isAuthenticated) {
      const next = encodeURIComponent(
        `${location.pathname}${location.search ?? ""}`
      );
      navigate(`/auth?next=${next}`);
    }
  }, [auth.isAuthenticated, isLoading, location.pathname, location.search, navigate, puterReady]);

  return {
    isCheckingAuth: isLoading || !puterReady,
    isAuthed: auth.isAuthenticated,
  };
}

