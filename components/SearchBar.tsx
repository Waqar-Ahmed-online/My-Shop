import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="flex h-11 w-full max-w-[450px] items-center overflow-hidden rounded-full border border-neutral-300 bg-white">
      <input
        placeholder="Search for products, brands and more..."
        className="h-full flex-1 px-4 text-sm text-black outline-none"
      />
      <button className="m-1 flex h-9 w-12 items-center justify-center rounded-full bg-brand text-black">
        <Search size={18} />
      </button>
    </div>
  );
}
