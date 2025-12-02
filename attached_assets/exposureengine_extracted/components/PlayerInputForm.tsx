import React, { useState } from 'react';
import { PlayerProfile, SeasonStat, ExposureEvent, YouthLeague, Position } from '../types';
import { LEAGUES, POSITIONS } from '../constants';
import { Plus, Trash2, ChevronRight, AlertCircle } from 'lucide-react';

interface Props {
  onSubmit: (profile: PlayerProfile) => void;
  isLoading: boolean;
}

const PlayerInputForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  // Initial Empty State
  const [profile, setProfile] = useState<PlayerProfile>({
    fullName: '',
    position: 'CM',
    height: '',
    gradYear: 2026,
    state: '',
    videoLink: false,
    coachesContacted: 0,
    responsesReceived: 0,
    academics: {
      graduationYear: 2026,
      gpa: 3.0,
      testScore: ''
    },
    seasons: [
      {
        year: 2024,
        teamName: '',
        league: 'ECNL',
        minutesPlayedPercent: 80,
        mainRole: 'Key_Starter',
        goals: 0,
        assists: 0,
        honors: ''
      }
    ],
    events: []
  });

  const handleInputChange = (field: keyof PlayerProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleAcademicChange = (field: keyof typeof profile.academics, value: any) => {
    setProfile(prev => ({
      ...prev,
      academics: { ...prev.academics, [field]: value }
    }));
  };

  const updateSeason = (index: number, field: keyof SeasonStat, value: any) => {
    const newSeasons = [...profile.seasons];
    newSeasons[index] = { ...newSeasons[index], [field]: value };
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
          league: 'High_School',
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

  const addEvent = () => {
    setProfile(prev => ({
      ...prev,
      events: [
        ...prev.events,
        { name: '', type: 'Showcase', collegesNoted: '' }
      ]
    }));
  };

  const updateEvent = (index: number, field: keyof ExposureEvent, value: any) => {
    const newEvents = [...profile.events];
    newEvents[index] = { ...newEvents[index], [field]: value };
    setProfile(prev => ({ ...prev, events: newEvents }));
  };

  const removeEvent = (index: number) => {
    setProfile(prev => ({
      ...prev,
      events: prev.events.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted", profile);
    onSubmit(profile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
        <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center">
          <span className="w-6 h-6 rounded-full bg-emerald-900/50 text-emerald-400 flex items-center justify-center text-xs mr-2">1</span>
          The Basics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              value={profile.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Grad Year</label>
            <input
              type="number"
              min={2024}
              max={2030}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-emerald-500"
              value={isNaN(profile.gradYear) ? '' : profile.gradYear}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                handleInputChange('gradYear', isNaN(val) ? 2026 : val);
                handleAcademicChange('graduationYear', isNaN(val) ? 2026 : val);
              }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Primary Position</label>
            <select
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-emerald-500"
              value={profile.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
            >
              {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">State / Region</label>
            <input
              type="text"
              placeholder="e.g. SoCal, NJ, TX"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-emerald-500"
              value={profile.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
        <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center">
           <span className="w-6 h-6 rounded-full bg-emerald-900/50 text-emerald-400 flex items-center justify-center text-xs mr-2">2</span>
           Academics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">GPA (Unweighted)</label>
            <input
              type="number"
              step="0.01"
              max="4.0"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-emerald-500"
              value={isNaN(profile.academics.gpa) ? '' : profile.academics.gpa}
              onChange={(e) => handleAcademicChange('gpa', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Test Score (Optional)</label>
            <input
              type="text"
              placeholder="e.g. 1300 SAT or 28 ACT"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-emerald-500"
              value={profile.academics.testScore || ''}
              onChange={(e) => handleAcademicChange('testScore', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-emerald-400 flex items-center">
             <span className="w-6 h-6 rounded-full bg-emerald-900/50 text-emerald-400 flex items-center justify-center text-xs mr-2">3</span>
             Season History
          </h3>
          <button type="button" onClick={addSeason} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center font-medium">
            <Plus className="w-3 h-3 mr-1" /> Add Season
          </button>
        </div>
        
        <div className="space-y-6">
          {profile.seasons.map((season, idx) => (
            <div key={idx} className="p-4 bg-slate-900 rounded-lg border border-slate-700 relative group">
              {idx > 0 && (
                <button
                  type="button"
                  onClick={() => removeSeason(idx)}
                  className="absolute top-2 right-2 text-slate-600 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                 <div>
                    <label className="block text-[10px] uppercase text-slate-500 mb-1">Year</label>
                    <input
                      type="number"
                      className="w-full bg-slate-800 border-none rounded p-1.5 text-sm text-white"
                      value={isNaN(season.year) ? '' : season.year}
                      onChange={(e) => updateSeason(idx, 'year', parseInt(e.target.value))}
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] uppercase text-slate-500 mb-1">League</label>
                    <select
                      className="w-full bg-slate-800 border-none rounded p-1.5 text-sm text-white"
                      value={season.league}
                      onChange={(e) => updateSeason(idx, 'league', e.target.value)}
                    >
                      {LEAGUES.map(l => <option key={l} value={l}>{l.replace(/_/g, ' ')}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] uppercase text-slate-500 mb-1">Team Name</label>
                    <input
                      type="text"
                      placeholder="Club Name"
                      className="w-full bg-slate-800 border-none rounded p-1.5 text-sm text-white"
                      value={season.teamName}
                      onChange={(e) => updateSeason(idx, 'teamName', e.target.value)}
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] uppercase text-slate-500 mb-1">Role</label>
                    <select
                      className="w-full bg-slate-800 border-none rounded p-1.5 text-sm text-white"
                      value={season.mainRole}
                      onChange={(e) => updateSeason(idx, 'mainRole', e.target.value)}
                    >
                      <option value="Key_Starter">Key Starter</option>
                      <option value="Rotation">Rotation</option>
                      <option value="Bench">Bench</option>
                      <option value="Injured">Injured</option>
                    </select>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-[10px] uppercase text-slate-500 mb-1">Minutes Played % (Approx)</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      className="w-full accent-emerald-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      value={season.minutesPlayedPercent}
                      onChange={(e) => updateSeason(idx, 'minutesPlayedPercent', parseInt(e.target.value))}
                    />
                    <div className="text-right text-xs text-emerald-400 font-mono">{season.minutesPlayedPercent}%</div>
                 </div>
                 <div>
                    <label className="block text-[10px] uppercase text-slate-500 mb-1">Honors / Notes</label>
                     <input
                      type="text"
                      placeholder="e.g. Captain, All-Conference"
                      className="w-full bg-slate-800 border-none rounded p-1.5 text-sm text-white"
                      value={season.honors}
                      onChange={(e) => updateSeason(idx, 'honors', e.target.value)}
                    />
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
        <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center">
           <span className="w-6 h-6 rounded-full bg-emerald-900/50 text-emerald-400 flex items-center justify-center text-xs mr-2">4</span>
           Recruiting Reality
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
           <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
              <label className="flex items-center space-x-3 mb-4 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={profile.videoLink}
                  onChange={(e) => handleInputChange('videoLink', e.target.checked)}
                  className="w-5 h-5 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-800"
                />
                <span className="text-sm text-slate-200">I have a current Highlight Video (Hudl/YouTube)</span>
              </label>
              <div className="text-xs text-slate-500 italic flex items-start">
                <AlertCircle className="w-3 h-3 mr-1 mt-0.5" />
                No video usually means zero visibility for schools outside your immediate driving radius.
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Coaches Emailed</label>
                <input
                  type="number"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white"
                  value={isNaN(profile.coachesContacted) ? 0 : profile.coachesContacted}
                  onChange={(e) => handleInputChange('coachesContacted', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Personal Replies</label>
                <input
                  type="number"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white"
                  value={isNaN(profile.responsesReceived) ? 0 : profile.responsesReceived}
                  onChange={(e) => handleInputChange('responsesReceived', parseInt(e.target.value))}
                />
              </div>
           </div>
        </div>

        <div className="border-t border-slate-700 pt-4">
          <div className="flex justify-between items-center mb-3">
             <label className="block text-sm font-medium text-slate-300">Major Events (Last 12 Mo)</label>
             <button type="button" onClick={addEvent} className="text-xs text-emerald-400 flex items-center">
                <Plus className="w-3 h-3 mr-1" /> Add Event
             </button>
          </div>
          {profile.events.length === 0 && (
             <p className="text-xs text-slate-500 text-center py-2">No events added. Adding national showcases helps visibility scoring.</p>
          )}
          <div className="space-y-3">
            {profile.events.map((event, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                 <div className="flex-1 grid grid-cols-3 gap-2">
                    <input 
                      placeholder="Event Name (e.g. MLS NEXT Fest)" 
                      className="bg-slate-900 border border-slate-700 rounded text-xs p-2 text-white"
                      value={event.name}
                      onChange={(e) => updateEvent(idx, 'name', e.target.value)}
                    />
                    <select
                      className="bg-slate-900 border border-slate-700 rounded text-xs p-2 text-white"
                      value={event.type}
                      onChange={(e) => updateEvent(idx, 'type', e.target.value)}
                    >
                      <option value="Showcase">Showcase</option>
                      <option value="ID_Camp">ID Camp</option>
                      <option value="ODP">ODP / Select</option>
                      <option value="HS_Playoffs">HS Playoffs</option>
                    </select>
                    <input 
                      placeholder="Colleges you spoke to?" 
                      className="bg-slate-900 border border-slate-700 rounded text-xs p-2 text-white"
                      value={event.collegesNoted}
                      onChange={(e) => updateEvent(idx, 'collegesNoted', e.target.value)}
                    />
                 </div>
                 <button onClick={() => removeEvent(idx)} className="text-slate-600 hover:text-red-400 p-2">
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all ${
            isLoading 
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
              : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center">
               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
               Analyzing Trajectory...
            </span>
          ) : (
            <>
               Calculate Visibility <ChevronRight className="ml-2 w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default PlayerInputForm;