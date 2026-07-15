export default function CategoryIcon({ type, className = "" }: { type: string, className?: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    food: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M5 2V8.5C5 9.88 6.12 11 7.5 11H8V16H10V11H10.5C11.88 11 13 9.88 13 8.5V2H11V7H10V2H8V7H7V2H5Z" fill="currentColor"/>
      </svg>
    ),
    groceries: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 2L4.5 4V13C4.5 13.83 5.17 14.5 6 14.5H13C13.83 14.5 14.5 13.83 14.5 13V4L16 2H3ZM6.5 7C6.5 8.38 7.62 9.5 9 9.5C10.38 9.5 11.5 8.38 11.5 7H13V7C13 9.21 11.21 11 9 11C6.79 11 5 9.21 5 7H6.5Z" fill="currentColor"/>
      </svg>
    ),
    shopping: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M6 14.5C5.17 14.5 4.51 15.17 4.51 16C4.51 16.83 5.17 17.5 6 17.5C6.83 17.5 7.5 16.83 7.5 16C7.5 15.17 6.83 14.5 6 14.5ZM1 1.5V3H2.5L5 8.48L4.02 10.25C3.91 10.45 3.85 10.69 3.85 10.95C3.85 11.78 4.52 12.45 5.35 12.45H14.5V10.95H5.62C5.52 10.95 5.44 10.87 5.44 10.77L5.46 10.68L6.1 9.45H11.88C12.45 9.45 12.95 9.13 13.2 8.67L15.68 4.23C15.74 4.13 15.77 4 15.77 3.87C15.77 3.46 15.44 3.12 15.02 3.12H4L3.27 1.5H1ZM13 14.5C12.17 14.5 11.51 15.17 11.51 16C11.51 16.83 12.17 17.5 13 17.5C13.83 17.5 14.5 16.83 14.5 16C14.5 15.17 13.83 14.5 13 14.5Z" fill="currentColor"/>
      </svg>
    ),
    bank: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 1.5L2 5.5V7H16V5.5L9 1.5ZM3.5 8.5V13.5H5.5V8.5H3.5ZM7.5 8.5V13.5H10.5V8.5H7.5ZM12.5 8.5V13.5H14.5V8.5H12.5ZM2 15V16.5H16V15H2Z" fill="currentColor"/>
      </svg>
    ),
    utilities: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M7 2L4 10H7.5L6.5 16L13 7H9L12 2H7Z" fill="currentColor"/>
      </svg>
    ),
    transport: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M13.5 3H4.5C3.67 3 3 3.67 3 4.5V12C3 12.83 3.67 13.5 4.5 13.5H5.25L4.5 15V15.5H6L7 13.5H11L12 15.5H13.5V15L12.75 13.5H13.5C14.33 13.5 15 12.83 15 12V4.5C15 3.67 14.33 3 13.5 3ZM5.25 11.5C4.7 11.5 4.25 11.05 4.25 10.5C4.25 9.95 4.7 9.5 5.25 9.5C5.8 9.5 6.25 9.95 6.25 10.5C6.25 11.05 5.8 11.5 5.25 11.5ZM12.75 11.5C12.2 11.5 11.75 11.05 11.75 10.5C11.75 9.95 12.2 9.5 12.75 9.5C13.3 9.5 13.75 9.95 13.75 10.5C13.75 11.05 13.3 11.5 12.75 11.5ZM14 8H4V4.5H14V8Z" fill="currentColor"/>
      </svg>
    ),
    housing: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M14.5 6.5V15H10.5V11H7.5V15H3.5V6.5L9 2.5L14.5 6.5ZM16 7L17 6L9 0L1 6L2 7L3 6.25V16.5H9H15V6.25L16 7Z" fill="currentColor"/>
      </svg>
    ),
    entertainment: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M16 3H2V15H16V3ZM14.5 6H13V4.5H14.5V6ZM14.5 9H13V7.5H14.5V9ZM14.5 12H13V10.5H14.5V12ZM14.5 15H13V13.5H14.5V15ZM5 15H3.5V13.5H5V15ZM5 12H3.5V10.5H5V12ZM5 9H3.5V7.5H5V9ZM5 6H3.5V4.5H5V6ZM11 15H7V4.5H11V15Z" fill="currentColor"/>
      </svg>
    ),
    health: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M13.5 3H11V1.5C11 0.67 10.33 0 9.5 0H8.5C7.67 0 7 0.67 7 1.5V3H4.5C3.67 3 3 3.67 3 4.5V15C3 15.83 3.67 16.5 4.5 16.5H13.5C14.33 16.5 15 15.83 15 15V4.5C15 3.67 14.33 3 13.5 3ZM8.5 1.5H9.5V3H8.5V1.5ZM13.5 15H4.5V4.5H13.5V15ZM9.75 6H8.25V8.25H6V9.75H8.25V12H9.75V9.75H12V8.25H9.75V6Z" fill="currentColor"/>
      </svg>
    ),
    others: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M4 8C3.17 8 2.5 8.67 2.5 9.5C2.5 10.33 3.17 11 4 11C4.83 11 5.5 10.33 5.5 9.5C5.5 8.67 4.83 8 4 8ZM9 8C8.17 8 7.5 8.67 7.5 9.5C7.5 10.33 8.17 11 9 11C9.83 11 10.5 10.33 10.5 9.5C10.5 8.67 9.83 8 9 8ZM14 8C13.17 8 12.5 8.67 12.5 9.5C12.5 10.33 13.17 11 14 11C14.83 11 15.5 10.33 15.5 9.5C15.5 8.67 14.83 8 14 8Z" fill="currentColor"/>
      </svg>
    ),
  };

  return (
    <div className={`w-10 h-10 flex items-center justify-center border border-rule rounded-lg text-muted flex-shrink-0 ${className}`}>
      {iconMap[type] || iconMap.others}
    </div>
  );
}
