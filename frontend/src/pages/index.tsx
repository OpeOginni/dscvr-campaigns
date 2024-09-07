import { PackagePlus } from "lucide-react";

export default function Home() {
  return (
    <div className="flex justify-center min-h-screen pt-20">
      <button
        type="button"
        className="relative flex items-center gap-4 rounded-lg border-2 w-1/3 h-12 hover:shadow-md"
      >
        <div className="absolute pl-4">
          <PackagePlus className="w-7 h-7" />
        </div>
        <p className="w-full text-xl text-center">Create a new Campaign</p>
      </button>
    </div>
  );
}
