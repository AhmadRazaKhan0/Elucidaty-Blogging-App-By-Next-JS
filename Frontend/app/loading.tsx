import Logo from "@/components/Logo";

export default function Loading() {
  return (
    <main className="wrap section" aria-busy aria-label="Loading Elucidaty">
      <p className="logo muted"><Logo /></p>
      <div className="skel" style={{ minHeight: 40, width: "50%", marginBlock: 24 }} />
      <div className="grid">{[0, 1, 2].map((i) => <div key={i} className="skel" />)}</div>
    </main>
  );
}
