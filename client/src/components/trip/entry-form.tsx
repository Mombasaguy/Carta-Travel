import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  citizenship: z.string().min(2, "Select citizenship"),
  destination: z.string().min(2, "Select destination"),
  durationDays: z.coerce.number().int().positive("Enter valid duration"),
  travelDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Select travel date"),
  isUSEmployerSponsored: z.boolean().default(false),
});

export type EntryFormData = z.infer<typeof formSchema>;

interface EntryFormProps {
  onSubmit: (data: EntryFormData & { purpose: "BUSINESS" }) => Promise<void>;
}

const citizenshipOptions = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "GB", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "JP", label: "Japan" },
  { value: "BR", label: "Brazil" },
  { value: "IN", label: "India" },
  { value: "MX", label: "Mexico" },
];

const destinationOptions = [
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "BR", label: "Brazil" },
  { value: "DE", label: "Germany" },
  { value: "JP", label: "Japan" },
];

export function EntryForm({ onSubmit }: EntryFormProps) {
  const form = useForm<EntryFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      citizenship: "",
      destination: "",
      durationDays: 7,
      travelDate: "",
      isUSEmployerSponsored: false,
    },
  });

  const handleSubmit = async (data: EntryFormData) => {
    await onSubmit({ ...data, purpose: "BUSINESS" });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="citizenship"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Citizenship</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-citizenship">
                      <SelectValue placeholder="Select citizenship" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {citizenshipOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-destination">
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {destinationOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="travelDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Travel Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    data-testid="input-travel-date"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="durationDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (days)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    data-testid="input-duration"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isUSEmployerSponsored"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">US Employer Sponsored</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Are you traveling on behalf of a US employer?
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="switch-us-sponsored"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
          data-testid="button-check-requirements"
        >
          {form.formState.isSubmitting ? "Checking..." : "Check Entry Requirements"}
        </Button>
      </form>
    </Form>
  );
}
