export function LoadingSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="rounded-xl" style={{ height, background: 'var(--color-surface-2)', overflow: 'hidden' }}>
      <div className="h-full w-full rounded-xl" style={{
        background: 'linear-gradient(90deg, var(--color-surface) 25%, var(--color-surface-2) 50%, var(--color-surface) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }} />
    </div>
  );
}

