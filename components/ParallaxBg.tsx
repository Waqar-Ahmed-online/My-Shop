import Image from "next/image";

// Section ke andar background image: scroll par image ruki rehti hai, content guzarta hai
export default function ParallaxBg({
  src,
  overlay = "bg-black/45",
  position = "75% 35%",
}: {
  src: string;
  overlay?: string;
  position?: string;
}) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [clip-path:inset(0)]">
      <div className="fixed inset-0">
        <Image
          src={src}
          alt=""
          fill
          sizes="100vw"
         quality={90}
          className="object-cover"
          style={{ objectPosition: position }}
        />
        <div className={`absolute inset-0 ${overlay}`} />
      </div>
    </div>
  );
}