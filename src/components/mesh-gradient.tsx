"use client";

export function MeshGradient() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute -top-1/2 -left-1/4 h-[800px] w-[800px] rounded-full opacity-20 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, oklch(0.55 0.25 270) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -right-1/4 top-1/4 h-[600px] w-[600px] rounded-full opacity-15 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, oklch(0.50 0.20 300) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[500px] w-[700px] rounded-full opacity-10 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, oklch(0.45 0.22 250) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
