import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12">
              <img 
                src="https://germany-socceracademy.com/wp-content/uploads/2023/09/NewCologneLogo.png" 
                alt="1.FC Köln" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-fc-dark">1.FC Köln</h1>
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
            <a href="#teams" className="text-gray-700 hover:text-fc-red transition-colors pb-4">
              Teams
            </a>
            <a href="#analytics" className="text-gray-700 hover:text-fc-red transition-colors pb-4">
              Analytics
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-fc-red transition-colors">
              <i className="fas fa-bell text-lg"></i>
            </button>
            <div className="w-8 h-8 bg-fc-red rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">CL</span>
            </div>
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
                href="#teams"
                className="block px-3 py-2 text-gray-700 hover:text-fc-red hover:bg-gray-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Teams
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
