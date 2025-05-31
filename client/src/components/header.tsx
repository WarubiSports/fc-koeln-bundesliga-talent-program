export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <svg viewBox="0 0 120 120" className="w-full h-full">
                {/* Red circle background */}
                <circle cx="60" cy="60" r="55" fill="#DC143C" stroke="#000" strokeWidth="2"/>
                
                {/* White text "1.FC" */}
                <text x="60" y="45" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">1.FC</text>
                
                {/* White text "KÖLN" */}
                <text x="60" y="65" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">KÖLN</text>
                
                {/* Goat silhouette */}
                <g transform="translate(30,75)" fill="black">
                  {/* Goat body and legs */}
                  <path d="M10 15 Q15 12 25 12 Q35 12 40 15 L40 25 Q35 28 25 28 Q15 28 10 25 Z"/>
                  {/* Goat head */}
                  <path d="M20 5 Q25 2 30 5 Q32 8 30 12 Q25 15 20 12 Q18 8 20 5"/>
                  {/* Horns */}
                  <path d="M22 5 L20 0 M28 5 L30 0" stroke="black" strokeWidth="1" fill="none"/>
                  {/* Legs */}
                  <rect x="22" y="25" width="2" height="8"/>
                  <rect x="26" y="25" width="2" height="8"/>
                </g>
                
                {/* Red banner at bottom */}
                <rect x="10" y="95" width="100" height="15" fill="#DC143C"/>
                <text x="60" y="105" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">FOOTBALL SCHOOL</text>
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
