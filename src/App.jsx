import React, { useState, useEffect, useRef } from 'react';
import {
  Map, Navigation2, FileWarning, Search, Car, AlertTriangle,
  CheckCircle, Mountain, X, Bike, Info, List, MapPin, Navigation, ArrowLeft, Trash2
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { useAuth } from './contexts/AuthContext';
import AuthScreen from './components/AuthScreen';
import UserMenu from './components/UserMenu';
import kawahRatuImg from './assets/kawahratu.jpeg';
import tanjungLesungImg from './assets/tanjunglesung.jpeg';
import baduyDalamImg from './assets/baduy.jpg';


const VEHICLES = [
  { id: 'sedan', name: 'Sedan / City Car', icon: <Car size={16}/>, clearance: 'Low', capability: 1 },
  { id: 'mpv', name: 'MPV / Keluarga', icon: <Car size={16}/>, clearance: 'Medium', capability: 2 },
  { id: 'suv', name: 'SUV / 4WD', icon: <Car size={16}/>, clearance: 'High', capability: 3 },
  { id: 'motor', name: 'Motor Roda 2', icon: <Bike size={16}/>, clearance: 'Medium', capability: 4 }
];

const DESTINATIONS = [
  {
    id: 'kawah-ratu',
    name: 'Kawah Ratu, Gunung Salak',
    category: 'Wisata Alam / Ekstrem',
    distance: '75 km',
    desc: 'Kawah aktif dengan pemandangan eksotis di TNGHS. Jalur menuju kesana menanjak dan berbatu padas.',
    img: kawahRatuImg,
    lat: -6.7213,
    lng: 106.6570,
    req_capability: 3, 
    trekking_required: true,
    parking_name: 'Pos Pendakian Cangkuang',
    parking_lat: -6.7050,
    parking_lng: 106.6600,
    shortcut_lat: -6.6500,
    shortcut_lng: 106.7500,
    reports: [
      { user: 'Budi (Jeep)', msg: 'Jalan akses pasca hujan licin parah. Wajib 4WD atau rantai ban.', sev: 4, time: '2 jam lalu' }
    ]
  },
  {
    id: 'tanjung-lesung',
    name: 'Pantai Tanjung Lesung',
    category: 'Wisata Pantai / Keluarga',
    distance: '170 km',
    desc: 'Resort pantai pasir putih dengan akses jalan aspal mulus sebagian besar jalurnya.',
    img: tanjungLesungImg,
    lat: -6.4786,
    lng: 105.6601,
    req_capability: 1, 
    trekking_required: false,
    shortcut_lat: -6.4600,
    shortcut_lng: 105.6700,
    reports: [
      { user: 'Andi', msg: 'Jalanan cor beton mulus, sedikit berlubang di area pasar.', sev: 1, time: '1 hari lalu' }
    ]
  },
  {
    id: 'baduy-dalam',
    name: 'Desa Wisata Baduy Dalam',
    category: 'Wisata Budaya / Ekstrem',
    distance: '130 km',
    desc: 'Suku pedalaman Banten yang menolak modernisasi. Tidak ada akses jalan kendaraan ke desa utama.',
    img: baduyDalamImg,
    lat: -6.6022, 
    lng: 106.2378,
    req_capability: 2, 
    trekking_required: true,
    parking_name: 'Terminal Ciboleger',
    parking_lat: -6.5810,
    parking_lng: 106.2550,
    shortcut_lat: -6.5850,
    shortcut_lng: 106.2450,
    reports: [
      { user: 'Traveler22', msg: 'Mobil hanya bisa sampai Terminal Ciboleger. Sisa 10km jalan kaki bukit.', sev: 3, time: '5 jam lalu' }
    ]
  }
];

const JAKARTA_LATLNG = [-6.200000, 106.816666];

const calculateFeasibility = (dest, vehicle) => {
  if (vehicle.capability >= dest.req_capability) {
    return { status: 'Aman Dilalui', risk: 'Low', color: 'bg-green-100 text-green-700', routeColor: '#10b981', score: 95 };
  } else if (vehicle.capability === dest.req_capability - 1) {
    return { status: 'Perlu Kewaspadaan', risk: 'Medium', color: 'bg-orange-100 text-orange-700', routeColor: '#f59e0b', score: 65 };
  } else {
    return { status: 'Sangat Berbahaya ', risk: 'High', color: 'bg-red-100 text-red-700', routeColor: '#ef4444', score: 25 };
  }
};

const DestinationDetail = ({ dest, vehicle, onClose, onNavigate, onDeleteReport }) => {
  const feas = calculateFeasibility(dest, vehicle);

  return (
    <div className="absolute inset-0 bg-white z-50 overflow-y-auto pb-20 animate-in slide-in-from-right-4">
      <div className="relative h-64 w-full">
        <img src={dest.img} alt={dest.name} className="w-full h-full object-cover" />
        <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/60 to-transparent">
          <button onClick={onClose} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
            <ArrowLeft size={20} />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
          <p className="text-sm font-medium text-indigo-300 mb-1">{dest.category}</p>
          <h1 className="text-2xl font-bold">{dest.name}</h1>
        </div>
      </div>

      <div className="p-4">
        <div className={`p-4 rounded-xl border mb-6 flex items-start gap-3 shadow-sm ${feas.risk === 'High' ? 'bg-red-50 border-red-200 text-red-800' : feas.risk === 'Medium' ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
          {feas.risk === 'High' ? <AlertTriangle className="shrink-0 mt-0.5" /> : <CheckCircle className="shrink-0 mt-0.5" />}
          <div>
            <h3 className="font-bold text-sm mb-1">Status Kendaraan Anda: {feas.status}</h3>
            <p className="text-xs opacity-90 leading-relaxed">
              Berdasarkan pilihan <b>{vehicle.name}</b>. {feas.risk === 'High' ? 'Kendaraan Anda berisiko mengalami kerusakan atau tidak kuat menanjak di rute ini.' : 'Rute aman dilalui dengan kehati-hatian standar.'}
            </p>
          </div>
        </div>

        {dest.trekking_required && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-800 font-bold mb-2">
              <Mountain size={18} />
              <span>Last Mile: Trekking Required</span>
            </div>
            <p className="text-xs text-emerald-700 leading-relaxed mb-3">
              Kendaraan tidak bisa masuk hingga ke titik lokasi utama. Anda harus memarkirkan kendaraan dan melanjutkan dengan berjalan kaki.
            </p>
            <div className="bg-white rounded-lg p-2.5 flex items-center justify-between border border-emerald-100">
              <span className="text-xs text-slate-500 font-medium">Titik Parkir Terakhir:</span>
              <span className="text-xs font-bold text-slate-800">{dest.parking_name}</span>
            </div>
          </div>
        )}

        <h3 className="font-bold text-slate-800 mb-2">Deskripsi</h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">{dest.desc}</p>

        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <FileWarning size={16} /> Laporan Komunitas Real-Time
        </h3>
        <div className="space-y-3 mb-6">
          {dest.reports.map((r, i) => (
            <div key={i} className="bg-slate-50 border border-slate-100 p-3 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">{r.user}</span>
                  <span className="text-[10px] text-slate-500">{r.time}</span>
                </div>
                {r.id && onDeleteReport && (
                  <button 
                    onClick={() => onDeleteReport(dest.id, r.id)}
                    className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                    title="Hapus Laporan"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-600">{r.msg}</p>
              <div className="mt-2 flex items-center gap-1">
                <span className="text-[10px] font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  Severity: Level {r.sev}/5
                </span>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => onNavigate(dest)}
          className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Navigation2 size={18} /> Mulai Navigasi Aman
        </button>
      </div>
    </div>
  );
};

// Helper: icon per vehicle (smaller, chip-style)
const VEHICLE_ICONS = {
  sedan: '🚗',
  mpv: '🚐',
  suv: '🛻',
  motor: '🏍️',
};

const DIFFICULTY_META = {
  'Wisata Alam / Ekstrem':   { color: 'bg-red-100 text-red-700',    dot: 'bg-red-500' },
  'Wisata Pantai / Keluarga':{ color: 'bg-sky-100 text-sky-700',    dot: 'bg-sky-500' },
  'Wisata Budaya / Ekstrem': { color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
};

const ExploreTab = ({ selectedVehicle, setSelectedVehicle, onSelectDest, destinations }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDestinations = destinations.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-[#f0f2f8] overflow-y-auto">

      {/* ─── Header ─── */}
      <div className="relative bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 text-white px-5 pt-10 pb-6 rounded-b-[32px] shadow-lg shrink-0 overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute top-4 right-16 w-16 h-16 bg-white/5 rounded-full" />

        <p className="text-indigo-200 text-xs font-semibold tracking-widest uppercase mb-1">Voyager Go</p>
        <h1 className="text-2xl font-black leading-tight mb-4">Mau Kemana<br/>Hari Ini? 🧭</h1>

        {/* Search bar */}
        <div className="bg-white/15 backdrop-blur-sm flex items-center gap-2 px-3 py-2.5 rounded-xl mb-5 border border-white/20 focus-within:bg-white/25 focus-within:border-white/40 transition-colors">
          <Search size={14} className="text-white/70" />
          <input 
            type="text" 
            placeholder="Cari destinasi wisata…" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-white placeholder:text-white/50 text-xs w-full"
          />
        </div>

        {/* Vehicle chips */}
        <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mb-2">Kendaraan Saya</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {VEHICLES.map(v => (
            <button
              key={v.id}
              onClick={() => setSelectedVehicle(v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap border transition-all ${
                selectedVehicle.id === v.id
                  ? 'bg-white text-indigo-700 border-white shadow-md scale-105'
                  : 'bg-white/15 text-white border-white/25 hover:bg-white/25'
              }`}
            >
              <span className="text-sm leading-none">{VEHICLE_ICONS[v.id]}</span>
              {v.name}
            </button>
          ))}
        </div>
      </div>

      {/* ─── List ─── */}
      <div className="px-4 pt-5 pb-28 flex-1 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-black text-slate-800 text-base">Rekomendasi Pintar</h2>
            <p className="text-slate-400 text-[10px]">{filteredDestinations.length} destinasi tersedia</p>
          </div>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            {selectedVehicle.name}
          </span>
        </div>

        {filteredDestinations.map(d => {
          const f = calculateFeasibility(d, selectedVehicle);
          const meta = DIFFICULTY_META[d.category] ?? { color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
          const warningReport = d.reports && d.reports.find(r => r.sev >= 4);
          const hasWarning = !!warningReport;
          return (
            <div
              key={d.id}
              onClick={() => onSelectDest(d)}
              className="bg-white rounded-2xl shadow-sm border border-slate-100/80 overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:shadow-md"
            >
              {/* Image */}
              <div className="h-36 relative overflow-hidden">
                <img src={d.img} alt={d.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                {/* Distance pill */}
                <div className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <MapPin size={9} /> {d.distance}
                </div>

                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
                  {/* Trekking badge */}
                  {d.trekking_required && (
                    <div className="bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Mountain size={9} /> Last Mile Trek
                    </div>
                  )}
                  {/* Warning badge */}
                  {hasWarning && (
                    <div className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse uppercase tracking-tight">
                      <FileWarning size={9} /> {warningReport.type || 'Awas Jalan Rusak'}
                    </div>
                  )}
                </div>

                {/* Name overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="font-bold text-white text-sm leading-tight drop-shadow">{d.name}</h3>
                </div>
              </div>

              {/* Info row */}
              <div className="px-3 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${meta.color}`}>
                    {d.category}
                  </span>
                </div>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${f.color}`}>
                  {f.risk === 'High' ? <AlertTriangle size={11}/> : f.risk === 'Medium' ? <AlertTriangle size={11}/> : <CheckCircle size={11}/>}
                  {f.status}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const NavigationTab = ({ targetNavDest, selectedVehicle, setSelectedVehicle, onGoExplore }) => {
  const [routeOptions, setRouteOptions] = useState([]);
  const [activeRouteIdx, setActiveRouteIdx] = useState(0);
  const [useShortcut, setUseShortcut] = useState(false);
  const mapRef = useRef(null);
  const layersRef = useRef(null);

  // Clean up map when component unmounts
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setUseShortcut(false);
  }, [targetNavDest]);

  useEffect(() => {
    if (!targetNavDest) return;
    const dest = targetNavDest;
    const isMotor = selectedVehicle.id === 'motor';
    const routingProfile = isMotor ? 'bike' : 'driving';
    const vehicleDestLat = dest.trekking_required ? dest.parking_lat : dest.lat;
    const vehicleDestLng = dest.trekking_required ? dest.parking_lng : dest.lng;

    const fetchRoute = async () => {
      try {
        let url = `https://router.project-osrm.org/route/v1/${routingProfile}/${JAKARTA_LATLNG[1]},${JAKARTA_LATLNG[0]};${vehicleDestLng},${vehicleDestLat}?overview=full&geometries=geojson&alternatives=true`;
        
        if (useShortcut && dest.shortcut_lat && dest.shortcut_lng) {
          url = `https://router.project-osrm.org/route/v1/${routingProfile}/${JAKARTA_LATLNG[1]},${JAKARTA_LATLNG[0]};${dest.shortcut_lng},${dest.shortcut_lat};${vehicleDestLng},${vehicleDestLat}?overview=full&geometries=geojson&alternatives=true`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (data.routes && data.routes.length > 0) {
          setRouteOptions(data.routes);
          setActiveRouteIdx(0);
        }
      } catch (err) {
        console.error("Routing error:", err);
      }
    };

    fetchRoute();
  }, [targetNavDest, selectedVehicle, useShortcut]);

  useEffect(() => {
    if (!targetNavDest || routeOptions.length === 0) return;

    const initMap = () => {
      if (!window.L) {
        setTimeout(initMap, 100); 
        return;
      }

      const dest = targetNavDest;
      const feas = calculateFeasibility(dest, selectedVehicle);
      
      const container = document.getElementById('nav-map-container');
      if (!container) return;

      if (!mapRef.current) {
          mapRef.current = window.L.map('nav-map-container', { 
            zoomControl: false,
            attributionControl: false 
          }).setView(JAKARTA_LATLNG, 13);
          
          window.L.tileLayer('https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
          }).addTo(mapRef.current);

          layersRef.current = window.L.layerGroup().addTo(mapRef.current);
      } else {
          layersRef.current.clearLayers();
      }

      const layerGroup = layersRef.current;
      const mapInstance = mapRef.current;

      const vehicleDestLat = dest.trekking_required ? dest.parking_lat : dest.lat;
      const vehicleDestLng = dest.trekking_required ? dest.parking_lng : dest.lng;

      window.L.circleMarker(JAKARTA_LATLNG, { color: 'black', fillColor: 'white', fillOpacity: 1, radius: 6, weight: 3 }).addTo(layerGroup);

      const parkingIconHtml = `<div style="background-color: ${feas.routeColor}; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size: 12px;">P</div>`;
      const parkingIcon = window.L.divIcon({ html: parkingIconHtml, className: '', iconSize: [24,24], iconAnchor: [12,12] });
      window.L.marker([vehicleDestLat, vehicleDestLng], { icon: parkingIcon }).addTo(layerGroup);

      if (dest.trekking_required) {
        const destIconHtml = `<div style="background-color: #10b981; color: white; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`;
        const destIcon = window.L.divIcon({ html: destIconHtml, className: '', iconSize: [14,14], iconAnchor: [7,7] });
        window.L.marker([dest.lat, dest.lng], { icon: destIcon }).addTo(layerGroup);
      }

      const bounds = window.L.latLngBounds();
      const hasWarning = dest.reports && dest.reports.some(r => r.sev >= 4);
      
      // Draw alternatives first
      routeOptions.forEach((route, idx) => {
        if (idx === activeRouteIdx) return;
        const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
        const isMainWithWarning = (idx === 0 && hasWarning);
        const isAltForWarning = (idx !== 0 && hasWarning);
        const altColor = isMainWithWarning ? '#ef4444' : isAltForWarning ? '#10b981' : '#94a3b8';
        const altOpacity = isMainWithWarning ? 0.9 : 0.8;
        window.L.polyline(coords, { color: altColor, opacity: altOpacity, weight: 4, dashArray: '5, 8' }).addTo(layerGroup);
        bounds.extend(coords);
      });

      // Draw active route last
      const activeRoute = routeOptions[activeRouteIdx];
      if (activeRoute) {
        const coords = activeRoute.geometry.coordinates.map(c => [c[1], c[0]]);
        window.L.polyline(coords, { color: '#000000', opacity: 0.15, weight: 8 }).addTo(layerGroup);
        
        let activeRouteColor = feas.routeColor;
        if (hasWarning) {
            if (useShortcut) {
                activeRouteColor = '#10b981';
            } else {
                if (activeRouteIdx === 0) activeRouteColor = '#ef4444';
                else activeRouteColor = '#10b981';
            }
        }

        window.L.polyline(coords, { color: activeRouteColor, opacity: 0.9, weight: 5 }).addTo(layerGroup);
        bounds.extend(coords);
      }

      if (useShortcut && dest.shortcut_lat && dest.shortcut_lng) {
        const shortcutIconHtml = `<div style="background-color: #3b82f6; color: white; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size: 8px;">S</div>`;
        const shortcutIcon = window.L.divIcon({ html: shortcutIconHtml, className: '', iconSize: [16,16], iconAnchor: [8,8] });
        window.L.marker([dest.shortcut_lat, dest.shortcut_lng], { icon: shortcutIcon })
          .bindTooltip("Jalan Pintas", { permanent: true, direction: 'top', className: 'font-bold text-blue-600 border-blue-200 text-[10px]' })
          .addTo(layerGroup);
      }

      if (hasWarning && routeOptions[0] && !useShortcut) {
        const warningReport = dest.reports.find(r => r.sev >= 4);
        const warningType = warningReport && warningReport.type ? warningReport.type : "Awas! Jalan Rusak";

        const mainRouteCoords = routeOptions[0].geometry.coordinates;
        // Simulate hazard location somewhere along the main route
        const hazardPoint = mainRouteCoords[Math.floor(mainRouteCoords.length * 0.6)];
        const warningIconHtml = `<div class="bg-red-500 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-pulse" style="font-size: 12px;">⚠️</div>`;
        const warningIcon = window.L.divIcon({ html: warningIconHtml, className: '', iconSize: [24,24], iconAnchor: [12,12] });
        window.L.marker([hazardPoint[1], hazardPoint[0]], { icon: warningIcon })
          .bindTooltip(warningType, { permanent: true, direction: 'top', className: 'font-bold text-red-600 border-red-200 text-[10px] whitespace-normal max-w-[150px] text-center uppercase tracking-tight' })
          .addTo(layerGroup);
      }

      if (dest.trekking_required) {
        const walkCoords = [ [vehicleDestLat, vehicleDestLng], [dest.lat, dest.lng] ];
        window.L.polyline(walkCoords, { color: '#10b981', weight: 4, dashArray: '5, 8' }).addTo(layerGroup);
        bounds.extend(walkCoords);
      }

      if (bounds.isValid()) {
        mapInstance.fitBounds(bounds, { padding: [40, 150] }); 
      }
    };

    initMap();
  }, [targetNavDest, selectedVehicle, routeOptions, activeRouteIdx, useShortcut]);

  if (!targetNavDest) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <Navigation size={32} className="text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Tujuan</h2>
        <p className="text-sm text-slate-500 mb-6">Pilih destinasi dari menu Explore untuk memulai navigasi aman.</p>
        <button onClick={onGoExplore} className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg">
          Cari Destinasi
        </button>
      </div>
    );
  }

  const feasibility = calculateFeasibility(targetNavDest, selectedVehicle);

  return (
    <div className="h-full w-full relative bg-slate-200">
      <div id="nav-map-container" className="absolute inset-0 z-0 h-full w-full"></div>

      <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none flex flex-col gap-2">
        <div className="flex flex-col gap-2 pointer-events-auto">
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-3 shadow-xl text-white flex items-center gap-3">
            <Navigation2 size={24} className="text-indigo-400 rotate-45" />
            <div>
              <p className="text-xl font-bold">{targetNavDest.distance.replace(/ km/i, '')} <span className="text-xs text-slate-300 font-medium">km</span></p>
              <p className="text-slate-300 text-[11px]">Menuju {targetNavDest.name}</p>
            </div>
          </div>
          
          {(() => {
            const warningReport = targetNavDest.reports && targetNavDest.reports.find(r => r.sev >= 4);
            const hasDamage = !!warningReport;
            const hasFeasibility = feasibility.risk !== 'Low';
            const hasTrekking = targetNavDest.trekking_required;

            if (hasDamage) {
              return (
                <div className="bg-orange-50/95 backdrop-blur-md border border-orange-300 rounded-xl p-2 flex flex-col gap-2 shadow-sm">
                  <div className="flex items-start gap-2">
                    <FileWarning size={16} className="text-orange-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-orange-700 uppercase tracking-tight">{warningReport.type || 'Peringatan Terkini!'}</p>
                      <p className="text-[10px] text-orange-600 mt-0.5 leading-snug italic line-clamp-2">
                        "{warningReport.msg}"
                      </p>
                      <p className="text-[8px] text-orange-500 mt-1 font-medium bg-orange-100/50 inline-block px-1.5 py-0.5 rounded">
                        Oleh: {warningReport.user} • Severity: {warningReport.sev}/5
                      </p>
                    </div>
                  </div>
                  {targetNavDest.shortcut_lat && !useShortcut && (
                    <button 
                      onClick={() => setUseShortcut(true)}
                      className="w-full mt-1 py-1.5 bg-orange-100 text-orange-700 hover:bg-orange-200 text-[10px] font-bold rounded-lg border border-orange-200 transition-colors cursor-pointer"
                    >
                      Cari Jalan Pintas Aman
                    </button>
                  )}
                  {useShortcut && (
                    <div className="w-full mt-1 py-1.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-200 text-center">
                      ✓ Jalan Pintas Aktif
                    </div>
                  )}
                </div>
              );
            }

            if (hasFeasibility) {
              return (
                <div className="bg-red-50/95 backdrop-blur-md border border-red-200 rounded-xl p-2 flex items-start gap-2 shadow-sm animate-pulse">
                  <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-red-700">Peringatan Kelayakan Kendaraan</p>
                    <p className="text-[9px] text-red-600 mt-0.5 leading-tight">Medan ini sulit dilalui oleh kendaraan Anda. Hati-hati.</p>
                  </div>
                </div>
              );
            }

            if (hasTrekking) {
              return (
                <div className="bg-emerald-50/95 backdrop-blur-md border border-emerald-300 rounded-xl p-2 flex items-start gap-2 shadow-md">
                  <Mountain size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-emerald-800 uppercase tracking-wide">Last Mile: Trekking</p>
                    <p className="text-[9px] text-emerald-700 mt-0.5 font-medium leading-tight">Parkir di <b>{targetNavDest.parking_name}</b>. Lanjut jalan kaki.</p>
                  </div>
                </div>
              );
            }

            return null;
          })()}
        </div>
      </div>

      <div className="absolute bottom-24 left-4 right-4 z-10 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] p-3 pointer-events-auto">
          <div className="flex justify-between items-end mb-2">
              <h3 className="text-sm font-bold text-slate-800">Trip Feasibility</h3>
              <div className={`text-base font-black ${feasibility.risk === 'High' ? 'text-red-500' : feasibility.risk === 'Medium' ? 'text-orange-500' : 'text-green-500'}`}>
                {feasibility.score}%
              </div>
          </div>

          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex mb-2 shadow-inner">
              <div className="bg-green-500 h-full transition-all duration-1000" style={{width: feasibility.score >= 30 ? '33.3%' : '0%'}}></div>
              <div className="bg-orange-500 h-full transition-all duration-1000" style={{width: feasibility.score >= 60 ? '33.3%' : '0%'}}></div>
              <div className="bg-red-500 h-full transition-all duration-1000" style={{width: feasibility.score >= 90 ? '33.4%' : '0%'}}></div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1 rounded-full ${feasibility.color}`}>
              {feasibility.risk === 'High' ? <X size={12} /> : <Car size={12} />}
            </div>
            <p className="text-[11px] font-medium text-slate-700">
                Status: <span className="font-bold">{feasibility.status}</span>
            </p>
          </div>

          {routeOptions.length > 1 && (
            <div className="border-t border-slate-100 pt-2 mb-2">
              <p className="text-[9px] text-slate-500 font-medium mb-1.5">Pilihan Rute Alternatif (Pintas):</p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {routeOptions.map((r, i) => {
                  const isMainWithWarning = (i === 0 && targetNavDest.reports && targetNavDest.reports.some(rep => rep.sev >= 4));
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveRouteIdx(i)}
                      className={`px-3 py-1.5 rounded-xl border text-[9px] font-bold whitespace-nowrap transition-all flex flex-col items-center gap-0.5 ${
                        activeRouteIdx === i 
                          ? (isMainWithWarning 
                              ? 'border-red-500 bg-red-50 text-red-700 shadow-sm' 
                              : 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm')
                          : (isMainWithWarning
                              ? 'border-red-200 text-red-500 hover:bg-red-50'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50')
                      }`}
                    >
                      <span>Rute {i === 0 ? 'Utama' : `Alternatif ${i}`} ({(r.distance / 1000).toFixed(1)} km)</span>
                      {isMainWithWarning && i === 0 && <span className="text-[8px] text-red-600">⚠️ Hindari</span>}
                      {i !== 0 && targetNavDest.reports && targetNavDest.reports.some(rep => rep.sev >= 4) && <span className="text-[8px] text-emerald-600 font-medium">✨ Aman (Cek Medannya)</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="border-t border-slate-100 pt-2">
              <p className="text-[9px] text-slate-500 font-medium mb-1.5">Ganti Kendaraan Untuk Cek Ulang Rute:</p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {VEHICLES.map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicle(v)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[9px] whitespace-nowrap transition-all ${
                    selectedVehicle.id === v.id 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold shadow-sm' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="scale-[0.8] origin-left">{v.icon}</span>
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportTab = ({ destinations, onSubmitReport, userName }) => {
  const [selectedDestId, setSelectedDestId] = useState(destinations[0]?.id || '');
  const [severity, setSeverity] = useState(3);
  const [reportType, setReportType] = useState('Jalan Berlubang');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDestId) return;

    setIsSubmitting(true);

    // Simulate network submission with loading spinner
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

    // Submit data to main state
    onSubmitReport({
      destId: selectedDestId,
      report: {
        user: userName || 'Anonim',
        msg: comment || `${reportType} terpantau di jalur ini. Harap berhati-hati.`,
        sev: severity,
        time: 'Baru saja',
        type: reportType
      }
    });
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="h-full bg-white flex flex-col items-center justify-center p-6 text-center pb-24 duration-300">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5 shadow-lg shadow-emerald-100/50 animate-bounce">
          <CheckCircle size={40} className="text-emerald-600 stroke-[2.5]" />
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-2">Laporan Terkirim!</h3>
        <p className="text-xs text-slate-500 max-w-[260px] leading-relaxed mb-6">
          Terima kasih telah melaporkan kondisi jalan. Laporan Anda kini aktif secara real-time untuk pemudik lainnya!
        </p>
        <div className="w-full max-w-[240px] bg-slate-100 h-1 rounded-full overflow-hidden">
          <div className="bg-indigo-600 h-full w-full animate-loader"></div>
        </div>
        <span className="text-[10px] text-slate-400 mt-2 font-medium">Kembali ke Jelajah...</span>
      </div>
    );
  }

  const selectedDest = destinations.find(d => d.id === selectedDestId);

  return (
    <form onSubmit={handleSubmit} className="h-full bg-white p-6 overflow-y-auto pb-28">
      <h2 className="text-2xl font-black text-slate-800 mb-1">Lapor Kondisi</h2>
      <p className="text-xs text-slate-500 mb-5">Bantu traveler lain dengan melaporkan rute berbahaya secara real-time.</p>

      {/* --- Visual Destination Selector Scroll --- */}
      <div className="mb-5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">Pilih Destinasi Wisata</label>
        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 -mx-6 px-6 scrollbar-hide">
          {destinations.map(d => {
            const isSelected = d.id === selectedDestId;
            return (
              <div
                key={d.id}
                onClick={() => setSelectedDestId(d.id)}
                className={`relative flex-shrink-0 w-32 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 ${
                  isSelected 
                    ? 'border-indigo-650 scale-[1.03] shadow-md shadow-indigo-100' 
                    : 'border-slate-100 scale-95 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="h-14 relative">
                  <img src={d.img} alt={d.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-indigo-600 text-white rounded-full p-0.5 shadow">
                      <CheckCircle size={10} className="stroke-[3]" />
                    </div>
                  )}
                </div>
                <div className="p-2 bg-slate-50">
                  <p className="text-[9px] font-bold text-slate-800 line-clamp-1 leading-tight">{d.name}</p>
                  <p className="text-[7px] text-slate-400 font-bold mt-0.5 line-clamp-1 uppercase">{d.category.split('/')[0].trim()}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Selected Location Address Display --- */}
      {selectedDest && (
        <div className="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100/50 mb-5 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-sm shrink-0">
            <MapPin size={16}/>
          </div>
          <div className="min-w-0">
            <p className="text-[8px] text-indigo-600 font-bold uppercase tracking-wider">Lokasi Deteksi Rute</p>
            <p className="font-extrabold text-xs text-slate-800 truncate">{selectedDest.name}</p>
            <p className="text-[9px] text-slate-450 truncate">
              {selectedDest.trekking_required ? `Titik Parkir: ${selectedDest.parking_name}` : 'Akses Kendaraan Langsung'}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* --- Severity Input --- */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Tingkat Bahaya (Severity)</label>
            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border transition-colors ${
              severity >= 4 
                ? 'bg-red-50 text-red-700 border-red-100' 
                : severity === 3 
                  ? 'bg-amber-50 text-amber-700 border-amber-100' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-100'
            }`}>
              Level {severity} / 5 ({severity >= 4 ? 'Berbahaya' : severity === 3 ? 'Waspada' : 'Aman'})
            </span>
          </div>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(num => {
              const isActive = severity === num;
              let activeClass = '';
              if (isActive) {
                if (num >= 4) activeClass = 'bg-red-650 border-red-650 text-white shadow-md shadow-red-100 scale-105';
                else if (num === 3) activeClass = 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-100 scale-105';
                else activeClass = 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-100 scale-105';
              } else {
                activeClass = 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300';
              }
              return (
                <button
                  type="button"
                  key={num}
                  onClick={() => setSeverity(num)}
                  className={`flex-1 py-2 rounded-xl font-black border text-xs transition-all duration-200 ${activeClass}`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* --- Report Type Input --- */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">Jenis Kendala</label>
          <div className="grid grid-cols-2 gap-2">
            {['Jalan Berlubang', 'Longsor', 'Banjir', 'Jalan Sempit'].map(type => {
              const isActive = reportType === type;
              return (
                <button
                  type="button"
                  key={type}
                  onClick={() => setReportType(type)}
                  className={`p-3 text-[10px] font-bold border rounded-xl text-left flex items-center justify-between transition-all duration-200 ${
                    isActive 
                      ? 'border-indigo-650 bg-indigo-50/70 text-indigo-700 shadow-sm' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{type}</span>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                    isActive ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-350 bg-white'
                  }`}>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-scale-in" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* --- Comment Input --- */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Keterangan Tambahan</label>
          <textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors bg-slate-50/50 hover:bg-slate-50/20" 
            rows="3" 
            placeholder={`Contoh: Ada ${reportType.toLowerCase()} parah di lajur kiri. Sangat disarankan SUV atau motor saja...`}
          ></textarea>
        </div>

        {/* --- Submit Button --- */}
        <button 
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-slate-900 text-white font-extrabold py-3.5 rounded-xl shadow-md mt-2 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
            isSubmitting ? 'opacity-80 cursor-not-allowed scale-[0.98]' : 'hover:bg-slate-850 hover:shadow-lg'
          }`}
        >
          {isSubmitting ? (
            <div className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-150"></span>
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-300"></span>
            </div>
          ) : (
            <span>Kirim Laporan</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default function App() {
  const { user, loading, userName } = useAuth();
  const [currentTab, setCurrentTab] = useState('explore');
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLES[1]); // Default MPV
  const [selectedDest, setSelectedDest] = useState(null);
  const [targetNavDest, setTargetNavDest] = useState(null);
  const [destinations, setDestinations] = useState(DESTINATIONS);

  useEffect(() => {
    if (!user || !supabase) return;
    const fetchReports = async () => {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          setDestinations(prevDest => {
            return prevDest.map(d => {
              const destReports = data.filter(r => r.dest_id === d.id).map(r => ({
                id: r.id,
                user: r.user_name,
                msg: r.message,
                sev: r.severity,
                time: r.time_label || 'Baru saja',
                type: r.report_type
              }));

              return {
                ...d,
                reports: [...destReports, ...(d.reports || [])]
              };
            });
          });
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
    };
    fetchReports();
  }, [user]);

  useEffect(() => {
    // Inject Leaflet CSS & JS dynamically mapping
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      document.head.appendChild(script);
    }
  }, []);

  // Show loading while checking auth session
  if (loading) {
    return (
      <div className="w-full h-screen max-h-[100dvh] bg-slate-900 flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-white">
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:75ms]" />
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms]" />
        </div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return (
      <div className="w-full h-screen max-h-[100dvh] bg-slate-900 flex items-center justify-center font-sans">
        <div className="w-full max-w-[400px] h-full sm:h-[800px] sm:max-h-[100vh] bg-white sm:rounded-[40px] shadow-2xl relative flex flex-col sm:border-[8px] border-slate-800 overflow-hidden">
          <AuthScreen />
        </div>
      </div>
    );
  }

  const handleStartNavigation = (dest) => {
    setTargetNavDest(dest);
    setSelectedDest(null);
    setCurrentTab('navigate');
  };

  const handleSubmitReport = async ({ destId, report }) => {
    // Generate temporary ID for optimistic UI
    const tempId = `temp-${Date.now()}`;
    const reportWithTempId = { ...report, id: tempId };

    setDestinations(prev => prev.map(d => {
      if (d.id === destId) {
        return {
          ...d,
          reports: [reportWithTempId, ...d.reports]
        };
      }
      return d;
    }));

    if (supabase) {
      try {
        const { data, error } = await supabase.from('reports').insert([{
          dest_id: destId,
          user_name: report.user,
          message: report.msg,
          severity: report.sev,
          report_type: report.type || 'Laporan Pengguna',
          time_label: report.time,
          user_id: user?.id || null
        }]).select();

        if (error) {
          console.error("Failed to insert report:", error);
        } else if (data && data.length > 0) {
          // Replace tempId with actual DB id
          const realId = data[0].id;
          setDestinations(prev => prev.map(d => {
            if (d.id === destId) {
              return {
                ...d,
                reports: d.reports.map(r => r.id === tempId ? { ...r, id: realId } : r)
              };
            }
            return d;
          }));
        }
      } catch (err) {
        console.error("Failed to insert report exception:", err);
      }
    }

    // Beautiful delay redirect to ensure they feel the success popup
    setTimeout(() => {
      setCurrentTab('explore');
    }, 2800);
  };

  const handleDeleteReport = async (destId, reportId) => {
    // Confirmation dialog
    const isConfirm = window.confirm("Apakah Anda yakin ingin menghapus laporan ini?");
    if (!isConfirm) return;

    let backupReports = [];

    // Optimistic UI update
    setDestinations(prev => prev.map(d => {
      if (d.id === destId) {
        backupReports = d.reports; // Save backup for rollback
        return {
          ...d,
          reports: d.reports.filter(r => r.id !== reportId)
        };
      }
      return d;
    }));

    if (supabase && reportId && (!String(reportId).startsWith('temp-'))) {
      try {
        const { data, error } = await supabase.from('reports').delete().eq('id', reportId).select();
        
        if (error) {
          console.error("Supabase delete error:", error);
          alert("Gagal menghapus laporan di database: " + error.message);
          // Rollback
          setDestinations(prev => prev.map(d => d.id === destId ? { ...d, reports: backupReports } : d));
        } else if (data && data.length === 0) {
          console.warn("Delete executed but 0 rows affected. Check Supabase RLS Policy.");
          alert("Data tidak terhapus di database. Kemungkinan besar disebabkan oleh RLS (Row Level Security) Supabase. Pastikan Anda telah membuat 'Policy' di tabel 'reports' yang mengizinkan operasi DELETE untuk publik/anonim.");
          // Rollback
          setDestinations(prev => prev.map(d => d.id === destId ? { ...d, reports: backupReports } : d));
        }
      } catch (err) {
        console.error("Failed to delete report exception:", err);
        // Rollback
        setDestinations(prev => prev.map(d => d.id === destId ? { ...d, reports: backupReports } : d));
      }
    }
  };

  // Keep references to active details reactive
  const activeDest = selectedDest ? destinations.find(d => d.id === selectedDest.id) : null;
  const activeNavDest = targetNavDest ? destinations.find(d => d.id === targetNavDest.id) : null;

  return (
    <div className="w-full h-screen max-h-[100dvh] bg-slate-900 flex items-center justify-center font-sans">
      <div className="w-full max-w-[400px] h-full sm:h-[800px] sm:max-h-[100vh] bg-white sm:rounded-[40px] shadow-2xl relative flex flex-col sm:border-[8px] border-slate-800 overflow-hidden">

        {/* User Menu - top right overlay */}
        <div className="absolute top-3 right-3 z-50">
          <UserMenu />
        </div>

        <div className="flex-1 relative overflow-hidden h-full">
          {currentTab === 'explore' && (
             <ExploreTab 
                selectedVehicle={selectedVehicle} 
                setSelectedVehicle={setSelectedVehicle} 
                onSelectDest={setSelectedDest}
                destinations={destinations}
             />
          )}
          {currentTab === 'navigate' && (
             <NavigationTab 
                targetNavDest={activeNavDest}
                selectedVehicle={selectedVehicle}
                setSelectedVehicle={setSelectedVehicle}
                onGoExplore={() => setCurrentTab('explore')}
             />
          )}
          {currentTab === 'report' && (
            <ReportTab
              destinations={destinations}
              onSubmitReport={handleSubmitReport}
              userName={userName}
            />
          )}

          {activeDest && (
             <DestinationDetail 
                dest={activeDest} 
                vehicle={selectedVehicle} 
                onClose={() => setSelectedDest(null)}
                onNavigate={handleStartNavigation}
                onDeleteReport={handleDeleteReport}
             />
          )}
        </div>

        <div className="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-100 flex justify-around pb-6 pt-3 px-2 z-40 rounded-b-[32px]">
          <button onClick={() => setCurrentTab('explore')} className={`flex flex-col items-center gap-1 p-2 w-20 transition-colors ${currentTab === 'explore' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <Search size={22} className={currentTab === 'explore' ? 'stroke-[2.5]' : ''} />
            <span className="text-[10px] font-bold">Explore</span>
          </button>
          
          <button onClick={() => setCurrentTab('navigate')} className={`flex flex-col items-center gap-1 p-2 w-20 transition-colors ${currentTab === 'navigate' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <Map size={22} className={currentTab === 'navigate' ? 'stroke-[2.5]' : ''} />
            <span className="text-[10px] font-bold">Navigate</span>
          </button>
          
          <button onClick={() => setCurrentTab('report')} className={`flex flex-col items-center gap-1 p-2 w-20 transition-colors ${currentTab === 'report' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <FileWarning size={22} className={currentTab === 'report' ? 'stroke-[2.5]' : ''} />
            <span className="text-[10px] font-bold">Report</span>
          </button>
        </div>
        
      </div>
    </div>
  );
}