export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12">
              <svg viewBox="0 0 200 300" className="w-full h-full">
                {/* Main red circle background */}
                <circle cx="100" cy="100" r="90" fill="#DC143C" stroke="#000000" strokeWidth="3"/>
                
                {/* White inner circle */}
                <circle cx="100" cy="100" r="70" fill="white"/>
                
                {/* "1.FC" text */}
                <text x="100" y="75" textAnchor="middle" fill="#DC143C" fontSize="18" fontWeight="bold" fontFamily="Arial, sans-serif">1.FC</text>
                
                {/* "KÖLN" text */}
                <text x="100" y="95" textAnchor="middle" fill="#DC143C" fontSize="14" fontWeight="bold" fontFamily="Arial, sans-serif">KÖLN</text>
                
                {/* Goat silhouette - based on FC Köln's iconic mascot */}
                <g fill="#000000" transform="translate(60,110)">
                  {/* Goat body */}
                  <path d="M20 40 Q30 35 50 35 Q70 35 80 40 L80 60 Q70 65 50 65 Q30 65 20 60 Z"/>
                  
                  {/* Goat head */}
                  <path d="M35 25 Q40 15 45 12 Q50 10 55 12 Q60 15 65 25 Q65 35 60 40 Q50 45 40 40 Q35 35 35 25"/>
                  
                  {/* Goat horns */}
                  <path d="M42 15 L38 5 Q37 2 38 0 M58 15 L62 5 Q63 2 62 0" stroke="#000000" strokeWidth="2" fill="none"/>
                  
                  {/* Goat ears */}
                  <ellipse cx="40" cy="22" rx="3" ry="8" transform="rotate(-20 40 22)"/>
                  <ellipse cx="60" cy="22" rx="3" ry="8" transform="rotate(20 60 22)"/>
                  
                  {/* Goat legs */}
                  <rect x="30" y="60" width="4" height="20"/>
                  <rect x="40" y="60" width="4" height="20"/>
                  <rect x="56" y="60" width="4" height="20"/>
                  <rect x="66" y="60" width="4" height="20"/>
                  
                  {/* Goat tail */}
                  <path d="M80 50 Q85 45 90 50 Q85 55 80 50" fill="#000000"/>
                </g>
                
                {/* Red banner at bottom - "FOOTBALL SCHOOL" */}
                <rect x="20" y="220" width="160" height="40" fill="#DC143C"/>
                <text x="100" y="245" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial, sans-serif">FOOTBALL SCHOOL</text>
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
