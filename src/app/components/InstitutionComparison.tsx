import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Download,
  TrendingUp,
  Globe2,
  Award,
  X,
  BookOpen,
  Hash,
  ChevronDown,
  ChevronUp,
  Building
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// const API_BASE = 'http://127.0.0.1:5000';
const API_BASE = "https://nlp-backend-l0p2.onrender.com";

interface Country {
  id: string;
  name: string;
}

interface Institution {
  id: string;
  name: string;
  average_h_index: number;
  average_rii: number;
  ranking: number;
}

interface Field {
  field: string;
  count: number;
  percentage: number;
}

interface InstitutionDetails {
  overview: Institution;
  fields: Field[];
}

export function InstitutionComparison() {
  // State for countries
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // State for institutions
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState<Institution[]>([]);
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [topInstitutions, setTopInstitutions] = useState<Institution[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string | null>(null);
  const [institutionDetails, setInstitutionDetails] = useState<InstitutionDetails | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // --------------------------------------------------
  // Load all countries on mount
  // --------------------------------------------------
  useEffect(() => {
    async function loadCountries() {
      try {
        const res = await fetch(`${API_BASE}/api/countries`);
        const data = await res.json();
        setCountries(data);
        setFilteredCountries(data);
      } catch (err) {
        console.error('Failed to load countries', err);
      }
    }

    loadCountries();
  }, []);

  // --------------------------------------------------
  // Filter countries based on search input
  // --------------------------------------------------
  useEffect(() => {
    if (countrySearch.trim() === '') {
      setFilteredCountries(countries);
    } else {
      const searchLower = countrySearch.toLowerCase();
      const filtered = countries.filter(country =>
        country.name.toLowerCase().includes(searchLower)
      );
      setFilteredCountries(filtered);
    }
  }, [countrySearch, countries]);

  // --------------------------------------------------
  // Load top 6 institutions when country is selected
  // --------------------------------------------------
  useEffect(() => {
    async function loadTopInstitutions() {
      if (!selectedCountry) {
        setTopInstitutions([]);
        setInstitutions([]);
        setFilteredInstitutions([]);
        return;
      }

      setLoadingInstitutions(true);
      try {
        // First, get all institutions in the country (or first page)
        const res = await fetch(
          `${API_BASE}/api/institutions/search?country_id=${selectedCountry.id}`
        );
        const allInstitutions = await res.json();
        
        // Take top 6 by ranking (or h-index if ranking is not available)
        const top6 = allInstitutions
          .sort((a: Institution, b: Institution) => 
            (a.ranking || 999) - (b.ranking || 999)
          )
          .slice(0, 6);
        
        setInstitutions(allInstitutions);
        setFilteredInstitutions(allInstitutions);
        setTopInstitutions(top6);
      } catch (err) {
        console.error('Failed to load institutions', err);
      } finally {
        setLoadingInstitutions(false);
      }
    }

    loadTopInstitutions();
  }, [selectedCountry]);

  // --------------------------------------------------
  // Filter institutions based on search input
  // --------------------------------------------------
  useEffect(() => {
    if (!selectedCountry || institutionSearch.trim() === '') {
      setFilteredInstitutions(institutions);
    } else {
      const searchLower = institutionSearch.toLowerCase();
      const filtered = institutions.filter(institution =>
        institution.name.toLowerCase().includes(searchLower)
      );
      setFilteredInstitutions(filtered);
    }
  }, [institutionSearch, institutions, selectedCountry]);

  // --------------------------------------------------
  // Load institution details for modal
  // --------------------------------------------------
  const loadInstitutionDetails = useCallback(async (institutionId: string) => {
    setModalLoading(true);
    try {
      const [overviewRes, fieldsRes] = await Promise.all([
        fetch(`${API_BASE}/api/institution/${institutionId}/overview`),
        fetch(`${API_BASE}/api/institution/${institutionId}/fields`)
      ]);

      const overview = await overviewRes.json();
      const fields = await fieldsRes.json();

      setInstitutionDetails({
        overview,
        fields
      });
    } catch (err) {
      console.error('Failed to load institution details', err);
    } finally {
      setModalLoading(false);
    }
  }, []);

  // --------------------------------------------------
  // Handle country selection
  // --------------------------------------------------
  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setCountrySearch(country.name);
    setShowCountryDropdown(false);
    setInstitutionSearch(''); // Reset institution search
  };

  // --------------------------------------------------
  // Handle institution click to show modal
  // --------------------------------------------------
  const handleInstitutionClick = async (institutionId: string) => {
    setSelectedInstitutionId(institutionId);
    setShowModal(true);
    await loadInstitutionDetails(institutionId);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInstitutionId(null);
    setInstitutionDetails(null);
  };

  // --------------------------------------------------
  // Prepare scatter chart data (using top 6 institutions)
  // --------------------------------------------------
  const scatterData = topInstitutions.map((inst) => ({
    name: inst.name,
    'Average h-Index': inst.average_h_index,
    'Average RII': inst.average_rii,
    size: 30 + (inst.average_h_index * 2) // Bubble size based on h-index
  }));

  // Colors for charts
  const COLORS = ['#10b981', '#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a'];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-white mb-2">Institution Comparison</h1>
          <p className="text-emerald-400/60">
            Compare institutions by country with h-Index and RII metrics
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Country Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left: Country and Institution Selection */}
        <div className="space-y-6">
          {/* Country Selection */}
          <div className="bg-[#0f2820] border border-[#1a3d33] rounded-xl p-6">
            <h3 className="text-white mb-4 flex items-center gap-2">
              <Globe2 className="w-5 h-5" />
              Select Country
            </h3>
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400/60 w-5 h-5" />
              <input
                type="text"
                placeholder="Type country name..."
                value={countrySearch}
                onChange={(e) => {
                  setCountrySearch(e.target.value);
                  setShowCountryDropdown(true);
                }}
                onFocus={() => setShowCountryDropdown(true)}
                className="w-full pl-12 pr-10 py-3 bg-[#0a1914] border border-[#1a3d33] rounded-lg text-white placeholder:text-emerald-400/40 focus:border-emerald-500 focus:outline-none"
              />
              <button
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400/60 hover:text-emerald-400"
              >
                {showCountryDropdown ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              {showCountryDropdown && (
                <div className="absolute top-full mt-1 w-full bg-[#0a1914] border border-[#1a3d33] rounded-lg overflow-hidden z-20 max-h-60 overflow-y-auto">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <div
                        key={country.id}
                        onClick={() => handleCountrySelect(country)}
                        className="px-4 py-3 hover:bg-[#1a3d33] cursor-pointer text-white border-b border-[#1a3d33] last:border-b-0 flex items-center gap-3"
                      >
                        <Globe2 className="w-4 h-4 text-emerald-400" />
                        {country.name}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-emerald-400/60 text-center">
                      No countries found
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedCountry && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white">
                      <Globe2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-white font-medium">{selectedCountry.name}</div>
                      <div className="text-emerald-400/60 text-sm">
                        {institutions.length} institutions available
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCountry(null);
                      setCountrySearch('');
                      setInstitutions([]);
                      setTopInstitutions([]);
                    }}
                    className="text-emerald-400/60 hover:text-emerald-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Institution Search */}
          {selectedCountry && (
            <div className="bg-[#0f2820] border border-[#1a3d33] rounded-xl p-6">
              <h3 className="text-white mb-4 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Search Institutions in {selectedCountry.name}
              </h3>
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400/60 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Type institution name..."
                  value={institutionSearch}
                  onChange={(e) => setInstitutionSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#0a1914] border border-[#1a3d33] rounded-lg text-white placeholder:text-emerald-400/40 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: Top Institutions Overview */}
        <div className="bg-[#0f2820] border border-[#1a3d33] rounded-xl p-6">
          <h3 className="text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            {selectedCountry ? `Top Institutions in ${selectedCountry.name}` : 'Select a Country'}
          </h3>
          
          {loadingInstitutions ? (
            <div className="flex items-center justify-center h-40 text-emerald-400">
              Loading institutions...
            </div>
          ) : selectedCountry && topInstitutions.length > 0 ? (
            <div className="space-y-4">
              {topInstitutions.map((institution, index) => (
                <div
                  key={institution.id}
                  className="bg-[#0a1914] border border-[#1a3d33] rounded-lg p-4 hover:border-emerald-500/50 transition-colors cursor-pointer group"
                  onClick={() => handleInstitutionClick(institution.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                        index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-br from-orange-600 to-orange-700' :
                        'bg-gradient-to-br from-emerald-500 to-emerald-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                          {institution.name}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          <span className="text-teal-400 flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            h-index: {institution.average_h_index?.toFixed(2) || 'N/A'}
                          </span>
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            RII: {institution.average_rii?.toFixed(2) || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-emerald-400/60 group-hover:text-emerald-400 transition-colors">
                      <ChevronDown className="w-5 h-5 transform -rotate-90" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-emerald-400/60">
              {selectedCountry ? 'No institutions found' : 'Select a country to view top institutions'}
            </div>
          )}
        </div>
      </div>

      {/* Charts Section */}
      {selectedCountry && topInstitutions.length > 0 && (
        <>
          {/* Scatter Chart for Top Institutions */}
          <div className="bg-[#0f2820] border border-[#1a3d33] rounded-xl p-6 mb-6">
            <h3 className="text-white mb-4">Top Institutions: h-Index vs RII Comparison</h3>
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a3d33" />
                <XAxis
                  type="number"
                  dataKey="Average h-Index"
                  name="Average h-Index"
                  stroke="#4ade80"
                  label={{ value: 'Average h-Index', position: 'insideBottom', offset: -5, fill: '#4ade80' }}
                />
                <YAxis
                  type="number"
                  dataKey="Average RII"
                  name="Average RII"
                  stroke="#4ade80"
                  label={{ value: 'Average RII', angle: -90, position: 'insideLeft', fill: '#4ade80' }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: '#0f2820',
                    border: '1px solid #1a3d33',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value, name, props) => [
                    value,
                    name,
                    `Institution: ${props.payload.name}`
                  ]}
                />
                <Legend />
                <Scatter 
                  name="Top Institutions" 
                  data={scatterData} 
                  fill="#10b981"
                  onClick={(data) => {
                    const institution = topInstitutions.find(inst => inst.name === data.name);
                    if (institution) {
                      handleInstitutionClick(institution.id);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* All Institutions Table */}
          <div className="bg-[#0f2820] border border-[#1a3d33] rounded-xl overflow-hidden">
            <div className="p-6 border-b border-[#1a3d33]">
              <h3 className="text-white">
                All Institutions in {selectedCountry.name} 
                {institutionSearch && ` matching "${institutionSearch}"`}
                <span className="text-emerald-400/60 text-sm ml-2">
                  ({filteredInstitutions.length} found)
                </span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a3d33]">
                    <th className="px-6 py-4 text-left text-emerald-400/80 text-sm">Rank</th>
                    <th className="px-6 py-4 text-left text-emerald-400/80 text-sm">Institution</th>
                    <th className="px-6 py-4 text-center text-emerald-400/80 text-sm">Average h-Index</th>
                    <th className="px-6 py-4 text-center text-emerald-400/80 text-sm">Average RII</th>
                    <th className="px-6 py-4 text-center text-emerald-400/80 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInstitutions.length > 0 ? (
                    filteredInstitutions.map((institution, index) => (
                      <tr
                        key={institution.id}
                        className="border-b border-[#1a3d33] hover:bg-emerald-500/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
                                index < 3
                                  ? index === 0
                                    ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                                    : index === 1
                                    ? 'bg-gradient-to-br from-gray-400 to-gray-500'
                                    : 'bg-gradient-to-br from-orange-600 to-orange-700'
                                  : 'bg-gradient-to-br from-emerald-500 to-emerald-700'
                              }`}
                            >
                              {institution.ranking || index + 1}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-white">{institution.name}</div>
                            <div className="text-emerald-400/60 text-sm flex items-center gap-2 mt-1">
                              <Globe2 className="w-3 h-3" />
                              {selectedCountry.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full mx-auto w-fit">
                            <Award className="w-4 h-4" />
                            <span>{institution.average_h_index?.toFixed(2) || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full mx-auto w-fit">
                            <Award className="w-4 h-4" />
                            <span>{institution.average_rii?.toFixed(2) || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleInstitutionClick(institution.id)}
                            className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-emerald-400/60">
                        {institutionSearch
                          ? "No institutions found matching your search"
                          : "No institutions available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Institution Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f2820] border border-[#1a3d33] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#1a3d33]">
              <div>
                <h2 className="text-2xl text-white mb-2">
                  {institutionDetails?.overview?.name || 'Loading...'}
                </h2>
                <div className="flex items-center gap-6 text-emerald-400/80">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Average h-Index: <span className="text-white">{institutionDetails?.overview?.average_h_index?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Average RII: <span className="text-white">{institutionDetails?.overview?.average_rii?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Ranking: <span className="text-white">#{institutionDetails?.overview?.ranking || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-[#1a3d33] rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-emerald-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              {modalLoading ? (
                <div className="flex items-center justify-center h-64 text-emerald-400">
                  Loading institution details...
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Research Fields Section */}
                  <div>
                    <h3 className="text-white text-xl mb-4 flex items-center gap-2">
                      <Globe2 className="w-5 h-5" />
                      Research Fields Distribution
                    </h3>
                    
                    {institutionDetails?.fields && institutionDetails.fields.length > 0 ? (
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={institutionDetails.fields}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={(entry) => `${entry.field}: ${entry.percentage}%`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="percentage"
                                >
                                  {institutionDetails.fields.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(value, name, props) => [
                                    `${value}%`,
                                    props.payload.field,
                                    `Count: ${props.payload.count}`
                                  ]}
                                  contentStyle={{
                                    backgroundColor: '#0f2820',
                                    border: '1px solid #1a3d33',
                                    borderRadius: '8px',
                                    color: '#fff'
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        <div>
                          <div className="space-y-3">
                            {institutionDetails.fields.map((field, index) => (
                              <div
                                key={field.field}
                                className="flex items-center justify-between p-3 bg-[#1a3d33] rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                  />
                                  <span className="text-white">{field.field}</span>
                                </div>
                                <div className="text-right">
                                  <div className="text-emerald-400 font-medium">
                                    {field.percentage}%
                                  </div>
                                  <div className="text-emerald-400/60 text-sm">
                                    {field.count} publications
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-emerald-400/60 bg-[#1a3d33] rounded-lg">
                        No field data available for this institution
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Context Note */}
      <div className="mt-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
        <h4 className="text-emerald-400 mb-2 flex items-center gap-2">
          <Award className="w-5 h-5" />
          How to Use
        </h4>
        <p className="text-emerald-400/80 text-sm">
          1. Start by typing a country name in the search box above
          <br />
          2. Select a country from the dropdown to view its top 6 institutions
          <br />
          3. Use the institution search box to find specific institutions within the selected country
          <br />
          4. Click "View Details" on any institution to see detailed research field distributions
        </p>
      </div>
    </div>
  );
}