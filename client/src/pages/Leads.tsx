import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Filter, RefreshCw, Mail, User, Calendar, Target, ChevronDown } from 'lucide-react';

interface Lead {
  id: number;
  role: string;
  name: string;
  email: string;
  age: string | null;
  grad_year: string | null;
  goals: string | null;
  current_level: string | null;
  budget_preference: string | null;
  gap_year_interest: boolean;
  source: string;
  status: string;
  notes: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  qualified: 'bg-purple-100 text-purple-700',
  converted: 'bg-green-100 text-green-700',
};

const statusOptions = ['new', 'contacted', 'qualified', 'converted'];

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    console.log('Fetching leads...');
    try {
      const params = new URLSearchParams();
      if (filterRole) params.append('role', filterRole);
      if (filterStatus) params.append('status', filterStatus);
      
      const url = `/public/leads?${params.toString()}`;
      console.log('Fetch URL:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) throw new Error(data.error);
      
      setLeads(data.leads);
      setTotal(data.total);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [filterRole, filterStatus]);

  const updateStatus = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      const response = await fetch(`/public/leads/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) throw new Error('Failed to update');
      
      setLeads(prev => prev.map(lead => 
        lead.id === id ? { ...lead, status: newStatus } : lead
      ));
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parseGoals = (goalsStr: string | null): string[] => {
    if (!goalsStr) return [];
    try {
      return JSON.parse(goalsStr);
    } catch {
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <a className="p-2 hover:bg-neutral-100 rounded-lg transition-colors" data-testid="link-back">
                <ArrowLeft size={20} className="text-neutral-600" />
              </a>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">Pathway Leads</h1>
              <p className="text-sm text-neutral-500">{total} total submissions</p>
            </div>
          </div>
          
          <button 
            onClick={fetchLeads}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium text-neutral-700 transition-colors"
            data-testid="button-refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
            <Filter size={16} className="text-neutral-400" />
            <select 
              className="bg-transparent text-sm focus:outline-none text-neutral-700"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              data-testid="filter-role"
            >
              <option value="">All Roles</option>
              <option value="Player">Player</option>
              <option value="Coach">Coach</option>
              <option value="Parent">Parent</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
            <Filter size={16} className="text-neutral-400" />
            <select 
              className="bg-transparent text-sm focus:outline-none text-neutral-700"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              data-testid="filter-status"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <RefreshCw size={24} className="animate-spin mx-auto text-neutral-400 mb-3" />
            <p className="text-neutral-500">Loading leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <User size={40} className="mx-auto text-neutral-300 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">No leads yet</h3>
            <p className="text-neutral-500">Form submissions from the Pathways page will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-6 py-4">Contact</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-6 py-4">Role</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-6 py-4">Goals</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-6 py-4">Details</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-6 py-4">Status</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 px-6 py-4">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-neutral-50 transition-colors" data-testid={`row-lead-${lead.id}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-neutral-900">{lead.name}</div>
                            <div className="flex items-center gap-1 text-sm text-neutral-500">
                              <Mail size={12} />
                              {lead.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm font-medium">
                          <User size={12} />
                          {lead.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {parseGoals(lead.goals).map((goal, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs font-medium">
                              <Target size={10} />
                              {goal}
                            </span>
                          ))}
                          {parseGoals(lead.goals).length === 0 && (
                            <span className="text-neutral-400 text-sm">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-neutral-600 space-y-1">
                          {lead.age && <div>Age: {lead.age}</div>}
                          {lead.grad_year && <div>Grad: {lead.grad_year}</div>}
                          {lead.current_level && <div>{lead.current_level}</div>}
                          {lead.gap_year_interest && (
                            <div className="text-green-600 font-medium">Gap Year ✓</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <select
                            value={lead.status}
                            onChange={(e) => updateStatus(lead.id, e.target.value)}
                            disabled={updatingId === lead.id}
                            className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${statusColors[lead.status] || 'bg-neutral-100 text-neutral-700'} ${updatingId === lead.id ? 'opacity-50' : ''}`}
                            data-testid={`select-status-${lead.id}`}
                          >
                            {statusOptions.map(opt => (
                              <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                            ))}
                          </select>
                          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                          <Calendar size={12} />
                          {formatDate(lead.created_at)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
