import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Filter,
  Download,
  TrendingUp,
  FileText,
  Award,
  ChevronLeft,
  ChevronRight,
  User,
  X,
  BookOpen,
  Users,
  BarChart3,
  Calendar,
  Hash,
  GitCompare as Compare,
  Check,
  Maximize2,
  Minimize2,
  Sparkles,
  Target,
  BarChart,
  LineChart,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  BarChart as RechartsBarChart,
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
  LineChart as RechartsLineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Area,
} from "recharts";

// const API_BASE = "http://127.0.0.1:5000";
const API_BASE = "https://nlp-backend-l0p2.onrender.com";

interface Researcher {
  id: string;
  name: string;
  publications: number;
  citations: number;
  hIndex: number;
  rii: number;
  full_name?: string;
}

interface Article {
  id: string;
  title: string;
  journal_name: string;
  publication_date: string;
  cited_by_count: number;
}

interface CoAuthor {
  id: string;
  name: string;
  shared_articles: number;
}

interface Field {
  field: string;
  percentage: number;
}

interface ResearcherDetails {
  overview: any;
  articles: Article[];
  coauthors: CoAuthor[];
  fields: Field[];
}

interface PaginatedResearchers {
  researchers: Researcher[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

interface SelectedResearcher extends Researcher {
  details?: ResearcherDetails;
  loading?: boolean;
}

export function ResearcherAnalysis() {
  const [topResearchers, setTopResearchers] = useState<Researcher[]>([]);
  const [allResearchers, setAllResearchers] = useState<Researcher[]>([]);
  const [searchResults, setSearchResults] = useState<Researcher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResearchers, setTotalResearchers] = useState(0);

  // Selection states
  const [selectedResearchers, setSelectedResearchers] = useState<SelectedResearcher[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonMode, setComparisonMode] = useState<'table' | 'charts' | 'radar'>('table');
  const [comparisonExpanded, setComparisonExpanded] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedResearcherId, setSelectedResearcherId] = useState<string | null>(null);
  const [researcherDetails, setResearcherDetails] = useState<ResearcherDetails | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"articles" | "coauthors" | "fields">("articles");

  // --------------------------------------------------
  // Load top 5 researchers (h-index vs RII) and initial paginated data
  // --------------------------------------------------
  useEffect(() => {
    async function loadInitialData() {
      try {
        // Load top 5 researchers
        const topRes = await fetch(
          `${API_BASE}/api/researchers/top5/hindex-rii`
        );
        const top5 = await topRes.json();

        const detailedTop = await Promise.all(
          top5.map(async (r: any) => {
            const res2 = await fetch(
              `${API_BASE}/api/researcher/${r.id}/overview`
            );
            const info = await res2.json();

            return {
              id: r.id,
              name: info.full_name,
              publications: info.total_publications,
              citations: info.total_citations,
              hIndex: info.h_index,
              rii: info.rii,
            };
          })
        );

        setTopResearchers(detailedTop);

        // Load first page of all researchers
        await loadPaginatedResearchers(1);
      } catch (err) {
        console.error("Failed to load researchers", err);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // --------------------------------------------------
  // Load paginated researchers
  // --------------------------------------------------
  const loadPaginatedResearchers = useCallback(
    async (page: number) => {
      try {
        const res = await fetch(
          `${API_BASE}/api/researchers/all?page=${page}&limit=${pageSize}`
        );
        const data: PaginatedResearchers = await res.json();

        // Transform results
        const transformed = await Promise.all(
          data.researchers.map(async (r: any) => ({
            id: r.id,
            name: r.full_name,
            publications: r.total_publications || 0,
            citations: r.total_citations || 0,
            hIndex: r.h_index || 0,
            rii: r.rii || 0,
          }))
        );

        setAllResearchers(transformed);
        setTotalPages(data.total_pages);
        setTotalResearchers(data.total);
        setCurrentPage(data.page);
      } catch (err) {
        console.error("Failed to load paginated researchers", err);
      }
    },
    [pageSize]
  );

  // --------------------------------------------------
  // Search functionality - starts from first letter
  // --------------------------------------------------
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length < 1) {
        setSearchResults([]);
        // Reload paginated researchers when search is cleared
        if (allResearchers.length === 0) {
          await loadPaginatedResearchers(1);
        }
        return;
      }

      setSearchLoading(true);
      try {
        // Fetch search results
        const res = await fetch(
          `${API_BASE}/api/researchers/search?q=${encodeURIComponent(
            searchTerm
          )}`
        );
        const searchResultsData = await res.json();

        // Transform results to match our Researcher interface
        const transformedResults = await Promise.all(
          searchResultsData.map(async (s: any) => {
            try {
              const res2 = await fetch(
                `${API_BASE}/api/researcher/${s.id}/overview`
              );
              const info = await res2.json();

              return {
                id: s.id,
                name: s.full_name,
                publications: info.total_publications || 0,
                citations: info.total_citations || 0,
                hIndex: info.h_index || 0,
                rii: info.rii || 0,
              };
            } catch (err) {
              console.error(`Failed to load details for ${s.id}`, err);
              return {
                id: s.id,
                name: s.full_name,
                publications: 0,
                citations: 0,
                hIndex: 0,
                rii: 0,
              };
            }
          })
        );

        setSearchResults(transformedResults);
        // Clear paginated results when searching
        setAllResearchers([]);
      } catch (err) {
        console.error("Failed to search researchers", err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, allResearchers.length, loadPaginatedResearchers]);

  // --------------------------------------------------
  // Load researcher details for modal
  // --------------------------------------------------
  const loadResearcherDetails = useCallback(async (researcherId: string) => {
    setModalLoading(true);
    try {
      const [overviewRes, articlesRes, coauthorsRes, fieldsRes] =
        await Promise.all([
          fetch(`${API_BASE}/api/researcher/${researcherId}/overview`),
          fetch(`${API_BASE}/api/researcher/${researcherId}/articles`),
          fetch(`${API_BASE}/api/researcher/${researcherId}/coauthors`),
          fetch(`${API_BASE}/api/researcher/${researcherId}/fields`),
        ]);

      const overview = await overviewRes.json();
      const articles = await articlesRes.json();
      const coauthors = await coauthorsRes.json();
      const fields = await fieldsRes.json();

      setResearcherDetails({
        overview,
        articles,
        coauthors,
        fields,
      });
    } catch (err) {
      console.error("Failed to load researcher details", err);
    } finally {
      setModalLoading(false);
    }
  }, []);

  // --------------------------------------------------
  // Load researcher details for comparison
  // --------------------------------------------------
  const loadResearcherForComparison = useCallback(async (researcherId: string) => {
    try {
      const [overviewRes, fieldsRes] = await Promise.all([
        fetch(`${API_BASE}/api/researcher/${researcherId}/overview`),
        fetch(`${API_BASE}/api/researcher/${researcherId}/fields`),
      ]);

      const overview = await overviewRes.json();
      const fields = await fieldsRes.json();

      return {
        overview,
        fields,
        articles: [],
        coauthors: [],
      };
    } catch (err) {
      console.error("Failed to load researcher for comparison", err);
      return null;
    }
  }, []);

  // --------------------------------------------------
  // Handle researcher selection for comparison
  // --------------------------------------------------
  const handleResearcherSelect = useCallback(async (researcher: Researcher) => {
    const isSelected = selectedResearchers.some(r => r.id === researcher.id);
    
    if (isSelected) {
      // Remove researcher
      setSelectedResearchers(prev => prev.filter(r => r.id !== researcher.id));
    } else {
      // Check if we can add more (max 5)
      if (selectedResearchers.length >= 5) {
        alert('You can only compare up to 5 researchers at once');
        return;
      }
      
      // Add researcher with loading state
      const newSelected: SelectedResearcher = {
        ...researcher,
        loading: true
      };
      
      setSelectedResearchers(prev => [...prev, newSelected]);
      
      // Load details for comparison
      const details = await loadResearcherForComparison(researcher.id);
      if (details) {
        setSelectedResearchers(prev =>
          prev.map(r =>
            r.id === researcher.id
              ? { ...r, details, loading: false }
              : r
          )
        );
      }
    }
  }, [selectedResearchers, loadResearcherForComparison]);

  // --------------------------------------------------
  // Toggle comparison mode
  // --------------------------------------------------
  const toggleComparisonMode = () => {
    if (selectedResearchers.length > 0) {
      setIsComparing(!isComparing);
    }
  };

  // --------------------------------------------------
  // Handle researcher click to show modal
  // --------------------------------------------------
  const handleResearcherClick = async (researcherId: string) => {
    setSelectedResearcherId(researcherId);
    setShowModal(true);
    setActiveTab("articles");
    await loadResearcherDetails(researcherId);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedResearcherId(null);
    setResearcherDetails(null);
  };

  // --------------------------------------------------
  // Pagination handlers
  // --------------------------------------------------
  const handlePrevPage = async () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      await loadPaginatedResearchers(newPage);
    }
  };

  const handleNextPage = async () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      await loadPaginatedResearchers(newPage);
    }
  };

  // --------------------------------------------------
  // Clear all selected researchers
  // --------------------------------------------------
  const clearSelection = () => {
    setSelectedResearchers([]);
    setIsComparing(false);
  };

  // --------------------------------------------------
  // Determine which researchers to display
  // --------------------------------------------------
  const displayResearchers =
    searchTerm.trim().length >= 1 ? searchResults : allResearchers;
  const isSearching = searchTerm.trim().length >= 1;

  // --------------------------------------------------
  // Comparison chart data
  // --------------------------------------------------
  const comparisonBarData = selectedResearchers.map((r, index) => ({
    name: r.name.split(" ").pop() || `Researcher ${index + 1}`,
    "Publications": r.publications,
    "Citations": r.citations / 100, // Scale down for visualization
    "h-Index": r.hIndex,
    "RII": r.rii * 100, // Scale up for visualization
  }));

  const comparisonRadarData = selectedResearchers.map((r, index) => ({
    subject: r.name.split(" ").pop() || `Researcher ${index + 1}`,
    Publications: Math.log10(r.publications + 1) * 10,
    Citations: Math.log10(r.citations + 1) * 5,
    "h-Index": r.hIndex * 5,
    RII: r.rii * 100,
    fullMark: 100,
  }));

  const metricsData = [
    { name: "Publications", key: "publications", format: (v: number) => v.toLocaleString() },
    { name: "Citations", key: "citations", format: (v: number) => v.toLocaleString() },
    { name: "h-Index", key: "hIndex", format: (v: number) => v },
    { name: "RII", key: "rii", format: (v: number) => v.toFixed(3) },
  ];

  // Colors for comparison
  const COMPARISON_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#f59e0b"];

  if (loading) {
    return (
      <div className="p-8 text-emerald-400">
        Loading researcher analytics...
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-white mb-2">Researcher Analysis</h1>
          <p className="text-emerald-400/60">
            Compare up to 5 researchers side-by-side
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">
          <Download className="w-5 h-5" />
          Export Data
        </button>
      </div>

      {/* Selection Panel */}
      {selectedResearchers.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Compare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">Selected for Comparison</h3>
                <p className="text-emerald-400/60 text-sm">
                  {selectedResearchers.length} researcher(s) selected
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {selectedResearchers.length > 0 && (
                <button
                  onClick={clearSelection}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              )}
              
              <button
                onClick={toggleComparisonMode}
                disabled={selectedResearchers.length === 0}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  selectedResearchers.length === 0
                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                    : isComparing
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                <Compare className="w-4 h-4" />
                {isComparing ? 'Exit Comparison' : 'Compare Selected'}
              </button>
            </div>
          </div>

          {/* Selected Researchers Chips */}
          <div className="flex flex-wrap gap-2">
            {selectedResearchers.map((researcher, index) => (
              <div
                key={researcher.id}
                className="group flex items-center gap-2 px-3 py-2 bg-[#1a3d33] border border-emerald-500/30 rounded-lg hover:border-emerald-500 transition-colors"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                  style={{ backgroundColor: COMPARISON_COLORS[index % COMPARISON_COLORS.length] }}
                >
                  {index + 1}
                </div>
                <span className="text-white text-sm">{researcher.name}</span>
                <button
                  onClick={() => handleResearcherSelect(researcher)}
                  className="ml-2 text-emerald-400/60 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Panel */}
      {isComparing && selectedResearchers.length > 0 && (
        <div className={`bg-[#0f2820] border border-[#1a3d33] rounded-xl overflow-hidden mb-6 transition-all duration-300 ${comparisonExpanded ? 'max-h-[800px]' : 'max-h-[400px]'}`}>
          <div className="flex items-center justify-between p-4 border-b border-[#1a3d33] bg-gradient-to-r from-emerald-500/5 to-teal-500/5">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="text-white font-medium">
                Comparison Mode ({selectedResearchers.length} researchers)
              </h3>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">
                Side-by-side Analysis
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setComparisonMode('table')}
                  className={`px-3 py-1 rounded text-sm ${comparisonMode === 'table' ? 'bg-emerald-500 text-white' : 'bg-[#1a3d33] text-emerald-400/80 hover:text-emerald-400'}`}
                >
                  Table
                </button>
                <button
                  onClick={() => setComparisonMode('charts')}
                  className={`px-3 py-1 rounded text-sm ${comparisonMode === 'charts' ? 'bg-emerald-500 text-white' : 'bg-[#1a3d33] text-emerald-400/80 hover:text-emerald-400'}`}
                >
                  Charts
                </button>
                <button
                  onClick={() => setComparisonMode('radar')}
                  className={`px-3 py-1 rounded text-sm ${comparisonMode === 'radar' ? 'bg-emerald-500 text-white' : 'bg-[#1a3d33] text-emerald-400/80 hover:text-emerald-400'}`}
                >
                  Radar
                </button>
              </div>
              
              <button
                onClick={() => setComparisonExpanded(!comparisonExpanded)}
                className="p-2 hover:bg-[#1a3d33] rounded-lg transition-colors"
              >
                {comparisonExpanded ? (
                  <Minimize2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Maximize2 className="w-5 h-5 text-emerald-400" />
                )}
              </button>
            </div>
          </div>

          <div className="p-4 overflow-auto">
            {comparisonMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1a3d33]">
                      <th className="px-4 py-3 text-left text-emerald-400/80 text-sm">
                        Metric
                      </th>
                      {selectedResearchers.map((researcher, index) => (
                        <th key={researcher.id} className="px-4 py-3 text-center text-emerald-400/80 text-sm">
                          <div className="flex items-center justify-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COMPARISON_COLORS[index % COMPARISON_COLORS.length] }}
                            />
                            {researcher.name.split(" ").pop()}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {metricsData.map((metric) => (
                      <tr key={metric.key} className="border-b border-[#1a3d33]/50">
                        <td className="px-4 py-3 text-emerald-400 font-medium">
                          {metric.name}
                        </td>
                        {selectedResearchers.map((researcher) => (
                          <td key={`${researcher.id}-${metric.key}`} className="px-4 py-3 text-center text-white">
                            {metric.format(researcher[metric.key as keyof Researcher] as number)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : comparisonMode === 'charts' ? (
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#1a3d33] rounded-xl p-4">
                  <h4 className="text-white mb-4 text-center">Publications & Citations</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsBarChart data={comparisonBarData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a4d44" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f2820',
                          border: '1px solid #1a3d33',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="Publications" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Citations" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="bg-[#1a3d33] rounded-xl p-4">
                  <h4 className="text-white mb-4 text-center">h-Index vs RII</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsBarChart data={comparisonBarData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a4d44" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f2820',
                          border: '1px solid #1a3d33',
                          borderRadius: '8px',
                          color: '#fff',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="h-Index" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="RII" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="bg-[#1a3d33] rounded-xl p-4">
                <h4 className="text-white mb-4 text-center">Performance Radar</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={comparisonRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
                    <PolarRadiusAxis stroke="#9ca3af" />
                    {selectedResearchers.map((_, index) => (
                      <Radar
                        key={index}
                        name={`Researcher ${index + 1}`}
                        dataKey={comparisonRadarData[index].subject}
                        stroke={COMPARISON_COLORS[index % COMPARISON_COLORS.length]}
                        fill={COMPARISON_COLORS[index % COMPARISON_COLORS.length]}
                        fillOpacity={0.2}
                      />
                    ))}
                    <Legend />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f2820',
                        border: '1px solid #1a3d33',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-4 mb-6 relative">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400/60 w-5 h-5" />
          <input
            type="text"
            placeholder="Search researchers by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#0f2820] border border-[#1a3d33] rounded-lg text-white placeholder:text-emerald-400/40 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <button className="flex items-center gap-2 px-6 py-3 bg-[#0f2820] border border-[#1a3d33] rounded-lg text-emerald-400 hover:border-emerald-500 transition-colors">
          <Filter className="w-5 h-5" />
          Filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0f2820] border border-[#1a3d33] rounded-xl overflow-hidden mb-8">
        {/* Table Header with Pagination */}
        <div className="flex items-center justify-between p-6 border-b border-[#1a3d33]">
          <h3 className="text-white text-xl">
            {isSearching
              ? `Search Results for "${searchTerm}" (${searchResults.length} researchers)`
              : `All Researchers (${totalResearchers} total)`}
          </h3>

          {/* Pagination Controls - Show only when not searching */}
          {!isSearching && totalPages > 1 && (
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 bg-[#0f2820] border border-[#1a3d33] rounded-lg text-emerald-400 hover:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              <span className="text-emerald-400">
                Page {currentPage} of {totalPages}
                {!isSearching && ` (${pageSize} per page)`}
              </span>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 bg-[#0f2820] border border-[#1a3d33] rounded-lg text-emerald-400 hover:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a3d33]">
                <th className="px-6 py-4 text-left text-emerald-400/80 text-sm w-12">
                  Select
                </th>
                <th className="px-6 py-4 text-left text-emerald-400/80 text-sm">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-emerald-400/80 text-sm">
                  Researcher
                </th>
                <th className="px-6 py-4 text-center text-emerald-400/80 text-sm">
                  Publications
                </th>
                <th className="px-6 py-4 text-center text-emerald-400/80 text-sm">
                  Citations
                </th>
                <th className="px-6 py-4 text-center text-emerald-400/80 text-sm">
                  h-Index
                </th>
                <th className="px-6 py-4 text-center text-emerald-400/80 text-sm">
                  RII
                </th>
                <th className="px-6 py-4 text-center text-emerald-400/80 text-sm">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {displayResearchers.length > 0 ? (
                displayResearchers.map((r, index) => {
                  const isSelected = selectedResearchers.some(sr => sr.id === r.id);
                  const selectedIndex = selectedResearchers.findIndex(sr => sr.id === r.id);
                  
                  return (
                    <tr
                      key={r.id}
                      className={`border-b border-[#1a3d33] transition-colors ${isSelected ? 'bg-emerald-500/10' : 'hover:bg-emerald-500/5'}`}
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleResearcherSelect(r)}
                          className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-emerald-500/30 hover:border-emerald-500'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-5 h-5 text-white" />
                              <div 
                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-bold"
                                style={{ backgroundColor: COMPARISON_COLORS[selectedIndex % COMPARISON_COLORS.length] }}
                              >
                                {selectedIndex + 1}
                              </div>
                            </>
                          ) : (
                            <div className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white bg-gradient-to-br from-emerald-500 to-emerald-700">
                            {isSearching
                              ? index + 1
                              : (currentPage - 1) * pageSize + index + 1}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white">
                            {r.name.charAt(0)}
                          </div>
                          <div className="text-white">{r.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-white">
                        {r.publications.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center text-white">
                        {r.citations.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center text-white">
                        <div className="flex items-center justify-center gap-2">
                          <Award className="w-4 h-4 text-teal-400" />
                          {r.hIndex}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-white">
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-400" />
                          {r.rii.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleResearcherClick(r.id)}
                            className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleResearcherSelect(r)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              isSelected
                                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                                : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400'
                            }`}
                          >
                            {isSelected ? 'Remove' : 'Compare'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-emerald-400/60"
                  >
                    {isSearching && searchLoading
                      ? "Searching..."
                      : isSearching
                      ? "No researchers found matching your search"
                      : "No researchers available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Original Chart */}
      <div className="bg-[#0f2820] border border-[#1a3d33] rounded-xl p-6 mb-6">
        <h3 className="text-white text-xl mb-2">
          h-Index vs RII Comparison (Top 5 Researchers)
        </h3>
        <p className="text-emerald-400/60 text-sm mb-6">
          Showing the top 5 researchers by h-index/RII combination
        </p>

        <ResponsiveContainer width="100%" height={300}>
          <RechartsBarChart data={topResearchers.slice(0, 5).map((r) => ({
            name: r.name.split(" ").pop(),
            "h-Index": r.hIndex,
            "RII (x10)": r.rii * 10,
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a3d33" />
            <XAxis dataKey="name" stroke="#4ade80" />
            <YAxis stroke="#4ade80" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f2820",
                border: "1px solid #1a3d33",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value, name) => [
                name === "RII (x10)"
                  ? ((value as number) / 10).toFixed(2)
                  : value,
                name === "RII (x10)" ? "RII" : name,
              ]}
            />
            <Legend />
            <Bar dataKey="h-Index" fill="#14b8a6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="RII (x10)" fill="#10b981" radius={[8, 8, 0, 0]} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>

      {/* Pagination Controls (Bottom) */}
      {!isSearching && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-6 py-3 bg-[#0f2820] border border-[#1a3d33] rounded-lg text-emerald-400 hover:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous Page
          </button>

          <div className="text-emerald-400 text-lg">
            Page <span className="text-white font-bold">{currentPage}</span> of{" "}
            <span className="text-white font-bold">{totalPages}</span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-6 py-3 bg-[#0f2820] border border-[#1a3d33] rounded-lg text-emerald-400 hover:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next Page
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Researcher Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f2820] border border-[#1a3d33] rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#1a3d33]">
              <div>
                <h2 className="text-2xl text-white mb-2">
                  {researcherDetails?.overview?.full_name || "Loading..."}
                </h2>
                <div className="flex items-center gap-6 text-emerald-400/80">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    H-index:{" "}
                    <span className="text-white">
                      {researcherDetails?.overview?.h_index || "0"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    RII:{" "}
                    <span className="text-white">
                      {researcherDetails?.overview?.rii?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Publications:{" "}
                    <span className="text-white">
                      {researcherDetails?.overview?.total_publications || "0"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Citations:{" "}
                    <span className="text-white">
                      {researcherDetails?.overview?.total_citations || "0"}
                    </span>
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

            {/* Modal Tabs */}
            <div className="flex border-b border-[#1a3d33]">
              <button
                onClick={() => setActiveTab("articles")}
                className={`px-6 py-4 flex items-center gap-2 transition-colors ${
                  activeTab === "articles"
                    ? "text-emerald-400 border-b-2 border-emerald-400"
                    : "text-emerald-400/60 hover:text-emerald-400"
                }`}
              >
                <BookOpen className="w-5 h-5" />
                Articles ({researcherDetails?.articles?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("coauthors")}
                className={`px-6 py-4 flex items-center gap-2 transition-colors ${
                  activeTab === "coauthors"
                    ? "text-emerald-400 border-b-2 border-emerald-400"
                    : "text-emerald-400/60 hover:text-emerald-400"
                }`}
              >
                <Users className="w-5 h-5" />
                Co-authors ({researcherDetails?.coauthors?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("fields")}
                className={`px-6 py-4 flex items-center gap-2 transition-colors ${
                  activeTab === "fields"
                    ? "text-emerald-400 border-b-2 border-emerald-400"
                    : "text-emerald-400/60 hover:text-emerald-400"
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                Research Fields
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              {modalLoading ? (
                <div className="flex items-center justify-center h-64 text-emerald-400">
                  Loading researcher details...
                </div>
              ) : (
                <>
                  {/* Articles Tab */}
                  {activeTab === "articles" && (
                    <div className="space-y-4">
                      {researcherDetails?.articles &&
                      researcherDetails.articles.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-[#1a3d33]">
                                <th className="px-4 py-3 text-left text-emerald-400/80 text-sm">
                                  Title
                                </th>
                                <th className="px-4 py-3 text-left text-emerald-400/80 text-sm">
                                  Journal
                                </th>
                                <th className="px-4 py-3 text-left text-emerald-400/80 text-sm">
                                  Year
                                </th>
                                <th className="px-4 py-3 text-left text-emerald-400/80 text-sm">
                                  Citations
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {researcherDetails.articles.map(
                                (article, index) => (
                                  <tr
                                    key={`${article.id}-${index}`}
                                    className="border-b border-[#1a3d33]/50 hover:bg-[#1a3d33]/30 transition-colors"
                                  >
                                    <td className="px-4 py-3 text-white">
                                      {article.title}
                                    </td>
                                    <td className="px-4 py-3 text-emerald-400/80">
                                      {article.journal_name || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-emerald-400/80">
                                      {article.publication_date
                                        ? new Date(
                                            article.publication_date
                                          ).getFullYear()
                                        : "-"}
                                    </td>
                                    <td className="px-4 py-3 text-white">
                                      <div className="flex items-center gap-2">
                                        <Hash className="w-4 h-4 text-emerald-400" />
                                        {article.cited_by_count}
                                      </div>
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-emerald-400/60">
                          No articles found for this researcher
                        </div>
                      )}
                    </div>
                  )}

                  {/* Co-authors Tab */}
                  {activeTab === "coauthors" && (
                    <div className="space-y-4">
                      {researcherDetails?.coauthors &&
                      researcherDetails.coauthors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {researcherDetails.coauthors.map(
                            (coauthor, index) => (
                              <div
                                key={`${coauthor.id}-${index}`}
                                className="bg-[#1a3d33] rounded-xl p-4 border border-[#2a4d44] hover:border-emerald-500/50 transition-colors"
                              >
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white">
                                    {coauthor.name.charAt(0)}
                                  </div>
                                  <div>
                                    <h4 className="text-white font-medium">
                                      {coauthor.name}
                                    </h4>
                                    <p className="text-emerald-400/60 text-sm">
                                      Co-author
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-400">
                                  <Users className="w-4 h-4" />
                                  <span className="text-white">
                                    {coauthor.shared_articles}
                                  </span>
                                  <span className="text-emerald-400/60">
                                    shared papers
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-emerald-400/60">
                          No co-authors found for this researcher
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fields Tab */}
                  {activeTab === "fields" && (
                    <div className="space-y-6">
                      {researcherDetails?.fields &&
                      researcherDetails.fields.length > 0 ? (
                        <>
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-white mb-4">
                                Field Distribution
                              </h4>
                              <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={researcherDetails.fields}
                                      cx="50%"
                                      cy="50%"
                                      labelLine={false}
                                      label={(entry) =>
                                        `${entry.field}: ${entry.percentage}%`
                                      }
                                      outerRadius={80}
                                      fill="#8884d8"
                                      dataKey="percentage"
                                    >
                                      {researcherDetails.fields.map(
                                        (entry, index) => (
                                          <Cell
                                            key={`cell-${index}`}
                                            fill={COMPARISON_COLORS[index % COMPARISON_COLORS.length]}
                                          />
                                        )
                                      )}
                                    </Pie>
                                    <Tooltip
                                      formatter={(value) => [
                                        `${value}%`,
                                        "Percentage",
                                      ]}
                                      contentStyle={{
                                        backgroundColor: "#0f2820",
                                        border: "1px solid #1a3d33",
                                        borderRadius: "8px",
                                        color: "#fff",
                                      }}
                                    />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-white mb-4">Field Details</h4>
                              <div className="space-y-3">
                                {researcherDetails.fields.map(
                                  (field, index) => (
                                    <div
                                      key={field.field}
                                      className="flex items-center justify-between p-3 bg-[#1a3d33] rounded-lg"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div
                                          className="w-3 h-3 rounded-full"
                                          style={{
                                            backgroundColor:
                                              COMPARISON_COLORS[index % COMPARISON_COLORS.length],
                                          }}
                                        />
                                        <span className="text-white">
                                          {field.field}
                                        </span>
                                      </div>
                                      <span className="text-emerald-400 font-medium">
                                        {field.percentage}%
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12 text-emerald-400/60">
                          No field data available for this researcher
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}