import { Clock } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#c9a962]/20 flex items-center justify-center mx-auto animate-pulse">
          <Clock className="w-8 h-8 text-[#c9a962]" />
        </div>
        <p className="text-[#b0b2bc] text-sm">Loading dashboard...</p>
      </div>
    </div>
  );
}
