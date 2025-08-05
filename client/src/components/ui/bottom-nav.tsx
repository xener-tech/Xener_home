import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/dashboard", icon: "fas fa-home", label: "Home" },
  { path: "/analytics", icon: "fas fa-chart-bar", label: "Analytics" },
  { path: "/bill-upload", icon: "fas fa-camera", label: "Bill Upload" },
  { path: "/appliances", icon: "fas fa-plug", label: "Appliances" },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-xl border-t border-gray-100 px-4 py-3 z-50 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <div
              className={cn(
                "flex flex-col items-center space-y-1 transition-all duration-300 cursor-pointer p-3 rounded-2xl",
                location === item.path
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
                  : "hover:bg-gray-50"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center",
                location === item.path 
                  ? "bg-white/20" 
                  : "bg-gradient-to-br from-blue-500 to-purple-600"
              )}>
                <i className={`${item.icon} text-sm ${location === item.path ? 'text-white' : 'text-white'}`}></i>
              </div>
              <span className={`text-xs font-medium ${location === item.path ? 'text-white' : 'text-gray-700'}`}>
                {item.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
