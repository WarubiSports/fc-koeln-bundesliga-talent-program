export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12">
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/1/15/FC_K%C3%B6ln_logo.svg" 
                alt="1.FC Köln" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement.innerHTML = '<div class="w-12 h-12 bg-fc-red rounded-full flex items-center justify-center"><span class="text-white font-bold text-sm">FC</span></div>';
                }}
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
