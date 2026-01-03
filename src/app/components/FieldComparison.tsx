import { useEffect, useState, useCallback, useRef } from "react";
import {
  Search,
  Award,
  TrendingUp,
  Globe2,
  Users,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  BarChart3,
  BookOpen,
  Hash,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// const API_BASE = "http://127.0.0.1:5000";
const API_BASE = "https://nlp-backend-l0p2.onrender.com";

interface Researcher {
  id: string;
  full_name: string;
  h_index: number;
  rii: number;
  total_publications?: number;
  total_citations?: number;
}

interface CountryContribution {
  country: string;
  country_id: string;
  iso_code: string;
  count: number;  // Changed from researcher_count
  percentage: number;
  // Removed average_h_index and average_rii as backend doesn't provide them
}

interface FieldOverview {
  by_h_index: Researcher[];
  by_rii: Researcher[];
}

interface CountryResearchers {
  by_h_index: Researcher[];
  by_rii: Researcher[];
}

export function FieldComparison() {
  // Hardcoded list of fields
  const allFields = [
    "accounting",
    "acoustics and ultrasonics",
    "aerospace engineering",
    "aging",
    "agricultural and biological sciences",
    "agronomy and crop science",
    "algebra and number theory",
    "analytical chemistry",
    "anatomy",
    "anesthesiology and pain medicine",
    "animal science and zoology",
    "anthropology",
    "applied mathematics",
    "applied microbiology and biotechnology",
    "applied psychology",
    "aquatic science",
    "archeology",
    "architecture",
    "artificial intelligence",
    "arts and humanities",
    "astronomy and astrophysics",
    "atmospheric science",
    "atomic and molecular physics, and optics",
    "automotive engineering",
    "behavioral neuroscience",
    "biochemistry",
    "biochemistry, genetics and molecular biology",
    "bioengineering",
    "biological psychiatry",
    "biomaterials",
    "biomedical engineering",
    "biophysics",
    "biotechnology",
    "building and construction",
    "business and international management",
    "business, management and accounting",
    "cancer research",
    "cardiology and cardiovascular medicine",
    "catalysis",
    "cell biology",
    "cellular and molecular neuroscience",
    "ceramics and composites",
    "chemical engineering",
    "chemical health and safety",
    "chemistry",
    "civil and structural engineering",
    "classics",
    "clinical biochemistry",
    "clinical psychology",
    "cognitive neuroscience",
    "communication",
    "complementary and alternative medicine",
    "complementary and manual therapy",
    "computational mathematics",
    "computational mechanics",
    "computational theory and mathematics",
    "computer graphics and computer-aided design",
    "computer networks and communications",
    "computer science",
    "computer science applications",
    "computer vision and pattern recognition",
    "condensed matter physics",
    "conservation",
    "control and systems engineering",
    "critical care and intensive care medicine",
    "cultural studies",
    "decision sciences",
    "demography",
    "dentistry",
    "dermatology",
    "development",
    "developmental and educational psychology",
    "developmental biology",
    "developmental neuroscience",
    "discrete mathematics and combinatorics",
    "drug discovery",
    "earth and planetary sciences",
    "earth-surface processes",
    "ecological modeling",
    "ecology",
    "ecology, evolution, behavior and systematics",
    "economics and econometrics",
    "economics, econometrics and finance",
    "education",
    "electrical and electronic engineering",
    "electrochemistry",
    "electronic, optical and magnetic materials",
    "emergency medical services",
    "emergency medicine",
    "endocrine and autonomic systems",
    "endocrinology",
    "endocrinology, diabetes and metabolism",
    "energy",
    "energy engineering and power technology",
    "engineering",
    "environmental chemistry",
    "environmental engineering",
    "environmental science",
    "epidemiology",
    "equine",
    "experimental and cognitive psychology",
    "family practice",
    "filtration and separation",
    "finance",
    "fluid flow and transfer processes",
    "food science",
    "forestry",
    "fuel technology",
    "gastroenterology",
    "gender studies",
    "general agricultural and biological sciences",
    "general arts and humanities",
    "general decision sciences",
    "general dentistry",
    "general economics, econometrics and finance",
    "general energy",
    "general engineering",
    "general health professions",
    "general materials science",
    "general psychology",
    "general social sciences",
    "genetics",
    "geochemistry and petrology",
    "geography, planning and development",
    "geology",
    "geometry and topology",
    "geophysics",
    "geriatrics and gerontology",
    "global and planetary change",
    "hardware and architecture",
    "health",
    "health informatics",
    "health information management",
    "health professions",
    "health sciences",
    "health, toxicology and mutagenesis",
    "hematology",
    "hepatology",
    "history",
    "history and philosophy of science",
    "horticulture",
    "human factors and ergonomics",
    "human-computer interaction",
    "immunology",
    "immunology and allergy",
    "immunology and microbiology",
    "industrial and manufacturing engineering",
    "industrial relations",
    "infectious diseases",
    "information systems",
    "information systems and management",
    "inorganic chemistry",
    "insect science",
    "instrumentation",
    "internal medicine",
    "issues, ethics and legal aspects",
    "language and linguistics",
    "law",
    "library and information sciences",
    "life sciences",
    "linguistics and language",
    "literature and literary theory",
    "management information systems",
    "management of technology and innovation",
    "management science and operations research",
    "management, monitoring, policy and law",
    "marketing",
    "materials chemistry",
    "materials science",
    "mathematical physics",
    "mathematics",
    "mechanical engineering",
    "mechanics of materials",
    "media technology",
    "medical laboratory technology",
    "medical terminology",
    "medicine",
    "metals and alloys",
    "microbiology",
    "modeling and simulation",
    "molecular biology",
    "molecular medicine",
    "museology",
    "music",
    "nature and landscape conservation",
    "nephrology",
    "neurology",
    "neuropsychology and physiological psychology",
    "neuroscience",
    "nuclear and high energy physics",
    "nuclear energy and engineering",
    "numerical analysis",
    "nursing",
    "nutrition and dietetics",
    "obstetrics and gynecology",
    "occupational therapy",
    "ocean engineering",
    "oceanography",
    "oncology",
    "ophthalmology",
    "oral surgery",
    "organic chemistry",
    "organizational behavior and human resource management",
    "orthodontics",
    "orthopedics and sports medicine",
    "otorhinolaryngology",
    "paleontology",
    "parasitology",
    "pathology and forensic medicine",
    "pediatrics, perinatology and child health",
    "periodontics",
    "pharmaceutical science",
    "pharmacology",
    "pharmacology, toxicology and pharmaceutics",
    "pharmacy",
    "philosophy",
    "physical and theoretical chemistry",
    "physical sciences",
    "physical therapy, sports therapy and rehabilitation",
    "physics and astronomy",
    "physiology",
    "plant science",
    "political science and international relations",
    "pollution",
    "polymers and plastics",
    "process chemistry and technology",
    "psychiatry and mental health",
    "psychology",
    "public administration",
    "public health, environmental and occupational health",
    "pulmonary and respiratory medicine",
    "radiation",
    "radiological and ultrasound technology",
    "radiology, nuclear medicine and imaging",
    "rehabilitation",
    "religious studies",
    "renewable energy, sustainability and the environment",
    "reproductive medicine",
    "research and theory",
    "rheumatology",
    "safety research",
    "safety, risk, reliability and quality",
    "sensory systems",
    "signal processing",
    "small animals",
    "social psychology",
    "social sciences",
    "sociology and political science",
    "software",
    "soil science",
    "space and planetary science",
    "spectroscopy",
    "speech and hearing",
    "statistical and nonlinear physics",
    "statistics and probability",
    "statistics, probability and uncertainty",
    "strategy and management",
    "structural biology",
    "surfaces, coatings and films",
    "surgery",
    "theoretical computer science",
    "tourism, leisure and hospitality management",
    "toxicology",
    "transplantation",
    "transportation",
    "urban studies",
    "urology",
    "veterinary",
    "virology",
    "visual arts and performing arts",
    "water science and technology"
  ];

  // Field search states
  const [filteredFields, setFilteredFields] = useState<string[]>([]);
  const [fieldSearch, setFieldSearch] = useState("");
  const [showFieldDropdown, setShowFieldDropdown] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);

  // Field data states
  const [fieldOverview, setFieldOverview] = useState<FieldOverview | null>(
    null
  );
  const [countryContributions, setCountryContributions] = useState<
    CountryContribution[]
  >([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalField, setModalField] = useState("");
  const [modalCountry, setModalCountry] = useState<{
    name: string;
    id: string;
  } | null>(null);
  const [countryResearchers, setCountryResearchers] =
    useState<CountryResearchers | null>(null);

  // Loading states
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);

  // Active tab for researchers
  const [activeResearcherTab, setActiveResearcherTab] = useState<
    "h-index" | "rii"
  >("h-index");
  const [activeModalTab, setActiveModalTab] = useState<"h-index" | "rii">(
    "h-index"
  );

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
    "#8b5cf6",
    "#d946ef",
  ];

  // --------------------------------------------------
  // Initialize filtered fields on component mount
  // --------------------------------------------------
  useEffect(() => {
    // Show first 20 fields initially
    setFilteredFields(allFields.slice(0, 20));
  }, []);

  // --------------------------------------------------
  // Filter fields as user types
  // --------------------------------------------------
  useEffect(() => {
    if (!fieldSearch.trim()) {
      setFilteredFields(allFields.slice(0, 20)); // Show first 20 when empty
      return;
    }

    const searchLower = fieldSearch.toLowerCase();
    const filtered = allFields.filter((field) =>
      field.toLowerCase().includes(searchLower)
    );
    setFilteredFields(filtered);
  }, [fieldSearch]);

  // --------------------------------------------------
  // Handle field selection
  // --------------------------------------------------
  const handleFieldSelect = useCallback(async (field: string) => {
    console.log("Field selected:", field);
    setSelectedField(field);
    setFieldSearch(field);
    setShowFieldDropdown(false);

    // Load field data
    setFieldOverview(null);
    setCountryContributions([]);

    try {
      await Promise.all([
        loadFieldOverview(field),
        loadCountryContributions(field),
      ]);
    } catch (err) {
      console.error("Error loading field data:", err);
    }
  }, []);

  // --------------------------------------------------
  // Load field overview
  // --------------------------------------------------
  const loadFieldOverview = async (field: string) => {
    setLoadingOverview(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/field/overview?field=${encodeURIComponent(field)}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log("Field overview data:", data); // Debug log
      setFieldOverview(data);
    } catch (err) {
      console.error("Failed to load field overview", err);
    } finally {
      setLoadingOverview(false);
    }
  };

  // --------------------------------------------------
  // Load country contributions
  // --------------------------------------------------
  const loadCountryContributions = async (field: string) => {
    setLoadingCountries(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/field/countries?field=${encodeURIComponent(field)}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log("Country contributions data:", data); // Debug log
      // Transform backend data to match our interface
      const transformedData = data.map((item: any) => ({
        country: item.country,
        country_id: item.country_id,
        iso_code: item.iso_code || "",
        count: item.count,
        percentage: item.percentage
      }));
      setCountryContributions(transformedData);
    } catch (err) {
      console.error("Failed to load country contributions", err);
    } finally {
      setLoadingCountries(false);
    }
  };

  // --------------------------------------------------
  // Load country researchers for modal
  // --------------------------------------------------
  const loadCountryResearchers = async (field: string, countryId: string) => {
    setLoadingModal(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/field/country/researchers?field=${encodeURIComponent(
          field
        )}&country_id=${countryId}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log("Country researchers data:", data); // Debug log
      setCountryResearchers(data);
    } catch (err) {
      console.error("Failed to load country researchers", err);
    } finally {
      setLoadingModal(false);
    }
  };

  // --------------------------------------------------
  // Handle country click to open modal
  // --------------------------------------------------
  const handleCountryClick = async (country: CountryContribution) => {
    if (!selectedField) return;

    setModalField(selectedField);
    setModalCountry({ name: country.country, id: country.country_id });
    setCountryResearchers(null);
    setShowModal(true);
    setActiveModalTab("h-index");

    await loadCountryResearchers(selectedField, country.country_id);
  };

  // --------------------------------------------------
  // Clear selection
  // --------------------------------------------------
  const clearSelection = () => {
    setSelectedField(null);
    setFieldSearch("");
    setFieldOverview(null);
    setCountryContributions([]);
    setShowFieldDropdown(true);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // --------------------------------------------------
  // Handle input focus
  // --------------------------------------------------
  const handleInputFocus = () => {
    if (!selectedField && !showFieldDropdown) {
      setShowFieldDropdown(true);
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
        setShowFieldDropdown(false);
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
    setFieldSearch(value);

    if (!showFieldDropdown) {
      setShowFieldDropdown(true);
    }
  };

  // --------------------------------------------------
  // Toggle dropdown
  // --------------------------------------------------
  const toggleDropdown = () => {
    if (fieldSearch) {
      clearSelection();
    } else {
      setShowFieldDropdown(!showFieldDropdown);
    }
  };

  // --------------------------------------------------
  // Close modal
  // --------------------------------------------------
  const closeModal = () => {
    setShowModal(false);
    setModalCountry(null);
    setCountryResearchers(null);
  };

  // Get active researchers based on tab
  const activeResearchers =
    activeResearcherTab === "h-index"
      ? fieldOverview?.by_h_index || []
      : fieldOverview?.by_rii || [];

  const activeModalResearchers =
    activeModalTab === "h-index"
      ? countryResearchers?.by_h_index || []
      : countryResearchers?.by_rii || [];

  // Prepare data for country bar chart
  const countryBarData = countryContributions
    .slice(0, 10)
    .map((country, index) => ({
      name:
        country.country.length > 15
          ? `${country.country.substring(0, 15)}...`
          : country.country,
      fullName: country.country,
      Percentage: country.percentage,
      Researchers: country.count,  // Changed from researcher_count to count
    }));

  // Prepare data for researchers bar chart
  const researcherBarData = activeResearchers
    .slice(0, 10)
    .map((researcher, index) => ({
      name:
        researcher.full_name.length > 15
          ? `${researcher.full_name.substring(0, 15)}...`
          : researcher.full_name,
      fullName: researcher.full_name,
      "H-Index": researcher.h_index,
      RII: researcher.rii,
      rank: index + 1,
    }));

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-white mb-2">
            Research Field Analytics
          </h1>
          <p className="text-emerald-400/60">
            Analyze research fields, top researchers, and country contributions
          </p>
        </div>
      </div>

      {/* Field Search */}
      <div className="relative mb-8">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400/60 w-5 h-5" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for a research field (e.g., computer science, medicine, physics)..."
              value={fieldSearch}
              onChange={handleSearchChange}
              onFocus={handleInputFocus}
              className="w-full pl-12 pr-10 py-3 bg-[#0f2820] border border-[#1a3d33] rounded-lg text-white placeholder:text-emerald-400/40 focus:border-emerald-500 focus:outline-none"
            />
            <button
              onClick={toggleDropdown}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-400/60 hover:text-emerald-400"
            >
              {fieldSearch ? (
                <X className="w-5 h-5" />
              ) : showFieldDropdown ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Field Suggestions Dropdown */}
        {showFieldDropdown && (
          <div
            ref={dropdownRef}
            className="absolute top-full mt-1 w-full bg-[#0f2820] border border-[#1a3d33] rounded-lg overflow-hidden z-20 max-h-80 overflow-y-auto shadow-2xl"
          >
            <div className="p-2 border-b border-[#1a3d33]">
              <div className="text-xs text-emerald-400/60 px-2 py-1">
                {`${filteredFields.length} fields found`}
              </div>
            </div>

            {filteredFields.length > 0 ? (
              filteredFields.map((field, index) => (
                <button
                  key={`${field}-${index}`}
                  type="button"
                  onClick={() => handleFieldSelect(field)}
                  className={`w-full text-left px-4 py-3 hover:bg-[#1a3d33] cursor-pointer text-white border-b border-[#1a3d33] last:border-b-0 flex items-center gap-3 transition-colors ${
                    selectedField === field ? "bg-[#1a3d33]" : ""
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <div className="flex-1">{field}</div>
                  {selectedField === field && (
                    <div className="text-emerald-400 text-sm">Selected</div>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-emerald-400/60">
                {fieldSearch
                  ? `No fields found matching "${fieldSearch}"`
                  : "No research fields available"}
              </div>
            )}

            {filteredFields.length > 0 && fieldSearch && (
              <div className="p-2 border-t border-[#1a3d33] bg-[#0a1914]">
                <div className="text-xs text-emerald-400/60 px-2">
                  Tip: Start typing to filter research fields
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Field Badge */}
      {selectedField && (
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span className="text-white font-medium">{selectedField}</span>
            <button
              onClick={clearSelection}
              className="text-emerald-400/60 hover:text-emerald-400 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Field Analysis Content */}
      {selectedField && (
        <>
          {/* Top Researchers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Researchers by H-Index */}
            <div className="bg-[#0f2820] border border-[#1a3d33] rounded-xl p-6">
              <h3 className="text-white mb-6 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Top Researchers by H-Index
              </h3>

              {loadingOverview ? (
                <div className="flex items-center justify-center h-64 text-emerald-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Loading researchers...
                </div>
              ) : fieldOverview?.by_h_index &&
                fieldOverview.by_h_index.length > 0 ? (
                <>
                  <div className="h-64 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={fieldOverview.by_h_index
                          .slice(0, 10)
                          .map((researcher, index) => ({
                            name:
                              researcher.full_name.length > 15
                                ? `${researcher.full_name.substring(0, 15)}...`
                                : researcher.full_name,
                            fullName: researcher.full_name,
                            "H-Index": researcher.h_index,
                            rank: index + 1,
                          }))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a3d33" />
                        <XAxis
                          dataKey="name"
                          stroke="#4ade80"
                          fontSize={12}
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis stroke="#4ade80" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f2820",
                            border: "1px solid #1a3d33",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                          formatter={(value, name, props) => [
                            value,
                            name,
                            `Researcher: ${props.payload.fullName}`,
                          ]}
                        />
                        <Bar
                          dataKey="H-Index"
                          fill="#14b8a6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3">
                    {fieldOverview.by_h_index
                      .slice(0, 5)
                      .map((researcher, index) => (
                        <div
                          key={researcher.id}
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
                            <div>
                              <div className="text-white text-sm font-medium">
                                {researcher.full_name}
                              </div>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-teal-400 text-xs flex items-center gap-1">
                                  <Award className="w-3 h-3" />
                                  h-index: {researcher.h_index}
                                </span>
                                <span className="text-emerald-400 text-xs flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  RII: {researcher.rii?.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-64 text-emerald-400/60">
                  No researcher data available for this field
                </div>
              )}
            </div>

            {/* Top Researchers by RII */}
            <div className="bg-[#0f2820] border border-[#1a3d33] rounded-xl p-6">
              <h3 className="text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Researchers by RII
              </h3>

              {loadingOverview ? (
                <div className="flex items-center justify-center h-64 text-emerald-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Loading researchers...
                </div>
              ) : fieldOverview?.by_rii && fieldOverview.by_rii.length > 0 ? (
                <>
                  <div className="h-64 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={fieldOverview.by_rii
                          .slice(0, 10)
                          .map((researcher, index) => ({
                            name:
                              researcher.full_name.length > 15
                                ? `${researcher.full_name.substring(0, 15)}...`
                                : researcher.full_name,
                            fullName: researcher.full_name,
                            RII: researcher.rii,
                            rank: index + 1,
                          }))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a3d33" />
                        <XAxis
                          dataKey="name"
                          stroke="#4ade80"
                          fontSize={12}
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis stroke="#4ade80" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f2820",
                            border: "1px solid #1a3d33",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                          formatter={(value, name, props) => [
                            value,
                            name,
                            `Researcher: ${props.payload.fullName}`,
                          ]}
                        />
                        <Bar
                          dataKey="RII"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3">
                    {fieldOverview.by_rii
                      .slice(0, 5)
                      .map((researcher, index) => (
                        <div
                          key={researcher.id}
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
                            <div>
                              <div className="text-white text-sm font-medium">
                                {researcher.full_name}
                              </div>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-teal-400 text-xs flex items-center gap-1">
                                  <Award className="w-3 h-3" />
                                  h-index: {researcher.h_index}
                                </span>
                                <span className="text-emerald-400 text-xs flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  RII: {researcher.rii?.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-64 text-emerald-400/60">
                  No researcher data available for this field
                </div>
              )}
            </div>
          </div>

          {/* Country Contributions */}
          <div className="bg-[#0f2820] border border-[#1a3d33] rounded-xl p-6 mb-8">
            <h3 className="text-white mb-6 flex items-center gap-2">
              <Globe2 className="w-5 h-5" />
              Country Contributions
            </h3>

            {loadingCountries ? (
              <div className="flex items-center justify-center h-64 text-emerald-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Loading country contributions...
              </div>
            ) : countryContributions.length > 0 ? (
              <>
                <div className="h-96 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={countryBarData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a3d33" />
                      <XAxis
                        dataKey="name"
                        stroke="#4ade80"
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={90}
                      />
                      <YAxis stroke="#4ade80" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f2820",
                          border: "1px solid #1a3d33",
                          borderRadius: "8px",
                          color: "#fff",
                          padding: "12px",
                        }}
                        formatter={(value, name, props) => [
                          value,
                          name,
                          `Country: ${props.payload.fullName}`,
                        ]}
                      />
                      <Legend />
                      <Bar
                        dataKey="Percentage"
                        name="Contribution %"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="Researchers"
                        name="Number of Researchers"
                        fill="#14b8a6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  {countryContributions.slice(0, 10).map((country, index) => (
                    <div
                      key={country.country_id}
                      onClick={() => handleCountryClick(country)}
                      className="p-4 bg-[#1a3d33] rounded-lg hover:bg-[#2a4d44] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white">
                            <Globe2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                              {country.country}
                            </div>
                            <div className="text-emerald-400/60 text-sm">
                              {country.count} researchers
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-emerald-400 text-lg font-medium">
                            {country.percentage.toFixed(2)}%
                          </div>
                          <div className="text-teal-400 text-sm">
                            Rank: #{index + 1}
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-[#0a1914] h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-700 transition-all duration-300"
                          style={{ width: `${country.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-emerald-400/60">
                No country contribution data available for this field
              </div>
            )}
          </div>
        </>
      )}

      {/* Empty State - When no field is selected */}
      {!selectedField && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
            <BookOpen className="w-12 h-12 text-emerald-400" />
          </div>
          <h3 className="text-white text-xl mb-3">Select a Research Field</h3>
          <p className="text-emerald-400/60 max-w-md">
            Search for a research field above to view top researchers and
            country contributions.
          </p>
          <div className="mt-8 text-sm text-emerald-400/80">
            Examples: computer science, medicine, physics, engineering, biology,
            chemistry
          </div>
        </div>
      )}

      {/* Modal for Country Researchers */}
      {showModal && modalCountry && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f2820] border border-[#1a3d33] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#1a3d33]">
              <div>
                <h2 className="text-2xl text-white mb-2">
                  {modalCountry.name} — Top Researchers in {modalField}
                </h2>
                <p className="text-emerald-400/60">
                  Top researchers in {modalField} from {modalCountry.name}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-[#1a3d33] rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-emerald-400" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-[#1a3d33]">
              <button
                onClick={() => setActiveModalTab("h-index")}
                className={`px-6 py-4 flex items-center gap-2 transition-colors ${
                  activeModalTab === "h-index"
                    ? "text-emerald-400 border-b-2 border-emerald-400"
                    : "text-emerald-400/60 hover:text-emerald-400"
                }`}
              >
                <Award className="w-5 h-5" />
                By H-Index
              </button>
              <button
                onClick={() => setActiveModalTab("rii")}
                className={`px-6 py-4 flex items-center gap-2 transition-colors ${
                  activeModalTab === "rii"
                    ? "text-emerald-400 border-b-2 border-emerald-400"
                    : "text-emerald-400/60 hover:text-emerald-400"
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                By RII
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              {loadingModal ? (
                <div className="flex items-center justify-center h-64 text-emerald-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Loading researchers...
                </div>
              ) : activeModalResearchers.length > 0 ? (
                <div className="space-y-4">
                  {/* Researchers Bar Chart */}
                  <div className="h-64 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={activeModalResearchers
                          .slice(0, 10)
                          .map((researcher, index) => ({
                            name:
                              researcher.full_name.length > 15
                                ? `${researcher.full_name.substring(0, 15)}...`
                                : researcher.full_name,
                            fullName: researcher.full_name,
                            value:
                              activeModalTab === "h-index"
                                ? researcher.h_index
                                : researcher.rii,
                            rank: index + 1,
                          }))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a3d33" />
                        <XAxis
                          dataKey="name"
                          stroke="#4ade80"
                          fontSize={12}
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis stroke="#4ade80" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f2820",
                            border: "1px solid #1a3d33",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                          formatter={(value, name, props) => [
                            value,
                            activeModalTab === "h-index" ? "H-Index" : "RII",
                            `Researcher: ${props.payload.fullName}`,
                          ]}
                        />
                        <Bar
                          dataKey="value"
                          name={
                            activeModalTab === "h-index" ? "H-Index" : "RII"
                          }
                          fill={
                            activeModalTab === "h-index" ? "#14b8a6" : "#10b981"
                          }
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Researchers List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeModalResearchers
                      .slice(0, 10)
                      .map((researcher, index) => (
                        <div
                          key={researcher.id}
                          className="bg-[#1a3d33] rounded-lg p-4 hover:bg-[#2a4d44] transition-colors"
                        >
                          <div className="flex items-start gap-3">
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
                            <div className="flex-1">
                              <div className="text-white font-medium mb-2">
                                {researcher.full_name}
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-teal-500/10 text-teal-400 px-3 py-1 rounded-lg">
                                  <div className="flex items-center gap-1">
                                    <Award className="w-3 h-3" />
                                    H-index: {researcher.h_index}
                                  </div>
                                </div>
                                <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg">
                                  <div className="flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    RII: {researcher.rii?.toFixed(2)}
                                  </div>
                                </div>
                                {researcher.total_publications && (
                                  <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg">
                                    <div className="flex items-center gap-1">
                                      <BookOpen className="w-3 h-3" />
                                      Publications:{" "}
                                      {researcher.total_publications}
                                    </div>
                                  </div>
                                )}
                                {researcher.total_citations && (
                                  <div className="bg-teal-500/10 text-teal-400 px-3 py-1 rounded-lg">
                                    <div className="flex items-center gap-1">
                                      <Hash className="w-3 h-3" />
                                      Citations: {researcher.total_citations}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-emerald-400/60">
                  No researchers found for {modalCountry.name} in {modalField}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
