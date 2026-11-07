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
     nameHint="Create a separate model for each voltage and amperage combination (e.g., 12V 10A, 12V 20A, 24V 10A). Always include both voltage and amperage in the name (12V, 10A), as the filters are generated using these values."
    />
  );
}