"use client";

import { createRequest } from "@/actions/create-request";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cropsList } from "@/data/crops-list";
import { cn, getCropInfo } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, LoaderCircle, Plus, X } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import RequestImageUpload from "./request-image-upload";

// define the shape of our form data
const formSchema = z.object({
  harvestDate: z.date({
    required_error: "A harvest date is required.",
  }),
  crops: z
    .array(
      z.object({
        name: z.string().min(1, { message: "Crop name is required." }),
        image: z.string().min(1, { message: "Crop image is required." }),
        amount: z.coerce.number().min(1, {
          message: "Amount must be greater than 0.",
        }),
      }),
    )
    .min(1, {
      message: "At least 1 crop must be added.",
    }),
});

// typescript type for our form values
type FormValues = z.infer<typeof formSchema>;

export default function RequestForm({ userId }: { userId: string }) {
  // state for toggling form visibility
  const [showForm, setShowForm] = useState(false);
  // state for storing image previews
  const [previewImages, setPreviewImages] = useState<Record<number, string>>(
    {},
  );
  // state for tracking image upload status
  const [uploadingStates, setUploadingStates] = useState<
    Record<number, boolean>
  >({});

  // initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      harvestDate: undefined,
      crops: [{ name: "", image: "", amount: 1 }],
    },
  });

  // setup field array for dynamic crop entries
  const { fields, append, remove } = useFieldArray({
    name: "crops",
    control: form.control,
  });

  // handle removal of a crop entry
  const handleRemoveCrop = (index: number) => {
    if (fields.length <= 1) return;
    remove(index);
    setPreviewImages((prev) => {
      const newPreviews = { ...prev };
      delete newPreviews[index];
      const updatedPreviews: Record<number, string> = {};
      fields.forEach((_, newIdx) => {
        if (newIdx < index && prev[newIdx])
          updatedPreviews[newIdx] = prev[newIdx];
        else if (newIdx >= index && prev[newIdx + 1])
          updatedPreviews[newIdx] = prev[newIdx + 1];
      });
      return updatedPreviews;
    });
    setUploadingStates((prev) => {
      const newUploadingStates = { ...prev };
      delete newUploadingStates[index];
      return newUploadingStates;
    });
  };

  // handle form submission
  async function onSubmit(data: FormValues) {
    await createRequest({ data, userId });
    toast.success("Request submitted successfully!");
    setShowForm(false);
    form.reset({
      harvestDate: undefined,
      crops: [{ name: "", image: "", amount: 1 }],
    });
    setPreviewImages({});
    setUploadingStates({});
  }

  return (
    <div className="border rounded-xl shadow p-8">
      <h1 className="text-xl font-semibold mb-6">New Surplus Request</h1>

      {!showForm ? (
        // show new request button when form is hidden
        <Button size="lg" className="w-full" onClick={() => setShowForm(true)}>
          New
          <Plus className="h-4 w-4" />
        </Button>
      ) : (
        // render form when showForm is true
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-8 md:grid-cols-2 items-start">
              {/* harvest date picker */}
              <FormField
                control={form.control}
                name="harvestDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-2">
                    <FormLabel className="text-lg font-medium">
                      Harvest Date
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When do you expect to harvest these crops?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* crops section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">Crops</h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => append({ name: "", image: "", amount: 1 })}
                  >
                    Add Crop
                    <Plus className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                {/* dynamic crop fields */}
                {fields.map((field, index) => (
                  <Card key={field.id} className="relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0"
                      onClick={() => handleRemoveCrop(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {/* crop name selection */}
                          <FormField
                            control={form.control}
                            name={`crops.${index}.name`}
                            render={({ field }) => (
                              <FormItem className="flex flex-col space-y-2">
                                <FormLabel>Crop Name</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select a crop" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {cropsList.map((option) => (
                                      <SelectItem
                                        key={option.name}
                                        value={option.name}
                                      >
                                        {option.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* amount input */}
                          <FormField
                            control={form.control}
                            name={`crops.${index}.amount`}
                            render={({ field }) => (
                              <FormItem className="flex flex-col space-y-2">
                                <FormLabel>Amount (lbs)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="e.g., 50"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* image upload component */}
                        <RequestImageUpload
                          uploadingStates={uploadingStates}
                          setUploadingStates={setUploadingStates}
                          previewImages={previewImages}
                          setPreviewImages={setPreviewImages}
                          form={form}
                          index={index}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* total value calculation */}
            <div className="items-center border-y py-4 border-dashed flex justify-between">
              <div className="font-medium text-base">Total Value:</div>
              <div className="font-medium text-base">
                $
                {fields
                  .reduce((sum, field, index) => {
                    const raw: string | number = form.watch(
                      `crops.${index}.amount`,
                    );
                    const amount = parseFloat(raw.toString()) || 0;
                    return (
                      sum +
                      amount *
                        (getCropInfo(form.watch(`crops.${index}.name`))
                          ?.buyFromFarmerPrice || 0)
                    );
                  }, 0)
                  .toFixed(2)}
              </div>
            </div>

            {/* form actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                className="w-full"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  form.reset({
                    harvestDate: undefined,
                    crops: [{ name: "", image: "", amount: 1 }],
                  });
                  setPreviewImages({});
                  setUploadingStates({});
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full"
                disabled={
                  Object.values(uploadingStates).some((s) => s) ||
                  form.formState.isSubmitting
                }
              >
                {(Object.values(uploadingStates).some((s) => s) ||
                  form.formState.isSubmitting) && (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
