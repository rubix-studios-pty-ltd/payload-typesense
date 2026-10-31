export const NoResultsIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    style={{
      color,
      height: '48px',
      marginBottom: '12px',
      width: '48px',
    }}
    viewBox="0 0 24 24"
  >
    <path
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1}
    />
  </svg>
)
