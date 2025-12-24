import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { ResearcherAnalysis } from "./components/ResearcherAnalysis";
import { InstitutionComparison } from "./components/InstitutionComparison";
import { AreaTaxonomy } from "./components/AreaTaxonomy";
import { Reports } from "./components/Reports";
import { CountryComparison } from "./components/CountryComparison";
import { FieldComparison } from "./components/FieldComparison";
import {ArticleClassification} from './components/ArticleClassification'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#0a1f1a]">
        <Sidebar />
        <main className="flex-1 ml-64">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/researcher-analysis"
              element={<ResearcherAnalysis />}
            />
            <Route
              path="/institution-comparison"
              element={<InstitutionComparison />}
            />
            <Route path="/area-taxonomy" element={<AreaTaxonomy />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/country-comparison" element={<CountryComparison />} />
            <Route path="/field-comparison" element={<FieldComparison />} />
            <Route path="/classification" element={<ArticleClassification />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
