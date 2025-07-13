import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-token-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { NotificationBell } from "@/components/notification-bell";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, canManageCalendar, canManagePlayers } = useAuth();
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isCoach = user?.role === 'coach';
  const [location] = useLocation();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12">
              <img 
                src="https://germany-socceracademy.com/wp-content/uploads/2023/09/NewCologneLogo.png" 
                alt="FC Köln Football School" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">1.FC Köln</h1>
              <p className="text-sm text-gray-600">International Talent Program</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <>
                <NotificationBell />
                {user && (
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                )}
              </>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-gray-200 py-3 space-y-1 relative z-50">
            <a 
              href="/" 
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                location === "/" 
                  ? "text-[#DC143C] bg-red-50" 
                  : "text-gray-700 hover:text-[#DC143C] hover:bg-gray-50"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </a>
            <a 
              href="/players" 
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                location === "/players" 
                  ? "text-[#DC143C] bg-red-50" 
                  : "text-gray-700 hover:text-[#DC143C] hover:bg-gray-50"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Players
            </a>
            <a 
              href="/chores" 
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                location === "/chores" 
                  ? "text-[#DC143C] bg-red-50" 
                  : "text-gray-700 hover:text-[#DC143C] hover:bg-gray-50"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Housing
            </a>
            <a 
              href="/food-orders" 
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                location === "/food-orders" 
                  ? "text-[#DC143C] bg-red-50" 
                  : "text-gray-700 hover:text-[#DC143C] hover:bg-gray-50"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Groceries
            </a>
            <a 
              href="/communications" 
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                location === "/communications" 
                  ? "text-[#DC143C] bg-red-50" 
                  : "text-gray-700 hover:text-[#DC143C] hover:bg-gray-50"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Messages
            </a>
            <a 
              href="/calendar" 
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                location === "/calendar" 
                  ? "text-[#DC143C] bg-red-50" 
                  : "text-gray-700 hover:text-[#DC143C] hover:bg-gray-50"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Calendar
            </a>

            {isAdmin && (
              <>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Admin
                  </p>
                  <a 
                    href="/admin/users" 
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      location === "/admin/users" 
                        ? "text-[#DC143C] bg-red-50" 
                        : "text-gray-700 hover:text-[#DC143C] hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    User Management
                  </a>
                  <a 
                    href="/admin/members" 
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      location === "/admin/members" 
                        ? "text-[#DC143C] bg-red-50" 
                        : "text-gray-700 hover:text-[#DC143C] hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Member Management
                  </a>
                </div>
              </>
            )}

            <div className="border-t border-gray-200 pt-3 mt-3">
              <a 
                href="/logout" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Out
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}