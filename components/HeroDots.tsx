type Props = { total: number; current: number; onSelect: (i: number) => void };

export default function HeroDots({ total, current, onSelect }: Props) {
  return (
    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`Go to slide ${i + 1}`}
          className={`h-1.5 rounded-full bg-white transition-all ${i === current ? "w-6" : "w-2 opacity-50"}`}
        />
      ))}
    </div>
  );
}