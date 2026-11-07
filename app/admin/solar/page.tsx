import ProductGroupAdmin from "@/components/admin/ProductGroupAdmin";

export default function AdminSolar() {
  return (
    <ProductGroupAdmin
      group="solar"
      pageTitle="Solar Controllers"
      noun="Solar Controller"
      defaultLabel="Solar Controller"
      defaultHref="/solar-controller-categories"
      nameExample="Solar Controller 12V/24V 30A"
      nameHint="Create a separate model for each voltage and amp rating (e.g. 12V 30A, 12V/24V 60A). Always include both the voltage and the amps in the name. If a controller works on both 12V and 24V, write 12V/24V, and it will appear in both filters."
    />
  );
}