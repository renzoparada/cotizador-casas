import { PricedItemForm } from "@/components/admin/priced-item-form";

export default function NewRoofUpgradePage() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Nuevo techo</h1>
      <div className="mt-6">
        <PricedItemForm apiBase="/api/admin/roof-upgrades" imageBase="/api/images/roof-upgrades" listPath="/admin/roof-upgrades" />
      </div>
    </div>
  );
}
