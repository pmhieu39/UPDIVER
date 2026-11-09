# UPDIVER (MH DRIVER) - Tải File Google Drive Không Giới Hạn

Web app tải file Google Drive tốc độ cao, hỗ trợ vượt giới hạn tải 24h (**Download quota exceeded**) và tải thư mục (Folder) nhiều file với giao diện hiện đại phong cách Apple iOS 16 Fluid Glassmorphism.

---

## 🌟 Điểm Nổi Bật

- ⚡ **100% Miễn Phí**: Không cần đăng nhập, không cần nạp tiền hay coin.
- 🚀 **Direct Stream Proxy**: Tự động vượt trang cảnh báo quét virus của file lớn (`confirm=t`), tạo luồng tải trực tiếp tốc độ cao.
- 📂 **Hỗ trợ Thư mục (Folder)**: Phân tích danh sách file trong thư mục Google Drive, cho phép chọn từng file hoặc chọn tất cả để tải.
- 🎨 **Giao diện iOS 16 Fluid Wallpaper**: Thiết kế kính mờ siêu thực (`backdrop-blur-2xl`) cùng hình nền iOS 16 sống động.
- 🕒 **Lịch sử tải thông minh**: Lưu trữ lịch sử tải cục bộ ngay trên trình duyệt (`LocalStorage`), hỗ trợ tải lại bất cứ lúc nào.

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
├── public/
│   ├── wallpaper.jpg           # Hình nền iOS 16 Fluid
│   ├── big-logo.svg            # Logo chuẩn MH DRIVER
│   └── mini-logo.svg           # Icon favicon
├── server/
│   └── index.js                # Backend Express xử lý proxy stream & Google Drive metadata
├── src/
│   ├── components/
│   │   ├── WallpaperBackground.jsx # Background với hiệu ứng kính mờ
│   │   ├── Navbar.jsx          # Thanh điều hướng MH DRIVER
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
Phát triển bởi **MH DRIVER**.
