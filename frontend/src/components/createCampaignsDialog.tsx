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
import { Checkbox } from "./ui/checkbox"; // Assuming Checkbox is already implemented
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
    setEndDate: z.boolean().default(false),
    endDate: z.date().optional(),
    image: z.string().url({
      message: "Image must be a valid URL.",
    }),
    maxDistribution: z.coerce.number().int().gte(0, {
      message: "Must be greater than or equal to 0.",
    }),
    requiredNumberOfDSCVRPoints: z.coerce.number().int().gte(0, {
      message: "Must be greater than or equal to 0.",
    }),
    requiredDSCVRStreakDays: z.coerce.number().int().gte(0, {
      message: "Must be greater than or equal to 0.",
    }),
    allowRecentAccounts: z.boolean().default(false),
    shouldFollowCreator: z.boolean().default(false),
    shouldReactToPost: z.boolean().default(false),
    shouldCommentOnPost: z.boolean().default(false),
    shouldBePortalMember: z.boolean().default(false),
  }),
  z.object({
    distribution: z.literal("Token"),
    title: z.string().min(2, {
      message: "Title must be at least 2 characters.",
    }),
    startDate: z.date({
      required_error: "A start date is required.",
    }),
    setEndDate: z.boolean().default(false),
    endDate: z.date().optional(),
    tokenName: z.string().min(2, {
      message: "Token name must be at least 2 characters.",
    }),
    tokenSymbol: z.string().min(2, {
      message: "Token symbol must be at least 2 characters.",
    }),
    maxDistribution: z.coerce.number().int().gte(0, {
      message: "Must be greater than or equal to 0.",
    }),
    requiredNumberOfDSCVRPoints: z.coerce.number().int().gte(0, {
      message: "Must be greater than or equal to 0.",
    }),
    requiredDSCVRStreakDays: z.coerce.number().int().gte(0, {
      message: "Must be greater than or equal to 0.",
    }),
    allowRecentAccounts: z.boolean().default(false),
    shouldFollowCreator: z.boolean().default(false),
    shouldReactToPost: z.boolean().default(false),
    shouldCommentOnPost: z.boolean().default(false),
    shouldBePortalMember: z.boolean().default(false),
  }),
]);

export default function CreateCampaignsDialog() {
  const [showEndDate, setShowEndDate] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Common Fields
      title: "",
      startDate: new Date(),
      endDate: undefined,
      setEndDate: false,
      maxDistribution: 0,
      requiredNumberOfDSCVRPoints: 0,
      requiredDSCVRStreakDays: 0,
      allowRecentAccounts: false,
      shouldFollowCreator: false,
      shouldReactToPost: false,
      shouldCommentOnPost: false,
      shouldBePortalMember: false,
      distribution: "Token", // Default to "NFT" as "Token" is coming soon
      // Token Specific Fields (will be ignored for "NFT" distribution)
      tokenName: "",
      tokenSymbol: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Create Campaign</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 pt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your campaign title" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the title of your campaign.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Date */}
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
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    The date when your campaign will start.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Set End Date Checkbox */}
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

            {/* End Date */}
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
                      The date when your campaign will end.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Distribution Type */}
            <div className="flex items-center gap-4">
              <FormField
                control={form.control}
                name="distribution"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Campaign Distribution</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Token" />
                          </FormControl>
                          <FormLabel className="font-normal">Tokens</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem disabled={true} value="NFT" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            NFT (Coming Soon)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* NFT Specific Fields */}
            {form.getValues("distribution") === "NFT" && (
              <>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter image URL" {...field} />
                      </FormControl>
                      <FormDescription>
                        The URL of the image for your NFTs.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Token Specific Fields */}
            {form.getValues("distribution") === "Token" && (
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="tokenName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Token Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tokenSymbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token Symbol</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Token Symbol" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Max Distribution */}
            <FormField
              control={form.control}
              name="maxDistribution"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Max Distribution</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter max number of distributions"
                      type="number"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The total number of NFTs to be distributed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Checkboxes */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="allowRecentAccounts"
                render={({ field }) => (
                  <FormItem className="flex items-center text-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel noMargin={true}>Allow Recent Accounts</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shouldFollowCreator"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel noMargin={true}>Must Follow Creator</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shouldReactToPost"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel noMargin={true}>Must React to Post</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shouldCommentOnPost"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel noMargin={true}>Must Comment on Post</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shouldBePortalMember"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel noMargin={true}>Must Be Portal Member</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="requiredNumberOfDSCVRPoints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DSCVR Points Required</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter points required"
                        type="number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requiredDSCVRStreakDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DSCVR Streak Days Required</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter streak days required"
                        type="number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </div>
    </DialogContent>
  );
}
