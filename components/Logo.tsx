import Image from "next/image";

export default function Logo() {
  return (
    <Image
      src="/images/logo-img1.png"
      alt="Abrar Store - Electronics & Accessories"
      width={2170}
      height={725}
      priority
      className="h-12 w-auto sm:h-14"
    />
  );
}