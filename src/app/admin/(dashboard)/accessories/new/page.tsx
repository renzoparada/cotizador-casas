import { PricedItemForm } from "@/components/admin/priced-item-form";

export default function NewAccessoryPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Nuevo accesorio</h1>
      <div className="mt-6">
        <PricedItemForm apiBase="/api/admin/accessories" imageBase="/api/images/accessories" listPath="/admin/accessories" />
      </div>
    </div>
  );
}
