import { useState } from 'react';
import { ChevronRight, ClipboardList, ShieldCheck, Award, GraduationCap, CheckCircle2, Play, X, Check, Wand2, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

const moves = [
  "Lukas M. — Cologne to NCAA D1",
  "Sarah K. — Regional League to NCAA D2",
  "Matteo R. — ITP Cologne to US JUCO",
  "Coach David — UEFA B License Acquired",
  "Felix B. — U19 Bundesliga to NAIA",
  "Jonas W. — Showcase Cologne to D1 Offer",
  "Amelie S. — Bayernliga to NCAA D1",
  "ITP Cohort '23 — 100% Placement Rate"
];

interface VideoCardProps {
  title: string;
  caption: string;
  thumbnailUrl: string;
  youtubeId?: string;
  placeholder?: boolean;
  className?: string;
  hideText?: boolean;
}

const VideoCard = ({ 
  title, 
  thumbnailUrl, 
  youtubeId, 
  placeholder = false,
  className = "",
}: VideoCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = (e: React.MouseEvent) => {
    if (youtubeId && !placeholder) {
      e.preventDefault();
      e.stopPropagation();
      setIsPlaying(true);
    }
  };

  return (
    <div 
      className={`group/video flex flex-col gap-4 w-full relative ${className} ${youtubeId && !placeholder ? 'cursor-pointer' : ''}`} 
      onClick={handlePlay}
    >
      <div className="relative w-full aspect-video bg-neutral-100 overflow-hidden shadow-sm transition-shadow duration-500 rounded-none md:rounded-t-2xl lg:rounded-none isolate">
        {isPlaying && youtubeId ? (
          <iframe
            className="w-full h-full object-cover relative z-30"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <button
            type="button"
            className="absolute inset-0 w-full h-full p-0 border-0 focus:outline-none text-left z-20"
            onClick={handlePlay}
            aria-label={youtubeId ? `Play video: ${title}` : title}
            disabled={!youtubeId || placeholder}
          >
            <div className="absolute inset-0 z-0">
              <img 
                src={thumbnailUrl} 
                alt="" 
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/video:scale-105 will-change-transform" 
              />
              <div className="absolute inset-0 bg-neutral-900/10 group-hover/video:bg-neutral-900/20 transition-colors duration-500" />
            </div>

            {!placeholder && youtubeId && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover/video:scale-110 group-hover/video:bg-white transition-all duration-300 ease-out">
                  <Play className="w-6 h-6 text-neutral-900 ml-1 fill-neutral-900" />
                </div>
              </div>
            )}

            {placeholder && (
              <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-md text-neutral-900 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                  Coming Soon
                </span>
              </div>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

const PathwayCard = ({ 
  category,
  title, 
  subtitle, 
  link,
  children,
}: { 
  category: string;
  title: string; 
  subtitle: string; 
  link: string;
  children?: React.ReactNode;
}) => {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-neutral-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group w-full">
      <div className="w-full relative bg-neutral-100">
        {children}
      </div>

      <div className="p-6 md:p-8 flex flex-col flex-grow relative bg-white">
        <div className="mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-red-50 text-red-600/80">
            {category}
          </span>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2 leading-tight">
            {title}
          </h2>
          <p className="text-neutral-500 font-medium text-sm leading-relaxed">
            {subtitle}
          </p>
        </div>

        <a 
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto pt-6 border-t border-neutral-100 flex items-center justify-between cursor-pointer"
          data-testid={`link-explore-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider group-hover:text-neutral-900 transition-colors">
            Explore Pathway
          </span>
          <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center group-hover:bg-red-500 transition-colors duration-300">
            <ChevronRight size={16} className="text-neutral-400 group-hover:text-white transition-colors" />
          </div>
        </a>
      </div>
    </div>
  );
};

const Badge = ({ icon, label, color, bg, border }: { icon: React.ReactNode, label: string, color: string, bg: string, border: string }) => (
  <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full border ${bg} ${border} ${color} transition-transform hover:scale-105`}>
    {icon}
    <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
  </div>
);

const Stat = ({ number, label }: { number: string, label: string }) => (
  <div className="text-center">
    <div className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight leading-none mb-1">{number}</div>
    <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{label}</div>
  </div>
);

const Credibility = () => {
  return (
    <div className="w-full mb-12 md:mb-16">
      <div className="bg-white rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 md:p-10 flex flex-col xl:flex-row items-center justify-between gap-8 xl:gap-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-neutral-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-10" />

        <div className="flex items-start gap-5 w-full xl:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-neutral-900 flex items-center justify-center shrink-0 shadow-lg shadow-neutral-900/20 text-white">
             <ShieldCheck size={28} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-900 leading-tight">
              Verified Elite Agency
            </h3>
            <p className="text-sm text-neutral-500 font-medium mt-1 leading-relaxed max-w-sm">
              Official partner for players and coaches. Bridging the gap between German football and global opportunities since 2012.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 md:gap-4 w-full xl:w-auto">
           <Badge icon={<Award size={16} />} label="UEFA Licensed" color="text-blue-600" bg="bg-blue-50" border="border-blue-100" />
           <Badge icon={<GraduationCap size={16} />} label="NCAA Certified" color="text-red-600" bg="bg-red-50" border="border-red-100" />
           <Badge icon={<CheckCircle2 size={16} />} label="DFB Network" color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-100" />
        </div>

        <div className="flex items-center gap-8 md:gap-12 border-t xl:border-t-0 xl:border-l border-neutral-100 pt-6 xl:pt-0 xl:pl-12 w-full xl:w-auto justify-around xl:justify-end">
           <Stat number="10+" label="Years" />
           <Stat number="500+" label="Placed" />
           <Stat number="100%" label="Transparency" />
        </div>
      </div>
    </div>
  );
};

const Ticker = () => {
  return (
    <div className="w-full bg-white border-y border-neutral-100 py-6 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 text-center">Recent Moves</h3>
      </div>
      <div className="relative w-full flex overflow-hidden whitespace-nowrap">
        <div className="animate-marquee flex gap-12 items-center">
          {[...moves, ...moves, ...moves].map((move, idx) => (
            <span key={idx} className="text-lg font-light text-neutral-600 inline-block">
              {move}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

interface IntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const IntakeModal = ({ isOpen, onClose }: IntakeModalProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    role: 'Player',
    name: '',
    email: '',
    age: '',
    goals: [] as string[],
    currentLevel: '',
    budget: '',
    gradYear: '',
    gapYear: false,
  });

  if (!isOpen) return null;

  const fillDemoData = () => {
    setFormData({
      role: 'Player',
      name: 'Julian Tester',
      email: 'julian.test@warubi.com',
      age: '18',
      goals: ['US College Soccer', 'Pro Academy in Europe'],
      currentLevel: 'U19 Regional League',
      budget: 'flexible',
      gradYear: '2025',
      gapYear: true,
    });
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal) 
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      role: formData.role,
      name: formData.name,
      email: formData.email,
      age: formData.age || undefined,
      gradYear: formData.gradYear || undefined,
      goals: formData.goals.length > 0 ? formData.goals : undefined,
      currentLevel: formData.currentLevel || undefined,
      budgetPreference: formData.budget || undefined,
      gapYearInterest: formData.gapYear,
    };

    console.log('Submitting lead:', payload);

    try {
      const response = await fetch('/public/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form');
      }

      setStep(2);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 transition-colors z-10 text-neutral-500 hover:text-neutral-900"
          data-testid="button-close-modal"
        >
          <X size={20} />
        </button>

        {step === 1 ? (
          <div className="flex flex-col overflow-y-auto">
            <div className="p-8 md:p-10 pb-0 flex justify-between items-start shrink-0">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
                    Find your perfect pathway
                  </h2>
                  <button 
                    onClick={fillDemoData}
                    className="p-1.5 text-neutral-200 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                    title="Fill Demo Data"
                    data-testid="button-fill-demo"
                  >
                    <Wand2 size={16} />
                  </button>
                </div>
                <p className="text-neutral-500 font-light">
                  Tell us a bit about yourself so we can recommend the best route for your development.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-sm font-semibold uppercase tracking-wider text-neutral-400">I am a</label>
                <div className="flex gap-4">
                  {['Player', 'Coach', 'Parent'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData({...formData, role: r})}
                      className={`flex-1 py-3 rounded-xl border font-medium transition-all duration-200 ${
                        formData.role === r 
                          ? 'border-red-600 bg-red-50 text-red-700' 
                          : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                      }`}
                      data-testid={`button-role-${r.toLowerCase()}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-900">Name</label>
                  <input 
                    type="text" 
                    placeholder="Your Full Name"
                    required
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    data-testid="input-name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-900">Email</label>
                  <input 
                    type="email" 
                    placeholder="you@example.com"
                    required
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-900">Age</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 17"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    data-testid="input-age"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-900">Graduation Year</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 2025"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    value={formData.gradYear}
                    onChange={(e) => setFormData({...formData, gradYear: e.target.value})}
                    data-testid="input-grad-year"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-neutral-900">Primary Goals <span className="text-neutral-400 font-normal">(Select all that apply)</span></label>
                <div className="flex flex-wrap gap-3">
                  {['US College Soccer', 'Pro Academy in Europe', 'Semi-Pro Level', 'Coaching License', 'Gap Year Experience'].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => handleGoalToggle(goal)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                        formData.goals.includes(goal)
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                      }`}
                      data-testid={`button-goal-${goal.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-900">Current Level / League</label>
                <input 
                  type="text" 
                  placeholder="e.g. U19 Bundesliga, Regional League, High School Varsity..."
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  value={formData.currentLevel}
                  onChange={(e) => setFormData({...formData, currentLevel: e.target.value})}
                  data-testid="input-current-level"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-900">Development Investment Preference</label>
                <div className="relative">
                  <select 
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-neutral-700"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    data-testid="select-budget"
                  >
                    <option value="" disabled>Select the best fit...</option>
                    <option value="scholarship">Seeking full scholarship opportunities</option>
                    <option value="flexible">Flexible budget for quality development</option>
                    <option value="premium">Open to premium, full-service programs</option>
                    <option value="unsure">Not sure yet / Need guidance</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                    <ChevronRight size={16} className="rotate-90" />
                  </div>
                </div>
                <p className="text-xs text-neutral-400 mt-1">This helps us understand which program types are realistic options for you.</p>
              </div>

              <div className="flex items-center gap-3 p-4 border border-neutral-100 rounded-xl bg-neutral-50/50">
                <div 
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${formData.gapYear ? 'bg-green-500' : 'bg-neutral-300'}`}
                  onClick={() => setFormData({...formData, gapYear: !formData.gapYear})}
                  data-testid="toggle-gap-year"
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${formData.gapYear ? 'translate-x-6' : ''}`} />
                </div>
                <span className="text-sm font-medium text-neutral-700">Interested in a Gap Year?</span>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-red-700 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-submit-intake"
              >
                {isSubmitting ? 'Submitting...' : 'Analyze my options'}
              </button>
            </form>
          </div>
        ) : (
          <div className="p-8 md:p-12 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm shrink-0">
              <Check size={28} strokeWidth={3} />
            </div>
            <h3 className="text-3xl font-bold text-neutral-900 mb-2">You're all set!</h3>
            <p className="text-neutral-500 mb-8">We've analyzed your profile.</p>
            
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 md:p-8 mb-8 w-full max-w-lg shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden shrink-0 group hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow duration-500">
               <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 to-red-500"></div>
              
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Your Recommended Focus</p>
              
              <p className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight mb-2">
                 {formData.role === 'Coach' ? 'Coaching Pathway' : 'College & Development'}
              </p>
              
              <div className="text-sm font-medium text-neutral-400 mb-6">
                 Based on your goal: <span className="text-neutral-900">{formData.goals[0] || 'Player Development'}</span>
              </div>

              <div className="bg-neutral-50 rounded-xl p-5 text-left border border-neutral-100">
                <p className="text-sm text-neutral-600 leading-relaxed">
                  <span className="font-bold text-neutral-900 block mb-1">Why this fits you:</span>
                  {formData.role === 'Coach' 
                    ? "Getting licensed in Germany while gaining practical experience solves the 'lack of access' problem many coaches face. This pathway builds immediate credibility."
                    : "This route addresses the common risk of 'all-or-nothing' trials. It provides a high-level competitive environment while securing your long-term future through education or structured development."
                  }
                </p>
              </div>
            </div>

            <p className="text-sm text-neutral-400 mb-8 max-w-sm mx-auto">
              A WARUBI expert will review your details and reach out to <span className="font-semibold text-neutral-900">{formData.email}</span> shortly with specific examples.
            </p>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-black transition-colors shadow-xl shadow-neutral-900/10 shrink-0"
              data-testid="button-back-to-pathways"
            >
              Back to Pathways
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Pathways() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col font-sans text-neutral-900 selection:bg-red-100 relative">
      
      <IntakeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="absolute inset-0 opacity-[0.4] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      <header className="relative pt-8 pb-12 px-6 max-w-4xl mx-auto z-10 w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-8 group" data-testid="link-back-home">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to ExposureEngine</span>
        </Link>
        
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-neutral-900 mb-4 uppercase">
            WARUBI <span className="text-red-600">Elite</span> <br className="hidden md:block"/> Player Pathways
          </h1>
          <p className="text-lg md:text-xl text-neutral-500 font-medium max-w-2xl mx-auto mb-8">
            Choose a pathway to explore real examples and stories.
          </p>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-neutral-200 shadow-sm rounded-full text-neutral-900 font-semibold hover:shadow-md hover:border-red-200 hover:text-red-600 transition-all duration-300 group"
            data-testid="button-find-pathway"
          >
            <ClipboardList size={18} className="text-neutral-400 group-hover:text-red-500 transition-colors" />
            <span>Find your perfect pathway</span>
          </button>
        </div>
      </header>

      <main className="relative flex-grow w-full max-w-[1400px] mx-auto px-4 md:px-8 pb-20 z-10">
        <Credibility />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          <PathwayCard 
            category="Pathway 01"
            title="College Pathway" 
            subtitle="Realistic placement to NCAA and NAIA universities with long-term development."
            link="https://warubi-sports.com/college-scholarships/"
          >
            <VideoCard 
              title="Avery - College Pathway Story"
              caption="From Europe to US college"
              thumbnailUrl="https://img.youtube.com/vi/26iGcbEljI8/maxresdefault.jpg"
              youtubeId="26iGcbEljI8"
              hideText={true}
              className="rounded-none"
            />
          </PathwayCard>

          <PathwayCard 
            category="Pathway 02"
            title="Development in Europe" 
            subtitle="Full season training and playing opportunities in top German environments."
            link="https://warubi-sports.com/3-german-soccer-academy-facts/"
          >
            <VideoCard 
              title="ITP Cologne"
              caption="Full season development example"
              thumbnailUrl="https://img.youtube.com/vi/dyiMulYAzdo/maxresdefault.jpg"
              youtubeId="dyiMulYAzdo"
              hideText={true}
              className="rounded-none"
            />
          </PathwayCard>

          <PathwayCard 
            category="Pathway 03"
            title="UEFA & German FA Coaching" 
            subtitle="Official licenses and hands-on coaching experience in German academies."
            link="https://warubi-sports.com/uefa-coaching-license-course/"
          >
            <VideoCard 
              title="UEFA Coaching Story"
              caption="How coaches use WARUBI to progress"
              thumbnailUrl="https://img.youtube.com/vi/kP3KuKfHYKs/maxresdefault.jpg"
              youtubeId="kP3KuKfHYKs"
              hideText={true}
              className="rounded-none"
            />
          </PathwayCard>

          <PathwayCard 
            category="Pathway 04"
            title="Exposure Events" 
            subtitle="High-level showcases and ID camps for direct scouting opportunities."
            link="https://germany-socceracademy.com/tryouts-id-camps/"
          >
            <VideoCard 
              title="Showcase Cologne"
              caption="High level scouting event in Cologne"
              thumbnailUrl="https://img.youtube.com/vi/BPwV72OJbdE/maxresdefault.jpg"
              youtubeId="BPwV72OJbdE"
              hideText={true}
              className="rounded-none"
            />
          </PathwayCard>
        </div>
      </main>
      
      <Ticker />

      <footer className="relative py-12 text-center border-t border-neutral-200 bg-white z-10">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm font-medium text-neutral-400 uppercase tracking-widest">
            Start your journey
          </p>
          <a 
            href="mailto:contact@warubi-sports.com" 
            className="text-lg font-bold text-neutral-900 border-b-2 border-transparent hover:border-red-500 transition-colors"
            data-testid="link-contact-email"
          >
            Contact WARUBI
          </a>
        </div>
      </footer>
    </div>
  );
}
