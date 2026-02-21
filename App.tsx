import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileUploader } from './components/FileUploader';
import { Dashboard } from './components/Dashboard';
import { ApplicantDemographics } from './components/ApplicantDemographics';
import { generateReport } from './services/geminiService';
import { DailyData, LoadingState, ClientInfo, WebSource, ApplicantDemographics as ApplicantDemographicsType, AppConfig } from './types';
import { 
  Loader2, 
  BrainCircuit, 
  Search, 
  Sparkles, 
  Pencil, 
  Check, 
  Printer,
  Copy,
  CheckCircle2,
  MessageSquare,
  Zap,
  Briefcase,
  Settings2,
  FileBarChart2,
  Target,
  ArrowRight,
  Quote,
  Users2,
  Plus,
  Trash2,
  Calendar,
  Lightbulb,
  Download,
  Save,
  Sheet,
  ExternalLink
} from 'lucide-react';

const App: React.FC = () => {
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: '',
    jobTitle: '',
    monthlyGoal: '',
    notes: ''
  });
  const [competitors, setCompetitors] = useState<string>('');
  
  // Daily Operation Logs
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<DailyData[]>([]);
  const [csvContent, setCsvContent] = useState<string>("");

  // Applicant Data
  const [applicantFile, setApplicantFile] = useState<File | null>(null);
  const [applicantCsvContent, setApplicantCsvContent] = useState<string>("");

  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  
  // Report Content States
  const [reportDate, setReportDate] = useState<string>(new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }));
  const [executiveSummary, setExecutiveSummary] = useState<string>("");
  const [performanceText, setPerformanceText] = useState<string>("");
  const [candidateAnalysisText, setCandidateAnalysisText] = useState<string>("");
  const [demographics, setDemographics] = useState<ApplicantDemographicsType | undefined>(undefined);
  const [trendsText, setTrendsText] = useState<string>("");
  const [marketExamples, setMarketExamples] = useState<string[]>([]);
  const [strategyText, setStrategyText] = useState<string>("");
  const [recommendedActions, setRecommendedActions] = useState<string[]>([]);
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [personaImage, setPersonaImage] = useState<string | undefined>(undefined);
  
  const [webSources, setWebSources] = useState<WebSource[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const reportRef = useRef<HTMLDivElement>(null);

  const [appConfig, setAppConfig] = useState<AppConfig>(() => {
    try {
      const saved = localStorage.getItem('rpo_app_config');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [savingToDoc, setSavingToDoc] = useState<boolean>(false);
  const [savedDocUrl, setSavedDocUrl] = useState<string | undefined>(undefined);
  const [fetchingSheets, setFetchingSheets] = useState<boolean>(false);
  const [dataSourceTab, setDataSourceTab] = useState<'csv' | 'sheets'>('csv');
  const [savingToPdf, setSavingToPdf] = useState<boolean>(false);
  const [savedPdfUrl, setSavedPdfUrl] = useState<string | undefined>(undefined);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClientInfo(prev => ({ ...prev, [name]: value }));
  };

  // --- CSV Handling ---
  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    const data: DailyData[] = [];
    const startIndex = lines.length > 2 ? 2 : 1; 
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      if (matches && matches.length >= 13) {
        const clean = (val: string) => val ? val.replace(/["¥,%]/g, '') : '0';
        data.push({
          date: matches[0].replace(/"/g, ''),
          impressions: parseInt(clean(matches[1])) || 0,
          clicks: parseInt(clean(matches[3])) || 0,
          applications: parseInt(clean(matches[7])) || 0,
          cpa: parseInt(clean(matches[11])) || 0,
          cost: parseInt(clean(matches[12])) || 0,
        });
      }
    }
    return data;
  };

  const handleCsvUpload = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvContent(text);
      setParsedData(parseCSV(text));
    };
    reader.readAsText(file);
  };

  const handleApplicantUpload = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setApplicantFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setApplicantCsvContent(text);
    };
    reader.readAsText(file);
  };

  // --- Report Generation ---
  const handleGenerate = async () => {
    if (!clientInfo.name) {
        alert("クライアント名を入力してください。");
        return;
    }
    setLoadingState(LoadingState.ANALYZING);
    setIsEditing(false);
    try {
      const result = await generateReport(csvContent, applicantCsvContent, clientInfo, competitors);
      setExecutiveSummary(result.executiveSummary);
      setPerformanceText(result.performanceContent);
      setCandidateAnalysisText(result.candidateAnalysis);
      setDemographics(result.applicantDemographics);
      setTrendsText(result.trendsContent);
      setMarketExamples(result.marketExamples);
      setStrategyText(result.strategyContent);
      setRecommendedActions(result.recommendedActions);
      setInterviewQuestions(result.interviewQuestions || []);
      setPersonaImage(result.personaImageUrl);
      setWebSources(result.webSources);
      setReportDate(new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }));
      setLoadingState(LoadingState.SUCCESS);
    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
    }
  };

  // --- Utility ---
  const handlePrint = () => {
    window.print();
  };

  const handleCopyToDocs = async () => {
    if (!reportRef.current) return;
    try {
        const content = reportRef.current.innerHTML;
        const htmlBlob = new Blob([`
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; line-height: 1.6; }
                    h1 { font-size: 24pt; color: #1e3a8a; margin-bottom: 12pt; }
                    h2 { font-size: 18pt; color: #1e3a8a; margin-top: 24pt; margin-bottom: 12pt; border-bottom: 1px solid #ccc; padding-bottom: 6pt; }
                    h3 { font-size: 14pt; color: #b45309; margin-bottom: 10pt; }
                    p { font-size: 11pt; margin-bottom: 12pt; }
                    li { font-size: 11pt; margin-bottom: 6pt; }
                </style>
            </head>
            <body>${content}</body>
            </html>
        `], { type: 'text/html' });
        const textBlob = new Blob([reportRef.current.innerText], { type: 'text/plain' });
        const clipboardItem = new ClipboardItem({
            'text/html': htmlBlob,
            'text/plain': textBlob
        });
        await navigator.clipboard.write([clipboardItem]);
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 3000);
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
  };

  const saveAppConfig = (newConfig: AppConfig) => {
    setAppConfig(newConfig);
    localStorage.setItem('rpo_app_config', JSON.stringify(newConfig));
  };

  const handleSaveToGoogleDoc = async () => {
    if (!appConfig.webhookUrl) {
      alert('設定からWebhook URLを入力してください');
      setShowSettings(true);
      return;
    }
    setSavingToDoc(true);
    setSavedDocUrl(undefined);
    try {
      const payload = {
        clientName: clientInfo.name,
        jobTitle: clientInfo.jobTitle,
        reportDate,
        executiveSummary,
        performanceContent: performanceText,
        candidateAnalysis: candidateAnalysisText,
        trendsContent: trendsText,
        marketExamples,
        strategyContent: strategyText,
        recommendedActions,
        interviewQuestions,
      };
      const res = await fetch(appConfig.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.documentUrl) {
        setSavedDocUrl(data.documentUrl);
      } else {
        alert('保存に失敗しました: ' + JSON.stringify(data));
      }
    } catch (e: any) {
      alert('保存エラー: ' + e.message);
    } finally {
      setSavingToDoc(false);
    }
  };

  const handleSaveToPdf = async () => {
    if (!appConfig.webhookUrl) {
      alert('設定からWebhook URLを入力してください');
      setShowSettings(true);
      return;
    }
    if (!reportRef.current) {
      alert('レポートが表示されていません');
      return;
    }
    setSavingToPdf(true);
    setSavedPdfUrl(undefined);
    try {
      const reportHtml = reportRef.current.innerHTML;
      const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif; color: #1e293b; line-height: 1.8; padding: 40px; max-width: 900px; margin: 0 auto; }
  h1 { font-size: 24px; color: #1e3a5f; border-bottom: 3px solid #1e3a5f; padding-bottom: 8px; margin-top: 32px; }
  h2 { font-size: 20px; color: #1e3a5f; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 28px; }
  h3 { font-size: 16px; color: #334155; margin-top: 20px; }
  p { margin: 8px 0; }
  ul, ol { margin: 8px 0; padding-left: 24px; }
  li { margin: 4px 0; }
  table { border-collapse: collapse; width: 100%; margin: 16px 0; }
  th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-size: 14px; }
  th { background-color: #f1f5f9; font-weight: bold; }
  .executive-summary { background: #f0f9ff; border-left: 4px solid #1e3a5f; padding: 16px 20px; margin: 16px 0; border-radius: 0 8px 8px 0; }
  strong { color: #1e3a5f; }
</style>
</head>
<body>${reportHtml}</body>
</html>`;
      const baseUrl = appConfig.webhookUrl?.replace(/\/[^/]*$/, '') || '';
      const pdfWebhookUrl = baseUrl + '/rpo-save-pdf';
      const payload = {
        reportTitle: 'RPO月次レポート_' + clientInfo.name + '_' + reportDate,
        clientName: clientInfo.name,
        reportPeriod: reportDate,
        htmlContent,
        folderId: '1RDjr32QVSbhW-g8VZ6t1zPruXgIPxN0X',
      };
      const res = await fetch(pdfWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.fileUrl) {
        setSavedPdfUrl(data.fileUrl);
      } else {
        alert('PDF保存に失敗しました: ' + JSON.stringify(data));
      }
    } catch (e: any) {
      alert('PDF保存エラー: ' + e.message);
    } finally {
      setSavingToPdf(false);
    }
  };

  const handleFetchFromSheets = async () => {
    if (!appConfig.spreadsheetUrl) {
      alert('設定からスプレッドシートURLを入力してください');
      setShowSettings(true);
      return;
    }
    const baseUrl = appConfig.webhookUrl?.replace(/\/[^/]*$/, '') || '';
    const sheetsWebhookUrl = baseUrl + '/rpo-fetch-sheets';
    setFetchingSheets(true);
    try {
      const url = `${sheetsWebhookUrl}?spreadsheetUrl=${encodeURIComponent(appConfig.spreadsheetUrl)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.csv) {
        setCsvContent(data.csv);
        const lines = data.csv.split('\n').filter((l: string) => l.trim());
        if (lines.length > 1) {
          const headers = lines[0].split(',').map((h: string) => h.replace(/"/g, '').trim());
          const rows: DailyData[] = [];
          for (let i = 1; i < lines.length; i++) {
            const vals = lines[i].split(',').map((v: string) => v.replace(/"/g, '').trim());
            const row: any = {};
            headers.forEach((h: string, idx: number) => {
              row[h.toLowerCase()] = isNaN(Number(vals[idx])) ? vals[idx] : Number(vals[idx]);
            });
            rows.push(row as DailyData);
          }
          setParsedData(rows);
        }
        alert(`${data.rowCount}行のデータを取得しました`);
      } else {
        alert('データ取得に失敗しました');
      }
    } catch (e: any) {
      alert('取得エラー: ' + e.message);
    } finally {
      setFetchingSheets(false);
    }
  };

  const isIdle = loadingState === LoadingState.IDLE;
  
  const cleanMarkdown = (text: string) => {
    if (!text) return "";
    return text.replace(/\\n/g, '\n'); 
  };

  const markdownComponents = {
    h1: ({node, ...props}: any) => <h1 className="text-xl font-bold text-blue-900 mt-6 mb-3 border-b-2 border-slate-200 pb-1" {...props} />,
    h2: ({node, ...props}: any) => <h2 className="text-lg font-bold text-blue-900 mt-6 mb-2 border-b border-slate-200 pb-1" {...props} />,
    h3: ({node, ...props}: any) => <h3 className="text-sm font-bold text-blue-900 mt-5 mb-2 border-l-2 border-amber-500 pl-3" {...props} />,
    strong: ({node, ...props}: any) => <strong className="font-bold text-slate-900 bg-amber-50 px-1" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc pl-5 space-y-1 mb-4" {...props} />,
    li: ({node, ...props}: any) => <li className="text-sm leading-relaxed" {...props} />,
  };

  // --- List Editing Helpers ---
  const updateAction = (index: number, val: string) => {
    const newActions = [...recommendedActions];
    newActions[index] = val;
    setRecommendedActions(newActions);
  };
  const addAction = () => setRecommendedActions([...recommendedActions, "新しい施策を入力..."]);
  const removeAction = (index: number) => setRecommendedActions(recommendedActions.filter((_, i) => i !== index));

  const updateExample = (index: number, val: string) => {
    const newExamples = [...marketExamples];
    newExamples[index] = val;
    setMarketExamples(newExamples);
  };
  const addExample = () => setMarketExamples([...marketExamples, "新しい事例を入力..."]);
  const removeExample = (index: number) => setMarketExamples(marketExamples.filter((_, i) => i !== index));

  return (
    <div className="flex h-screen bg-[#F1F5F9] overflow-hidden font-sans text-slate-800 relative">
      
      {/* LEFT PANEL: The Output Stage (Preview) */}
      {!isIdle && (
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative bg-[#F1F5F9] border-r border-slate-200 shadow-inner animate-in fade-in duration-500">
            {/* Top Navbar for Report Actions */}
            <div className="h-16 flex items-center justify-between px-8 bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-10 print:hidden">
                <div className="flex items-center space-x-2">
                    <FileBarChart2 className="text-blue-900" size={20} />
                    <span className="font-bold text-slate-700 text-sm tracking-wide">レポートプレビュー</span>
                </div>
                {loadingState === LoadingState.SUCCESS && (
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${isEditing ? 'bg-blue-100 text-blue-800' : 'text-slate-500 hover:text-blue-900 hover:bg-slate-100'}`}
                        >
                            {isEditing ? <Check size={14}/> : <Pencil size={14}/>}
                            <span>{isEditing ? '編集完了' : '編集モード'}</span>
                        </button>
                        <button
                            onClick={handleCopyToDocs}
                            className="flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors"
                        >
                            {copyStatus === 'copied' ? <CheckCircle2 size={14}/> : <Copy size={14}/>}
                            <span>コピー</span>
                        </button>
                        <button onClick={handleSaveToGoogleDoc} disabled={savingToDoc}
                            className="flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {savingToDoc ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>}
                            <span>{savingToDoc ? '保存中...' : 'Google Doc保存'}</span>
                        </button>
                        {savedDocUrl && (
                            <a href={savedDocUrl} target="_blank" rel="noopener noreferrer"
                                className="flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors">
                                <ExternalLink size={14}/>
                                <span>Doc表示</span>
                            </a>
                        )}
                        <button onClick={handleSaveToPdf} disabled={savingToPdf}
                            className="flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium text-rose-700 hover:bg-rose-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {savingToPdf ? <Loader2 size={14} className="animate-spin"/> : <Download size={14}/>}
                            <span>{savingToPdf ? 'PDF保存中...' : 'PDF保存'}</span>
                        </button>
                        {savedPdfUrl && (
                            <a href={savedPdfUrl} target="_blank" rel="noopener noreferrer"
                                className="flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors">
                                <ExternalLink size={14}/>
                                <span>PDF表示</span>
                            </a>
                        )}
                        <button
                            onClick={handlePrint}
                            className="flex items-center space-x-2 px-4 py-1.5 rounded bg-blue-900 text-white text-xs font-bold hover:bg-blue-800 transition-colors shadow-sm"
                        >
                            <Printer size={14}/>
                            <span>PDF出力</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Report Content Container */}
            <div className="flex-1 p-8 lg:p-16 flex justify-center">
                {loadingState === LoadingState.ANALYZING && !performanceText ? (
                    <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mt-[-80px]">
                    <div className="w-24 h-32 bg-white rounded shadow-lg border border-slate-100 flex flex-col items-center justify-center mb-8 relative rotate-[-2deg]">
                        <div className="w-16 h-1 bg-slate-100 mb-2"></div>
                        <div className="w-12 h-1 bg-slate-100 mb-2"></div>
                        <div className="w-16 h-1 bg-slate-100"></div>
                        <div className="absolute inset-0 bg-white/95 flex items-center justify-center">
                            <Loader2 className="animate-spin text-blue-900" size={32} />
                        </div>
                    </div>
                    <h3 className="text-lg font-serif font-bold text-slate-800 mb-2 tracking-tight">
                        戦略レポートを構築中...
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        市場データの検索、競合比較、ペルソナ分析を実行しています。<br/>右側のパネルから設定を変更できます。
                    </p>
                    </div>
                ) : (
                    /* THE PHYSICAL PAPER REPORT */
                    <div 
                        ref={reportRef}
                        id="report-content"
                        className="w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-2xl p-[20mm] print:shadow-none print:w-full print:p-0 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700"
                    >
                        {/* Header Strip */}
                        <div className="flex items-start justify-between border-b-2 border-blue-900 pb-6 mb-12">
                            <div className="flex-1">
                                <div className="mb-4">
                                     <img src="/logo.svg" alt="Logo" className="h-12 w-auto object-contain" />
                                </div>
                                <h1 className="text-3xl font-serif font-medium text-slate-900 mb-2">定例レポート</h1>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                {isEditing ? (
                                    <>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <input 
                                                value={clientInfo.name} 
                                                onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                                                className="text-right text-sm font-bold text-blue-900 border-b border-blue-200 focus:outline-none focus:border-blue-500 bg-transparent w-[200px]"
                                                placeholder="企業名"
                                            />
                                            <span className="text-sm font-bold text-blue-900">御中</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Calendar size={12} className="text-slate-400"/>
                                            <input 
                                                value={reportDate} 
                                                onChange={(e) => setReportDate(e.target.value)}
                                                className="text-right text-[10px] text-slate-400 border-b border-slate-200 focus:outline-none focus:border-blue-500 bg-transparent w-[120px]"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm font-bold text-blue-900">{clientInfo.name || "CLIENT NAME"} 御中</p>
                                        <p className="text-[10px] text-slate-400 mt-1">{reportDate}</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Executive Summary Section */}
                        {executiveSummary && (
                           <div className="mb-12 print:break-inside-avoid bg-slate-50 p-6 border-l-4 border-blue-900 group relative">
                                <div className="flex items-center space-x-2 mb-3">
                                    <Quote size={20} className="text-blue-900 fill-blue-900/20" />
                                    <h2 className="text-sm font-bold text-blue-900 uppercase tracking-widest">サマリー</h2>
                                </div>
                                <div className="prose prose-sm prose-slate max-w-none text-justify font-serif text-slate-700 leading-relaxed">
                                    {isEditing ? (
                                        <textarea 
                                        value={executiveSummary}
                                        onChange={(e) => setExecutiveSummary(e.target.value)}
                                        className="w-full h-[120px] p-2 bg-white border border-slate-200 rounded resize-none focus:outline-none focus:ring-1 focus:ring-blue-200"
                                        />
                                    ) : (
                                        <ReactMarkdown>{cleanMarkdown(executiveSummary)}</ReactMarkdown>
                                    )}
                                </div>
                           </div>
                        )}

                        {/* 1. Performance Section */}
                        <div className="mb-16 print:break-inside-avoid">
                            <div className="flex items-center space-x-3 mb-8">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-900 text-white text-[10px] font-bold">01</span>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-widest">運用実績分析</h2>
                                    {parsedData.length > 0 && (
                                        <p className="text-[10px] text-slate-500 font-medium mt-1">
                                            期間: {parsedData[0].date} 〜 {parsedData[parsedData.length - 1].date}
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            {parsedData.length > 0 && (
                                <div className="mb-10 print:break-inside-avoid">
                                    <Dashboard data={parsedData} />
                                </div>
                            )}

                            <div className="prose prose-sm prose-slate max-w-none text-justify">
                                {isEditing ? (
                                    <textarea 
                                    value={performanceText}
                                    onChange={(e) => setPerformanceText(e.target.value)}
                                    className="w-full h-[300px] p-4 bg-white border border-slate-200 rounded font-sans text-sm leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-blue-200"
                                    />
                                ) : (
                                    <ReactMarkdown components={markdownComponents}>
                                        {cleanMarkdown(performanceText)}
                                    </ReactMarkdown>
                                )}
                            </div>
                        </div>

                         {/* 2. Candidate Analysis */}
                        {(candidateAnalysisText || demographics) && (
                            <div className="mb-16 print:break-inside-avoid">
                                <div className="flex items-center space-x-3 mb-8 border-t border-slate-100 pt-8">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-900 text-white text-[10px] font-bold">02</span>
                                    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-widest">応募者属性・定性分析</h2>
                                </div>

                                {/* Demographics Charts */}
                                {demographics && (
                                    <ApplicantDemographics data={demographics} />
                                )}

                                <div className="prose prose-sm prose-slate max-w-none text-justify bg-slate-50/50 p-6 border-l-2 border-amber-500 rounded-r">
                                    <div className="flex items-center mb-4 text-amber-600">
                                        <Users2 size={18} className="mr-2" />
                                        <span className="text-xs font-bold uppercase tracking-widest">応募者分析インサイト</span>
                                    </div>
                                    {isEditing ? (
                                        <textarea 
                                        value={candidateAnalysisText}
                                        onChange={(e) => setCandidateAnalysisText(e.target.value)}
                                        className="w-full h-[300px] p-4 bg-white border border-slate-200 rounded font-sans text-sm leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-amber-200"
                                        />
                                    ) : (
                                        <ReactMarkdown components={markdownComponents}>
                                            {cleanMarkdown(candidateAnalysisText)}
                                        </ReactMarkdown>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 3. Market & Competitors */}
                        <div className="mb-16 print:break-inside-avoid">
                            <div className="flex items-center space-x-3 mb-8 border-t border-slate-100 pt-8">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-900 text-white text-[10px] font-bold">03</span>
                                <h2 className="text-lg font-bold text-slate-800 uppercase tracking-widest">市場トレンド・競合分析</h2>
                            </div>
                            <div className="prose prose-sm prose-slate max-w-none text-justify">
                                {isEditing ? (
                                    <textarea 
                                    value={trendsText}
                                    onChange={(e) => setTrendsText(e.target.value)}
                                    className="w-full h-[400px] p-4 bg-white border border-slate-200 rounded font-sans text-sm leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-blue-200"
                                    />
                                ) : (
                                    <ReactMarkdown components={markdownComponents}>
                                        {cleanMarkdown(trendsText)}
                                    </ReactMarkdown>
                                )}
                            </div>

                            {/* Market Examples - Editable List */}
                            {marketExamples.length > 0 && (
                                <div className="mt-10 bg-white border-l-4 border-emerald-600 p-6 shadow-sm print:shadow-none">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center">
                                            <Lightbulb size={16} className="mr-2"/>
                                            他社採用事例・求人トレンド
                                        </h3>
                                        {isEditing && (
                                            <button onClick={addExample} className="flex items-center text-xs text-blue-600 font-bold hover:bg-blue-50 px-2 py-1 rounded">
                                                <Plus size={14} className="mr-1"/> 追加
                                            </button>
                                        )}
                                    </div>
                                    <ul className="space-y-4">
                                        {marketExamples.map((ex, i) => (
                                            <li key={i} className="flex items-start group/item">
                                                <span className="text-emerald-500 mr-3 mt-1 font-bold">●</span>
                                                {isEditing ? (
                                                    <div className="flex-1 flex items-start gap-2">
                                                        <textarea 
                                                            value={ex} 
                                                            onChange={(e) => updateExample(i, e.target.value)}
                                                            className="flex-1 bg-slate-50 border border-slate-200 p-2 text-sm text-slate-700 rounded focus:outline-none focus:border-blue-400 resize-none h-16"
                                                        />
                                                        <button onClick={() => removeExample(i)} className="text-slate-400 hover:text-red-500 pt-2">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm font-medium text-slate-700 leading-relaxed">{ex}</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* 4. Strategy & Persona */}
                        <div className="mb-12 print:break-inside-avoid">
                            <div className="flex items-center space-x-3 mb-8 border-t border-slate-100 pt-8">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-900 text-white text-[10px] font-bold">04</span>
                                <h2 className="text-lg font-bold text-slate-800 uppercase tracking-widest">戦略ロードマップ (KPT)</h2>
                            </div>

                            {/* Persona Card - Clean Executive Style */}
                            {personaImage && (
                            <div className="mb-10 flex flex-col md:flex-row gap-8 items-start bg-slate-50 p-6 print:bg-white print:border-none print:p-0 rounded-lg">
                                <div className="w-full md:w-[200px] shrink-0">
                                    <img src={personaImage} alt="Persona" className="w-full h-auto shadow-sm grayscale-[20%] rounded-sm" />
                                </div>
                                <div className="flex-1 w-full">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Target size={14} className="text-amber-600"/>
                                        <span className="text-xs font-bold text-blue-900 uppercase tracking-widest">ターゲットペルソナ定義</span>
                                    </div>
                                    <div className="mb-3 border-b border-slate-200 pb-2">
                                        {isEditing ? (
                                            <input 
                                                value={clientInfo.jobTitle}
                                                onChange={(e) => setClientInfo({...clientInfo, jobTitle: e.target.value})}
                                                className="w-full text-base font-serif font-bold text-slate-900 border-b border-blue-200 focus:outline-none focus:border-blue-500 bg-transparent"
                                                placeholder="職種名・ペルソナ名"
                                            />
                                        ) : (
                                            <h3 className="text-base font-serif font-bold text-slate-900">
                                                {clientInfo.jobTitle} - ハイパフォーマー像
                                            </h3>
                                        )}
                                    </div>
                                    <p className="text-xs leading-loose text-slate-600 font-medium">
                                    市場データと貴社の組織文化に基づき、最も獲得効率が高く、かつ定着率が見込めるターゲット層を可視化しました。本レポートの施策は、このペルソナの行動特性（転職動機、使用メディア、重視する価値観）に最適化されています。
                                    </p>
                                </div>
                            </div>
                            )}

                            <div className="prose prose-sm prose-slate max-w-none text-justify mb-10">
                                {isEditing ? (
                                    <textarea 
                                    value={strategyText}
                                    onChange={(e) => setStrategyText(e.target.value)}
                                    className="w-full h-[300px] p-4 bg-white border border-slate-200 rounded font-sans text-sm leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-blue-200"
                                    />
                                ) : (
                                    <ReactMarkdown components={markdownComponents}>
                                        {cleanMarkdown(strategyText)}
                                    </ReactMarkdown>
                                )}
                            </div>

                            {/* Action Plan - Editable List */}
                            {recommendedActions.length > 0 && (
                                <div className="bg-white border-2 border-slate-100 p-8 mb-10 shadow-sm print:border-slate-300 rounded-lg group relative transition-all hover:border-slate-200">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-blue-900 text-white flex items-center justify-center rounded-sm mr-3">
                                                <Zap size={16} fill="white"/>
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">推奨アクションプラン</h3>
                                        </div>
                                        {isEditing && (
                                            <button onClick={addAction} className="flex items-center text-xs text-blue-600 font-bold hover:bg-blue-50 px-2 py-1 rounded">
                                                <Plus size={14} className="mr-1"/> 追加
                                            </button>
                                        )}
                                    </div>
                                    <ul className="space-y-4">
                                        {recommendedActions.map((action, i) => (
                                            <li key={i} className="flex items-start group/item">
                                                <span className="text-amber-600 mr-3 mt-1 font-bold">✓</span>
                                                {isEditing ? (
                                                    <div className="flex-1 flex items-start gap-2">
                                                        <textarea 
                                                            value={action} 
                                                            onChange={(e) => updateAction(i, e.target.value)}
                                                            className="flex-1 bg-slate-50 border border-slate-200 p-2 text-sm text-slate-700 rounded focus:outline-none focus:border-blue-400 resize-none h-16"
                                                        />
                                                        <button onClick={() => removeAction(i)} className="text-slate-400 hover:text-red-500 pt-2">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm font-bold text-slate-700 leading-relaxed">{action}</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {webSources.length > 0 && (
                            <div className="pt-8 border-t border-slate-100 text-[10px] text-slate-400">
                                <p className="font-bold mb-2 uppercase tracking-widest text-slate-300">データソース</p>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                                    {webSources.map((source, i) => (
                                        <div key={i} className="truncate hover:text-blue-900 transition-colors cursor-pointer">
                                            [{i+1}] {source.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      )}

      {/* RIGHT PANEL: The "Control Deck" (Input) */}
      {/* Adapts to become Centered Modal in IDLE state, Sidebar in NOT IDLE state */}
      <div 
        className={`
            transition-all duration-700 ease-in-out z-20 print:hidden
            ${isIdle 
                ? "fixed inset-0 flex items-center justify-center p-4 bg-slate-100" 
                : "w-full lg:w-[380px] xl:w-[420px] flex flex-col bg-white border-l border-slate-200 shadow-xl"
            }
        `}
      >
           {/* Inner Card / Sidebar Container */}
           <div className={`
               bg-white overflow-hidden transition-all duration-700 flex
               ${isIdle 
                  ? "w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl ring-1 ring-slate-900/5 flex-row" 
                  : "flex-col h-full w-full"
               }
           `}>
           
                {/* LEFT BRANDING SIDEBAR (Visible only in IDLE) */}
                {isIdle && (
                    <div className="w-[40%] bg-white border-r border-slate-200 p-12 flex flex-col justify-between relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
                            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,#cbd5e1_1px,transparent_1px)] bg-[length:24px_24px]"></div>
                        </div>
                        
                        <div className="relative z-10">
                            {/* Logo */}
                            <div className="mb-10">
                                 <img src="/logo.svg" alt="Logo" className="h-20 w-auto object-contain" />
                            </div>
                            <h1 className="text-4xl font-serif font-medium leading-tight mb-6 tracking-tight text-slate-900">
                                株式会社202<br/>月次戦略レポート
                            </h1>
                        </div>

                        <div className="relative z-10">
                             <div className="flex items-center space-x-3 text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400">
                                <div className="h-px w-8 bg-slate-300"></div>
                                <span>RPO インテリジェンス</span>
                             </div>
                        </div>
                    </div>
                )}

                 {/* RIGHT FORM AREA */}
                 <div className={`flex flex-col bg-white relative ${isIdle ? "w-[60%]" : "w-full h-full"}`}>
                    
                    {/* Header Area */}
                    <div className={`
                        flex items-center px-6 border-b border-slate-100 bg-white shrink-0
                        ${isIdle ? "h-24" : "h-16"}
                    `}>
                        {!isIdle && (
                            <div className="flex items-center justify-center rounded shadow-sm mr-4 w-8 h-8 bg-blue-900 text-white">
                                <Settings2 size={18} />
                            </div>
                        )}
                        <div>
                            <h1 className={`font-bold text-slate-800 uppercase tracking-widest ${isIdle ? "text-lg" : "text-xs"}`}>
                                {isIdle ? "新規レポート作成" : "設定"}
                            </h1>
                            <p className="text-[10px] text-slate-400">戦略パラメータ</p>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 pb-32">
                        
                        {/* 1. Project Scoping */}
                        <section className="space-y-4">
                            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center mb-4">
                                基本情報
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">企業名</label>
                                    <input 
                                    type="text" 
                                    name="name"
                                    value={clientInfo.name}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-100 rounded px-3 py-2.5 text-sm text-slate-800 transition-all outline-none placeholder:text-slate-400"
                                    placeholder="例：株式会社サンプル"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">募集職種</label>
                                        <input 
                                        type="text" 
                                        name="jobTitle"
                                        value={clientInfo.jobTitle}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-100 rounded px-3 py-2.5 text-sm text-slate-800 transition-all outline-none placeholder:text-slate-400"
                                        placeholder="例：法人営業"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">目標 / 予算</label>
                                        <input 
                                        type="text" 
                                        name="monthlyGoal"
                                        value={clientInfo.monthlyGoal}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-100 rounded px-3 py-2.5 text-sm text-slate-800 transition-all outline-none placeholder:text-slate-400"
                                        placeholder="例：50万円"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">戦略コンテキスト</label>
                                    <textarea 
                                        name="notes"
                                        value={clientInfo.notes}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-100 rounded px-3 py-2.5 text-sm text-slate-800 transition-all outline-none placeholder:text-slate-400 resize-none"
                                        placeholder="今月の注力ポイント、組織課題など..."
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="w-full h-px bg-slate-100"></div>

                        {/* 2. Data Intelligence */}
                        <section className="space-y-4">
                        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center mb-4">
                            分析データ
                        </h2>
                        <div className="flex rounded border border-slate-200 overflow-hidden mb-4">
                            <button onClick={() => setDataSourceTab('csv')}
                                className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-bold transition-colors ${dataSourceTab === 'csv' ? 'bg-blue-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                                <Download size={12}/><span>CSVアップロード</span>
                            </button>
                            <button onClick={() => setDataSourceTab('sheets')}
                                className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-xs font-bold transition-colors ${dataSourceTab === 'sheets' ? 'bg-blue-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                                <Sheet size={12}/><span>スプシから取得</span>
                            </button>
                        </div>
                        <div className="space-y-5">
                            {dataSourceTab === 'csv' && (<>
                            <FileUploader
                                label="運用ログ (CSV)"
                                accept=".csv,.txt"
                                selectedFiles={csvFile ? [csvFile] : []}
                                onFilesSelected={handleCsvUpload}
                                onRemoveFile={() => { setCsvFile(null); setCsvContent(""); setParsedData([]); }}
                                description="AirWork, Indeed等の日次レポート"
                            />

                            <FileUploader
                                label="応募者データ (CSV)"
                                accept=".csv,.txt"
                                selectedFiles={applicantFile ? [applicantFile] : []}
                                onFilesSelected={handleApplicantUpload}
                                onRemoveFile={() => { setApplicantFile(null); setApplicantCsvContent(""); }}
                                description="応募者一覧・属性データ"
                            />
                            </>)}

                            {dataSourceTab === 'sheets' && (
                                <div className="p-4 bg-green-50 rounded border border-green-200 space-y-3">
                                    <label className="block text-xs font-bold text-green-800 mb-1">Google スプレッドシートURL</label>
                                    <input type="url" value={appConfig.spreadsheetUrl || ''}
                                        onChange={(e) => saveAppConfig({...appConfig, spreadsheetUrl: e.target.value})}
                                        placeholder="https://docs.google.com/spreadsheets/d/..."
                                        className="w-full bg-white border border-green-300 focus:border-green-600 focus:ring-1 focus:ring-green-100 rounded px-3 py-2 text-sm text-slate-800 transition-all outline-none placeholder:text-slate-400" />
                                    <button onClick={handleFetchFromSheets}
                                        disabled={fetchingSheets || !appConfig.spreadsheetUrl}
                                        className="w-full flex items-center justify-center space-x-2 py-2.5 rounded text-xs font-bold bg-green-600 text-white hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors">
                                        {fetchingSheets ? <Loader2 size={14} className="animate-spin"/> : <Sheet size={14}/>}
                                        <span>{fetchingSheets ? '取得中...' : 'データを取得'}</span>
                                    </button>
                                    {csvContent && dataSourceTab === 'sheets' && (
                                        <p className="text-xs text-green-700 font-medium">✓ 取得済み ({parsedData.length}行)</p>
                                    )}
                                </div>
                            )}

                            <div className="p-4 bg-slate-50 rounded border border-slate-100">
                                <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                                <span>競合ベンチマーク</span>
                                <span className="text-[9px] text-blue-600 font-bold flex items-center bg-blue-50 px-2 py-0.5 rounded border border-blue-100"><Sparkles size={8} className="mr-1"/>AI AUTO</span>
                                </label>
                                <div className="relative group">
                                    <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={14} strokeWidth={2} />
                                    <input 
                                        type="text" 
                                        value={competitors}
                                        onChange={(e) => setCompetitors(e.target.value)}
                                        placeholder="特に意識する競合企業があれば入力"
                                        className="w-full pl-9 bg-white border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-100 rounded px-3 py-2 text-sm text-slate-800 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                        </section>

                        <div className="w-full h-px bg-slate-100"></div>
                        <section className="space-y-4">
                            <button onClick={() => setShowSettings(!showSettings)}
                                className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center w-full hover:text-slate-600 transition-colors">
                                <Settings2 size={12} className="mr-2"/>
                                Integration Settings
                                <span className="ml-auto text-[10px]">{showSettings ? '▲' : '▼'}</span>
                            </button>
                            {showSettings && (
                                <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">n8n Webhook URL</label>
                                        <input type="url" value={appConfig.webhookUrl || ''}
                                            onChange={(e) => saveAppConfig({...appConfig, webhookUrl: e.target.value})}
                                            placeholder="https://your-n8n.com/webhook/rpo-save-doc"
                                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-100 rounded px-3 py-2.5 text-sm text-slate-800 transition-all outline-none placeholder:text-slate-400" />
                                        <p className="text-[10px] text-slate-400 mt-1">Googleドキュメント保存・スプシ取得用</p>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Footer Action */}
                    <div className="p-6 bg-white border-t border-slate-100 sticky bottom-0">
                        <button
                            onClick={handleGenerate}
                            disabled={loadingState === LoadingState.ANALYZING}
                            className={`
                                w-full flex items-center justify-center space-x-2 py-4 text-xs font-bold tracking-[0.15em] uppercase transition-all duration-300 rounded shadow-lg shadow-blue-900/20
                                ${(loadingState === LoadingState.ANALYZING) 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none' 
                                : 'bg-blue-900 text-white hover:bg-blue-800 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm'}
                            `}
                            >
                            {loadingState === LoadingState.ANALYZING ? (
                                <>
                                <Loader2 className="animate-spin" size={16} />
                                <span>分析中...</span>
                                </>
                            ) : (
                                <>
                                <BrainCircuit size={16} strokeWidth={2} />
                                <span>レポートを生成</span>
                                {isIdle && <ArrowRight size={16} className="ml-1" />}
                                </>
                            )}
                        </button>
                    </div>
                 </div>
           </div>
      </div>
    </div>
  );
};

export default App;