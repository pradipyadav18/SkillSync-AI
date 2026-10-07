import { useState, useCallback } from 'react';
import { API_BASE, extractJson, extractScore } from '../utils/resumeUtils';

/**
 * useAnalyzer
 *
 * Owns all shared application state and the analyze / clear actions.
 * Components receive only the slices they need via props.
 */
export function useAnalyzer() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [mode, setMode] = useState('resume');          // 'resume' | 'ats'
  const [jobDescription, setJobDescription] = useState('');
  const [status, setStatus] = useState({ text: 'Ready', isError: false });
  const [result, setResult] = useState(null);          // { parsed, raw } | null
  const [score, setScore] = useState(null);            // number | string | null
  const [isLoading, setIsLoading] = useState(false);

  // ── file selection ──────────────────────────────────
  const handleFileSelect = useCallback((file) => {
    if (!file) return;
    setSelectedFile(file);
  }, []);

  // ── mode switch ─────────────────────────────────────
  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
  }, []);

  // ── analyze ─────────────────────────────────────────
  const analyze = useCallback(async () => {
    if (!selectedFile) {
      setStatus({ text: 'Choose a resume first', isError: true });
      return;
    }
    if (mode === 'ats' && !jobDescription.trim()) {
      setStatus({ text: 'Paste a job description', isError: true });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    let endpoint = `${API_BASE}/analyze`;
    if (mode === 'ats') {
      endpoint = `${API_BASE}/ats-check`;
      formData.append('jd', jobDescription.trim());
    }

    setIsLoading(true);
    setStatus({ text: 'Analyzing…', isError: false });
    setResult({ loading: true });
    setScore(null);

    try {
      const response = await fetch(endpoint, { method: 'POST', body: formData });
      if (!response.ok) throw new Error(`Request failed — status ${response.status}`);

      const data = await response.json();
      const raw = mode === 'ats' ? data.atsReport : data.analysis;
      const text = raw ?? data;
      const normalized =
        text == null ? '' : typeof text === 'string' ? text : JSON.stringify(text, null, 2);

      const parsed = extractJson(normalized);
      const scoreValue = parsed ? extractScore(parsed) : null;

      setResult({ parsed, raw: normalized, loading: false });
      setScore(scoreValue);
      setStatus({ text: 'Complete', isError: false });
    } catch (error) {
      const errorMsg = `Could not reach the SkillSync API. Start the Spring Boot app on port 8080 and try again.\n\n${error.message}`;
      setResult({ parsed: null, raw: errorMsg, loading: false });
      setScore(null);
      setStatus({ text: 'API error', isError: true });
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, mode, jobDescription]);

  // ── clear ────────────────────────────────────────────
  const clear = useCallback(() => {
    setSelectedFile(null);
    setJobDescription('');
    setResult(null);
    setScore(null);
    setStatus({ text: 'Ready', isError: false });
  }, []);

  return {
    // state
    selectedFile,
    mode,
    jobDescription,
    status,
    result,
    score,
    isLoading,
    // actions
    handleFileSelect,
    handleModeChange,
    setJobDescription,
    analyze,
    clear,
  };
}
