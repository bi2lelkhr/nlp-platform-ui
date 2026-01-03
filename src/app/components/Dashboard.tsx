import {
  TrendingUp,
  Users,
  Building2,
  FileText,
  Download,
  Globe,
  Trophy,
  Award,
  Star,
  Target,
  Medal,
  Flame,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { useState, useEffect } from "react";

// Types based on your backend response
interface StatItem {
  label: string;
  value: string | number;
  change: string;
  icon: any;
  color: string;
}

interface CountryInfo {
  id: string;
  name: string;
  average_h_index?: number;
  average_rii?: number;
}

interface InstitutionInfo {
  id: string;
  name: string;
  average_h_index: number;
  average_rii: number;
}

interface ResearcherInfo {
  id: string;
  full_name: string;
  h_index?: number;
  rii?: number;
}

interface StatsData {
  researchers: number;
  countries: number;
  institutions: number;
  fields: number;
}

interface OverviewResponse {
  total: number;
  by_h_index: any[];
  by_rii: any[];
}

interface ChartData {
  year: number;
  publications: number;
  citations: number;
  avgRII: number;
}

// const API_BASE = "http://127.0.0.1:5000/api/overview";
 const API_BASE = "https://nlp-backend-l0p2.onrender.com/api/overview";

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatItem[]>([
    {
      label: "Total Researchers",
      value: "0",
      change: "+12%",
      icon: Users,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Countries Tracked",
      value: "0",
      change: "+5.2%",
      icon: Globe,
      color: "from-teal-500 to-teal-600",
    },
    {
      label: "Institutions Tracked",
      value: "0",
      change: "+5.2%",
      icon: Building2,
      color: "from-cyan-500 to-cyan-600",
    },
    {
      label: "Research Fields",
      value: "0",
      change: "+8.5%",
      icon: FileText,
      color: "from-green-500 to-green-600",
    },
  ]);

  const [topCountries, setTopCountries] = useState<{
    byH: CountryInfo[];
    byRII: CountryInfo[];
    total: number;
  }>({ byH: [], byRII: [], total: 0 });

  const [topInstitutions, setTopInstitutions] = useState<{
    byH: InstitutionInfo[];
    byRII: InstitutionInfo[];
    total: number;
  }>({ byH: [], byRII: [], total: 0 });

  const [topResearchers, setTopResearchers] = useState<{
    byH: ResearcherInfo[];
    byRII: ResearcherInfo[];
    total: number;
  }>({ byH: [], byRII: [], total: 0 });

  const [publicationTrends, setPublicationTrends] = useState<ChartData[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [statsRes, countriesRes, institutionsRes, researchersRes] =
        await Promise.all([
          fetch(`${API_BASE}/stats`).then((res) => res.json()),
          fetch(`${API_BASE}/countries`).then((res) => res.json()),
          fetch(`${API_BASE}/institutions`).then((res) => res.json()),
          fetch(`${API_BASE}/researchers`).then((res) => res.json()),
        ]);

      // Process all data
      processDashboardData(
        statsRes,
        countriesRes,
        institutionsRes,
        researchersRes
      );

      // Generate mock chart data
      generateChartData(institutionsRes, countriesRes);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processDashboardData = (
    statsData: StatsData,
    countriesData: OverviewResponse,
    institutionsData: OverviewResponse,
    researchersData: OverviewResponse
  ) => {
    // Update stats cards with actual data
    const newStats: StatItem[] = [
      {
        label: "Total Researchers",
        value: statsData.researchers.toLocaleString(),
        change: "+12%",
        icon: Users,
        color: "from-emerald-500 to-emerald-600",
      },
      {
        label: "Countries Tracked",
        value: statsData.countries.toLocaleString(),
        change: "+5.2%",
        icon: Globe,
        color: "from-teal-500 to-teal-600",
      },
      {
        label: "Institutions Tracked",
        value: statsData.institutions.toLocaleString(),
        change: "+5.2%",
        icon: Building2,
        color: "from-cyan-500 to-cyan-600",
      },
      {
        label: "Research Fields",
        value: statsData.fields.toLocaleString(),
        change: "+8.5%",
        icon: FileText,
        color: "from-green-500 to-green-600",
      },
    ];
    setStats(newStats);

    // Set top countries data
    setTopCountries({
      byH: countriesData.by_h_index || [],
      byRII: countriesData.by_rii || [],
      total: countriesData.total || 0,
    });

    // Set top institutions data
    setTopInstitutions({
      byH: institutionsData.by_h_index || [],
      byRII: institutionsData.by_rii || [],
      total: institutionsData.total || 0,
    });

    // Set top researchers data
    setTopResearchers({
      byH: researchersData.by_h_index || [],
      byRII: researchersData.by_rii || [],
      total: researchersData.total || 0,
    });
  };

  const generateChartData = (
    institutionsData: OverviewResponse,
    countriesData: OverviewResponse
  ) => {
    // Generate mock publication trends data
    const years = [2020, 2021, 2022, 2023, 2024];
    const totalInstitutions = institutionsData.total || 100;
    const totalCountries = countriesData.total || 50;

    const publicationsData: ChartData[] = years.map((year, index) => {
      const basePublications = 1000 + index * 200;
      const baseCitations = 5000 + index * 500;
      const baseRII = 2.0 + index * 0.1;

      return {
        year,
        publications: Math.floor(basePublications * (totalInstitutions / 100)),
        citations: Math.floor(baseCitations * (totalInstitutions / 100)),
        avgRII: baseRII + Math.random() * 0.3,
      };
    });

    setPublicationTrends(publicationsData);
  };

  const handleExportReport = async () => {
    try {
      // Create a download link for CSV export
      const csvContent = createCSVExport();
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `research_dashboard_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };

  const createCSVExport = (): string => {
    const headers = [
      "Category",
      "Metric",
      "Value",
      "Top Performers (H-Index)",
      "Top Performers (RII)",
    ];
    const rows = [
      [
        "Researchers",
        "Total Count",
        topResearchers.total,
        topResearchers.byH
          .map((r) => r.full_name)
          .slice(0, 3)
          .join("; "),
        topResearchers.byRII
          .map((r) => r.full_name)
          .slice(0, 3)
          .join("; "),
      ],
      [
        "Countries",
        "Total Count",
        topCountries.total,
        topCountries.byH
          .map((c) => c.name)
          .slice(0, 3)
          .join("; "),
        topCountries.byRII
          .map((c) => c.name)
          .slice(0, 3)
          .join("; "),
      ],
      [
        "Institutions",
        "Total Count",
        topInstitutions.total,
        topInstitutions.byH
          .map((i) => i.name)
          .slice(0, 3)
          .join("; "),
        topInstitutions.byRII
          .map((i) => i.name)
          .slice(0, 3)
          .join("; "),
      ],
    ];

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    return csv;
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-emerald-400 text-lg">
            Loading dashboard data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-white mb-2">
            Research Production Dashboard
          </h1>
          <p className="text-emerald-400/60">
            Real-time overview of research metrics and comparative analysis
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-[#1a3d33] hover:bg-[#245c4a] text-emerald-400 rounded-lg transition-colors"
          >
            Refresh Data
          </button>
          {/* <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            Export Report
          </button> */}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#0f2820] border border-[#1a3d33] rounded-xl p-6 hover:border-emerald-500/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-emerald-400 text-sm">{stat.change}</span>
            </div>
            <div className="text-2xl text-white mb-1">{stat.value}</div>
            <div className="text-emerald-400/60 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Top Institutions Section */}
      <div className="bg-[#0f2820] border border-[#1a3d33] rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-cyan-500" />
            <h3 className="text-white text-xl">Top Institutions</h3>
          </div>
          <div className="text-emerald-400/60 text-sm">
            Total: {topInstitutions.total.toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* By h-Index */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-white text-lg font-medium"> By h-Index</h4>
                <p className="text-emerald-400/60 text-sm">
                  Top institutions ranked by average h-index
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              {topInstitutions.byH.map((institution, index) => (
                <div
                  key={institution.id}
                  className="flex items-center justify-between p-4 hover:bg-[#1a3d33]/50 rounded-xl transition-all border border-[#1a3d33] hover:border-emerald-500/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <span className="text-emerald-400 font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {institution.name}
                      </div>
                      <div className="text-emerald-400/60 text-xs">
                        Average h-index
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-emerald-500/10 rounded-lg">
                      <span className="text-emerald-400 font-bold">
                        {institution.average_h_index?.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By RII */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-teal-500" />
              </div>
              <div>
                <h4 className="text-white text-lg font-medium"> By RII</h4>
                <p className="text-emerald-400/60 text-sm">
                  Top institutions ranked by average RII
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              {topInstitutions.byRII.map((institution, index) => (
                <div
                  key={institution.id}
                  className="flex items-center justify-between p-4 hover:bg-[#1a3d33]/50 rounded-xl transition-all border border-[#1a3d33] hover:border-teal-500/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                      <span className="text-teal-400 font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {institution.name}
                      </div>
                      <div className="text-teal-400/60 text-xs">
                        Average RII
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-teal-500/10 rounded-lg">
                      <span className="text-teal-400 font-bold">
                        {institution.average_rii?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Researchers Section */}
      <div className="bg-[#0f2820] border border-[#1a3d33] rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-purple-500" />
            <h3 className="text-white text-xl">Top Researchers</h3>
          </div>
          <div className="text-emerald-400/60 text-sm">
            Total: {topResearchers.total.toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* By h-Index */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center">
                <Medal className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h4 className="text-white text-lg font-medium"> By h-Index</h4>
                <p className="text-emerald-400/60 text-sm">
                  Top researchers ranked by h-index
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              {topResearchers.byH.map((researcher, index) => (
                <div
                  key={researcher.id}
                  className="flex items-center justify-between p-4 hover:bg-[#1a3d33]/50 rounded-xl transition-all border border-[#1a3d33] hover:border-amber-500/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <span className="text-amber-400 font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-medium truncate">
                        {researcher.full_name}
                      </div>
                      <div className="text-amber-400/60 text-xs">
                        h-index
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-amber-500/10 rounded-lg">
                      <span className="text-amber-400 font-bold">
                        {researcher.h_index?.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By RII */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <h4 className="text-white text-lg font-medium"> By RII</h4>
                <p className="text-emerald-400/60 text-sm">
                  Top researchers ranked by RII
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              {topResearchers.byRII.map((researcher, index) => (
                <div
                  key={researcher.id}
                  className="flex items-center justify-between p-4 hover:bg-[#1a3d33]/50 rounded-xl transition-all border border-[#1a3d33] hover:border-violet-500/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                      <span className="text-violet-400 font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-medium truncate">
                        {researcher.full_name}
                      </div>
                      <div className="text-violet-400/60 text-xs">
                        RII Score
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-violet-500/10 rounded-lg">
                      <span className="text-violet-400 font-bold">
                        {researcher.rii?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Countries Section */}
      <div className="bg-[#0f2820] border border-[#1a3d33] rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-blue-500" />
            <h3 className="text-white text-xl">Top Countries</h3>
          </div>
          <div className="text-emerald-400/60 text-sm">
            Total: {topCountries.total.toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* By h-Index */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="text-white text-lg font-medium"> By h-Index</h4>
                <p className="text-emerald-400/60 text-sm">
                  Top countries ranked by average h-index
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              {topCountries.byH.map((country, index) => (
                <div
                  key={country.id}
                  className="flex items-center justify-between p-4 hover:bg-[#1a3d33]/50 rounded-xl transition-all border border-[#1a3d33] hover:border-blue-500/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <span className="text-blue-400 font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {country.name}
                      </div>
                      <div className="text-blue-400/60 text-xs">
                        Average h-index
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-blue-500/10 rounded-lg">
                      <span className="text-blue-400 font-bold">
                        {country.average_h_index?.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By RII */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500/20 to-cyan-500/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-sky-500" />
              </div>
              <div>
                <h4 className="text-white text-lg font-medium"> By RII</h4>
                <p className="text-emerald-400/60 text-sm">
                  Top countries ranked by average RII
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              {topCountries.byRII.map((country, index) => (
                <div
                  key={country.id}
                  className="flex items-center justify-between p-4 hover:bg-[#1a3d33]/50 rounded-xl transition-all border border-[#1a3d33] hover:border-sky-500/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center">
                      <span className="text-sky-400 font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {country.name}
                      </div>
                      <div className="text-sky-400/60 text-xs">
                        Average RII
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-sky-500/10 rounded-lg">
                      <span className="text-sky-400 font-bold">
                        {country.average_rii?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Publication Trends */}
        <div className="bg-[#0f2820] border border-[#1a3d33] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white">Publication & Citation Trends</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-emerald-400/60">Publications</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                <span className="text-emerald-400/60">Citations</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={publicationTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a3d33" />
              <XAxis dataKey="year" stroke="#4ade80" />
              <YAxis stroke="#4ade80" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f2820",
                  border: "1px solid #1a3d33",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value, name) => {
                  if (name === "publications")
                    return [value.toLocaleString(), "Publications"];
                  if (name === "citations")
                    return [value.toLocaleString(), "Citations"];
                  return [value, name];
                }}
              />
              <Line
                type="monotone"
                dataKey="publications"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981" }}
                name="Publications"
              />
              <Line
                type="monotone"
                dataKey="citations"
                stroke="#14b8a6"
                strokeWidth={2}
                dot={{ fill: "#14b8a6" }}
                name="Citations"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* RII Trends */}
        <div className="bg-[#0f2820] border border-[#1a3d33] rounded-xl p-6">
          <h3 className="text-white mb-6">
            Relative Impact Index (RII) Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={publicationTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a3d33" />
              <XAxis dataKey="year" stroke="#4ade80" />
              <YAxis stroke="#4ade80" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f2820",
                  border: "1px solid #1a3d33",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value) => [
                  isNaN(Number(value)) ? "NaN" : Number(value).toFixed(2),
                  "Avg RII",
                ]}
              />
              <Bar
                dataKey="avgRII"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
                name="Average RII"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-8 text-center text-emerald-400/40 text-sm">
        Data fetched from {API_BASE} • Last updated:{" "}
        {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
