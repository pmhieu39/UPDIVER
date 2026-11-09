# UPDIVER (MH DRIVER) - Công Cụ Mở Khóa Tải Google Drive Siêu Tốc

Web app tải file Google Drive tốc độ cao, hỗ trợ vượt giới hạn tải 24h (**Download quota exceeded**) và tải thư mục (Folder) nhiều file với giao diện hiện đại độc quyền phong cách Apple iOS 16 Fluid Glassmorphism.

---

## 🌟 Điểm Nổi Bật

- 🎨 **Giao diện Mới Độc Quyền (Không Đạo Nhái)**: Thiết kế Frosted Glass tinh tế, sáng sủa, làm nổi bật các dải màu sống động của hình nền iOS 16 Fluid.
- ⚡ **100% Miễn Phí**: Không cần đăng nhập, không cần nạp tiền hay coin.
- 🚀 **Direct Stream Proxy**: Tự động vượt trang cảnh báo quét virus của file lớn (`confirm=t`), tạo luồng tải trực tiếp tốc độ cao.
- 📂 **Hỗ trợ Thư mục (Folder)**: Phân tích danh sách file trong thư mục Google Drive, cho phép chọn từng file hoặc chọn tất cả để tải.
- 🕒 **Lịch sử tải thông minh**: Lưu trữ lịch sử tải cục bộ ngay trên trình duyệt (`LocalStorage`), hỗ trợ tải lại bất cứ lúc nào.
- ☁️ **Sẵn sàng cho Cloudflare Pages**: Tích hợp sẵn `functions/api/` hỗ trợ triển khai 1-click lên Cloudflare Pages hoàn toàn miễn phí.

---

## 🚀 Cài Đặt & Khởi Chạy

### 1. Cài đặt thư viện
```bash
git clone https://github.com/pmhieu39/UPDIVER.git
cd UPDIVER
npm install
```

### 2. Chạy chế độ phát triển (Development)
```bash
npm run dev
```
Trang web sẽ chạy tại: **`http://localhost:5173`** (API port: 3001)

### 3. Chạy sản phẩm (Production)
```bash
npm start
```
Trang web sẽ tự động build và chạy tại: **`http://localhost:3001`**

---

## 📁 Cấu Trúc Dự Án

```
UPDIVER/
├── functions/
│   └── api/[[path]].js         # Cloudflare Pages Functions (Native Worker)
├── public/
│   ├── wallpaper.jpg           # Hình nền iOS 16 Fluid độ phân giải cao
│   ├── big-logo.svg            # Logo chuẩn MH DRIVER PRO
│   └── mini-logo.svg           # Icon favicon
├── server/
│   └── index.js                # Backend Express xử lý proxy stream & Google Drive metadata
├── src/
│   ├── components/
│   │   ├── WallpaperBackground.jsx # Background iOS 16 với ánh sáng ambient glow
│   │   ├── Navbar.jsx          # Thanh điều hướng MH DRIVER phong cách kính mờ
│   │   ├── HistoryModal.jsx    # Modal lịch sử tải xuống
│   │   └── GuideModal.jsx      # Modal hướng dẫn bypass quota
│   ├── App.jsx                 # Giao diện chính của ứng dụng
│   ├── index.css               # Phong cách Tailwind CSS
│   └── main.jsx
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 📄 Bản Quyền
© 2026 **MH DRIVER (MH DIVER)**. Tất cả các quyền được bảo lưu.
Nghiêm cấm sao chép mã nguồn và giao diện.
