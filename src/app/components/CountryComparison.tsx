import { useEffect, useState, useCallback, useRef } from "react";
import {
  Search,
  Download,
  Globe2,
  Award,
  Building,
  TrendingUp,
  BarChart3,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// const API_BASE = "http://127.0.0.1:5000";
const API_BASE = "https://nlp-backend-l0p2.onrender.com";

interface Country {
  id: string;
  name: string;
}

interface CountryOverview {
  id: string;
  name: string;
  average_h_index: number;
  average_rii: number;
  ranking: number;
}

interface Institution {
  id: string;
  name: string;
  average_h_index: number;
  average_rii: number;
}

interface Field {
  field: string;
  count: number;
  percentage: number;
}

interface BestInstitutions {
  by_h_index: Institution[];
  by_rii: Institution[];
}

export function CountryComparison() {
  // Country search states
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);

  // Country data states
  const [countryOverview, setCountryOverview] =
    useState<CountryOverview | null>(null);
  const [bestInstitutions, setBestInstitutions] =
    useState<BestInstitutions | null>(null);
  const [fields, setFields] = useState<Field[]>([]);

  // Loading states
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);

  // Active tab for institutions
  const [activeInstitutionTab, setActiveInstitutionTab] = useState<
    "h-index" | "rii"
  >("h-index");

  // References
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Colors for charts
  const COLORS = [
    "#10b981",
    "#14b8a6",
    "#0d9488",
    "#0f766e",
    "#115e59",
    "#134e4a",
    "#059669",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
  ];

  // --------------------------------------------------
  // Load all countries on component mount
  // --------------------------------------------------
  useEffect(() => {
    async function loadAllCountries() {
      setIsLoadingCountries(true);
      try {
        const res = await fetch(`${API_BASE}/api/countries`);
        const data = await res.json();
        if (data && data.length > 0) {
          setAllCountries(data);
          setFilteredCountries(data);
        }
      } catch (err) {
        console.error("Failed to load countries", err);
      } finally {
        setIsLoadingCountries(false);
      }
    }

    loadAllCountries();
  }, []);

  // --------------------------------------------------
  // Filter countries as user types
  // --------------------------------------------------
  useEffect(() => {
    if (!countrySearch.trim()) {
      setFilteredCountries(allCountries);
      return;
    }

    const searchLower = countrySearch.toLowerCase();
    const filtered = allCountries.filter((country) =>
      country.name.toLowerCase().includes(searchLower)
    );
    setFilteredCountries(filtered);
  }, [countrySearch, allCountries]);

  // --------------------------------------------------
  // Handle country selection
  // --------------------------------------------------
  const handleCountrySelect = useCallback(async (country: Country) => {
    console.log("Country selected:", country);
    setSelectedCountry(country);
    setCountrySearch(country.name);
    setShowCountryDropdown(false);

    // Load all data for selected country
    setCountryOverview(null);
    setBestInstitutions(null);
    setFields([]);

    try {
      await Promise.all([
        loadCountryOverview(country.id),
        loadBestInstitutions(country.id),
        loadCountryFields(country.id),
      ]);
    } catch (err) {
      console.error("Error loading country data:", err);
    }
  }, []);

  // --------------------------------------------------
  // Load country overview
  // --------------------------------------------------
  const loadCountryOverview = async (countryId: string) => {
    setLoadingOverview(true);
    try {
      const res = await fetch(`${API_BASE}/api/country/${countryId}/overview`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCountryOverview(data);
    } catch (err) {
      console.error("Failed to load country overview", err);
    } finally {
      setLoadingOverview(false);
    }
  };

  // --------------------------------------------------
  // Load best institutions
  // --------------------------------------------------
  const loadBestInstitutions = async (countryId: string) => {
    setLoadingInstitutions(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/country/${countryId}/institutions`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBestInstitutions(data);
    } catch (err) {
      console.error("Failed to load best institutions", err);
    } finally {
      setLoadingInstitutions(false);
    }
  };

  // --------------------------------------------------
  // Load country fields
  // --------------------------------------------------
  const loadCountryFields = async (countryId: string) => {
    setLoadingFields(true);
    try {
      const res = await fetch(`${API_BASE}/api/country/${countryId}/fields`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setFields(data);
    } catch (err) {
      console.error("Failed to load country fields", err);
    } finally {
      setLoadingFields(false);
    }
  };

  // --------------------------------------------------
  // Clear selection
  // --------------------------------------------------
  const clearSelection = () => {
    setSelectedCountry(null);
    setCountrySearch("");
    setCountryOverview(null);
    setBestInstitutions(null);
    setFields([]);
    setShowCountryDropdown(true);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // --------------------------------------------------
  // Handle input focus
  // --------------------------------------------------
  const handleInputFocus = () => {
    if (!selectedCountry && !showCountryDropdown) {
      setShowCountryDropdown(true);
    }
  };

  // --------------------------------------------------
  // Handle outside click to close dropdown
  // --------------------------------------------------
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutsideInput =
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node);
      const isOutsideDropdown =
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node);

      if (isOutsideInput && isOutsideDropdown) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --------------------------------------------------
  // Handle search input change
  // --------------------------------------------------
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCountrySearch(value);

    if (!showCountryDropdown) {
      setShowCountryDropdown(true);
    }
  };

  // --------------------------------------------------
  // Toggle dropdown
  // --------------------------------------------------
  const toggleDropdown = () => {
    if (countrySearch) {
      clearSelection();
    } else {
      setShowCountryDropdown(!showCountryDropdown);
    }
  };

  // Get active institutions based on tab
  const activeInstitutions =
    activeInstitutionTab === "h-index"
      ? bestInstitutions?.by_h_index || []
      : bestInstitutions?.by_rii || [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-white mb-2">Country Analytics</h1>
          <p className="text-emerald-400/60">
            Compare country-level research metrics and institutional performance
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedCountry}
        >
          <Download className="w-5 h-5" />
          Export Data
        </button>
      </div>

      {/* Country Search */}
      <div className="relative mb-8">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400/60 w-5 h-5" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Select or type a country name..."
              value={countrySearch}
              onChange={handleSearchChange}
              onFocus={handleInputFocus}
              className="w-full pl-12 pr-10 py-3 bg-[#0f2820] border border-[#1a3d33] rounded-lg text-white placeholder:text-emerald-400/40 focus:border-emerald-500 focus:outline-none"
            />
            <button
              onClick={toggleDropdown}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400/60 hover:text-emerald-400"
            >
              {countrySearch ? (
                <X className="w-5 h-5" />
              ) : showCountryDropdown ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Country Suggestions Dropdown */}
        {showCountryDropdown && (
          <div
            ref={dropdownRef}
            className="absolute top-full mt-1 w-full bg-[#0f2820] border border-[#1a3d33] rounded-lg overflow-hidden z-20 max-h-80 overflow-y-auto shadow-2xl"
          >
            <div className="p-2 border-b border-[#1a3d33]">
              <div className="text-xs text-emerald-400/60 px-2 py-1">
                {isLoadingCountries
                  ? "Loading countries..."
                  : `${filteredCountries.length} countries found`}
              </div>
            </div>

            {isLoadingCountries ? (
              <div className="px-4 py-8 text-center text-emerald-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading countries...
              </div>
            ) : filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.id}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={`w-full text-left px-4 py-3 hover:bg-[#1a3d33] cursor-pointer text-white border-b border-[#1a3d33] last:border-b-0 flex items-center gap-3 transition-colors ${
                    selectedCountry?.id === country.id ? "bg-[#1a3d33]" : ""
                  }`}
                >
                  <Globe2 className="w-4 h-4 text-emerald-400" />
                  <div className="flex-1">{country.name}</div>
                  {selectedCountry?.id === country.id && (
                    <div className="text-emerald-400 text-sm">Selected</div>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-emerald-400/60">
                {countrySearch
                  ? `No countries found matching "${countrySearch}"`
                  : "No countries available"}
              </div>
            )}

            {filteredCountries.length > 0 && countrySearch && (
              <div className="p-2 border-t border-[#1a3d33] bg-[#0a1914]">
                <div className="text-xs text-emerald-400/60 px-2">
                  Tip: Start typing to filter countries
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Country Badge */}
      {selectedCountry && (
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2">
            <Globe2 className="w-5 h-5 text-emerald-400" />
            <span className="text-white font-medium">
              {selectedCountry.name}
            </span>
            <button
              onClick={clearSelection}
              className="text-emerald-400/60 hover:text-emerald-400 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Country Overview Stats */}
      {selectedCountry && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* H-Index Card */}
            <div className="bg-[#0f2820] border border-[#1a3d33] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-emerald-400/60 text-sm">
                  Average H-Index
                </div>
                {loadingOverview ? (
                  <div className="animate-pulse bg-emerald-500/20 rounded-lg w-16 h-8"></div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-teal-400" />
                    <span className="text-2xl text-white">
                      {countryOverview?.average_h_index?.toFixed(2) || "N/A"}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-emerald-400/80 text-sm">
                Average researcher impact score for {selectedCountry.name}
              </div>
            </div>

            {/* RII Card */}
            <div className="bg-[#0f2820] border border-[#1a3d33] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-emerald-400/60 text-sm">Average RII</div>
                {loadingOverview ? (
                  <div className="animate-pulse bg-emerald-500/20 rounded-lg w-16 h-8"></div>
                ) : (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <span className="text-2xl text-white">
                      {countryOverview?.average_rii?.toFixed(2) || "N/A"}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-emerald-400/80 text-sm">
                Relative Impact Index normalized by field
              </div>
            </div>

            {/* Ranking Card */}
            <div className="bg-[#0f2820] border border-[#1a3d33] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-emerald-400/60 text-sm">Global Rank</div>
                {loadingOverview ? (
                  <div className="animate-pulse bg-emerald-500/20 rounded-lg w-16 h-8"></div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Globe2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-2xl text-white">
                      #{countryOverview?.ranking || "N/A"}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-emerald-400/80 text-sm">
                Overall ranking among all countries
              </div>
            </div>
          </div>

          {/* Research Fields and Best Institutions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Research Fields Card */}
            <div className="bg-[#0f2820] border border-[#1a3d33] rounded-xl p-6">
              <h3 className="text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Research Fields Distribution
              </h3>

              {loadingFields ? (
                <div className="flex items-center justify-center h-80 text-emerald-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Loading research fields...
                </div>
              ) : fields.length > 0 ? (
                <>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={fields}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) =>
                            `${entry.field}: ${entry.percentage}%`
                          }
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="percentage"
                        >
                          {fields.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => [
                            `${value}%`,
                            props.payload.field,
                            `Publications: ${props.payload.count}`,
                          ]}
                          contentStyle={{
                            backgroundColor: "#0f2820",
                            border: "1px solid #1a3d33",
                            borderRadius: "8px",
                            color: "#fff",
                            fontSize: "14px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Field Details */}
                  <div className="mt-6 space-y-2">
                    <h4 className="text-emerald-400 text-sm mb-2">
                      Top Research Areas:
                    </h4>
                    {fields.slice(0, 5).map((field, index) => (
                      <div
                        key={field.field}
                        className="flex items-center justify-between p-2 hover:bg-[#1a3d33] rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                          <span className="text-white text-sm">
                            {field.field}
                          </span>
                        </div>
                        <div className="text-emerald-400 text-sm">
                          {field.percentage}%
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-80 text-emerald-400/60">
                  No field data available for this country
                </div>
              )}
            </div>

            {/* Best Institutions Card with taller bars */}
            <div className="bg-[#0f2820] border border-[#1a3d33] rounded-xl p-6">
              <h3 className="text-white mb-6 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Best Institutions
              </h3>

              {/* Institution Tabs */}
              <div className="flex border-b border-[#1a3d33] mb-6">
                <button
                  onClick={() => setActiveInstitutionTab("h-index")}
                  className={`px-4 py-2 flex items-center gap-2 transition-colors ${
                    activeInstitutionTab === "h-index"
                      ? "text-emerald-400 border-b-2 border-emerald-400"
                      : "text-emerald-400/60 hover:text-emerald-400"
                  }`}
                >
                  <Award className="w-4 h-4" />
                  By H-Index
                </button>
                <button
                  onClick={() => setActiveInstitutionTab("rii")}
                  className={`px-4 py-2 flex items-center gap-2 transition-colors ${
                    activeInstitutionTab === "rii"
                      ? "text-emerald-400 border-b-2 border-emerald-400"
                      : "text-emerald-400/60 hover:text-emerald-400"
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  By RII
                </button>
              </div>

              {loadingInstitutions ? (
                <div className="flex items-center justify-center h-80 text-emerald-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Loading institutions...
                </div>
              ) : activeInstitutions.length > 0 ? (
                <>
                  {/* Bar Chart with much taller bars */}
                  <div className="h-80 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={activeInstitutions.map((inst, index) => ({
                          name: inst.name,
                          "h-Index": inst.average_h_index,
                          RII: inst.average_rii,
                          rank: index + 1,
                        }))}
                        margin={{ top: 20, right: 30, left: 40, bottom: 100 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a3d33" />
                        <XAxis
                          dataKey="name"
                          stroke="#4ade80"
                          fontSize={12}
                          angle={-45}
                          textAnchor="end"
                          height={90}
                          tickFormatter={(name) => {
                            if (name.length > 25) {
                              return name.substring(0, 25) + "...";
                            }
                            return name;
                          }}
                        />
                        <YAxis
                          stroke="#4ade80"
                          domain={[0, "dataMax + 1"]}
                          label={{
                            value:
                              activeInstitutionTab === "h-index"
                                ? "Average H-Index"
                                : "Average RII",
                            angle: -90,
                            position: "insideLeft",
                            offset: -10,
                            style: { fill: "#4ade80", fontSize: "12px" },
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f2820",
                            border: "1px solid #1a3d33",
                            borderRadius: "8px",
                            color: "#fff",
                            padding: "12px",
                            fontSize: "14px",
                          }}
                          formatter={(value, name) => [value, name]}
                          labelStyle={{
                            color: "#4ade80",
                            marginBottom: "8px",
                            fontSize: "14px",
                            fontWeight: "bold",
                          }}
                          labelFormatter={(label) => label}
                        />
                        <Legend />
                        <Bar
                          dataKey={
                            activeInstitutionTab === "h-index"
                              ? "h-Index"
                              : "RII"
                          }
                          name={
                            activeInstitutionTab === "h-index"
                              ? "Average H-Index"
                              : "Average RII"
                          }
                          fill={
                            activeInstitutionTab === "h-index"
                              ? "#14b8a6"
                              : "#10b981"
                          }
                          radius={[4, 4, 0, 0]}
                          barSize={60} // Much taller bars
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Institution List with full names */}
                  <div className="space-y-3">
                    {activeInstitutions.map((institution, index) => (
                      <div
                        key={institution.id}
                        className="flex items-center justify-between p-3 bg-[#1a3d33] rounded-lg hover:bg-[#2a4d44] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                              index === 0
                                ? "bg-gradient-to-br from-yellow-500 to-yellow-600"
                                : index === 1
                                ? "bg-gradient-to-br from-gray-400 to-gray-500"
                                : index === 2
                                ? "bg-gradient-to-br from-orange-600 to-orange-700"
                                : "bg-gradient-to-br from-emerald-500 to-emerald-700"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div
                              className="text-white text-sm font-medium truncate"
                              title={institution.name}
                            >
                              {institution.name}
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-teal-400 text-xs flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                h-index:{" "}
                                {institution.average_h_index?.toFixed(2)}
                              </span>
                              <span className="text-emerald-400 text-xs flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                RII: {institution.average_rii?.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-80 text-emerald-400/60">
                  No institution data available for this country
                </div>
              )}
            </div>
          </div>

          {/* Institution Comparison Table */}
          {bestInstitutions &&
            bestInstitutions.by_h_index &&
            bestInstitutions.by_h_index.length > 0 && (
              <div className="bg-[#0f2820] border border-[#1a3d33] rounded-xl overflow-hidden mb-8">
                <div className="p-6 border-b border-[#1a3d33]">
                  <h3 className="text-white">
                    Institution Performance Comparison
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#1a3d33]">
                        <th className="px-6 py-4 text-left text-emerald-400/80 text-sm">
                          Rank
                        </th>
                        <th className="px-6 py-4 text-left text-emerald-400/80 text-sm">
                          Institution
                        </th>
                        <th className="px-6 py-4 text-center text-emerald-400/80 text-sm">
                          Average H-Index
                        </th>
                        <th className="px-6 py-4 text-center text-emerald-400/80 text-sm">
                          Average RII
                        </th>
                        <th className="px-6 py-4 text-center text-emerald-400/80 text-sm">
                          Performance
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bestInstitutions.by_h_index.map((institution, index) => (
                        <tr
                          key={institution.id}
                          className="border-b border-[#1a3d33] hover:bg-emerald-500/5 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
                                  index === 0
                                    ? "bg-gradient-to-br from-yellow-500 to-yellow-600"
                                    : index === 1
                                    ? "bg-gradient-to-br from-gray-400 to-gray-500"
                                    : index === 2
                                    ? "bg-gradient-to-br from-orange-600 to-orange-700"
                                    : "bg-gradient-to-br from-emerald-500 to-emerald-700"
                                }`}
                              >
                                {index + 1}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-white">{institution.name}</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full mx-auto w-fit">
                              <Award className="w-4 h-4" />
                              <span>
                                {institution.average_h_index?.toFixed(2) ||
                                  "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full mx-auto w-fit">
                              <TrendingUp className="w-4 h-4" />
                              <span>
                                {institution.average_rii?.toFixed(2) || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <div className="text-emerald-400 text-sm">
                                {institution.average_h_index >
                                (countryOverview?.average_h_index || 0) ? (
                                  <span className="flex items-center gap-1 text-teal-400">
                                    <TrendingUp className="w-4 h-4" />
                                    Above Average
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-amber-400">
                                    <TrendingUp className="w-4 h-4 transform rotate-180" />
                                    Below Average
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </>
      )}

      {/* Empty State - When no country is selected */}
      {!selectedCountry && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
            <Globe2 className="w-12 h-12 text-emerald-400" />
          </div>
          <h3 className="text-white text-xl mb-3">Select a Country</h3>
          <p className="text-emerald-400/60 max-w-md">
            Click the search box above to view all available countries. Select a
            country to view its research metrics, top institutions, and field
            distributions.
          </p>
        </div>
      )}
    </div>
  );
}
