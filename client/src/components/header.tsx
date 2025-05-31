export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-fc-red rounded-full flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-8 h-8 text-white">
                {/* FC Köln logo - simplified version */}
                <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="20" cy="20" r="12" fill="none" stroke="currentColor" strokeWidth="1"/>
                <text x="20" y="17" textAnchor="middle" fontSize="6" fill="currentColor" fontWeight="bold">FC</text>
                <text x="20" y="25" textAnchor="middle" fontSize="4" fill="currentColor">KÖLN</text>
                {/* Goat head silhouette - simplified */}
                <path d="M15 10 Q20 8 25 10 Q25 15 20 16 Q15 15 15 10" fill="currentColor" opacity="0.3"/>
              </svg>
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
          </div>
        </div>
      </div>
    </header>
  );
}
