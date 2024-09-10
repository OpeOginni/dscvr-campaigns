import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Coins, Image as ImageIcon } from "lucide-react"; // Import the icons
import Link from "next/link";

export default function CampaignComponent({
  id,
  title,
  status,
  distribution,
}: {
  id: string;
  title: string;
  status: string;
  distribution: "TOKEN" | "NFT";
}) {
  return (
    <Link
      href={`/campaigns/${id}`}
      className="w-full text-left bg-white border border-gray-200 shadow-lg rounded-lg p-4 mb-4 transition-transform transform hover:scale-105 hover:shadow-2xl hover:border-gray-300"
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {distribution === "NFT" ? (
            <ImageIcon className="w-5 h-5" />
          ) : (
            <Coins className="w-5 h-5" />
          )}
          <p className="font-semibold text-lg">{title}</p>
        </div>
        <Badge
          className={cn(
            status === "active" ? "bg-green-100 text-green-800" : "",
            status === "inactive" ? "bg-red-100 text-red-800" : ""
          )}
          variant={"outline"}
        >
          {status}
        </Badge>
      </div>
    </Link>
  );
}
