import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Calendar, Filter } from 'lucide-react';

export function Reports() {
  const [selectedReport, setSelectedReport] = useState('comparative');
  const [selectedPeriod, setSelectedPeriod] = useState('2024');

  const reports = [
    {
      id: 'comparative',
      name: 'h-Index vs RII Comparative Report',
      description: 'Side-by-side comparison of traditional h-Index and novel Relative Impact Index',
      type: 'PDF / Excel',
      lastGenerated: '2024-12-20',
    },
    {
      id: 'institutional',
      name: 'Institutional Performance Report',
      description: 'Comprehensive analysis of institutional rankings and trends',
      type: 'PDF / Excel',
      lastGenerated: '2024-12-18',
    },
    {
      id: 'researcher',
      name: 'Individual Researcher Analysis',
      description: 'Detailed metrics for specific researchers with area-normalized scores',
      type: 'PDF / Excel',
      lastGenerated: '2024-12-19',
    },
    {
      id: 'taxonomy',
      name: 'Research Area Taxonomy Report',
      description: 'Hierarchical breakdown of research areas and publication distribution',
      type: 'PDF / Excel',
      lastGenerated: '2024-12-17',
    },
    {
      id: 'trends',
      name: 'Publication & Citation Trends',
      description: 'Time-series analysis of research output and impact over time',
      type: 'PDF / Excel',
      lastGenerated: '2024-12-16',
    },
    {
      id: 'coauthorship',
      name: 'Co-authorship Network Analysis',
      description: 'Collaboration patterns and network visualization',
      type: 'PDF / Excel',
      lastGenerated: '2024-12-15',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-white mb-2">Reports & Export</h1>
        <p className="text-emerald-400/60">
          Generate comprehensive reports with h-Index and RII comparative tables
        </p>
      </div>

      {/* Filter Section */}
      <div className="bg-[#0f2820] border border-[#1a3d33] rounded-xl p-6 mb-6">
        <h3 className="text-white mb-4">Report Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-emerald-400/80 text-sm mb-2">Report Type</label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full px-4 py-3 bg-[#0a1f1a] border border-[#1a3d33] rounded-lg text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="comparative">h-Index vs RII Comparative</option>
              <option value="institutional">Institutional Performance</option>
              <option value="researcher">Individual Researcher</option>
              <option value="taxonomy">Research Area Taxonomy</option>
              <option value="trends">Publication Trends</option>
              <option value="coauthorship">Co-authorship Network</option>
            </select>
          </div>

          <div>
            <label className="block text-emerald-400/80 text-sm mb-2">Time Period</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400/60 w-5 h-5" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0a1f1a] border border-[#1a3d33] rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-emerald-400/80 text-sm mb-2">Country/Region</label>
            <select className="w-full px-4 py-3 bg-[#0a1f1a] border border-[#1a3d33] rounded-lg text-white focus:border-emerald-500 focus:outline-none">
              <option value="all">All Countries</option>
              <option value="algeria">Algeria</option>
              <option value="usa">USA</option>
              <option value="uk">UK</option>
              <option value="egypt">Egypt</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">
            <Download className="w-5 h-5" />
            Export PDF
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors">
            <FileSpreadsheet className="w-5 h-5" />
            Export Excel
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#0f2820] border border-[#1a3d33] text-emerald-400 rounded-lg hover:border-emerald-500 transition-colors">
            <Filter className="w-5 h-5" />
            Advanced Filters
          </button>
        </div>
      </div>

      {/* Available Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <div
            key={report.id}
            className={`bg-[#0f2820] border rounded-xl p-6 transition-all cursor-pointer ${
              selectedReport === report.id
                ? 'border-emerald-500 shadow-lg shadow-emerald-500/20'
                : 'border-[#1a3d33] hover:border-emerald-500/50'
            }`}
            onClick={() => setSelectedReport(report.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">
                {report.type}
              </div>
            </div>

            <h3 className="text-white mb-2">{report.name}</h3>
            <p className="text-emerald-400/60 text-sm mb-4">{report.description}</p>

            <div className="flex items-center justify-between text-sm">
              <span className="text-emerald-400/60">Last generated: {report.lastGenerated}</span>
              <button className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Generate →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sample Report Preview */}
      <div className="mt-6 bg-[#0f2820] border border-[#1a3d33] rounded-xl p-6">
        <h3 className="text-white mb-4">Sample Report Preview: h-Index vs RII Comparison</h3>
        <div className="bg-[#0a1f1a] rounded-lg p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a3d33]">
                <th className="px-4 py-3 text-left text-emerald-400/80">Researcher</th>
                <th className="px-4 py-3 text-left text-emerald-400/80">Institution</th>
                <th className="px-4 py-3 text-center text-emerald-400/80">h-Index</th>
                <th className="px-4 py-3 text-center text-emerald-400/80">RII</th>
                <th className="px-4 py-3 text-center text-emerald-400/80">Δ Impact</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#1a3d33]">
                <td className="px-4 py-3 text-white">Dr. Amina Bouazza</td>
                <td className="px-4 py-3 text-emerald-400/60">University of Algiers</td>
                <td className="px-4 py-3 text-center text-teal-400">28</td>
                <td className="px-4 py-3 text-center text-emerald-400">2.45</td>
                <td className="px-4 py-3 text-center text-emerald-400">+87.5%</td>
              </tr>
              <tr className="border-b border-[#1a3d33]">
                <td className="px-4 py-3 text-white">Dr. Karim El-Hassan</td>
                <td className="px-4 py-3 text-emerald-400/60">MIT</td>
                <td className="px-4 py-3 text-center text-teal-400">42</td>
                <td className="px-4 py-3 text-center text-emerald-400">1.89</td>
                <td className="px-4 py-3 text-center text-emerald-400">-55.0%</td>
              </tr>
              <tr className="border-b border-[#1a3d33]">
                <td className="px-4 py-3 text-white">Dr. Sarah Chen</td>
                <td className="px-4 py-3 text-emerald-400/60">Stanford University</td>
                <td className="px-4 py-3 text-center text-teal-400">38</td>
                <td className="px-4 py-3 text-center text-emerald-400">2.12</td>
                <td className="px-4 py-3 text-center text-emerald-400">+55.8%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-emerald-400/60 text-sm mt-4">
          * Δ Impact shows the percentage difference when RII normalizes for field size and maturity compared to raw h-Index.
        </p>
      </div>
    </div>
  );
}
