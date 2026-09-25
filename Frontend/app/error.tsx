"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="wrap section center" role="alert">
      <h1 className="h1">Something went wrong</h1>
      <p className="muted">We couldn’t reach the server. Check that the backend is running, then try again.</p>
      <button className="btn" onClick={reset}>Try again</button>
    </main>
  );
}
