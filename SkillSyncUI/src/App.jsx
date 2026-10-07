import './styles/global.css';
import { useAnalyzer } from './hooks/useAnalyzer';
import { Sidebar }      from './components/Sidebar/Sidebar';
import { Header }       from './components/Header/Header';
import { UploadCard }   from './components/UploadCard/UploadCard';
import { ControlCard }  from './components/ControlCard/ControlCard';
import { ResultsPanel } from './components/ResultsPanel/ResultsPanel';

export default function App() {
  const {
    selectedFile,
    mode,
    jobDescription,
    status,
    result,
    score,
    isLoading,
    handleFileSelect,
    handleModeChange,
    setJobDescription,
    analyze,
    clear,
  } = useAnalyzer();

  return (
    <>
      {/* Grain texture overlay */}
      <div className="grain" aria-hidden="true" />

      <div className="app-layout">
        {/* ── Sidebar ── */}
        <Sidebar score={score} mode={mode} status={status} />

        {/* ── Main workspace ── */}
        <main className="workspace">
          <Header />

          <div className="work-grid">
            <UploadCard
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
            />

            <ControlCard
              mode={mode}
              onModeChange={handleModeChange}
              jobDescription={jobDescription}
              onJdChange={setJobDescription}
              isLoading={isLoading}
              onAnalyze={analyze}
              onClear={clear}
            />

            <ResultsPanel result={result} mode={mode} />
          </div>
        </main>
      </div>
    </>
  );
}
