import ProductGroupAdmin from "@/components/admin/ProductGroupAdmin";

export default function AdminChargers() {
  return (
    <ProductGroupAdmin
      group="charger"
      pageTitle="Chargers"
      noun="Charger"
      defaultLabel="Battery Charger"
      defaultHref="/charger-categories"
      nameExample="Battery Charger 12V 10A"
      nameHint="Har volt aur amp ka alag model banao (jaise 12V 10A, 12V 20A, 24V 10A). Naam mein volt aur amp dono zaroor likho (12V, 10A), filter inhi se banta hai."
    />
  );
}