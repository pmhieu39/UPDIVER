import React from 'react';
import { X, HelpCircle, ShieldCheck, Zap } from 'lucide-react';

export default function GuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-black/80 p-6 sm:p-8 shadow-2xl backdrop-blur-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Hướng Dẫn Tải & Bypass Quota Drive</h3>
              <p className="text-xs text-white/50">Hệ thống MH DRIVER Proxy Download</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="mt-5 space-y-5 text-sm text-white/80 leading-relaxed">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg">
            <h4 className="font-bold text-white flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Lỗi "Download quota exceeded for this file" là gì?
            </h4>
            <p className="text-white/70 text-xs sm:text-sm">
              Google Drive áp dụng chính sách giới hạn băng thông tải xuống của một file trong vòng 24 giờ. Khi có quá nhiều người tải cùng lúc, liên kết sẽ bị Google tạm khóa và báo lỗi vượt giới hạn.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-base">Cách 1: Tải trực tiếp qua MH DRIVER (Nhanh nhất)</h4>
            <div className="grid gap-2.5 pl-1">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs flex items-center justify-center shrink-0 font-bold">1</span>
                <span className="text-white/80 text-xs sm:text-sm">Dán liên kết Google Drive (tệp đơn hoặc thư mục) vào thanh nhập của <strong>MH DRIVER</strong>.</span>
              </div>
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs flex items-center justify-center shrink-0 font-bold">2</span>
                <span className="text-white/80 text-xs sm:text-sm">Nhấn nút <strong>"Tiến Hành"</strong> để hệ thống tự động vượt hạn mức quét virus và thiết lập luồng stream trực tiếp.</span>
              </div>
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 text-xs flex items-center justify-center shrink-0 font-bold">3</span>
                <span className="text-white/80 text-xs sm:text-sm">Nhấn <strong>"Tải Xuống Trực Tiếp (Tốc Độ Cao)"</strong> để bắt đầu tải file về thiết bị.</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-white/10">
            <h4 className="font-bold text-white text-base">Cách 2: Mẹo "Thêm Lối Tắt & Tạo Thư Mục" (Dự phòng)</h4>
            <div className="grid gap-2.5 pl-1">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center shrink-0 font-bold">1</span>
                <span className="text-white/80 text-xs sm:text-sm">Mở link file trên Google Drive, đăng nhập tài khoản Google của bạn.</span>
              </div>
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center shrink-0 font-bold">2</span>
                <span className="text-white/80 text-xs sm:text-sm">Nhấn vào biểu tượng <strong>"Thêm lối tắt vào Drive"</strong> (Add shortcut) và lưu vào một thư mục trống trong Drive của bạn.</span>
              </div>
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center shrink-0 font-bold">3</span>
                <span className="text-white/80 text-xs sm:text-sm">Nhấp chuột phải vào thư mục đó và chọn <strong>"Tải xuống"</strong> (Google sẽ nén thành ZIP và tải về bình thường mà không bị chặn).</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs sm:text-sm flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 shrink-0 text-emerald-400" />
            <span>MH DRIVER cam kết 100% miễn phí, không lưu trữ tệp dữ liệu cá nhân của người dùng, không yêu cầu đăng nhập.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-sm hover:bg-sky-50 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
          >
            Đã Hiểu
          </button>
        </div>
      </div>
    </div>
  );
}
