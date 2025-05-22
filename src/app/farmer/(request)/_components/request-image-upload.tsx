import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ImageIcon, LoaderCircle } from "lucide-react";
import Image from "next/image";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

// cloudinary configuration
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

// type definition for form data
type FormType = UseFormReturn<
  {
    harvestDate: Date;
    crops: {
      name: string;
      image: string;
      amount: number;
    }[];
  },
  {
    harvestDate: Date;
    crops: {
      name: string;
      image: string;
      amount: number;
    }[];
  }
>;

// component for handling image uploads in a form
export default function RequestImageUpload({
  uploadingStates,
  setUploadingStates,
  previewImages,
  setPreviewImages,
  form,
  index,
}: {
  uploadingStates: Record<number, boolean>;
  setUploadingStates: React.Dispatch<
    React.SetStateAction<Record<number, boolean>>
  >;
  previewImages: Record<number, string>;
  setPreviewImages: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
  form: FormType;
  index: number;
}) {
  // handles the image upload process to cloudinary
  const handleImageUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      toast.error("Image upload service not configured.");
      return;
    }

    setUploadingStates((prev) => ({ ...prev, [index]: true }));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        toast.error("There was an error uploading your image.");
      }

      const data = await response.json();
      const imageUrl = data.secure_url;

      // update form and preview states with the new image
      form.setValue(`crops.${index}.image`, imageUrl);
      setPreviewImages((prev) => ({
        ...prev,
        [index]: imageUrl,
      }));
    } catch {
      toast.error("There was an error uploading your image.");
      setPreviewImages((prev) => ({
        ...prev,
        [index]: "",
      }));
      form.setValue(`crops.${index}.image`, "");
    } finally {
      setUploadingStates((prev) => ({ ...prev, [index]: false }));
    }
  };
  return (
    <FormField
      control={form.control}
      name={`crops.${index}.image`}
      render={() => (
        <FormItem>
          <FormLabel>Image of Crop</FormLabel>
          <FormControl>
            <div className="flex flex-col items-center gap-4">
              {/* loading state */}
              {uploadingStates[index] && (
                <div className="flex items-center justify-center h-40 w-full rounded-md border border-dashed">
                  <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
              {/* preview image */}
              {!uploadingStates[index] && previewImages[index] && (
                <div className="relative h-40 rounded-md overflow-hidden">
                  <Image
                    src={previewImages[index]}
                    width={300}
                    height={300}
                    className="object-contain w-full h-full"
                    alt={`Crop ${index + 1}`}
                  />
                </div>
              )}
              {/* empty state */}
              {!uploadingStates[index] && !previewImages[index] && (
                <div className="flex items-center justify-center h-40 w-full rounded-md border border-dashed bg-muted">
                  <span className="text-muted-foreground text-sm">
                    No image selected
                  </span>
                </div>
              )}
              {/* upload button */}
              <label className="border rounded-md px-3 h-10 flex items-center justify-center gap-2 text-sm font-medium w-full hover:bg-muted transition-all cursor-pointer">
                {" "}
                <ImageIcon size={14} />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(index, e)}
                  className="hidden"
                  disabled={uploadingStates[index]}
                />
              </label>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
