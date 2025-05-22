import { LoaderCircle } from "lucide-react";

export default function Loading() {
  // loading spinner as suspense boundary
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <LoaderCircle className="animate-spin text-primary" size={30} />
    </div>
  );
}
