import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin } = useAuth();

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
          
          <nav className="hidden md:flex space-x-8">
            <a href="/dashboard" className="text-fc-red font-medium border-b-2 border-fc-red pb-4">
              Dashboard
            </a>
            <a href="/chores" className="text-gray-700 hover:text-fc-red transition-colors pb-4">
              Chores
            </a>
            <a href="/calendar" className="text-gray-700 hover:text-fc-red transition-colors pb-4">
              Calendar
            </a>
            <a href="#analytics" className="text-gray-700 hover:text-fc-red transition-colors pb-4">
              Analytics
            </a>
          </nav>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName || user?.email || "User"}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {isAdmin ? "Admin" : "Player"}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-fc-red rounded-full flex items-center justify-center">
                    {user?.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <i className="fas fa-user text-white text-sm"></i>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/api/logout'}
                  className="border-fc-red text-fc-red hover:bg-fc-red hover:text-white"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => window.location.href = '/api/login'}
                className="bg-fc-red hover:bg-fc-red/90 text-white"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                Login
              </Button>
            )}
            
            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-600 hover:text-fc-red"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a
                href="/dashboard"
                className="block px-3 py-2 text-fc-red font-medium bg-fc-red/10 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </a>
              <a
                href="/chores"
                className="block px-3 py-2 text-gray-700 hover:text-fc-red hover:bg-gray-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Chores
              </a>
              <a
                href="/calendar"
                className="block px-3 py-2 text-gray-700 hover:text-fc-red hover:bg-gray-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Calendar
              </a>
              <a
                href="#analytics"
                className="block px-3 py-2 text-gray-700 hover:text-fc-red hover:bg-gray-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Analytics
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}