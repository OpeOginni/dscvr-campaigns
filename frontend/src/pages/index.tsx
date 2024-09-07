import CampaignComponent from "@/components/campaignComponent";
import CreateCampaignsDialog from "@/components/createCampaignsDialog";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { PackagePlus } from "lucide-react";

const testCampaigns: {
  id: string;
  title: string;
  status: string;
  distribution: "token" | "NFT";
}[] = [
  { id: "1", title: "Campaign One", status: "ongoing", distribution: "token" },
  { id: "2", title: "Campaign Two", status: "completed", distribution: "NFT" },
  { id: "3", title: "Campaign Three", status: "ongoing", distribution: "NFT" },
  {
    id: "4",
    title: "Campaign Four",
    status: "completed",
    distribution: "token",
  },
  { id: "5", title: "Campaign Five", status: "ongoing", distribution: "token" },
  { id: "6", title: "Campaign Six", status: "completed", distribution: "NFT" },
  { id: "7", title: "Campaign Seven", status: "ongoing", distribution: "NFT" },
  {
    id: "8",
    title: "Campaign Eight",
    status: "completed",
    distribution: "token",
  },
  { id: "9", title: "Campaign Nine", status: "ongoing", distribution: "token" },
  { id: "10", title: "Campaign Ten", status: "completed", distribution: "NFT" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="flex justify-center pt-20 pb-9">
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="relative flex items-center gap-4 rounded-lg border-2 w-1/3 h-12 hover:shadow-md"
            >
              <div className="absolute pl-4">
                <PackagePlus className="w-7 h-7" />
              </div>
              <p className="w-full text-xl text-center">
                Create a new Campaign
              </p>
            </button>
          </DialogTrigger>
          <CreateCampaignsDialog />
        </Dialog>
      </div>

      <div className="flex w-full justify-center pt-3">
        <div className="flex flex-col justify-center w-1/2 gap-3">
          {testCampaigns.map((campaign) => (
            <CampaignComponent
              key={campaign.id}
              title={campaign.title}
              status={campaign.status}
              distribution={campaign.distribution}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
