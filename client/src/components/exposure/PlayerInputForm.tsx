import { useState, useEffect, useRef } from 'react';
import type { PlayerProfile, SeasonStat, ExposureEvent, Position, YouthLeague } from '../../../../shared/exposure-types';
import { LEAGUES, POSITIONS, ATHLETIC_RATINGS } from '../../../../shared/exposure-types';
import { Plus, Trash2, ChevronRight, Video, Zap, Check, ChevronsUpDown, Lightbulb, ChevronDown, User, GraduationCap } from 'lucide-react';

interface Props {
  onSubmit: (profile: PlayerProfile) => void;
  isLoading: boolean;
}

const Label = ({ children }: { children?: React.ReactNode }) => (
  <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1.5 font-mono">{children}</label>
);

const SectionHeader = ({ step, title, icon: Icon }: { step: string, title: string, icon: any }) => (
  <div className="flex items-center mb-6 pb-4 border-b border-slate-200 dark:border-white/5">
    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mr-3 font-mono text-sm font-bold">
      {step}
    </div>
    <h3 className="text-lg font-medium text-slate-900 dark:text-white flex items-center">
      {title}
      <Icon className="w-4 h-4 ml-2 text-slate-400 dark:text-slate-500" />
    </h3>
  </div>
);

const LeagueMultiSelect = ({ selected, onChange }: { selected: YouthLeague[], onChange: (leagues: YouthLeague[]) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLeague = (league: YouthLeague) => {
    if (selected.includes(league)) {
      onChange(selected.filter(l => l !== league));
    } else {
      onChange([...selected, league]);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700/50 rounded-lg p-2.5 text-sm text-left text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all hover:border-slate-400 dark:hover:border-slate-600 flex justify-between items-center group"
        data-testid="button-league-select"
      >
        <span className="truncate block pr-6">
          {selected.length > 0 
            ? selected.map(l => l.replace(/_/g, ' ')).join(', ') 
            : <span className="text-slate-400 dark:text-slate-500">Select Leagues...</span>}
        </span>
        <ChevronsUpDown className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 absolute right-2.5" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {LEAGUES.map((league) => (
            <div
              key={league}
              onClick={() => toggleLeague(league)}
              className="flex items-center px-3 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-0"
              data-testid={`option-league-${league}`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 transition-colors ${selected.includes(league) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950'}`}>
                {selected.includes(league) && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className={`text-sm ${selected.includes(league) ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                {league.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DEMO_PROFILES: Record<string, Partial<PlayerProfile>> = {
  "Blue Chip D1 (MLS NEXT)": {
    firstName: 'Alex', lastName: 'Romero', gender: 'Male', position: 'CM', gradYear: 2026,
    experienceLevel: 'Youth_Club_Only', videoLink: true, coachesContacted: 25, responsesReceived: 8, offersReceived: 1,
    academics: { graduationYear: 2026, gpa: 3.6, testScore: '1250 SAT' },
    athleticProfile: { speed: 'Elite', strength: 'Top_10_Percent', endurance: 'Elite', workRate: 'Elite', technical: 'Elite', tactical: 'Top_10_Percent' },
    seasons: [{ year: 2024, teamName: 'LA Galaxy Academy', league: ['MLS_NEXT'], minutesPlayedPercent: 90, mainRole: 'Key_Starter', goals: 8, assists: 12, honors: 'All-American' }]
  },
  "Solid Recruit (ECNL)": {
    firstName: 'Liam', lastName: 'Smith', gender: 'Male', position: 'CB', gradYear: 2026,
    experienceLevel: 'Youth_Club_Only', videoLink: true, coachesContacted: 15, responsesReceived: 2, offersReceived: 0,
    academics: { graduationYear: 2026, gpa: 3.2, testScore: '1100 SAT' },
    athleticProfile: { speed: 'Above_Average', strength: 'Top_10_Percent', endurance: 'Above_Average', workRate: 'Top_10_Percent', technical: 'Above_Average', tactical: 'Top_10_Percent' },
    seasons: [{ year: 2024, teamName: 'Mustang SC', league: ['ECNL'], minutesPlayedPercent: 85, mainRole: 'Key_Starter', goals: 3, assists: 1, honors: '1st Team All-Conference' }]
  },
  "High Academic D3 (ECNL RL)": {
    firstName: 'Emma', lastName: 'Davis', gender: 'Female', position: 'DM', gradYear: 2025,
    experienceLevel: 'Youth_Club_Only', videoLink: true, coachesContacted: 40, responsesReceived: 12, offersReceived: 2,
    academics: { graduationYear: 2025, gpa: 4.0, testScore: '1450 SAT' },
    athleticProfile: { speed: 'Average', strength: 'Average', endurance: 'Above_Average', workRate: 'Top_10_Percent', technical: 'Above_Average', tactical: 'Top_10_Percent' },
    seasons: [{ year: 2024, teamName: 'Crossfire', league: ['ECNL_RL'], minutesPlayedPercent: 95, mainRole: 'Key_Starter', goals: 2, assists: 6, honors: 'Scholar Athlete' }]
  },
  "JUCO Route (Academic Risk)": {
    firstName: 'Jayden', lastName: 'Williams', gender: 'Male', position: '9', gradYear: 2025,
    experienceLevel: 'Youth_Club_Only', videoLink: true, coachesContacted: 5, responsesReceived: 0, offersReceived: 0,
    academics: { graduationYear: 2025, gpa: 2.1, testScore: '' },
    athleticProfile: { speed: 'Elite', strength: 'Elite', endurance: 'Average', workRate: 'Average', technical: 'Top_10_Percent', tactical: 'Above_Average' },
    seasons: [{ year: 2024, teamName: 'Top Academy', league: ['MLS_NEXT'], minutesPlayedPercent: 70, mainRole: 'Key_Starter', goals: 15, assists: 2, honors: 'Top Scorer' }]
  },
  "The Ghost (No Video)": {
    firstName: 'Chris', lastName: 'Invisible', gender: 'Male', position: 'WB', gradYear: 2026,
    experienceLevel: 'Youth_Club_Only', videoLink: false, coachesContacted: 0, responsesReceived: 0, offersReceived: 0,
    academics: { graduationYear: 2026, gpa: 3.5, testScore: '' },
    athleticProfile: { speed: 'Elite', strength: 'Average', endurance: 'Top_10_Percent', workRate: 'Elite', technical: 'Above_Average', tactical: 'Average' },
    seasons: [{ year: 2024, teamName: 'ECNL Team', league: ['ECNL'], minutesPlayedPercent: 90, mainRole: 'Key_Starter', goals: 5, assists: 8, honors: '' }]
  }
};

export default function PlayerInputForm({ onSubmit, isLoading }: Props) {
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(10);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const demoRef = useRef<HTMLDivElement>(null);
  
  const loadingTips = [
    "Did you know? Over 70% of D1 scholarships are committed before senior year begins.",
    "Coaches spend an average of 3 minutes watching a highlight tape. The first 30 seconds are critical.",
    "D3 schools do not offer athletic scholarships, but 80% of D3 athletes receive academic aid.",
    "A 3.5+ GPA opens up 40% more roster spots than a 2.5 GPA.",
    "Personalized emails to coaches have a 5x higher response rate than generic blasts.",
    "There are over 1,200 colleges offering men's soccer, but only 205 are NCAA Division 1."
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      interval = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % loadingTips.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (demoRef.current && !demoRef.current.contains(event.target as Node)) {
        setIsDemoOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [profile, setProfile] = useState<PlayerProfile>({
    firstName: '',
    lastName: '',
    gender: 'Male',
    dateOfBirth: '',
    citizenship: '',
    experienceLevel: 'Youth_Club_Only',
    position: 'CM',
    secondaryPositions: [],
    dominantFoot: 'Right',
    height: '5\'10"',
    gradYear: 2026,
    state: '',
    videoLink: false,
    coachesContacted: 0,
    responsesReceived: 0,
    offersReceived: 0,
    academics: {
      graduationYear: 2026,
      gpa: 3.0,
      testScore: ''
    },
    athleticProfile: {
      speed: 'Average',
      strength: 'Average',
      endurance: 'Average',
      workRate: 'Average',
      technical: 'Average',
      tactical: 'Average'
    },
    seasons: [
      {
        year: 2024,
        teamName: '',
        league: ['ECNL'],
        minutesPlayedPercent: 80,
        mainRole: 'Key_Starter',
        goals: 0,
        assists: 0,
        honors: ''
      }
    ],
    events: []
  });

  useEffect(() => {
    setProfile(prev => ({ ...prev, height: `${heightFt}'${heightIn}"` }));
  }, [heightFt, heightIn]);

  const handleInputChange = (field: keyof PlayerProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleAcademicChange = (field: keyof typeof profile.academics, value: any) => {
    setProfile(prev => ({
      ...prev,
      academics: { ...prev.academics, [field]: value }
    }));
  };

  const handleAthleticChange = (field: keyof typeof profile.athleticProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      athleticProfile: { ...prev.athleticProfile, [field]: value }
    }));
  };

  const toggleSecondaryPosition = (pos: Position) => {
    setProfile(prev => {
      const current = prev.secondaryPositions || [];
      if (current.includes(pos)) {
        return { ...prev, secondaryPositions: current.filter(p => p !== pos) };
      }
      if (current.length >= 2) return prev;
      return { ...prev, secondaryPositions: [...current, pos] };
    });
  };

  const updateSeason = (index: number, field: keyof SeasonStat, value: any) => {
    const newSeasons = [...profile.seasons];
    (newSeasons[index] as any)[field] = value;
    setProfile(prev => ({ ...prev, seasons: newSeasons }));
  };

  const addSeason = () => {
    setProfile(prev => ({
      ...prev,
      seasons: [
        ...prev.seasons,
        {
          year: prev.seasons[prev.seasons.length - 1].year - 1,
          teamName: '',
          league: ['High_School'],
          minutesPlayedPercent: 50,
          mainRole: 'Rotation',
          goals: 0,
          assists: 0,
          honors: ''
        }
      ]
    }));
  };

  const removeSeason = (index: number) => {
    setProfile(prev => ({
      ...prev,
      seasons: prev.seasons.filter((_, i) => i !== index)
    }));
  };

  const fillDemoData = (key: string) => {
    const demoData = DEMO_PROFILES[key];
    if (!demoData) return;

    setHeightFt(5);
    setHeightIn(10);
    setProfile(prev => ({
      ...prev,
      ...demoData,
      state: 'California',
      citizenship: 'USA',
      dateOfBirth: '2007-06-15',
      secondaryPositions: [],
      events: [
        { name: 'Surf Cup', type: 'Showcase', collegesNoted: 'Local Colleges' }
      ]
    }));
    setIsDemoOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(profile);
  };

  const inputClass = "w-full bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700/50 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 hover:border-slate-400 dark:hover:border-slate-600";
  const selectClass = "w-full bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700/50 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer hover:border-slate-400 dark:hover:border-slate-600";

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-8 md:p-12 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg text-center animate-fadeInUp">
        <div className="w-16 h-16 mx-auto mb-6 relative">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin"></div>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Analyzing Your Profile...</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Our AI is calculating your visibility across D1-JUCO levels</p>
        
        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-4 flex items-start gap-3 text-left">
          <Lightbulb className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600 dark:text-slate-300">{loadingTips[currentTipIndex]}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
      <div className="flex justify-end relative" ref={demoRef}>
        <button 
          type="button"
          onClick={() => setIsDemoOpen(!isDemoOpen)}
          className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
          data-testid="button-demo-profiles"
        >
           <Zap className="w-3.5 h-3.5 text-emerald-500 group-hover:animate-pulse" />
           <span>Load Demo Profile</span>
           <ChevronDown className={`w-3 h-3 transition-transform ${isDemoOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDemoOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden">
            <div className="py-1">
              {Object.keys(DEMO_PROFILES).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => fillDemoData(key)}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-0"
                  data-testid={`button-demo-${key.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg dark:shadow-black/20">
        <SectionHeader step="01" title="Player Bio & Physical" icon={User} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <Label>First Name</Label>
            <input type="text" required className={inputClass} placeholder="e.g. John" value={profile.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} data-testid="input-first-name" />
          </div>
          <div>
            <Label>Last Name</Label>
            <input type="text" required className={inputClass} placeholder="e.g. Doe" value={profile.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} data-testid="input-last-name" />
          </div>
          <div>
            <Label>Gender</Label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => handleInputChange('gender', 'Male')} className={`py-2.5 text-sm rounded-lg border transition-all ${profile.gender === 'Male' ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'bg-white dark:bg-slate-950/50 border-slate-300 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'}`} data-testid="button-gender-male">Male</button>
              <button type="button" onClick={() => handleInputChange('gender', 'Female')} className={`py-2.5 text-sm rounded-lg border transition-all ${profile.gender === 'Female' ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'bg-white dark:bg-slate-950/50 border-slate-300 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'}`} data-testid="button-gender-female">Female</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <Label>HS Grad Year</Label>
            <input type="number" min={2024} max={2030} required className={`${inputClass} font-mono`} value={profile.gradYear || ''} onChange={(e) => { const val = parseInt(e.target.value); const newVal = isNaN(val) ? 0 : val; handleInputChange('gradYear', newVal); handleAcademicChange('graduationYear', newVal); }} data-testid="input-grad-year" />
          </div>
          <div>
            <Label>Date of Birth</Label>
            <input type="date" required className={`${inputClass} font-mono`} value={profile.dateOfBirth} onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} data-testid="input-dob" />
          </div>
          <div>
            <Label>State / Region</Label>
            <input type="text" placeholder="e.g. SoCal, TX" required className={inputClass} value={profile.state} onChange={(e) => handleInputChange('state', e.target.value)} data-testid="input-state" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label>Nationality / Citizenship</Label>
            <input type="text" placeholder="e.g. USA, Germany" className={inputClass} value={profile.citizenship} onChange={(e) => handleInputChange('citizenship', e.target.value)} data-testid="input-citizenship" />
          </div>
          <div>
            <Label>Experience Level</Label>
            <select className={selectClass} value={profile.experienceLevel} onChange={(e) => handleInputChange('experienceLevel', e.target.value)} data-testid="select-experience">
              <option value="Youth_Club_Only">Youth Club Only</option>
              <option value="High_School_Varsity">High School Varsity</option>
              <option value="Adult_Amateur_League">Adult Amateur League</option>
              <option value="Semi_Pro_UPSL_NPSL_WPSL">Semi-Pro (UPSL/NPSL/WPSL)</option>
              <option value="International_Academy_U19">International Academy U19</option>
              <option value="Pro_Academy_Reserve">Pro Academy / Reserve</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <Label>Primary Position</Label>
            <select className={selectClass} value={profile.position} onChange={(e) => handleInputChange('position', e.target.value as Position)} data-testid="select-position">
              {POSITIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
            </select>
          </div>
          <div>
            <Label>Height (ft)</Label>
            <div className="flex gap-2">
              <input type="number" min={4} max={7} className={`${inputClass} w-20 font-mono`} value={heightFt} onChange={(e) => setHeightFt(parseInt(e.target.value) || 5)} data-testid="input-height-ft" />
              <input type="number" min={0} max={11} className={`${inputClass} w-20 font-mono`} value={heightIn} onChange={(e) => setHeightIn(parseInt(e.target.value) || 0)} data-testid="input-height-in" />
            </div>
          </div>
          <div>
            <Label>Dominant Foot</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['Right', 'Left', 'Both'] as const).map(foot => (
                <button key={foot} type="button" onClick={() => handleInputChange('dominantFoot', foot)} className={`py-2 text-xs rounded-lg border transition-all ${profile.dominantFoot === foot ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'bg-white dark:bg-slate-950/50 border-slate-300 dark:border-slate-700/50 text-slate-500'}`} data-testid={`button-foot-${foot.toLowerCase()}`}>{foot}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg">
        <SectionHeader step="02" title="Academics" icon={GraduationCap} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Unweighted GPA</Label>
            <input type="number" step="0.01" min={0} max={4} className={`${inputClass} font-mono`} value={profile.academics.gpa} onChange={(e) => handleAcademicChange('gpa', parseFloat(e.target.value) || 0)} data-testid="input-gpa" />
          </div>
          <div>
            <Label>Test Score (Optional)</Label>
            <input type="text" placeholder="e.g. 1200 SAT, 28 ACT" className={inputClass} value={profile.academics.testScore || ''} onChange={(e) => handleAcademicChange('testScore', e.target.value)} data-testid="input-test-score" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg">
        <SectionHeader step="03" title="Athletic Self-Assessment" icon={Zap} />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {(['speed', 'strength', 'endurance', 'workRate', 'technical', 'tactical'] as const).map(attr => (
            <div key={attr}>
              <Label>{attr.charAt(0).toUpperCase() + attr.slice(1).replace(/([A-Z])/g, ' $1')}</Label>
              <select className={selectClass} value={profile.athleticProfile[attr]} onChange={(e) => handleAthleticChange(attr, e.target.value)} data-testid={`select-${attr}`}>
                {ATHLETIC_RATINGS.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 dark:border-white/5">
          <SectionHeader step="04" title="Soccer Resume" icon={ChevronRight} />
          <button type="button" onClick={addSeason} className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium" data-testid="button-add-season"><Plus className="w-3 h-3" />Add Season</button>
        </div>
        
        {profile.seasons.map((season, idx) => (
          <div key={idx} className="bg-slate-50 dark:bg-slate-950/30 p-4 rounded-lg mb-4 relative">
            {profile.seasons.length > 1 && (
              <button type="button" onClick={() => removeSeason(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500" data-testid={`button-remove-season-${idx}`}><Trash2 className="w-4 h-4" /></button>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label>Year</Label>
                <input type="number" className={`${inputClass} font-mono`} value={season.year} onChange={(e) => updateSeason(idx, 'year', parseInt(e.target.value))} data-testid={`input-season-${idx}-year`} />
              </div>
              <div>
                <Label>Team Name</Label>
                <input type="text" className={inputClass} value={season.teamName} onChange={(e) => updateSeason(idx, 'teamName', e.target.value)} data-testid={`input-season-${idx}-team`} />
              </div>
              <div className="col-span-2">
                <Label>League(s)</Label>
                <LeagueMultiSelect selected={season.league} onChange={(leagues) => updateSeason(idx, 'league', leagues)} />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Minutes %</Label>
                <input type="number" min={0} max={100} className={`${inputClass} font-mono`} value={season.minutesPlayedPercent} onChange={(e) => updateSeason(idx, 'minutesPlayedPercent', parseInt(e.target.value))} data-testid={`input-season-${idx}-minutes`} />
              </div>
              <div>
                <Label>Role</Label>
                <select className={selectClass} value={season.mainRole} onChange={(e) => updateSeason(idx, 'mainRole', e.target.value)} data-testid={`select-season-${idx}-role`}>
                  <option value="Key_Starter">Key Starter</option>
                  <option value="Rotation">Rotation</option>
                  <option value="Bench">Bench</option>
                  <option value="Injured">Injured</option>
                </select>
              </div>
              <div>
                <Label>Goals</Label>
                <input type="number" min={0} className={`${inputClass} font-mono`} value={season.goals} onChange={(e) => updateSeason(idx, 'goals', parseInt(e.target.value) || 0)} data-testid={`input-season-${idx}-goals`} />
              </div>
              <div>
                <Label>Assists</Label>
                <input type="number" min={0} className={`${inputClass} font-mono`} value={season.assists} onChange={(e) => updateSeason(idx, 'assists', parseInt(e.target.value) || 0)} data-testid={`input-season-${idx}-assists`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-lg">
        <SectionHeader step="04" title="Market Reality" icon={Video} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div 
            className={`p-5 rounded-xl border transition-all duration-300 cursor-pointer ${profile.videoLink ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-500/50' : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-500'}`}
            onClick={() => handleInputChange('videoLink', !profile.videoLink)}
            data-testid="toggle-video"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-900 dark:text-white flex items-center">
                <Video className={`w-4 h-4 mr-2 ${profile.videoLink ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-500'}`} />
                Highlight Video
              </span>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${profile.videoLink ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${profile.videoLink ? 'left-6' : 'left-1'}`} />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {profile.videoLink 
                ? "Great. Having accessible footage is the #1 requirement for remote recruiting." 
                : "WARNING: Without video, your visibility score will be severely penalized."}
            </p>
          </div>
           
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Coaches Emailed</Label>
              <input type="number" min={0} className={`${inputClass} font-mono`} value={profile.coachesContacted} onChange={(e) => handleInputChange('coachesContacted', parseInt(e.target.value) || 0)} data-testid="input-coaches-contacted" />
            </div>
            <div>
              <Label>Personal Replies</Label>
              <input type="number" min={0} className={`${inputClass} font-mono`} value={profile.responsesReceived} onChange={(e) => handleInputChange('responsesReceived', parseInt(e.target.value) || 0)} data-testid="input-responses" />
            </div>
            <div>
              <Label>Concrete Offers</Label>
              <input type="number" min={0} className={`${inputClass} font-mono`} value={profile.offersReceived} onChange={(e) => handleInputChange('offersReceived', parseInt(e.target.value) || 0)} data-testid="input-offers" />
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <Label>Showcase Events (Last 12 Months)</Label>
            <button 
              type="button" 
              onClick={() => setProfile(prev => ({ ...prev, events: [...(prev.events || []), { name: '', type: 'Showcase', collegesNoted: '' }] }))}
              className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium"
              data-testid="button-add-event"
            >
              <Plus className="w-3 h-3" />Add Event
            </button>
          </div>
          
          {(!profile.events || profile.events.length === 0) ? (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700/50 rounded-xl p-6 text-center">
              <p className="text-sm text-slate-400 dark:text-slate-500">No events added.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.events.map((event, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-950/30 p-4 rounded-lg relative">
                  <button 
                    type="button" 
                    onClick={() => setProfile(prev => ({ ...prev, events: prev.events?.filter((_, i) => i !== idx) || [] }))}
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                    data-testid={`button-remove-event-${idx}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Event Name</Label>
                      <input 
                        type="text" 
                        className={inputClass} 
                        placeholder="e.g. Surf Cup"
                        value={event.name}
                        onChange={(e) => {
                          const newEvents = [...(profile.events || [])];
                          newEvents[idx] = { ...newEvents[idx], name: e.target.value };
                          setProfile(prev => ({ ...prev, events: newEvents }));
                        }}
                        data-testid={`input-event-${idx}-name`}
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <select 
                        className={selectClass}
                        value={event.type}
                        onChange={(e) => {
                          const newEvents = [...(profile.events || [])];
                          newEvents[idx] = { ...newEvents[idx], type: e.target.value as any };
                          setProfile(prev => ({ ...prev, events: newEvents }));
                        }}
                        data-testid={`select-event-${idx}-type`}
                      >
                        <option value="Showcase">Showcase</option>
                        <option value="ID_Camp">ID Camp</option>
                        <option value="College_Visit">College Visit</option>
                        <option value="Tournament">Tournament</option>
                      </select>
                    </div>
                    <div>
                      <Label>Colleges Noted</Label>
                      <input 
                        type="text" 
                        className={inputClass}
                        placeholder="e.g. UCLA, Stanford"
                        value={event.collegesNoted}
                        onChange={(e) => {
                          const newEvents = [...(profile.events || [])];
                          newEvents[idx] = { ...newEvents[idx], collegesNoted: e.target.value };
                          setProfile(prev => ({ ...prev, events: newEvents }));
                        }}
                        data-testid={`input-event-${idx}-colleges`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-2 rounded-2xl border-2 border-dashed border-emerald-400/50 dark:border-emerald-500/30 bg-transparent">
        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500 text-slate-900 font-bold rounded-xl text-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed" 
          data-testid="button-submit"
        >
          Calculate Visibility Score <ChevronRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
