import { Users, Home, Calendar, MessageSquare, ShoppingCart, ClipboardList } from "lucide-react";
import { useLocation } from "wouter";

export default function SectionOverview() {
  const [location] = useLocation();

  const sections = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/players", label: "Players", icon: Users },
    { path: "/house-orders", label: "Orders", icon: ClipboardList },
    { path: "/food-orders", label: "Groceries", icon: ShoppingCart },
    { path: "/communications", label: "Messages", icon: MessageSquare },
    { path: "/calendar", label: "Calendar", icon: Calendar },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = location === section.path;
          
          return (
            <a
              key={section.path}
              href={section.path}
              className={`flex flex-col items-center space-y-1 px-2 py-1 rounded-lg transition-colors ${
                isActive 
                  ? "text-[#DC143C] bg-red-50" 
                  : "text-gray-500 hover:text-[#DC143C] hover:bg-gray-50"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{section.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}