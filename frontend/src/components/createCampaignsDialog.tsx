import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useState } from "react";

const formSchema = z.discriminatedUnion("distribution", [
  z.object({
    distribution: z.literal("NFT"),
    title: z.string().min(2, {
      message: "Title must be at least 2 characters.",
    }),
    startDate: z.date({
      required_error: "A start date is required.",
    }),
    setEndDate: z.boolean().optional(),
    endDate: z.date().optional(),
    image: z.string().url({
      message: "Image must be a valid URL.",
    }),
    maxDistribution: z.coerce.number().int(),
  }),
  z.object({
    distribution: z.literal("Token"),
    title: z.string().min(2, {
      message: "Title must be at least 2 characters.",
    }),
    startDate: z.date({
      required_error: "A start date is required.",
    }),
    setEndDate: z.boolean().optional(),
    endDate: z.date().optional(),
    tokenName: z.string().min(2, {
      message: "Token name must be at least 2 characters.",
    }),
    tokenSymbol: z.string().min(2, {
      message: "Token symbol must be at least 2 characters.",
    }),
    maxDistribution: z.coerce.number().int(),
  }),
]);

export default function CreateCampaignsDialog() {
  const [showEndDate, setShowEndDate] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      startDate: new Date(),
      endDate: undefined,
      distribution: "NFT",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Create Campaign</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 pt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your campaign Title.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
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
                        disabled={(date) =>
                          date.getTime() < new Date().setHours(0, 0, 0, 0)
                        } // Disable dates before today
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    The date you want the campaign to start.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showEndDate"
                checked={showEndDate}
                onChange={() => {
                  setShowEndDate(!showEndDate);
                  form.setValue("endDate", undefined); // Reset endDate when unchecked
                }}
              />
              <label htmlFor="showEndDate">Set End Date</label>
            </div>

            {showEndDate && (
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
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
                          disabled={(date) =>
                            date <= form.getValues("startDate")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      The date you want the campaign to end.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex items-center gap-4">
              <FormField
                control={form.control}
                name="distribution"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Choose your Campaign Distribution</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="NFT" />
                          </FormControl>
                          <FormLabel className="font-normal">NFT</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem disabled={true} value="Token" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Tokens (Coming Soon)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {form.getValues("distribution") === "NFT" && (
              <>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="shadcn" {...field} />
                      </FormControl>
                      <FormDescription>
                        The Image URL for your NFTs
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxDistribution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Number of Mints</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="shadcn" {...field} />
                      </FormControl>
                      <FormDescription>
                        The max number of NFTs that can be minted.
                        <br />
                        NOTE: Use 0 for unlimited mints
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {form.getValues("distribution") === "Token" && (
              <div>
                {/* Render Token specific form fields here */}
                <p>Token specific form fields go here.</p>
              </div>
            )}

            <DialogFooter>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </Form>
      </div>
    </DialogContent>
  );
}
