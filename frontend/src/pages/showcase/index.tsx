import { useCopyToClipboard } from "usehooks-ts";

export default function Showcase() {
  const dashboardLink =
    process.env.NEXT_PUBLIC_URL || "https://localhost:3000/canvas";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white text-center p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to DSCVR Campaigns</h1>
      <p className="text-lg mb-6">
        Create and manage your campaigns on DSCVR with ease.
      </p>
      <ul className="list-disc list-inside mb-6">
        <li>Launch NFT and Token campaigns effortlessly.</li>
        <li>Increase Profile Reach and Engagements.</li>
        <li>Track your campaign&apos;s performance in real-time.</li>
        <li>Reward your most loyal Community Members and Followers.</li>
      </ul>
      <div className="flex flex-col items-center">
        <p className="mb-2">
          Copy the link to the dashboard and create your own campaigns:
        </p>
        <input
          type="text"
          value={dashboardLink}
          readOnly
          className="w-96 p-2 border rounded font-bold text-black cursor-text" // Adjusted width here
        />
      </div>
    </div>
  );
}
