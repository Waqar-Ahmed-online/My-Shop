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
      nameHint="Har wattage ek alag model hai (jaise 500W, 1000W, 1500W, 2500W). Naam mein watt zaroor likho, filter usi se banta hai."
    />
  );
}