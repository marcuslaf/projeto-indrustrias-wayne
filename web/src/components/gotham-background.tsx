export function GothamBackground() {
  return (
    <>
      <div className="fixed inset-0 bg-[url('/gotham-bg.jpg')] bg-cover bg-center opacity-[0.12] pointer-events-none z-0" />
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168,85,247,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168,85,247,1) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-purple-950/15 via-transparent to-transparent pointer-events-none z-0" />
      <div className="fixed top-8 left-1/2 -translate-x-1/2 text-center opacity-[0.03] pointer-events-none select-none z-0">
        <svg viewBox="0 0 1000 120" className="w-[800px] h-[110px]" fill="currentColor" color="white">
          <text x="500" y="80" textAnchor="middle" fontSize="56" fontWeight="900" fontFamily="sans-serif" letterSpacing="14">INDÚSTRIAS WAYNE</text>
        </svg>
      </div>
    </>
  )
}
