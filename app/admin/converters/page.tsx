import ProductGroupAdmin from "@/components/admin/ProductGroupAdmin";

export default function AdminConverters() {
  return (
    <ProductGroupAdmin
      group="converter"
      pageTitle="DC to AC Converters"
      noun="Converter"
      defaultLabel="DC to AC Converter"
      defaultHref="/converter-categories"
      nameExample="Oval Gold 2500W"
      nameHint="Each wattage represents a separate model (e.g., 500W, 1000W, 1500W, 2500W). Always include the wattage in the model name, as the filter is generated using this value."
    />
  );
}