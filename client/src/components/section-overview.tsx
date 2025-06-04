import { Users, Home, Calendar, MessageSquare, ShoppingCart, User } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function SectionOverview() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const sections = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/players", label: "Players", icon: Users },
    { path: "/chores", label: "Housing", icon: Home },
    { path: "/food-orders", label: "Groceries", icon: ShoppingCart },
    { path: "/communications", label: "Messages", icon: MessageSquare },
    { path: "/calendar", label: "Calendar", icon: Calendar },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-between items-center">
        <div className="flex justify-around items-center max-w-md mx-auto flex-1">
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
        
        {/* User Profile Display */}
        {isAuthenticated && user && (
          <div className="flex items-center space-x-2 ml-4">
            <div className="w-8 h-8 bg-[#DC143C] rounded-full flex items-center justify-center">
              {user.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-white" />
              )}
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user.role}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}