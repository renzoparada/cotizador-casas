import { HouseModelForm } from "@/components/admin/house-model-form";

export default function NewHouseModelPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Nuevo modelo de casa</h1>
      <div className="mt-6">
        <HouseModelForm />
      </div>
    </div>
  );
}
