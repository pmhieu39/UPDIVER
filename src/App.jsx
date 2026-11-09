/**
 * ==============================================================================
 * © 2026 MH DRIVER (MH DIVER). TẤT CẢ CÁC QUYỀN ĐƯỢC BẢO LƯU.
 * ALL RIGHTS RESERVED. PHÁT TRIỂN BỞI MH DRIVER / MH DIVER.
 * Nghiêm cấm mọi hành vi sao chép mã nguồn và giao diện.
 * Watermark Tag: MH_DIVER_PROTECTED_APP
 * ==============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Star,
  ArrowRight,
  Loader2,
  CheckCircle2,
  XCircle,
  Download,
  Folder,
  FileText,
  Copy,
  Check,
  RotateCcw,
  ClipboardPaste,
  ExternalLink
} from 'lucide-react';
import WallpaperBackground from './components/WallpaperBackground';
import Navbar from './components/Navbar';
import HistoryModal from './components/HistoryModal';
import GuideModal from './components/GuideModal';

export default function App() {
  const [driveUrl, setDriveUrl] = useState('');
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedFileIds, setSelectedFileIds] = useState(new Set());
  const [showFileList, setShowFileList] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressData, setProgressData] = useState(null);
  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const pollIntervalRef = useRef(null);
  const isFolder = driveUrl.includes('/drive/folders/') || driveUrl.includes('/folders/');

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mhdriver_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading history:', e);
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (item) => {
    try {
      setHistory(prev => {
        const next = [item, ...prev.filter(i => i.id !== item.id)].slice(0, 30);
        localStorage.setItem('mhdriver_history', JSON.stringify(next));
        return next;
      });
    } catch (e) {
      console.error('Error saving history:', e);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('mhdriver_history');
    } catch (e) {}
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Quick paste link
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setDriveUrl(text.trim());
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  // Fetch list of files in folder
  const handleListFiles = async () => {
    if (!driveUrl) return;
    setLoadingFiles(true);
    setShowFileList(true);
    try {
      const res = await axios.post('/api/list-files', { driveUrl });
      if (res.data && res.data.files) {
        setFiles(res.data.files);
        setSelectedFileIds(new Set(res.data.files.map(f => f.id)));
      }
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Lỗi tải danh sách files từ Google Drive');
      setShowFileList(false);
    } finally {
      setLoadingFiles(false);
    }
  };

  // Start download process
  const handleStartDownload = async () => {
    if (!driveUrl) return;

    setIsProcessing(true);
    setProgressData({
      status: 'processing',
      progress: 5,
      message: 'Đang kết nối MH DRIVER proxy...'
    });

    try {
      const payload = { driveUrl };
      if (isFolder && selectedFileIds.size > 0) {
        payload.selectedFileIds = Array.from(selectedFileIds);
      }

      const res = await axios.post('/api/download/start', payload);
      const jobId = res.data.job_id;

      // Poll progress every 500ms
      pollIntervalRef.current = setInterval(async () => {
        try {
          const pollRes = await axios.get(`/api/download/progress/${jobId}`);
          const data = pollRes.data;
          setProgressData(data);

          if (data.status === 'completed' || data.status === 'error') {
            clearInterval(pollIntervalRef.current);
            setIsProcessing(false);

            if (data.status === 'completed') {
              saveToHistory({
                id: data.file?.id || jobId,
                name: data.file?.name || 'Tệp Google Drive',
                size: data.file?.sizeFormatted || 'N/A',
                directUrl: data.directUrl,
                driveLink: data.driveLink,
                timestamp: Date.now()
              });
            }
          }
        } catch (err) {
          clearInterval(pollIntervalRef.current);
          setIsProcessing(false);
          setProgressData(prev => ({
            ...prev,
            status: 'error',
            message: 'Lỗi lấy thông tin tiến trình từ máy chủ'
          }));
        }
      }, 500);
    } catch (err) {
      setIsProcessing(false);
      setProgressData({
        status: 'error',
        message: err.response?.data?.error || 'Không thể bắt đầu quá trình tải'
      });
    }
  };

  // Toggle file selection
  const toggleFile = (id) => {
    const next = new Set(selectedFileIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedFileIds(next);
  };

  // Copy download link
  const handleCopyLink = (url) => {
    if (!url) return;
    const fullUrl = url.startsWith('http') ? url : window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Reset form
  const handleReset = () => {
    setDriveUrl('');
    setFiles([]);
    setSelectedFileIds(new Set());
    setShowFileList(false);
    setProgressData(null);
    setIsProcessing(false);
  };

  return (
    <div className="relative min-h-screen w-full overflow-y-auto bg-black font-sans flex flex-col justify-between" data-author="MH DRIVER (MH DIVER)">
      {/* iOS 16 Wallpaper Background */}
      <WallpaperBackground />

      {/* Navigation Header */}
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        historyCount={history.length}
      />

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full">
          <div className="mx-auto max-w-4xl text-center">
            {/* VIP Status Pill Badge */}
            <div className="mb-8 inline-flex items-center rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 px-5 py-2 text-sm text-white shadow-xl shadow-black/20 hover:scale-105 transition-transform">
              <Star className="mr-2 h-4 w-4 text-sky-400 fill-sky-400" />
              <span className="font-semibold tracking-wide">MH DRIVER</span>
              <span className="mx-2 text-white/40">•</span>
              <span className="text-white/90">Hệ thống Get Link VIP Miễn Phí</span>
            </div>

            {/* Main Headline */}
            <h1 className="mb-6 text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl drop-shadow-md">
              Tải File Drive{' '}
              <span className="bg-gradient-to-r from-sky-200 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                Không Giới Hạn
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mb-10 text-lg leading-8 text-white/90 sm:text-xl max-w-3xl mx-auto font-normal drop-shadow">
              Tải file Google Drive bị lỗi hết lượt tải trong ngày siêu nhanh. Tốc độ tối đa, hoàn toàn miễn phí và không cần đăng nhập.
            </p>

            {/* Input Box & Action Button */}
            <div className="w-full max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    placeholder="Dán link Google Drive vào đây (file hoặc thư mục)..."
                    className="w-full rounded-full border border-white/20 bg-black/40 pl-6 pr-24 py-4 text-white placeholder-white/45 backdrop-blur-2xl focus:border-sky-400/80 focus:outline-none focus:ring-2 focus:ring-sky-400/30 transition-all text-sm sm:text-base shadow-2xl"
                  />
                  {/* Quick Paste or Clear Button */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {driveUrl ? (
                      <button
                        type="button"
                        onClick={() => setDriveUrl('')}
                        className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                        title="Xóa link"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handlePaste}
                        className="px-3 py-1 rounded-full text-xs font-semibold text-white/70 hover:text-white bg-white/15 hover:bg-white/25 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Dán từ bộ nhớ tạm"
                      >
                        <ClipboardPaste className="w-3.5 h-3.5 text-sky-400" />
                        Dán
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={isFolder && !showFileList ? handleListFiles : handleStartDownload}
                  disabled={!driveUrl.trim() || isProcessing}
                  className="w-full sm:w-auto bg-white text-black rounded-full px-8 py-4 font-bold shrink-0 shadow-[0_10px_30px_rgba(255,255,255,0.2)] hover:bg-sky-50 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 inline-flex items-center justify-center transition-all cursor-pointer"
                >
                  {isProcessing && <Loader2 className="animate-spin mr-2 h-5 w-5 text-black" />}
                  {isFolder && !showFileList ? 'Xem Danh Sách' : 'Tiến Hành'}
                  {!isProcessing && <ArrowRight className="ml-2 h-5 w-5 text-black" />}
                </button>
              </div>

              {/* Folder File List Selector */}
              {showFileList && (
                <div className="mt-6 bg-black/50 border border-white/15 rounded-2xl p-5 backdrop-blur-2xl text-left shadow-2xl animate-fadeIn">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Folder className="w-5 h-5 text-sky-400" />
                      <h3 className="text-white font-semibold">
                        Chọn files trong thư mục ({selectedFileIds.size}/{files.length})
                      </h3>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => setSelectedFileIds(new Set(files.map(f => f.id)))}
                        className="text-xs bg-white/15 text-white px-3 py-1 rounded-lg hover:bg-white/25 transition-colors font-medium cursor-pointer"
                      >
                        Chọn hết
                      </button>
                      <button
                        onClick={() => setSelectedFileIds(new Set())}
                        className="text-xs bg-white/15 text-white px-3 py-1 rounded-lg hover:bg-white/25 transition-colors font-medium cursor-pointer"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  </div>

                  {loadingFiles ? (
                    <div className="py-8 text-center text-white/70 flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin h-6 w-6 text-sky-400" />
                      <span>Đang tải danh sách files...</span>
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl border border-transparent hover:border-white/15 cursor-pointer transition-colors"
                          onClick={() => toggleFile(file.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedFileIds.has(file.id)}
                            readOnly
                            className="h-4 w-4 rounded border-gray-400 text-sky-500 focus:ring-0 cursor-pointer"
                          />
                          <FileText className="w-4 h-4 text-sky-300 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{file.name}</p>
                            <p className="text-xs text-white/50">{file.sizeFormatted}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
                    <span className="text-xs text-white/70 font-medium">
                      Đã chọn {selectedFileIds.size} file • Miễn phí 100%
                    </span>
                    <button
                      onClick={handleStartDownload}
                      disabled={selectedFileIds.size === 0 || isProcessing}
                      className="px-5 py-2.5 rounded-full bg-white text-black font-bold text-xs hover:bg-sky-50 disabled:opacity-50 transition-all inline-flex items-center gap-1.5 shadow-lg cursor-pointer"
                    >
                      Tải File Đã Chọn
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Progress & Result Card */}
              {progressData && (
                <div className="mt-6 bg-black/60 border border-white/20 rounded-2xl p-6 backdrop-blur-2xl text-left shadow-2xl animate-fadeIn">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {progressData.status === 'processing' && (
                        <Loader2 className="animate-spin text-sky-400 h-6 w-6 shrink-0" />
                      )}
                      {progressData.status === 'completed' && (
                        <CheckCircle2 className="text-emerald-400 h-6 w-6 shrink-0" />
                      )}
                      {progressData.status === 'error' && (
                        <XCircle className="text-red-400 h-6 w-6 shrink-0" />
                      )}
                      <div>
                        <p className="text-white font-semibold text-base">
                          {progressData.message || 'Đang xử lý'}
                        </p>
                        {progressData.file?.name && (
                          <p className="text-white/80 text-xs mt-0.5 font-mono truncate max-w-sm sm:max-w-md">
                            {progressData.file.name} ({progressData.file.sizeFormatted || 'N/A'})
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xl font-bold text-white font-mono">
                      {Math.round(progressData.progress || 0)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-white/10 rounded-full h-3 mb-4 overflow-hidden p-0.5 border border-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        progressData.status === 'completed'
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_15px_rgba(52,211,153,0.7)]'
                          : progressData.status === 'error'
                          ? 'bg-red-400'
                          : 'bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 shadow-[0_0_15px_rgba(56,189,248,0.7)]'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, progressData.progress || 0))}%` }}
                    />
                  </div>

                  {/* Completed Download Links */}
                  {progressData.status === 'completed' && (
                    <div className="mt-5 space-y-3 pt-3 border-t border-white/10">
                      <div className="flex flex-col sm:flex-row gap-3">
                        {/* Direct High Speed Download Button */}
                        <a
                          href={progressData.directUrl}
                          download
                          className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-white to-gray-100 text-black font-extrabold hover:from-sky-50 hover:to-white transition-all shadow-[0_10px_25px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.99]"
                        >
                          <Download className="h-5 w-5 text-black" />
                          <span>Tải Xuống Trực Tiếp (Tốc Độ Cao)</span>
                        </a>

                        {/* Open in Google Drive */}
                        {progressData.driveLink && (
                          <a
                            href={progressData.driveLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all border border-white/15"
                          >
                            <span>Mở Google Drive</span>
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>

                      {/* Secondary actions: Copy link & Reset */}
                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={() => handleCopyLink(progressData.directUrl)}
                          className="text-xs text-white/80 hover:text-white flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-white/10 transition-colors font-medium cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-semibold">Đã sao chép link tải!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-sky-400" />
                              <span>Sao chép link tải</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={handleReset}
                          className="text-xs text-white/60 hover:text-white flex items-center gap-1 py-1 px-3 rounded-lg hover:bg-white/10 transition-colors font-medium cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                          Tải link khác
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Copyright Watermark */}
      <footer className="relative z-10 py-4 text-center text-xs text-white/40 border-t border-white/5 backdrop-blur-md">
        <p>© 2026 <strong className="text-white/70 font-semibold">MH DRIVER</strong> (MH DIVER). Bản quyền được bảo hộ • Nghiêm cấm sao chép.</p>
      </footer>

      {/* Hidden DOM Security Watermark Tag */}
      <div
        className="hidden"
        aria-hidden="true"
        data-mh-diver-signature="MH_DIVER_PROTECTED_2026_GENUINE_SYSTEM"
        data-owner="MH DRIVER (MH DIVER)"
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={clearHistory}
      />

      {/* Guide Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
