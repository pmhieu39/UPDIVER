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
  Sparkles,
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
  ExternalLink,
  Zap,
  ShieldCheck,
  Link2,
  HardDrive
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

  // Sample test link
  const handleSampleLink = () => {
    setDriveUrl('https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view');
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
      progress: 10,
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
    <div className="relative min-h-screen w-full overflow-y-auto font-sans flex flex-col justify-between" data-author="MH DRIVER (MH DIVER)">
      {/* Dynamic Bright iOS 16 Wallpaper Background */}
      <WallpaperBackground />

      {/* Navigation Header */}
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center py-10 sm:py-14 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl w-full text-center">

          {/* Top Pill Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-2xl border border-white/25 px-5 py-2 text-xs sm:text-sm text-white shadow-xl hover:bg-white/20 transition-all cursor-default">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="font-extrabold tracking-wider bg-gradient-to-r from-white via-sky-100 to-sky-300 bg-clip-text text-transparent">
              MH DRIVER
            </span>
            <span className="text-white/40">•</span>
            <span className="text-white/90 font-medium">Mở Khóa Tải Google Drive Siêu Tốc</span>
          </div>

          {/* Main Headline */}
          <h1 className="mb-5 text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
            Tải File Google Drive
          </h1>

          {/* Subtitle */}
          <p className="mb-8 text-base sm:text-lg text-white/90 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            Tải file Google Drive bị lỗi hết lượt tải trong ngày siêu nhanh. Tốc độ tối đa, hoàn toàn miễn phí và không cần đăng nhập.
          </p>

          {/* Central Interactive Glass Card */}
          <div className="w-full max-w-3xl mx-auto rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/20 p-5 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] text-left">
            
            {/* Input Row */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400">
                  <Link2 className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  placeholder="Dán link Google Drive vào đây (file hoặc thư mục)..."
                  className="w-full rounded-2xl border border-white/20 bg-black/40 pl-12 pr-24 py-4 text-white placeholder-white/45 backdrop-blur-xl focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30 transition-all text-sm sm:text-base shadow-inner"
                />
                
                {/* Quick Paste or Clear Button */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {driveUrl ? (
                    <button
                      type="button"
                      onClick={() => setDriveUrl('')}
                      className="p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                      title="Xóa link"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePaste}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-sky-300 hover:text-white bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 transition-all flex items-center gap-1 cursor-pointer"
                      title="Dán từ bộ nhớ tạm"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5" />
                      Dán link
                    </button>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={isFolder && !showFileList ? handleListFiles : handleStartDownload}
                disabled={!driveUrl.trim() || isProcessing}
                className="w-full sm:w-auto bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-white rounded-2xl px-7 py-4 font-bold shrink-0 shadow-[0_10px_25px_rgba(14,165,233,0.35)] hover:shadow-[0_15px_30px_rgba(14,165,233,0.5)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 inline-flex items-center justify-center transition-all cursor-pointer text-sm sm:text-base"
              >
                {isProcessing && <Loader2 className="animate-spin mr-2 h-5 w-5 text-white" />}
                {isFolder && !showFileList ? 'Xem Danh Sách' : 'Mở Khóa & Tải Ngay'}
                {!isProcessing && <ArrowRight className="ml-2 h-5 w-5 text-white" />}
              </button>
            </div>

            {/* Link Detection Badge & Quick Helper */}
            <div className="mt-3 flex items-center justify-between text-xs text-white/60 px-1">
              <div className="flex items-center gap-2">
                {driveUrl.trim() ? (
                  isFolder ? (
                    <span className="inline-flex items-center gap-1 text-amber-300 font-semibold bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-400/20">
                      <Folder className="w-3.5 h-3.5" />
                      Phát hiện: Thư mục Google Drive
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sky-300 font-semibold bg-sky-400/10 px-2.5 py-0.5 rounded-md border border-sky-400/20">
                      <FileText className="w-3.5 h-3.5" />
                      Phát hiện: Tệp Google Drive
                    </span>
                  )
                ) : (
                  <span>Hỗ trợ tệp đơn, thư mục và mọi định dạng link Drive</span>
                )}
              </div>

              {!driveUrl && (
                <button
                  type="button"
                  onClick={handleSampleLink}
                  className="text-sky-300/80 hover:text-sky-200 underline decoration-dotted transition-colors cursor-pointer"
                >
                  Thử link mẫu
                </button>
              )}
            </div>

            {/* Folder File List Selector */}
            {showFileList && (
              <div className="mt-6 bg-black/40 border border-white/15 rounded-2xl p-5 backdrop-blur-xl animate-fadeIn">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Folder className="w-5 h-5 text-amber-400" />
                    <h3 className="text-white font-semibold">
                      Chọn tệp cần tải ({selectedFileIds.size}/{files.length})
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
                    <span>Đang đọc danh sách file từ Google Drive...</span>
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
                    Đã chọn {selectedFileIds.size} file • Tải trực tiếp
                  </span>
                  <button
                    onClick={handleStartDownload}
                    disabled={selectedFileIds.size === 0 || isProcessing}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 text-white font-bold text-xs hover:from-sky-300 hover:to-blue-400 disabled:opacity-50 transition-all inline-flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    Tải File Đã Chọn
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Progress & Result Card */}
            {progressData && (
              <div className="mt-6 bg-black/50 border border-white/20 rounded-2xl p-6 backdrop-blur-2xl shadow-2xl animate-fadeIn">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {progressData.status === 'processing' && (
                      <Loader2 className="animate-spin text-sky-400 h-6 w-6 shrink-0" />
                    )}
                    {progressData.status === 'completed' && (
                      <CheckCircle2 className="text-emerald-400 h-6 w-6 shrink-0" />
                    )}
                    {progressData.status === 'error' && (
                      <XCircle className="text-rose-400 h-6 w-6 shrink-0" />
                    )}
                    <div>
                      <p className="text-white font-bold text-base">
                        {progressData.message || 'Đang xử lý'}
                      </p>
                      {progressData.file?.name && (
                        <p className="text-white/80 text-xs mt-0.5 font-mono truncate max-w-sm sm:max-w-md">
                          {progressData.file.name} ({progressData.file.sizeFormatted || 'N/A'})
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xl font-black text-sky-400 font-mono">
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
                        ? 'bg-rose-500'
                        : 'bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 shadow-[0_0_15px_rgba(56,189,248,0.7)]'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, progressData.progress || 0))}%` }}
                  />
                </div>

                {/* Completed Action Buttons */}
                {progressData.status === 'completed' && (
                  <div className="mt-5 space-y-3 pt-3 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Primary Direct Download Button */}
                      <a
                        href={progressData.directUrl}
                        download
                        className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black font-black transition-all shadow-[0_10px_25px_rgba(52,211,153,0.3)] hover:scale-[1.02] active:scale-[0.99]"
                      >
                        <Download className="h-5 w-5 text-black" />
                        <span>TẢI VỀ MÁY NGAY (TỐC ĐỘ CAO)</span>
                      </a>

                      {/* Open in Google Drive */}
                      {progressData.driveLink && (
                        <a
                          href={progressData.driveLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 py-4 px-5 rounded-2xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all border border-white/15"
                        >
                          <span>Mở Google Drive</span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => handleCopyLink(progressData.directUrl)}
                        className="text-xs text-white/80 hover:text-white flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-white/10 transition-colors font-medium cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Đã sao chép link tải!</span>
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
                        Tải liên kết khác
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3 Step Visual Tracker */}
            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block mb-1">Bước 1</span>
                <span className="text-xs font-semibold text-white/90">Dán Link Drive</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block mb-1">Bước 2</span>
                <span className="text-xs font-semibold text-white/90">Bypass Quota 24h</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">Bước 3</span>
                <span className="text-xs font-semibold text-white/90">Tải File Tốc Độ Cao</span>
              </div>
            </div>

          </div>

          {/* 3 Feature Showcase Cards (Unique, Bright, Distinctive) */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto text-left">
            <div className="p-5 rounded-2xl bg-slate-900/50 backdrop-blur-2xl border border-white/15 shadow-xl hover:border-white/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm mb-1">Tải Trực Tiếp Siêu Tốc</h4>
              <p className="text-xs text-white/70 leading-relaxed">
                Tự động bỏ qua bước cảnh báo quét virus với tệp lớn, truyền trực tiếp từ Google Drive CDN với tốc độ tối đa.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/50 backdrop-blur-2xl border border-white/15 shadow-xl hover:border-white/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 mb-3">
                <HardDrive className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm mb-1">Mở Khóa Giới Hạn Quota</h4>
              <p className="text-xs text-white/70 leading-relaxed">
                Khắc phục triệt để lỗi "Download quota exceeded" khi file bị quá tải lượt tải trong ngày.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/50 backdrop-blur-2xl border border-white/15 shadow-xl hover:border-white/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-sm mb-1">Bảo Mật & Miễn Phí</h4>
              <p className="text-xs text-white/70 leading-relaxed">
                Không lưu trữ dữ liệu của người dùng, không yêu cầu tạo tài khoản hay nạp coin rườm rà.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Modern Clean Footer with Copyright */}
      <footer className="relative z-10 py-5 text-center text-xs text-white/60 border-t border-white/10 backdrop-blur-2xl bg-slate-950/20">
        <p className="font-medium">
          © 2026 <strong className="text-white font-bold tracking-wide">MH DRIVER</strong> (MH DIVER). Bản quyền được bảo hộ • Nghiêm cấm sao chép.
        </p>
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
