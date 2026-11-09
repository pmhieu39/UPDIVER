import React from 'react';
import { X, Download, Trash2, ExternalLink, Clock, File } from 'lucide-react';

export default function HistoryModal({ isOpen, onClose, history, onClearHistory }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-3xl border border-white/15 bg-black/80 p-6 sm:p-7 shadow-2xl backdrop-blur-3xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Lịch Sử Tải Xuống</h3>
              <p className="text-xs text-white/50">MH DRIVER Local Storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 max-h-80 overflow-y-auto space-y-2.5 pr-1">
          {history.length === 0 ? (
            <div className="py-12 text-center text-white/40">
              <File className="w-10 h-10 mx-auto mb-2 opacity-30 text-sky-400" />
              Chưa có lịch sử tải xuống nào trên trình duyệt.
            </div>
          ) : (
            history.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition-all"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                  <p className="text-xs text-white/50 mt-0.5">
                    {item.size || 'Không rõ'} • {new Date(item.timestamp).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {item.directUrl && (
                    <a
                      href={item.directUrl}
                      download
                      className="px-3.5 py-1.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-sky-50 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 text-black" />
                      Tải lại
                    </a>
                  )}
                  {item.driveLink && (
                    <a
                      href={item.driveLink}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors border border-white/10"
                      title="Mở Google Drive"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-white/50">Được lưu trên máy của bạn (không gửi lên server)</span>
            <button
              onClick={onClearHistory}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-rose-500/10 transition-colors font-medium cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xóa tất cả
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
