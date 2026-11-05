import Image from "next/image";

export default function Logo() {
  return (
    <Image
      src="/images/logo-img5.png"
      alt="Abrar Store - Electronics & Accessories"
      width={2170}
      height={725}
      priority
               className="h-14 w-auto sm:h-[72px] [[data-overlay]_&]:brightness-0 [[data-overlay]_&]:invert"
    />
  );
} 