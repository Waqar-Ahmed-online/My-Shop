import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, MessageCircle, Package, Phone, ShieldCheck, Tag } from "lucide-react";
import Header from "@/components/Header";
import ParallaxBg from "@/components/ParallaxBg";
import { getFanCards } from "@/lib/data";

export const metadata = { title: "About Us | Abrar Store" };

/* ============ yahan apni maloomat likho ============ */
const SHOP = {
  name: "Abrar Khan Electronics & Parts",
  address: "Hyderabad Gari Khata Qazi Abdul Qayoom Raod Battery Market Near Allah Di Masjid",
  phone: "03493032515",
  hours: "Mon - Sat: 10:00 AM - 8:00 PM",
};
// "Our Story" ke saath wali product photo (kisi bhi product ki photo laga sakte ho)
const STORY_IMAGE = "/images/fan-bg.jpg";
/* =================================================== */

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923493032515";
const WA_LINK = `https://wa.me/${WA}?text=${encodeURIComponent(
  "Assalam o Alaikum! Mujhe aap ke products ke baare mein maloomat chahiye."
)}`;
const TEL_LINK = `tel:${SHOP.phone.replace(/\s/g, "")}`;

const features = [
  {
    icon: ShieldCheck,
    title: "Trusted Quality",
    text: "We stock products from known brands, so you get quality you can rely on.",
  },
  {
    icon: Tag,
    title: "Honest Prices",
    text: "Clear prices and real discounts. Check our Deals page for the latest offers.",
  },
  {
    icon: MessageCircle,
    title: "Quick Help",
    text: "Not sure which model to pick? Message us on WhatsApp and we will guide you.",
  },
  {
    icon: Package,
    title: "Wide Range",
    text: "Ceiling fans, power converters, chargers and solar controllers, all in one place.",
  },
];

function InfoBox({
  icon: Icon,
  title,
  text,
  href,
}: {
  icon: typeof Phone;
  title: string;
  text: string;
  href?: string;
}) {
  const body = (
    <>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/15 text-gold-dark">
        <Icon size={22} />
      </span>
      <h3 className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
        {title}
      </h3>
      <p className="mt-2 text-base font-medium leading-relaxed text-neutral-900">{text}</p>
    </>
  );

  const cls =
    "block rounded-lg border border-neutral-200 bg-white p-6 text-center shadow-sm transition hover:shadow-md";

  return href ? (
    <a href={href} className={cls}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-neutral-500">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl font-semibold uppercase tracking-wide text-neutral-900 sm:text-4xl">
        {title}
      </h2>
      <div className="mx-auto mt-4 h-0.5 w-16 bg-brand" />
    </div>
  );
}

export default async function AboutPage() {
  const cards = await getFanCards();

  return (
    <>
      <header className="border-b border-neutral-200 bg-white text-neutral-900">
        <Header active="about" />
      </header>

      <main>
        {/* 1) Banner */}
        <section className="relative isolate px-4 py-20 text-center sm:px-6 sm:py-28">
          <ParallaxBg src="/images/fan-bg.jpg" overlay="bg-black/50" />
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/80">Who we are</p>
          <h1 className="mt-3 font-display text-4xl font-semibold uppercase tracking-wide text-white drop-shadow-sm sm:text-6xl">
            About Us
          </h1>
          <div className="mx-auto mt-5 h-0.5 w-16 bg-brand" />
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
            Your trusted store for ceiling fans, power converters, battery chargers and solar
            controllers.
          </p>
        </section>

        {/* 2) Our Story + product photo */}
        <section className="bg-white px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark">
                Our Story
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold uppercase leading-tight tracking-wide text-neutral-900 sm:text-4xl">
                Quality electronics, honest service
              </h2>
              <p className="mt-5 text-base leading-relaxed text-neutral-600">
                {SHOP.name} is a local electronics store that brings ceiling fans, DC to AC power
                converters, battery chargers and solar controllers together under one roof. We
                believe buying electronics should be simple: clear prices, honest advice and
                products you can trust.
              </p>
              <p className="mt-4 text-base leading-relaxed text-neutral-600">
                Whether you are choosing a fan for your bedroom, a charger for your battery or a
                controller for your solar setup, we are happy to help you pick the right model.
                Message us on WhatsApp any time.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/collection"
                  className="bg-brand px-6 py-3 text-xs font-semibold uppercase tracking-wider text-black transition hover:bg-neutral-900 hover:text-white"
                >
                  Shop Collection
                </Link>
                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-neutral-900 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
                >
                  WhatsApp Us
                </a>
              </div>
            </div>

            {/* photo, sunehri frame ke saath */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div
                aria-hidden
                className="absolute bottom-0 left-4 right-0 top-4 border-2 border-brand"
              />
              <div className="relative mb-4 mr-4 aspect-4/5 overflow-hidden bg-neutral-100 shadow-xl">
                <Image
                  src={STORY_IMAGE}
                  alt="Ceiling fan"
                  fill
                  quality={90}
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover"
                  style={{ objectPosition: "75% 35%" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3) Our Collections (admin ke cards se khud banti hain) */}
        {cards.length > 0 && (
                    <section className="bg-neutral-50 px-4 py-16 sm:px-6 sm:py-20">
            <div className="mx-auto max-w-6xl">
              <SectionHead eyebrow="What we sell" title="Our Collections" />

              <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
                {cards.map((c) => (
                  <Link
                    key={c.id}
                    href={c.href || "#"}
                    className="group relative block aspect-4/5 overflow-hidden shadow-md ring-1 ring-black/10"
                  >
                    <Image
                      src={c.image}
                      alt={c.label}
                      fill
                      quality={90}
                      sizes="(min-width: 768px) 33vw, 50vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 to-transparent p-4 pt-14">
                      <p className="text-sm font-semibold uppercase tracking-wider text-white">
                        {c.label}
                      </p>
                      <p className="mt-0.5 text-xs text-white/80 transition group-hover:text-brand">
                        Browse &rarr;
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 4) Why choose us */}
        <section className="bg-white px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <SectionHead eyebrow="Why choose us" title="Why Customers Choose Us" />

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-lg border border-neutral-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand/15 text-gold-dark">
                    <f.icon size={26} />
                  </span>
                  <h3 className="mt-5 text-sm font-semibold uppercase tracking-wider text-neutral-900">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5) Visit / contact */}
        <section className="bg-neutral-50 px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <SectionHead eyebrow="Visit us" title="Get In Touch" />

            <div className="mt-10 grid gap-4 md:grid-cols-3 lg:gap-6">
              <InfoBox icon={MapPin} title="Address" text={SHOP.address} />
              <InfoBox icon={Phone} title="Phone / WhatsApp" text={SHOP.phone} href={TEL_LINK} />
              <InfoBox icon={Clock} title="Opening Hours" text={SHOP.hours} />
            </div>
          </div>
        </section>

        {/* 6) Aakhri button wali patti */}
        <section className="bg-neutral-900 px-4 py-14 text-center sm:px-6">
          <h2 className="font-display text-2xl font-semibold uppercase tracking-wide text-white sm:text-3xl">
            Need help choosing the right product?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/70">
            Send us a message and we will help you find the best fan, converter, charger or solar
            controller for your needs.
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block bg-brand px-8 py-3 text-xs font-semibold uppercase tracking-wider text-black transition hover:bg-white"
          >
            Chat on WhatsApp
          </a>
        </section>
      </main>
    </>
  );
}