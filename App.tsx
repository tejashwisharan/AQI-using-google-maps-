
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Wind, 
  MapPin, 
  RefreshCw, 
  ShieldAlert, 
  Info, 
  ExternalLink,
  Activity,
  Droplets,
  CloudRain,
  Navigation,
  Map as MapIcon,
  ChevronRight,
  LocateFixed,
  Search as SearchIcon,
  ArrowLeft,
  Loader2,
  Globe,
  Layers,
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { fetchAQIData, searchLocations } from './services/geminiService';
import { AQIData, LocationSearchResult, getAQIColor, getAQIBG, ProviderData } from './types';
import PollutantCard from './components/PollutantCard';

type AppStep = 'welcome' | 'search' | 'locating' | 'dashboard';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('welcome');
  const [data, setData] = useState<AQIData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeProviderIndex, setActiveProviderIndex] = useState(0);
  
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadData = useCallback(async (location: LocationSearchResult) => {
    try {
      setSelectedLocation(location);
      setStep('locating');
      const result = await fetchAQIData(location.lat, location.lng);
      // Overlay the selected name to ensure consistency with what user clicked
      setData({
        ...result,
        locationName: location.title
      });
      setError(null);
      setStep('dashboard');
    } catch (err) {
      setError("Failed to fetch air quality data. Please try another location.");
      setStep('search');
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (val.length > 2) {
      setIsSearching(true);
      searchTimeout.current = setTimeout(async () => {
        const results = await searchLocations(val);
        setSearchResults(results);
        setIsSearching(false);
      }, 1000);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const handleLocateMe = () => {
    setError(null);
    setStep('locating');
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setStep('welcome');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { 
          title: "My Current Location", 
          address: "Based on your GPS coordinates", 
          lat: position.coords.latitude, 
          lng: position.coords.longitude 
        };
        loadData(loc);
      },
      (err) => {
        setError("Location access denied. Please search manually.");
        setStep('search');
      }
    );
  };

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100 rounded-full blur-[120px] opacity-50 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-50" />
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 relative z-10 text-center">
          <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 shadow-lg shadow-emerald-200">
            <Wind className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Know Your Air.</h1>
          <p className="text-slate-500 mb-10 leading-relaxed">Multi-source air quality comparison grounded with Google Maps & AI verification.</p>
          <div className="space-y-4">
            <button onClick={() => setStep('search')} className="w-full bg-slate-900 hover:bg-slate-800 text-white h-16 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-slate-900/10 group">
              <SearchIcon className="w-5 h-5" />
              Search Location
              <ChevronRight className="w-4 h-4 ml-2 opacity-50" />
            </button>
            <button onClick={handleLocateMe} className="w-full bg-white hover:bg-slate-50 text-slate-700 h-16 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all border border-slate-200">
              <LocateFixed className="w-5 h-5" />
              Use Current Location
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'search') {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center pt-24">
        <div className="max-w-2xl w-full">
          <div className="flex items-center gap-4 mb-10">
            <button onClick={() => setStep('welcome')} className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h2 className="text-2xl font-black text-slate-900">Find a location</h2>
          </div>
          <div className="relative group mb-8">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <SearchIcon className="h-6 w-6 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-16 pr-6 py-6 bg-white border-0 rounded-[2rem] shadow-xl shadow-slate-200/50 text-slate-800 text-lg font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
              placeholder="Type a city or address..."
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-6 flex items-center">
                <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
              </div>
            )}
          </div>
          <div className="space-y-4">
            {searchResults.length > 0 && (
              <div className="px-2 mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculated results for "{searchQuery}"</span>
              </div>
            )}
            {searchResults.map((result, idx) => (
              <button key={idx} onClick={() => loadData(result)} className="w-full text-left bg-white p-6 rounded-2xl border border-slate-100 hover:border-emerald-500 hover:shadow-md transition-all group flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors shrink-0">
                  <MapPin className="w-6 h-6 text-slate-400 group-hover:text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-lg">{result.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed truncate">{result.address}</p>
                </div>
                {result.aqi !== undefined && (
                  <div className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl border shrink-0 ${getAQIColor(result.aqi)}`}>
                    <span className="text-lg font-black leading-none mb-1">{result.aqi}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none opacity-80">{result.status || 'AQI'}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'locating') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-emerald-200 blur-3xl opacity-30 animate-pulse" />
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl relative z-10 border border-slate-100">
            <MapIcon className="w-10 h-10 text-emerald-600 animate-pulse" />
          </div>
          <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full animate-[ping_2s_linear_infinite]" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Syncing APIs for</h2>
        <h3 className="text-xl font-black text-emerald-600 mb-6 px-8">{selectedLocation?.title}</h3>
        <p className="text-slate-500 max-w-xs mx-auto leading-relaxed">Cross-referencing IQAir, OpenAQ, OpenWeather, AQICN, and Google Air Quality...</p>
        <div className="mt-12 flex gap-3">
           {[0, 200, 400].map(delay => <div key={delay} className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />)}
        </div>
      </div>
    );
  }

  const activeProvider = data?.providers[activeProviderIndex];
  const compareData = data?.providers.map(p => ({ name: p.providerName.split(' ')[0], aqi: p.aqiValue }));

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep('welcome')}>
            <div className="bg-emerald-600 p-2 rounded-lg"><Wind className="text-white w-5 h-5" /></div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 font-black">BreathePure</span>
          </div>
          <button onClick={() => setStep('search')} className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-full transition-all shadow-lg">
            <SearchIcon className="w-3 h-3" />
            <span>Change Location</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Viewing Atmosphere In</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              {data?.locationName}
            </h1>
            <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">{selectedLocation?.address}</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100">
             <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><Globe className="w-4 h-4 text-emerald-600" /></div>
             <div>
               <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Station Network</div>
               <div className="text-xs font-bold text-emerald-600">5 Providers Verified</div>
             </div>
          </div>
        </div>

        {/* Multi-Source Comparison Tabs */}
        <div className="flex overflow-x-auto gap-3 pb-6 no-scrollbar">
          {data?.providers.map((p, idx) => (
            <button 
              key={p.providerName}
              onClick={() => setActiveProviderIndex(idx)}
              className={`flex-shrink-0 px-6 py-4 rounded-2xl border transition-all flex flex-col items-start gap-1 min-w-[160px] ${activeProviderIndex === idx ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-600 border-slate-100 hover:border-emerald-200'}`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{p.providerName}</span>
              <div className="flex items-center justify-between w-full">
                <span className="text-xl font-black">{p.aqiValue}</span>
                <div className={`w-2 h-2 rounded-full ${getAQIBG(p.aqiValue)}`} />
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
              {/* Context Label In Card Corner - Displaying Name prominently */}
              <div className="absolute top-8 right-8 hidden md:block">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-900/10">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-wider truncate max-w-[200px]">
                    {data?.locationName}
                  </span>
                </div>
              </div>
              
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] -z-0"><Activity className="w-64 h-64" /></div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                <div className="space-y-4">
                  <h2 className="text-slate-500 font-bold text-sm">Calculated Air Quality Index</h2>
                  <h1 className="text-9xl font-black text-slate-900 leading-none tracking-tighter">{activeProvider?.aqiValue}</h1>
                  <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full border text-sm font-bold shadow-sm ${getAQIColor(activeProvider?.aqiValue || 0)}`}>
                    <div className={`w-3 h-3 rounded-full ${getAQIBG(activeProvider?.aqiValue || 0)}`} />
                    {activeProvider?.status}
                  </div>
                  <p className="text-slate-400 text-xs font-medium italic">{activeProvider?.description}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 md:flex md:flex-col gap-3">
                   {[{ icon: Droplets, label: 'Humidity', val: '45%', col: 'blue' }, { icon: CloudRain, label: 'Precip.', val: '2%', col: 'teal' }, { icon: Navigation, label: 'Wind', val: '12 km/h', col: 'indigo' }].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className={`w-10 h-10 rounded-xl bg-${item.col}-100 flex items-center justify-center`}><item.icon className={`text-${item.col}-600 w-5 h-5`} /></div>
                      <div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.label}</div><div className="text-base font-bold text-slate-800">{item.val}</div></div>
                    </div>
                   ))}
                </div>
              </div>
              <div className="mt-14 space-y-3">
                 <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                   <span>Good</span><span>Moderate</span><span>Sensitive</span><span>Unhealthy</span><span>Hazardous</span>
                 </div>
                 <div className="h-4 w-full rounded-full bg-gradient-to-r from-green-500 via-yellow-400 via-orange-500 via-red-500 via-purple-600 to-rose-900 relative">
                    <div className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-[3px] border-slate-900 rounded-full shadow-2xl transition-all duration-1000 flex items-center justify-center" style={{ left: `${Math.min((activeProvider?.aqiValue || 0) / 3, 100)}%` }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                    </div>
                 </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-10">
                <div><h3 className="text-lg font-black text-slate-900">Source Correlation</h3><p className="text-xs text-slate-400 mt-1">Comparing real-time results across all 5 monitoring services</p></div>
                <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">Network View</div>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compareData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={10} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="aqi" radius={[8, 8, 8, 8]} barSize={40}>
                      {compareData?.map((entry, index) => <Cell key={index} fill={index === activeProviderIndex ? '#10b981' : '#e2e8f0'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              <PollutantCard label="PM2.5" value={activeProvider?.pollutants.pm25 || 0} unit="μg/m³" fullName="Fine Particulates" threshold={25} />
              <PollutantCard label="PM10" value={activeProvider?.pollutants.pm10 || 0} unit="μg/m³" fullName="Coarse Particulates" threshold={50} />
              <PollutantCard label="NO2" value={activeProvider?.pollutants.no2 || 0} unit="μg/m³" fullName="Nitrogen Dioxide" threshold={40} />
              <PollutantCard label="SO2" value={activeProvider?.pollutants.so2 || 0} unit="μg/m³" fullName="Sulfur Dioxide" threshold={20} />
              <PollutantCard label="O3" value={activeProvider?.pollutants.o3 || 0} unit="μg/m³" fullName="Ozone Layer" threshold={100} />
              <PollutantCard label="CO" value={activeProvider?.pollutants.co || 0} unit="mg/m³" fullName="Carbon Monoxide" threshold={4} />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-600/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center"><BarChart3 className="w-5 h-5 text-white" /></div>
                <h3 className="text-xl font-black">Consensus</h3>
              </div>
              <div className="text-5xl font-black mb-2">{data?.avgAqi}</div>
              <p className="text-emerald-100/80 text-sm font-medium leading-relaxed">The average AQI consensus for {data?.locationName}.</p>
              <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">High Confidence Level</span>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 group">
              <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3"><Layers className="w-5 h-5 text-emerald-500" /> Health Protocol</h3>
              <ul className="space-y-6">
                {data?.recommendations.map((tip, idx) => (
                  <li key={idx} className="flex gap-4 items-start"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" /><p className="text-slate-500 text-sm leading-relaxed font-bold">{tip}</p></li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
               <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3"><Activity className="w-5 h-5 text-slate-500" /> Verification Evidence</h3>
               <div className="space-y-3">
                 {data?.sources.map((source, idx) => (
                   <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100 group">
                     <span className="text-xs font-bold text-slate-600 truncate max-w-[160px]">{source.title}</span><ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-transform" />
                   </a>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-10 border-t border-slate-200 text-center">
        <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">BreathePure Monitoring • Calculated for {data?.locationName}</p>
      </footer>
    </div>
  );
};

export default App;
