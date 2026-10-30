export default function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1312px] px-6 ${className}`}>{children}</div>;
}
