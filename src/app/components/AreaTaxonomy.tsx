import { useState, useMemo, JSX } from "react";
import {
  ChevronRight,
  ChevronDown,
  Network,
  Users,
  FileText,
  Search,
  Filter,
  BarChart3,
  PieChart,
  Globe,
  Cpu,
  BookOpen,
  FlaskRound,
  Hash,
  Circle,
  Square,
  Triangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  Treemap,
  Tooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { taxonomyData } from "./taxonomyData";

interface TaxonomyNode {
  [key: string]: any;
}

interface AreaStats {
  totalAreas: number;
  totalResearchers: number;
  totalPublications: number;
  maxDepth: number;
  domains: Array<{ name: string; count: number; color: string }>;
}

interface FlattenedNode {
  id: string;
  name: string;
  path: string[];
  depth: number;
  type: "domain" | "field" | "subfield" | "specialization" | "topic";
  childrenCount: number;
  domain: string;
  isLeaf: boolean;
}

interface TreemapContentProps {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  size: number;
  color: string;
}

export function AreaTaxonomy() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(["Natural Science"])
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [activeView, setActiveView] = useState<"tree" | "treemap" | "sunburst">(
    "tree"
  );
  const [maxDepthVisible, setMaxDepthVisible] = useState<number>(6); // Control how many levels to show

  // Flatten the taxonomy for search and statistics
  const flattenTaxonomy = (
    node: TaxonomyNode,
    path: string[] = [],
    depth = 0
  ): FlattenedNode[] => {
    const result: FlattenedNode[] = [];

    if (typeof node === "object" && node !== null) {
      Object.entries(node).forEach(([key, value]) => {
        const currentPath = [...path, key];
        const isLeaf =
          Array.isArray(value) ||
          (typeof value === "object" && Object.keys(value).length === 0);
        const isDomain = depth === 0;
        const isField = depth === 1;
        const isSubfield = depth === 2;
        const isSpecialization = depth === 3;
        const isTopic = depth >= 4;

        result.push({
          id: currentPath.join("|"),
          name: key,
          path: currentPath,
          depth,
          type: isDomain
            ? "domain"
            : isField
            ? "field"
            : isSubfield
            ? "subfield"
            : isSpecialization
            ? "specialization"
            : "topic",
          childrenCount:
            typeof value === "object"
              ? Array.isArray(value)
                ? value.length
                : Object.keys(value).length
              : 0,
          domain: path[0] || key,
          isLeaf,
        });

        if (typeof value === "object" && !Array.isArray(value)) {
          result.push(...flattenTaxonomy(value, currentPath, depth + 1));
        } else if (Array.isArray(value)) {
          // Add leaf nodes
          value.forEach((leaf: string) => {
            const leafPath = [...currentPath, leaf];
            result.push({
              id: leafPath.join("|"),
              name: leaf,
              path: leafPath,
              depth: depth + 1,
              type: "topic",
              childrenCount: 0,
              domain: path[0] || key,
              isLeaf: true,
            });
          });
        }
      });
    }

    return result;
  };

  const allAreas = useMemo(() => flattenTaxonomy(taxonomyData.taxonomy), []);

  const calculateStatistics = (): AreaStats => {
    const domains = Object.keys(taxonomyData.taxonomy);
    const maxDepth = Math.max(...allAreas.map((area) => area.depth));

    // Calculate per-domain counts
    const domainStats = domains.map((domain, index) => {
      const domainAreas = allAreas.filter((area) => area.domain === domain);
      const colors = [
        "#10b981",
        "#3b82f6",
        "#8b5cf6",
        "#ef4444",
        "#f59e0b",
        "#ec4899",
        "#06b6d4",
      ];
      return {
        name: domain,
        count: domainAreas.length,
        color: colors[index % colors.length],
      };
    });

    return {
      totalAreas: allAreas.length,
      totalResearchers: 1248,
      totalPublications: 42892,
      maxDepth,
      domains: domainStats,
    };
  };

  const stats = useMemo(() => calculateStatistics(), [allAreas]);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderTaxonomyNode = (
    node: TaxonomyNode,
    parentKey = "",
    depth = 0,
    domain = ""
  ): JSX.Element[] => {
    const nodes: JSX.Element[] = [];

    if (typeof node !== "object" || node === null) return nodes;

    Object.entries(node).forEach(([key, value]) => {
      const nodeKey = parentKey ? `${parentKey}|${key}` : key;
      const currentDomain = depth === 0 ? key : domain;

      // Filter by search term
      const isSearchMatch =
        searchTerm === "" ||
        key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nodeKey.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by domain
      const isDomainMatch =
        selectedDomain === "all" || currentDomain === selectedDomain;

      if (!isSearchMatch || !isDomainMatch) return;

      const isExpanded = expandedNodes.has(nodeKey);
      const isArray = Array.isArray(value);
      const hasChildren =
        (typeof value === "object" && Object.keys(value).length > 0) || isArray;

      const depthColors = [
        "from-emerald-500 to-emerald-700",
        "from-teal-500 to-teal-600",
        "from-cyan-500 to-cyan-600",
        "from-blue-500 to-blue-600",
        "from-purple-500 to-purple-600",
        "from-pink-500 to-pink-600",
        "from-rose-500 to-rose-600",
        "from-amber-500 to-amber-600",
      ];

      const icons = [
        Network,
        Cpu,
        FlaskRound,
        BookOpen,
        Globe,
        BarChart3,
        Hash,
        Circle,
      ];
      const IconComponent = icons[depth % icons.length];

      nodes.push(
        <div key={nodeKey} className="mb-1">
          <div
            className={`flex items-center gap-3 p-4 rounded-lg hover:bg-emerald-500/5 transition-all cursor-pointer border border-transparent hover:border-emerald-500/20 ${
              depth > 0 ? "ml-6" : ""
            }`}
            onClick={() => hasChildren && toggleNode(nodeKey)}
          >
            {hasChildren && !isArray && (
              <button className="text-emerald-400 hover:text-emerald-300 transition-colors">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
            )}
            {(!hasChildren || isArray) && <div className="w-5" />}

            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${
                depthColors[depth % depthColors.length]
              }`}
            >
              <IconComponent className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-white font-medium truncate">{key}</div>
              <div className="text-emerald-400/60 text-sm flex items-center gap-4 mt-1 flex-wrap">
                {hasChildren && (
                  <span className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded">
                    <Network className="w-3 h-3" />
                    {isArray ? value.length : Object.keys(value).length}{" "}
                    {isArray ? "topics" : "sub-areas"}
                  </span>
                )}
                <span className="text-emerald-400/40 text-xs">
                  {currentDomain} • Level {depth + 1}
                </span>
              </div>
            </div>

            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                depth === 0
                  ? "bg-emerald-500/20 text-emerald-400"
                  : depth === 1
                  ? "bg-teal-500/20 text-teal-400"
                  : depth === 2
                  ? "bg-cyan-500/20 text-cyan-400"
                  : depth === 3
                  ? "bg-blue-500/20 text-blue-400"
                  : depth === 4
                  ? "bg-purple-500/20 text-purple-400"
                  : "bg-pink-500/20 text-pink-400"
              }`}
            >
              {depth === 0
                ? "Domain"
                : depth === 1
                ? "Field"
                : depth === 2
                ? "Sub-field"
                : depth === 3
                ? "Specialization"
                : "Topic"}
            </div>
          </div>

          {hasChildren && !isArray && isExpanded && (
            <div className="mt-2 ml-6 pl-4 border-l border-emerald-500/20">
              {renderTaxonomyNode(value, nodeKey, depth + 1, currentDomain)}
            </div>
          )}

          {isArray && isExpanded && (
            <div className="mt-2 ml-6 pl-4 border-l border-emerald-500/20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {value.map((leaf: string, index: number) => (
                  <div
                    key={`${nodeKey}|${leaf}|${index}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 flex items-center justify-center">
                      <Square className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">
                        {leaf}
                      </div>
                      <div className="text-emerald-400/40 text-xs">Topic</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    });

    return nodes;
  };

  // Prepare data for visualizations
  const treemapData = Object.entries(taxonomyData.taxonomy).map(
    ([domain, fields]) => {
      const areaCount = allAreas.filter(
        (area) => area.domain === domain
      ).length;
      return {
        name: domain,
        size: areaCount,
        color: stats.domains.find((d) => d.name === domain)?.color || "#10b981",
      };
    }
  );

  const domainDistributionData = stats.domains;

  const renderTreemapContent = (props: TreemapContentProps) => {
    const { x, y, width, height, name, size, color } = props;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: color,
            stroke: "#0f2820",
            strokeWidth: 2,
            opacity: 0.9,
          }}
        />
        {width > 80 && height > 40 && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 10}
              textAnchor="middle"
              fill="#fff"
              fontSize={12}
              fontWeight="500"
            >
              {name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 10}
              textAnchor="middle"
              fill="#fff"
              fontSize={10}
            >
              {size} areas
            </text>
          </>
        )}
      </g>
    );
  };

  const renderVisualization = () => {
    switch (activeView) {
      case "treemap":
        return (
          <div className="bg-[#0f2820] border border-[#1a3d33] rounded-xl p-6">
            <h3 className="text-white mb-6 text-lg font-semibold flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Research Areas Distribution by Domain
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <Treemap
                data={treemapData}
                dataKey="size"
                stroke="#0f2820"
                fill="#10b981"
                content={renderTreemapContent}
              />
            </ResponsiveContainer>
          </div>
        );

      case "sunburst":
        return (
          <div className="bg-[#0f2820] border border-[#1a3d33] rounded-xl p-6">
            <h3 className="text-white mb-6 text-lg font-semibold flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Domain Distribution
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <RechartsPieChart>
                <Tooltip
                  formatter={(value: number) => [`${value} areas`, "Count"]}
                  contentStyle={{
                    backgroundColor: "#0f2820",
                    border: "1px solid #1a3d33",
                    color: "white",
                  }}
                />
                <Pie
                  data={domainDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({
                    name,
                    percent,
                  }: {
                    name: string;
                    percent: number;
                  }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {domainDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        );

      default:
        return null;
    }
  };

  const renderBreadcrumb = (path: string) => {
    const parts = path.split("|");
    return (
      <div className="flex items-center gap-2 text-sm">
        {parts.map((part, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-emerald-400/60">{part}</span>
            {index < parts.length - 1 && (
              <ChevronRight className="w-4 h-4 text-emerald-400/40" />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Calculate leaf node statistics
  const leafNodes = allAreas.filter((area) => area.isLeaf);
  const nonLeafNodes = allAreas.filter((area) => !area.isLeaf);

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl text-white mb-2 font-bold">
              Research Area Taxonomy
            </h1>
            <p className="text-emerald-400/60">
              {taxonomyData.metadata.description} •{" "}
              {taxonomyData.metadata.total_domains} domains
            </p>
          </div>
          
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {taxonomyData.metadata.sources.map(
            (source: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs border border-emerald-500/20"
              >
                {source}
              </span>
            )
          )}
        </div>
      </div>

      {/* Controls and Search */}
      <div className="mb-6 p-6 bg-[#0f2820] border border-[#1a3d33] rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-400/60" />
            <input
              type="text"
              placeholder="Search research areas..."
              className="w-full pl-10 pr-4 py-3 bg-[#0a1f18] border border-[#1a3d33] rounded-lg text-white placeholder-emerald-400/40 focus:outline-none focus:border-emerald-500/50 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-400/60" />
            <select
              className="w-full pl-10 pr-4 py-3 bg-[#0a1f18] border border-[#1a3d33] rounded-lg text-white appearance-none focus:outline-none focus:border-emerald-500/50 transition-colors"
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
            >
              <option value="all">All Domains</option>
              {Object.keys(taxonomyData.taxonomy).map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              className={`flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                activeView === "tree"
                  ? "bg-emerald-500 text-white"
                  : "bg-[#0a1f18] text-emerald-400 border border-[#1a3d33] hover:border-emerald-500/30"
              }`}
              onClick={() => setActiveView("tree")}
            >
              <Network className="w-5 h-5" />
              Tree View
            </button>
            <button
              className={`flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                activeView === "treemap"
                  ? "bg-emerald-500 text-white"
                  : "bg-[#0a1f18] text-emerald-400 border border-[#1a3d33] hover:border-emerald-500/30"
              }`}
              onClick={() => setActiveView("treemap")}
            >
              <PieChart className="w-5 h-5" />
              Treemap
            </button>
            <button
              className={`flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                activeView === "sunburst"
                  ? "bg-emerald-500 text-white"
                  : "bg-[#0a1f18] text-emerald-400 border border-[#1a3d33] hover:border-emerald-500/30"
              }`}
              onClick={() => setActiveView("sunburst")}
            >
              <PieChart className="w-5 h-5" />
              Sunburst
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-emerald-400/60 text-sm">Total Areas</div>
              <div className="text-3xl text-white font-bold">
                {stats.totalAreas}
              </div>
            </div>
            <Network className="w-10 h-10 text-emerald-400" />
          </div>
          <div className="text-emerald-400/80 text-sm">
            {nonLeafNodes.length} categories • {leafNodes.length} topics
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-blue-400/60 text-sm">Max Depth</div>
              <div className="text-3xl text-white font-bold">
                {stats.maxDepth + 1}
              </div>
            </div>
            <BarChart3 className="w-10 h-10 text-blue-400" />
          </div>
          <div className="text-blue-400/80 text-sm">Hierarchical levels</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-purple-400/60 text-sm">Domains</div>
              <div className="text-3xl text-white font-bold">
                {stats.domains.length}
              </div>
            </div>
            <Globe className="w-10 h-10 text-purple-400" />
          </div>
          <div className="text-purple-400/80 text-sm">
            Major research fields
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-cyan-400/60 text-sm">Leaf Topics</div>
              <div className="text-3xl text-white font-bold">
                {leafNodes.length}
              </div>
            </div>
            <BookOpen className="w-10 h-10 text-cyan-400" />
          </div>
          <div className="text-cyan-400/80 text-sm">
            Terminal research topics
          </div>
        </div>
      </div>

      {/* Visualization Section */}
      {activeView !== "tree" && renderVisualization()}

      {/* Tree View */}
      {activeView === "tree" && (
        <div className="bg-[#0f2820] border border-[#1a3d33] rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white text-lg font-semibold">
                Hierarchical Taxonomy Structure
              </h3>
              <p className="text-emerald-400/60 text-sm mt-1">
                Expand nodes to view all sub-areas and topics
              </p>
            </div>
            <div className="text-sm text-emerald-400/60">
              Showing{" "}
              {
                allAreas.filter(
                  (a) =>
                    (searchTerm === "" ||
                      a.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())) &&
                    (selectedDomain === "all" || a.domain === selectedDomain)
                ).length
              }{" "}
              of {stats.totalAreas} areas
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-white text-sm">Domain</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-teal-500"></div>
              <span className="text-white text-sm">Field</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              <span className="text-white text-sm">Sub-field</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-white text-sm">Specialization</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-white text-sm">Topic</span>
            </div>
          </div>

          {searchTerm && (
            <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="text-emerald-400 mb-2">
                Search Results for "{searchTerm}"
              </div>
              <div className="text-sm text-emerald-400/80">
                Found{" "}
                {
                  allAreas.filter(
                    (a) =>
                      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      a.id.toLowerCase().includes(searchTerm.toLowerCase())
                  ).length
                }{" "}
                matching areas
              </div>
            </div>
          )}

          <div className="space-y-1 max-h-[600px] overflow-y-auto pr-2">
            {renderTaxonomyNode(taxonomyData.taxonomy)}
          </div>
        </div>
      )}

      {/* Domain Statistics */}
      <div className="bg-[#0f2820] border border-[#1a3d33] rounded-xl p-6 mb-6">
        <h3 className="text-white mb-6 text-lg font-semibold">
          Domain Statistics
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.domains}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a3d33" />
                <XAxis
                  dataKey="name"
                  stroke="#9ca3af"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f2820",
                    border: "1px solid #1a3d33",
                    color: "white",
                  }}
                  formatter={(value: number) => [`${value} areas`, "Count"]}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stats.domains.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <div className="space-y-4">
              {stats.domains.map((domain, index) => {
                const percentage = Math.round(
                  (domain.count / stats.totalAreas) * 100
                );
                const domainLeafNodes = leafNodes.filter(
                  (node) => node.domain === domain.name
                ).length;
                const domainNonLeafNodes = nonLeafNodes.filter(
                  (node) => node.domain === domain.name
                ).length;

                return (
                  <div key={domain.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">{domain.name}</span>
                      <span className="text-emerald-400 text-sm">
                        {domain.count} areas
                      </span>
                    </div>
                    <div className="h-2 bg-[#1a3d33] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: domain.color,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-emerald-400/60">
                      <span>{domainLeafNodes} topics</span>
                      <span>{domainNonLeafNodes} categories</span>
                      <span>{percentage}% of total</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* LLM Integration Note */}
      <div className="mt-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-emerald-400 mb-2 text-lg font-semibold">
              LLM-Enhanced Taxonomy
            </h4>
            <p className="text-emerald-400/80">
              This unified taxonomy is grounded in established classification
              systems—ACM Computing Classification System (CCS), UNESCO Fields
              of Science, and the OECD Frascati framework—and extended through a
              custom hierarchical taxonomy developed using DeepSeek. The
              resulting structure preserves compatibility with widely accepted
              standards while enabling finer-grained and more adaptive domain
              classification. This approach supports fair cross-disciplinary
              assessment and allows controlled evolution to accommodate emerging
              research areas.
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">
                Last Updated: {taxonomyData.metadata.last_updated}
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">
                Hierarchy Levels: {taxonomyData.metadata.hierarchy_levels}
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">
                LLM-Enhanced Classification
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
