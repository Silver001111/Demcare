import React, { useState } from 'react';
import { MapPin, Users, AlertTriangle, ShieldCheck, Filter, Download, Activity, Search } from 'lucide-react';
import { DistrictEpidemiology, LanguageCode } from '../../types';

interface Props {
  lang?: LanguageCode;
}

const DISTRICT_DATA: DistrictEpidemiology[] = [
  {
    id: 'dist_dibrugarh',
    district: 'Dibrugarh',
    state: 'Assam',
    totalScreened: 412,
    mciRiskPercent: 24.5,
    averageCcs: 66.8,
    predominantLanguage: 'Assamese / Tea Dialects',
    alertLevel: 'high',
    activeAshas: 16,
  },
  {
    id: 'dist_kamrup',
    district: 'Kamrup Metro (Guwahati)',
    state: 'Assam',
    totalScreened: 685,
    mciRiskPercent: 19.2,
    averageCcs: 71.4,
    predominantLanguage: 'Assamese / Bengali',
    alertLevel: 'moderate',
    activeAshas: 22,
  },
  {
    id: 'dist_sonitpur',
    district: 'Sonitpur (Tezpur)',
    state: 'Assam',
    totalScreened: 420,
    mciRiskPercent: 14.8,
    averageCcs: 74.5,
    predominantLanguage: 'Assamese / Bodo',
    alertLevel: 'low',
    activeAshas: 14,
  },
  {
    id: 'dist_cachar',
    district: 'Cachar (Silchar)',
    state: 'Assam',
    totalScreened: 310,
    mciRiskPercent: 18.0,
    averageCcs: 70.8,
    predominantLanguage: 'Bengali / Sylheti',
    alertLevel: 'moderate',
    activeAshas: 11,
  },
  {
    id: 'dist_imphal',
    district: 'Imphal West',
    state: 'Manipur',
    totalScreened: 245,
    mciRiskPercent: 15.3,
    averageCcs: 73.9,
    predominantLanguage: 'Manipuri (Meiteilon)',
    alertLevel: 'low',
    activeAshas: 8,
  },
  {
    id: 'dist_kohima',
    district: 'Kohima',
    state: 'Nagaland',
    totalScreened: 180,
    mciRiskPercent: 12.1,
    averageCcs: 77.2,
    predominantLanguage: 'Tenyidie / Nagamese',
    alertLevel: 'low',
    activeAshas: 6,
  },
  {
    id: 'dist_khasi',
    district: 'East Khasi Hills (Shillong)',
    state: 'Meghalaya',
    totalScreened: 220,
    mciRiskPercent: 13.6,
    averageCcs: 75.8,
    predominantLanguage: 'Khasi',
    alertLevel: 'low',
    activeAshas: 7,
  },
  {
    id: 'dist_tripura',
    district: 'West Tripura (Agartala)',
    state: 'Tripura',
    totalScreened: 195,
    mciRiskPercent: 21.0,
    averageCcs: 68.2,
    predominantLanguage: 'Kokborok / Bengali',
    alertLevel: 'high',
    activeAshas: 8,
  },
  {
    id: 'dist_arunachal',
    district: 'Papum Pare (Itanagar)',
    state: 'Arunachal Pradesh',
    totalScreened: 130,
    mciRiskPercent: 17.5,
    averageCcs: 71.0,
    predominantLanguage: 'Nyishi / Hindi',
    alertLevel: 'moderate',
    activeAshas: 5,
  },
];

export const RegionalEpidemiologyHeatmap: React.FC<Props> = ({ lang = 'en' }) => {
  const [filterLevel, setFilterLevel] = useState<'all' | 'high' | 'moderate' | 'low'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDistricts = DISTRICT_DATA.filter((d) => {
    const matchesLevel = filterLevel === 'all' || d.alertLevel === filterLevel;
    const matchesSearch =
      d.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.predominantLanguage.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const totalScreenedNER = DISTRICT_DATA.reduce((acc, d) => acc + d.totalScreened, 0);
  const avgMciPercent = (
    DISTRICT_DATA.reduce((acc, d) => acc + d.mciRiskPercent, 0) / DISTRICT_DATA.length
  ).toFixed(1);
  const totalAshas = DISTRICT_DATA.reduce((acc, d) => acc + d.activeAshas, 0);

  const handleExportCSV = () => {
    const headers = 'District,State,Total Screened,MCI Risk %,Average CCS,Primary Language,Alert Level,Active ASHAs\n';
    const rows = DISTRICT_DATA.map(
      (d) =>
        `"${d.district}","${d.state}",${d.totalScreened},${d.mciRiskPercent}%,${d.averageCcs},"${d.predominantLanguage}","${d.alertLevel.toUpperCase()}",${d.activeAshas}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CogniCare_NER_District_Epidemiology_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white border-2 border-ner-earth/20 rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-bold text-ner-earth uppercase tracking-wider flex items-center gap-1 mb-1">
            <Users className="w-3.5 h-3.5 text-ner-forest" />
            <span>Total Screened</span>
          </div>
          <div className="text-2xl md:text-3xl font-serif font-bold text-ner-bark">
            {totalScreenedNER.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Across 8 NER States</div>
        </div>

        <div className="bg-white border-2 border-ner-earth/20 rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-bold text-ner-earth uppercase tracking-wider flex items-center gap-1 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Regional MCI Rate</span>
          </div>
          <div className="text-2xl md:text-3xl font-serif font-bold text-amber-900">
            {avgMciPercent}%
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-0.5">Early cognitive decline</div>
        </div>

        <div className="bg-white border-2 border-ner-earth/20 rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-bold text-ner-earth uppercase tracking-wider flex items-center gap-1 mb-1">
            <Activity className="w-3.5 h-3.5 text-emerald-700" />
            <span>Active ASHAs</span>
          </div>
          <div className="text-2xl md:text-3xl font-serif font-bold text-ner-bark">
            {totalAshas}
          </div>
          <div className="text-[11px] text-ner-earth font-semibold mt-0.5">Community Field Workers</div>
        </div>

        <div className="bg-white border-2 border-ner-earth/20 rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-bold text-ner-earth uppercase tracking-wider flex items-center gap-1 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Teleconsults</span>
          </div>
          <div className="text-2xl md:text-3xl font-serif font-bold text-blue-900">
            142
          </div>
          <div className="text-[11px] text-blue-700 font-semibold mt-0.5">e-Sanjeevani Dispatches</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border-2 border-ner-earth/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-ner-earth absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search district, state, dialect..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-ner-cream rounded-xl text-xs font-bold text-ner-bark border border-ner-earth/30 focus:outline-none focus:border-ner-forest"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
          <div className="flex items-center gap-1 bg-ner-cream p-1 rounded-xl border border-ner-earth/20">
            {(['all', 'high', 'moderate', 'low'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  filterLevel === lvl
                    ? 'bg-ner-forest text-white shadow-sm'
                    : 'text-ner-earth hover:text-ner-bark'
                }`}
              >
                {lvl === 'all' ? 'All Districts' : lvl}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-ner-sand hover:bg-ner-sand/80 text-ner-bark border border-ner-earth/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Download DHO Surveillance CSV"
          >
            <Download className="w-3.5 h-3.5 text-ner-earth" />
            <span>Export DHO CSV</span>
          </button>
        </div>
      </div>

      {/* District Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDistricts.map((d) => (
          <div
            key={d.id}
            className={`bg-white rounded-2xl p-4 border-2 transition-all shadow-sm ${
              d.alertLevel === 'high'
                ? 'border-red-400/80 bg-red-50/20'
                : d.alertLevel === 'moderate'
                ? 'border-amber-400/70 bg-amber-50/20'
                : 'border-emerald-300 bg-emerald-50/20'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="font-bold text-ner-bark text-base flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-ner-forest" />
                  <span>{d.district}</span>
                </div>
                <div className="text-xs text-ner-earth">{d.state}</div>
              </div>

              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                  d.alertLevel === 'high'
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : d.alertLevel === 'moderate'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {d.alertLevel === 'high' ? '🚨 High Alert' : d.alertLevel === 'moderate' ? '⚠️ Moderate' : '✅ Stable'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-white/80 rounded-xl border border-ner-earth/10">
              <div>
                <div className="text-[10px] text-ner-earth uppercase font-semibold">Total Screened</div>
                <div className="text-lg font-bold text-ner-bark">{d.totalScreened}</div>
              </div>
              <div>
                <div className="text-[10px] text-ner-earth uppercase font-semibold">MCI Risk %</div>
                <div
                  className={`text-lg font-bold ${
                    d.mciRiskPercent > 20
                      ? 'text-red-700'
                      : d.mciRiskPercent > 15
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                  }`}
                >
                  {d.mciRiskPercent}%
                </div>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-ner-earth">
                <span>Avg Cognitive Score:</span>
                <span className="font-bold text-ner-bark">{d.averageCcs} / 100</span>
              </div>
              <div className="flex justify-between text-ner-earth">
                <span>Primary Dialect:</span>
                <span className="font-bold text-ner-forest">{d.predominantLanguage}</span>
              </div>
              <div className="flex justify-between text-ner-earth">
                <span>Active Field ASHAs:</span>
                <span className="font-bold text-ner-bark">{d.activeAshas} Workers</span>
              </div>
            </div>

            {d.alertLevel === 'high' && (
              <div className="mt-3 p-2 bg-red-100/80 border border-red-200 rounded-xl text-[11px] font-bold text-red-800">
                ⚠️ DHO Alert: High concentration of acoustic speech hesitation. Recommend sending mobile screening van.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
