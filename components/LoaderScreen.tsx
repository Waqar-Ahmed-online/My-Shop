import Image from "next/image";

export default function LoaderScreen() {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-white">
      <Image
        src="/images/loader-logo1.png"
        alt="Loading"
        width={400}
        height={400}
        priority
        className="h-28 w-28 animate-spin object-contain [animation-duration:1.5s] sm:h-36 sm:w-36"
      />
    </div>
  );
}