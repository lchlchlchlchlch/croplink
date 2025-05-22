import { LoaderCircle } from "lucide-react";

export default function Loading() {
  // loading spinner as suspense boundary
  return (
    <div className="flex flex-1 items-center justify-center">
      <LoaderCircle className="animate-spin text-primary" size={30} />
    </div>
  );
}
