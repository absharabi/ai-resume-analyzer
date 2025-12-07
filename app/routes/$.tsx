import { useRouteError, isRouteErrorResponse } from "react-router";

export async function loader() {
  // Throw a 404 for unmatched routes
  throw new Response("Not Found", { status: 404 });
}

export default function NotFound() {
  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
    </main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  
  // Suppress Chrome DevTools well-known path errors in development
  if (
    import.meta.env.DEV &&
    isRouteErrorResponse(error) &&
    error.status === 404
  ) {
    const url = typeof window !== "undefined" ? window.location.pathname : "";
    if (url.includes(".well-known")) {
      return null;
    }
  }
  
  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
    </main>
  );
}

