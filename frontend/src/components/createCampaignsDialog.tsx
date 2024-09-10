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
import { Checkbox } from "./ui/checkbox";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@solana/wallet-adapter-react";

const MAX_FILE_SIZE = 1024 * 1024 * 5;
const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

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
    image: z
      .any()
      .refine((file) => {
        return file?.size <= MAX_FILE_SIZE;
      }, "Max image size is 5MB.")
      .refine(
        (file) => ACCEPTED_IMAGE_MIME_TYPES.includes(file?.type),
        "Only .jpg, .jpeg, .png and .webp formats are supported."
      )
      .optional(),
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
    distribution: z.literal("TOKEN"),
    title: z.string().min(2, {
      message: "Title must be at least 2 characters.",
    }),
    startDate: z.date({
      required_error: "A start date is required.",
    }),
    setEndDate: z.boolean().default(false),
    endDate: z.date().optional(),
    image: z
      .any()
      .refine((file) => {
        return file?.size <= MAX_FILE_SIZE;
      }, "Max image size is 5MB.")
      .refine(
        (file) => ACCEPTED_IMAGE_MIME_TYPES.includes(file?.type),
        "Only .jpg, .jpeg, .png and .webp formats are supported."
      )
      .optional(),
    tokenName: z.string().min(2, {
      message: "TOKEN name must be at least 2 characters.",
    }),
    tokenSymbol: z.string().min(2, {
      message: "TOKEN symbol must be at least 2 characters.",
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
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const { toast } = useToast();
  const { publicKey } = useWallet();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Common Fields
      title: "",
      startDate: new Date(),
      image: undefined,
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
      distribution: "TOKEN", // Default to "NFT" as "TOKEN" is coming soon
      tokenName: "",
      tokenSymbol: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true); // Set loading state to true

    // Convert image to base64 string if it exists
    const convertImageToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
    };

    let imageBase64 = "";
    if (values.image instanceof File) {
      imageBase64 = await convertImageToBase64(values.image);
    }

    const payload = {
      creator: publicKey?.toBase58(),
      status: "ACTIVE",
      ...values,
      image: imageBase64, // Add the base64 string to the payload
    };
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/campaigns`,
        {
          method: "POST",
          body: JSON.stringify(payload),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast({
          title: "Created Campaign",
        });
      } else {
        toast({
          title: "Failed to create campaign",
          description: "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Failed to create campaign",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // Set loading state to false
    }
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
                            <RadioGroupItem value="TOKEN" />
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

            {/* TOKEN Specific Fields */}
            {form.getValues("distribution") === "TOKEN" && (
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
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          field.onChange(e.target.files[0]);
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>The image for your NFT.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Loading..." : "Create Campaign"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </div>
    </DialogContent>
  );
}
