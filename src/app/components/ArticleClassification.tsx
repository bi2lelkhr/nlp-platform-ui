import { useState, useRef } from "react";
import {
  Upload,
  FileText,
  ChevronRight,
  Brain,
  Target,
  Loader2,
  X,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Copy,
} from "lucide-react";

const API_BASE = "http://127.0.0.1:5000";

interface ClassificationNode {
  id: string;
  name: string;
  confidence: number;
  children?: ClassificationNode[];
  description?: string;
}

interface ArticleInfo {
  title: string;
  authors: string[];
  year?: number;
  journal?: string;
  doi?: string;
}

export function ArticleClassification() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationResult, setClassificationResult] = useState<{
    path: ClassificationNode[];
    articleInfo?: ArticleInfo;
    confidence: number;
    processingTime: number;
    model: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === "application/pdf") {
      setSelectedFile(files[0]);
      setClassificationResult(null);
      setError(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setClassificationResult(null);
      setError(null);
    }
  };

  const handleClassify = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event from bubbling up to parent
    if (!selectedFile) return;
    
    setIsClassifying(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResult = {
        path: [
          {
            id: "cs",
            name: "Computer Science",
            confidence: 0.95,
            children: [
              {
                id: "ai",
                name: "Artificial Intelligence",
                confidence: 0.92,
                children: [
                  {
                    id: "dl",
                    name: "Deep Learning",
                    confidence: 0.89,
                    children: [
                      {
                        id: "cv",
                        name: "Computer Vision",
                        confidence: 0.86,
                        children: [
                          {
                            id: "object_detection",
                            name: "Object Detection",
                            confidence: 0.83,
                            description: "Algorithms for detecting objects in images and videos"
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        articleInfo: {
          title: "Advanced Object Detection in Real-World Scenes",
          authors: ["Dr. Jane Smith", "Prof. John Doe", "Dr. Alice Johnson"],
          year: 2024,
          journal: "IEEE Transactions on Pattern Analysis and Machine Intelligence",
          doi: "10.1109/TPAMI.2024.1234567"
        },
        confidence: 0.86,
        processingTime: 2.3,
        model: "llama-3.1-8b"
      };

      setClassificationResult(mockResult);
      
    } catch (err) {
      setError("Failed to classify the article. Please try again.");
      console.error("Classification error:", err);
    } finally {
      setIsClassifying(false);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event from bubbling up to parent
    resetAll();
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderClassificationPath = (nodes: ClassificationNode[], depth = 0) => {
    return nodes.map((node) => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = expandedNodes.has(node.id);
      const isLeaf = !hasChildren;
      
      return (
        <div key={node.id} className="mb-2">
          <div
            className={`flex items-center gap-3 p-4 rounded-lg transition-all hover:bg-emerald-500/10 cursor-pointer border ${
              depth === 0 
                ? 'border-emerald-500/30 bg-emerald-500/5' 
                : 'border-transparent hover:border-emerald-500/30'
            }`}
            onClick={() => hasChildren && toggleNode(node.id)}
          >
            {hasChildren && (
              <button className="text-emerald-400 hover:text-emerald-300 transition-colors">
                {isExpanded ? (
                  <ChevronRight className="w-5 h-5 rotate-90" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
            )}
            {isLeaf && (
              <div className="w-5 flex justify-center">
                <Target className="w-4 h-4 text-emerald-400" />
              </div>
            )}
            
            {/* Level indicator */}
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              depth === 0 ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' :
              depth === 1 ? 'bg-gradient-to-br from-teal-500 to-teal-600' :
              depth === 2 ? 'bg-gradient-to-br from-cyan-500 to-cyan-600' :
              depth === 3 ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
              'bg-gradient-to-br from-purple-500 to-purple-600'
            }`}>
              <span className="text-white font-bold text-sm">
                {depth + 1}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="text-white font-medium text-lg">{node.name}</div>
                <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium">
                  {(node.confidence * 100).toFixed(1)}% confidence
                </div>
              </div>
              
              {node.description && (
                <div className="text-emerald-400/60 text-sm mt-1">
                  {node.description}
                </div>
              )}
            </div>

            {/* Level label */}
            <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
              depth === 0 ? 'bg-emerald-500/20 text-emerald-400' :
              depth === 1 ? 'bg-teal-500/20 text-teal-400' :
              depth === 2 ? 'bg-cyan-500/20 text-cyan-400' :
              depth === 3 ? 'bg-blue-500/20 text-blue-400' :
              'bg-purple-500/20 text-purple-400'
            }`}>
              {depth === 0 ? 'DOMAIN' : 
               depth === 1 ? 'FIELD' : 
               depth === 2 ? 'SUB-FIELD' : 
               depth === 3 ? 'SPECIALIZATION' : 
               'TOPIC'}
            </div>
          </div>

          {/* Arrow connector */}
          {hasChildren && isExpanded && depth < 4 && (
            <div className="flex justify-center">
              <div className="w-0.5 h-4 bg-emerald-500/30" />
            </div>
          )}

          {/* Children */}
          {hasChildren && isExpanded && (
            <div className="mt-2 ml-12">
              {renderClassificationPath(node.children!, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const resetAll = () => {
    setSelectedFile(null);
    setClassificationResult(null);
    setError(null);
    setExpandedNodes(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl text-white mb-3 font-bold">PDF Article Classifier</h1>
        <p className="text-emerald-400/60 text-lg">
          Upload a research paper and get its hierarchical classification path
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-[#0f2820] border border-[#1a3d33] rounded-2xl overflow-hidden">
        <div className="p-8">
          {/* Upload Section */}
          {!classificationResult && (
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-6">
                <Brain className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-2xl text-white mb-4">Upload Research Paper</h2>
              <p className="text-emerald-400/60 mb-8 max-w-2xl mx-auto">
                Drag and drop a PDF file or click to browse. Our AI will analyze the content 
                and classify it into the research taxonomy.
              </p>

              {/* Upload Zone */}
              <div
                className={`max-w-2xl mx-auto border-3 border-dashed rounded-2xl p-12 text-center transition-all ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-500/10 scale-[1.02]'
                    : 'border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/5'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => {
                  if (!selectedFile) {
                    fileInputRef.current?.click();
                  }
                }}
              >
                {selectedFile ? (
                  <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                      <FileText className="w-10 h-10 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium text-lg mb-2">
                        {selectedFile.name}
                      </div>
                      <div className="text-emerald-400/60">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-6">
                      <button
                        onClick={handleRemoveFile}
                        className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                      <button
                        onClick={handleClassify}
                        disabled={isClassifying}
                        className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        {isClassifying ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Classifying...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            Classify Now
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                      <Upload className="w-12 h-12 text-emerald-400" />
                    </div>
                    <h3 className="text-white text-xl mb-2">Drop PDF file here</h3>
                    <p className="text-emerald-400/60 mb-6">or click to browse files</p>
                    <div className="text-sm text-emerald-400/40">
                      Supports PDF files up to 10MB
                    </div>
                  </>
                )}
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf"
                  className="hidden"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-6 max-w-2xl mx-auto p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <div className="flex items-center gap-3 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results Section */}
          {classificationResult && (
            <div className="space-y-8">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl text-white">Classification Complete</h2>
                      <div className="text-emerald-400/60">
                        Article successfully classified
                      </div>
                    </div>
                  </div>
                  
                  {classificationResult.articleInfo && (
                    <div className="mt-6 p-6 bg-[#1a3d33] rounded-xl border border-emerald-500/30">
                      <h3 className="text-white text-lg mb-3">{classificationResult.articleInfo.title}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-emerald-400">Authors:</div>
                          <div className="text-white">{classificationResult.articleInfo.authors.join(', ')}</div>
                        </div>
                        {classificationResult.articleInfo.year && (
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-emerald-400">Year:</div>
                            <div className="text-white">{classificationResult.articleInfo.year}</div>
                          </div>
                        )}
                        {classificationResult.articleInfo.journal && (
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-emerald-400">Journal:</div>
                            <div className="text-white">{classificationResult.articleInfo.journal}</div>
                          </div>
                        )}
                        {classificationResult.articleInfo.doi && (
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-emerald-400">DOI:</div>
                            <div className="text-white flex items-center gap-2">
                              {classificationResult.articleInfo.doi}
                              <button 
                                onClick={() => navigator.clipboard.writeText(classificationResult.articleInfo!.doi!)}
                                className="p-1 hover:bg-emerald-500/10 rounded"
                                title="Copy DOI"
                              >
                                <Copy className="w-4 h-4 text-emerald-400" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={resetAll}
                    className="px-6 py-3 bg-[#1a3d33] hover:bg-[#2a4d44] text-emerald-400 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Upload New
                  </button>
                </div>
              </div>

              
              <div className="bg-gradient-to-b from-[#0f2820] to-[#1a3d33] rounded-xl border border-emerald-500/30 p-6">
                <div className="mb-8">
                  <h3 className="text-white text-xl mb-2">Classification Path</h3>
                  <p className="text-emerald-400/60">
                    This article belongs to the following research areas:
                  </p>
                </div>

                <div className="space-y-3">
                  {renderClassificationPath(classificationResult.path)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      
      <div className="mt-8 text-center text-emerald-400/60 text-sm">
        <p>
          Powered by LLM-based classification • Supports all research domains
        </p>
      </div>
    </div>
  );
}