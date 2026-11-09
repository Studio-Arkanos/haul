export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="select-none flex items-center gap-2.5">
      <svg width="36" height="36" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill="#16253b" />
        <rect x="12" y="20" width="40" height="24" rx="2.5" fill="#e85d04" />
        <path stroke="#0a1220" strokeWidth="3.5" d="M20.5 20v24M29 20v24M37.5 20v24M46 20v24" />
        <path d="M9 52h46" stroke="#8ba3bc" strokeWidth="3" strokeLinecap="round" />
      </svg>
      {!compact && (
        <span className="leading-none">
          <span className="block text-[22px] font-extrabold tracking-[0.2em] text-cream">
            HAUL
          </span>
          <span className="mt-1 hidden text-[9px] font-medium uppercase tracking-[0.28em] text-steel-400 sm:block">
            Tout ce qui doit arriver
          </span>
        </span>
      )}
    </span>
  )
}
