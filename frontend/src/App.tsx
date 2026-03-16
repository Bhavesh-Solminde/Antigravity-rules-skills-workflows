import { useEffect, useState, useMemo } from 'react';
import { create } from 'zustand';
import { io } from 'socket.io-client';
import axios from 'axios';
import { format, formatDistanceToNow, isWithinInterval, startOfDay, endOfDay, subDays } from 'date-fns';
import { 
  Terminal, 
  Activity, 
  ShieldAlert, 
  Clock, 
  RefreshCw, 
  Trash2, 
  Copy, 
  Check, 
  Search,
  Zap,

  Sun,
  Moon,
  LayoutDashboard,
  Webhook,
  Globe,
  Settings,
  BarChart3,
  Key,
  User,
  Plus,

  Code2
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// --- Demo Data ---
const DEMO_WEBHOOKS: any[] = [
  {
    id: 'wh_7a21b8c',
    source: 'stripe',
    method: 'POST',
    url: '/api/v1/webhooks/stripe',
    headers: { 'stripe-signature': 't=1625,v1=...','content-type': 'application/json' },
    payload: { 
      id: 'evt_1Oiq2...', 
      type: 'payment_intent.succeeded', 
      livemode: false,
      data: { object: { amount: 2900, currency: 'usd', status: "succeeded" } } 
    },
    status: 200,
    responseTime: 45,
    timestamp: new Date().toISOString(),
    failed: false,
  },
  {
    id: 'wh_921p0x2',
    source: 'github',
    method: 'POST',
    url: '/api/webhooks/github-push',
    headers: { 'x-github-event': 'push', 'user-agent': 'GitHub-Hookshot' },
    payload: { 
      ref: 'refs/heads/main', 
      repository: { name: "awesome-project", private: false },
      commits: [{ message: 'feat: add analytics', author: "dev_user" }] 
    },
    status: 500,
    responseTime: 1240,
    timestamp: subDays(new Date(), 1).toISOString(),
    failed: true,
  },
  {
    id: 'wh_lk912m1',
    source: 'sendgrid',
    method: 'POST',
    url: '/hooks/email-status',
    headers: { 'authorization': 'Bearer ****' },
    payload: { event: 'delivered', email: 'user@example.com', timestamp: 1710584400, sg_message_id: "abc-123" },
    status: 201,
    responseTime: 12,
    timestamp: subDays(new Date(), 2).toISOString(),
    failed: false,
  }
];

const DEMO_API_REQUESTS = [
  { id: 'req_1', path: '/v1/users/me', method: 'GET' as const, status: 200, duration: '12ms', time: '2 mins ago' },
  { id: 'req_2', path: '/v1/auth/login', method: 'POST' as const, status: 401, duration: '45ms', time: '15 mins ago' },
  { id: 'req_3', path: '/v1/products', method: 'GET' as const, status: 200, duration: '110ms', time: '1 hour ago' },
  { id: 'req_4', path: '/v1/billing/checkout', method: 'POST' as const, status: 201, duration: '340ms', time: '3 hours ago' },
];

const API_BASE_URL = 'http://localhost:3000'; // Make sure this matches your backend port

interface WebhookEvent {
  id: string;
  source: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  payload: any;
  status: number;
  responseTime: number;
  timestamp: string;
  failed: boolean;
}

type StatusFilter = 'all' | 'success' | 'errors';
type DateFilter = 'all' | 'today' | 'last-3-days' | 'last-7-days';
type ViewType = 'dashboard' | 'webhooks' | 'api-requests' | 'settings';

interface WebhookStore {
  activeView: ViewType;
  webhooks: WebhookEvent[];
  selectedId: string | null;
  loading: boolean;
  statusFilter: StatusFilter;
  dateFilter: DateFilter;
  search: string;
  isDark: boolean;
  setActiveView: (view: ViewType) => void;
  fetchWebhooks: () => Promise<void>;
  addWebhook: (event: WebhookEvent) => void;
  setSelectedId: (id: string | null) => void;
  setStatusFilter: (val: StatusFilter) => void;
  setDateFilter: (val: DateFilter) => void;
  setSearch: (val: string) => void;
  toggleTheme: () => void;
  replay: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

// --- Store ---
const useStore = create<WebhookStore>((set) => ({
  activeView: 'webhooks',
  webhooks: [],
  selectedId: null,
  loading: false,
  statusFilter: 'all',
  dateFilter: 'all',
  search: '',
  isDark: true,
  setActiveView: (activeView) => set({ activeView }),
  fetchWebhooks: async () => {
    set({ loading: true });
    try {
      const res = await axios.get(`${API_BASE_URL}/api/webhooks`);
      const apiData = res.data.data || [];
      set({ webhooks: apiData.length > 0 ? apiData : DEMO_WEBHOOKS });
    } catch (err) {
      set({ webhooks: DEMO_WEBHOOKS });
    } finally {
      set({ loading: false });
    }
  },
  addWebhook: (event) => set((state) => ({ webhooks: [event, ...state.webhooks] })),
  setSelectedId: (selectedId) => set({ selectedId }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setDateFilter: (dateFilter) => set({ dateFilter }),
  setSearch: (search) => set({ search }),
  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
  replay: async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/api/webhooks/${id}/replay`);
      toast.success('Webhook replayed successfully');
    } catch (err) {
      toast.error('Failed to replay webhook');
    }
  },
  remove: async (id) => {
    try {
      if (!id.startsWith('wh_')) {
        await axios.delete(`${API_BASE_URL}/api/webhooks/${id}`);
      }
      set((state) => ({ webhooks: state.webhooks.filter(w => w.id !== id), selectedId: null }));
      toast.success('Event cleared');
    } catch (err) {
      toast.error('Failed to clear event');
    }
  }
}));

// --- Styles ---
const btnClasses = {
  primary: "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-slate-50 shadow hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90 h-9 px-4 py-2",
  secondary: "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300 disabled:pointer-events-none disabled:opacity-50 bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80 h-9 px-4 py-2",
  outline: "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-transparent shadow-sm hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-50 h-9 px-4 py-2",
  ghost: "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300 disabled:pointer-events-none disabled:opacity-50 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50 h-9 px-4 py-2",
  icon: "h-9 w-9 px-0",
};

// --- Components ---
const SyntaxHighlighter = ({ json, isDark }: { json: any; isDark: boolean }) => {
  const formatted = JSON.stringify(json, null, 2);
  const highlighted = formatted.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = isDark ? 'text-[#ce9178]' : 'text-[#a31515]'; 
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = isDark ? 'text-[#9cdcfe]' : 'text-[#0451a5]'; 
        }
      } else if (/true|false/.test(match)) {
        cls = isDark ? 'text-[#569cd6]' : 'text-[#0000ff]'; 
      } else if (/null/.test(match)) {
        cls = isDark ? 'text-[#569cd6]' : 'text-[#0000ff]';
      } else {
        cls = isDark ? 'text-[#b5cea8]' : 'text-[#098658]';
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );

  return (
    <pre 
      className={`text-[13px] leading-relaxed font-mono selection:bg-[#264f78]/30 ${isDark ? 'text-[#d4d4d4]' : 'text-slate-700'}`}
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
};

const StatusBadge = ({ status }: { status: number }) => {
  const isError = status >= 400;
  const color = isError 
    ? 'text-rose-600 bg-rose-500/10 border-rose-500/20' 
    : 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${color}`}>
      {status}
    </span>
  );
};

const SourceIcon = ({ source }: { source: string }) => {
  const colors: Record<string, string> = {
    stripe: 'bg-indigo-500',
    github: 'bg-slate-900 dark:bg-slate-200 dark:text-slate-900',
    sendgrid: 'bg-blue-400',
    default: 'bg-slate-500'
  };
  const colorClass = colors[source.toLowerCase() as keyof typeof colors] || colors.default;
  return (
    <div className={`w-8 h-8 rounded-md ${colorClass} flex items-center justify-center text-white font-black text-[10px] shadow-sm shrink-0`}>
      {source.charAt(0).toUpperCase()}
    </div>
  );
};

const MethodBadge = ({ method }: { method: string }) => {
  const colors: Record<string, string> = {
    POST: 'bg-emerald-500/10 text-emerald-600',
    GET: 'bg-sky-500/10 text-sky-600',
    PUT: 'bg-amber-500/10 text-amber-600',
    DELETE: 'bg-rose-500/10 text-rose-600'
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border border-current opacity-80 ${colors[method as keyof typeof colors] || 'bg-slate-500/10 text-slate-500'}`}>
      {method}
    </span>
  );
};

const JsonBox = ({ data, title, isDark }: { data: any; title: string; isDark: boolean }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative rounded-md border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 dark:bg-[#252526] border-b border-slate-200 dark:border-black/20">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
             <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
             <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
             <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</span>
        </div>
        <button onClick={copy} className={`${btnClasses.ghost} ${btnClasses.icon} h-7 w-7 text-slate-400 hover:text-slate-900 dark:hover:text-white`}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <div className={`p-5 overflow-x-auto ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
        <SyntaxHighlighter json={data} isDark={isDark} />
      </div>
    </div>
  );
};

const DashboardView = ({ webhooks }: { webhooks: WebhookEvent[] }) => {
  const totalEvents = webhooks.length;
  const failureRate = ((webhooks.filter((w: WebhookEvent) => w.failed).length / (totalEvents || 1)) * 100).toFixed(1);
  const avgLatency = Math.round(webhooks.reduce((acc: number, w: WebhookEvent) => acc + w.responseTime, 0) / (totalEvents || 1));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">System Overview</h2>
          <p className="text-sm text-slate-500 mt-1">Infrastructure health and traffic monitoring.</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-md border border-emerald-500/20">
          <Activity size={14} className="animate-pulse" /> Live Status: Online
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Inbound', value: totalEvents, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Avg Latency', value: `${avgLatency}ms`, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Error Rate', value: `${failureRate}%`, icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Peak Load', value: '1.2k req/s', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <div key={i} className="group bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/5 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-md flex items-center justify-center mb-4`}>
              <stat.icon size={20} />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/5 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-semibold flex items-center gap-2 text-lg text-slate-900 dark:text-slate-50">
              <BarChart3 size={18} className="text-slate-500" />
              Traffic Analysis
            </h3>
          </div>
          <div className="h-[240px] flex items-end justify-between gap-3">
            {[40, 70, 45, 90, 65, 80, 50, 60, 85, 40, 30, 75, 55, 65, 80].map((h, i) => (
              <div key={i} className="flex-1 bg-slate-100 dark:bg-white/5 rounded-t-sm relative group h-full">
                <div 
                  className="absolute bottom-0 w-full bg-slate-400 dark:bg-slate-600 rounded-t-sm transition-all duration-700" 
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/5 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold flex items-center gap-2 mb-6 text-slate-900 dark:text-slate-50">
            <Activity size={18} className="text-slate-500" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {webhooks.slice(0, 6).map((w: WebhookEvent) => (
              <div key={w.id} className="flex items-center justify-between p-3 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${w.failed ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  <div>
                    <p className="text-xs font-medium capitalize text-slate-900 dark:text-slate-100">{w.source}</p>
                    <p className="text-[10px] text-slate-500 font-mono">ID: {w.id.slice(0, 8)}</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-500 font-mono">{w.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ApiRequestsView = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">API Logs</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time outbound request performance.</p>
        </div>
        <button className={btnClasses.primary}>
          <Plus size={16} className="mr-2" /> New Destination
        </button>
      </div>

      <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Endpoint</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Method</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Duration</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {DEMO_API_REQUESTS.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-md">{req.path}</span>
                  </td>
                  <td className="px-6 py-4"><MethodBadge method={req.method} /></td>
                  <td className="px-6 py-4"><span className="text-xs font-medium text-slate-600 dark:text-slate-400">{req.duration}</span></td>
                  <td className="px-6 py-4"><span className="text-xs text-slate-500">{req.time}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SettingsView = ({ isDark, toggleTheme }: { isDark: boolean; toggleTheme: () => void }) => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Configuration</h2>
        <p className="text-sm text-slate-500 mt-1">Manage environment variables and visual preferences.</p>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <User size={14} /> Appearance
          </h3>
          <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/5 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-50">Theme Mode</p>
                <p className="text-xs text-slate-500">Currently using {isDark ? 'Dark' : 'Light'} mode.</p>
              </div>
              <button onClick={toggleTheme} className={btnClasses.outline}>
                {isDark ? <Sun size={14} className="mr-2" /> : <Moon size={14} className="mr-2" />} 
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Key size={14} /> Authentication
          </h3>
          <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/5 rounded-xl p-6 shadow-sm">
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Environment Key</label>
            <div className="flex gap-2">
              <input 
                type="password" 
                value="pk_test_8172635489127346" 
                readOnly
                className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-md px-4 py-2 text-sm font-mono outline-none dark:text-slate-300" 
              />
              <button className={btnClasses.primary}>Rotate</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default function App() {
  const store = useStore();
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    store.fetchWebhooks();
    const socket = io(API_BASE_URL);
    socket.on('connect', () => setIsLive(true));
    socket.on('disconnect', () => setIsLive(false));
    socket.on('new_webhook', (event) => store.addWebhook(event));
    return () => { socket.disconnect(); };
  }, []);

  // Fix: Sync theme to document element
  useEffect(() => {
    if (store.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [store.isDark]);

  const filtered = useMemo(() => {
    return store.webhooks.filter(w => {
      const matchSearch = w.source.toLowerCase().includes(store.search.toLowerCase()) || 
                          w.url.toLowerCase().includes(store.search.toLowerCase());
      
      let matchStatus = true;
      if (store.statusFilter === 'success') matchStatus = !w.failed;
      if (store.statusFilter === 'errors') matchStatus = w.failed;

      let matchDate = true;
      const date = new Date(w.timestamp);
      if (store.dateFilter === 'today') {
        matchDate = isWithinInterval(date, { start: startOfDay(new Date()), end: endOfDay(new Date()) });
      } else if (store.dateFilter === 'last-3-days') {
        matchDate = date >= subDays(new Date(), 3);
      } else if (store.dateFilter === 'last-7-days') {
        matchDate = date >= subDays(new Date(), 7);
      }

      return matchSearch && matchStatus && matchDate;
    });
  }, [store.webhooks, store.search, store.statusFilter, store.dateFilter]);

  const selected = store.webhooks.find(w => w.id === store.selectedId);

  const NAV_ITEMS = [
    { id: 'dashboard' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'webhooks' as const, label: 'Intercept', icon: Webhook },
    { id: 'api-requests' as const, label: 'API Logs', icon: Globe },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-50 flex flex-col font-sans transition-colors duration-300">
      <Toaster position="bottom-right" />
        
      <header className="h-14 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#0f0f0f] sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 dark:bg-slate-50 rounded-md flex items-center justify-center">
            <Terminal size={18} className="text-slate-50 dark:text-slate-900" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight leading-none">DevProxy</h1>
            <p className="text-[10px] font-medium text-slate-500 mt-0.5 uppercase tracking-widest">Enterprise Hub</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
              {isLive ? 'Cluster Online' : 'Local Node'}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <nav className="w-16 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#0f0f0f] flex flex-col items-center py-4 gap-4">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => store.setActiveView(item.id)}
              className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors group relative ${
                store.activeView === item.id 
                ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-slate-50' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <item.icon size={20} />
              <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-slate-50 text-[10px] font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <main className="flex-1 flex overflow-hidden">
          {store.activeView === 'dashboard' && <DashboardView webhooks={store.webhooks} />}
          {store.activeView === 'api-requests' && <ApiRequestsView />}
          {store.activeView === 'settings' && <SettingsView isDark={store.isDark} toggleTheme={store.toggleTheme} />}
          
          {store.activeView === 'webhooks' && (
            <>
              <aside className="w-[380px] border-r border-slate-200 dark:border-white/5 flex flex-col bg-slate-50 dark:bg-[#0c0c0c]">
                <div className="p-4 space-y-4 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#0c0c0c]">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search events..."
                      className="w-full bg-slate-100 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-md py-2 pl-9 pr-4 text-sm outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600"
                      value={store.search}
                      onChange={(e) => store.setSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-md">
                    {(['all', 'success', 'errors'] as StatusFilter[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => store.setStatusFilter(f)}
                        className={`flex-1 py-1 text-[11px] font-medium capitalize rounded-[4px] transition-all ${
                          store.statusFilter === f 
                          ? 'bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-slate-50 shadow-sm' 
                          : 'text-slate-500'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {filtered.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => store.setSelectedId(w.id)}
                      className={`w-full p-4 text-left border-b border-slate-200 dark:border-white/5 transition-all flex gap-3 items-start
                        ${store.selectedId === w.id ? 'bg-white dark:bg-[#1a1a1a]' : 'hover:bg-white/50 dark:hover:bg-white/5'}
                      `}
                    >
                      <SourceIcon source={w.source} />
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{w.source}</span>
                          <StatusBadge status={w.status} />
                        </div>
                        <p className="text-[11px] font-mono text-slate-500 truncate">{w.url}</p>
                        <div className="flex items-center justify-between text-[10px] font-medium text-slate-400">
                          <span className="flex items-center gap-1"><Clock size={12} /> {w.responseTime}ms</span>
                          <span>{formatDistanceToNow(new Date(w.timestamp), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </aside>

              <section className="flex-1 bg-white dark:bg-[#0a0a0a] overflow-y-auto">
                {selected ? (
                  <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-3">
                        <SourceIcon source={selected.source} />
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold capitalize">{selected.source} Event</h2>
                            <StatusBadge status={selected.status} />
                          </div>
                          <p className="text-xs font-mono text-slate-500 mt-1">{selected.id}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => store.replay(selected.id)} className={btnClasses.outline}>
                          <RefreshCw size={14} className="mr-2" /> Replay
                        </button>
                        <button onClick={() => store.remove(selected.id)} className={`${btnClasses.outline} text-rose-500 border-rose-200 dark:border-rose-900/30`}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: 'Method', value: selected.method, icon: Code2 },
                          { label: 'Time', value: format(new Date(selected.timestamp), 'HH:mm:ss'), icon: Clock },
                          { label: 'Latency', value: `${selected.responseTime}ms`, icon: Zap },
                          { label: 'Status', value: selected.status, icon: ShieldAlert },
                        ].map((item, i) => (
                          <div key={i} className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                              <item.icon size={12} />
                              <span className="text-[10px] font-bold uppercase">{item.label}</span>
                            </div>
                            <p className="text-sm font-bold">{item.value}</p>
                          </div>
                        ))}
                      </div>

                      <JsonBox title="Request Headers" data={selected.headers} isDark={store.isDark} />
                      <JsonBox title="Payload Body" data={selected.payload} isDark={store.isDark} />
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 opacity-50">
                    <Webhook size={48} strokeWidth={1} />
                    <p className="text-sm font-medium">Select an event to inspect details</p>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}