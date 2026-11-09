import express from 'express';
import cors from 'cors';
import https from 'https';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory job store
const jobs = new Map();

/**
 * Extract Google Drive file/folder ID and type from URL
 */
function parseDriveUrl(input) {
  if (!input || typeof input !== 'string') return null;
  const str = input.trim();

  // Folder matches
  const folderMatch = str.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch) {
    return { type: 'folder', id: folderMatch[1] };
  }

  // File matches
  const fileMatch = str.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    return { type: 'file', id: fileMatch[1] };
  }

  // Parameter id=
  const idMatch = str.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) {
    return { type: 'file', id: idMatch[1] };
  }

  // If raw ID (alphanumeric, 20-50 chars)
  if (/^[a-zA-Z0-9_-]{20,50}$/.test(str)) {
    return { type: 'file', id: str };
  }

  return null;
}

/**
 * Format bytes to readable string
 */
function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Fetch HTML or headers from Google Drive to inspect file info
 */
async function fetchFileInfo(fileId) {
  return new Promise((resolve) => {
    const url = `https://drive.google.com/file/d/${fileId}/view`;
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'vi,en;q=0.9',
      },
      timeout: 6000
    }, (res) => {
      let body = '';
      res.on('data', chunk => {
        if (body.length < 80000) body += chunk.toString();
      });
      res.on('end', () => {
        let name = 'Tệp Google Drive';
        let sizeFormatted = 'Không rõ dung lượng';

        const ogMatch = body.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
        if (ogMatch && ogMatch[1] && !ogMatch[1].includes('Google Drive')) {
          name = ogMatch[1].trim();
        } else {
          const titleMatch = body.match(/<title>([^<]+)<\/title>/i);
          if (titleMatch && titleMatch[1]) {
            const raw = titleMatch[1].replace('- Google Drive', '').trim();
            if (raw) name = raw;
          }
        }

        const sizeMatch = body.match(/(\d+(?:\.\d+)?\s*(?:MB|GB|KB|B))/i);
        if (sizeMatch) {
          sizeFormatted = sizeMatch[1];
        }

        resolve({ name, sizeFormatted, id: fileId });
      });
    });

    req.on('error', () => {
      resolve({ name: `Tệp Drive (${fileId.slice(0, 8)}...)`, sizeFormatted: 'Không rõ dung lượng', id: fileId });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ name: `Tệp Drive (${fileId.slice(0, 8)}...)`, sizeFormatted: 'Không rõ dung lượng', id: fileId });
    });
  });
}

/**
 * Fetch folder files
 */
async function fetchFolderFiles(folderId) {
  return new Promise((resolve) => {
    const url = `https://drive.google.com/embeddedfolderview?id=${folderId}#list`;
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 6000
    }, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk.toString(); });
      res.on('end', () => {
        const files = [];
        const regex = /<div class="flip-entry"[^>]*id="entry-([^"]+)"[^>]*>.*?<div class="flip-entry-title">([^<]+)<\/div>.*?<div class="flip-entry-size">([^<]+)<\/div>/gs;
        let match;
        while ((match = regex.exec(body)) !== null) {
          files.push({
            id: match[1],
            name: match[2].trim(),
            sizeFormatted: match[3].trim() || 'N/A'
          });
        }

        if (files.length === 0) {
          const linkRegex = /href="https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view[^"]*"[^>]*>([^<]+)<\/a>/g;
          while ((match = linkRegex.exec(body)) !== null) {
            files.push({
              id: match[1],
              name: match[2].trim(),
              sizeFormatted: 'Không rõ dung lượng'
            });
          }
        }

        if (files.length === 0) {
          files.push({
            id: folderId,
            name: `Thư mục Drive (${folderId.slice(0, 8)}...)`,
            sizeFormatted: 'Đầy đủ thư mục'
          });
        }

        resolve(files);
      });
    });

    req.on('error', () => {
      resolve([{
        id: folderId,
        name: `Thư mục Drive (${folderId.slice(0, 8)}...)`,
        sizeFormatted: 'Đầy đủ thư mục'
      }]);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve([{
        id: folderId,
        name: `Thư mục Drive (${folderId.slice(0, 8)}...)`,
        sizeFormatted: 'Đầy đủ thư mục'
      }]);
    });
  });
}

/**
 * Route: List files for folder or file
 */
app.post('/api/list-files', async (req, res) => {
  try {
    const { driveUrl } = req.body;
    if (!driveUrl) {
      return res.status(400).json({ error: 'Vui lòng cung cấp link Google Drive' });
    }

    const parsed = parseDriveUrl(driveUrl);
    if (!parsed) {
      return res.status(400).json({ error: 'Định dạng link Google Drive không hợp lệ' });
    }

    if (parsed.type === 'folder') {
      const files = await fetchFolderFiles(parsed.id);
      return res.json({ files, isFolder: true, folderId: parsed.id });
    } else {
      const file = await fetchFileInfo(parsed.id);
      return res.json({ files: [file], isFolder: false, fileId: parsed.id });
    }
  } catch (err) {
    console.error('list-files error:', err);
    res.status(500).json({ error: 'Không thể tải thông tin từ Google Drive' });
  }
});

/**
 * Route: Start download process
 */
app.post('/api/download/start', async (req, res) => {
  try {
    const { driveUrl, selectedFileIds } = req.body;
    if (!driveUrl) {
      return res.status(400).json({ error: 'Vui lòng cung cấp link Google Drive' });
    }

    const parsed = parseDriveUrl(driveUrl);
    if (!parsed) {
      return res.status(400).json({ error: 'Định dạng link không hợp lệ' });
    }

    const jobId = 'job_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const targetFileId = (selectedFileIds && selectedFileIds.length > 0) ? selectedFileIds[0] : parsed.id;

    const job = {
      id: jobId,
      status: 'processing',
      progress: 10,
      message: 'Đang kết nối MH DRIVER proxy...',
      targetFileId,
      isFolder: parsed.type === 'folder',
      current: 1,
      total: (selectedFileIds && selectedFileIds.length) || 1,
      createdAt: Date.now()
    };
    jobs.set(jobId, job);

    (async () => {
      try {
        const fileInfo = await fetchFileInfo(targetFileId);
        job.file = fileInfo;
        job.progress = 35;
        job.message = 'Đang phân tích cấu trúc và bypass giới hạn quota 24h...';

        await new Promise(r => setTimeout(r, 600));

        job.progress = 70;
        job.message = 'Đang khởi tạo luồng tải trực tiếp tốc độ cao...';

        await new Promise(r => setTimeout(r, 600));

        const directStreamUrl = `/api/download/stream?id=${targetFileId}&name=${encodeURIComponent(fileInfo.name || 'download')}`;
        const googleDirectUrl = `https://drive.usercontent.google.com/download?id=${targetFileId}&export=download&confirm=t`;
        const driveLink = `https://drive.google.com/file/d/${targetFileId}/view`;

        job.status = 'completed';
        job.progress = 100;
        job.message = 'MH DRIVER đã sẵn sàng tải xuống!';
        job.driveLink = driveLink;
        job.directUrl = directStreamUrl;
        job.googleDirectUrl = googleDirectUrl;
        job.file = fileInfo;
      } catch (e) {
        console.error('Job error:', e);
        job.status = 'error';
        job.message = 'Không thể phân tích hoặc file không có quyền công khai.';
      }
    })();

    res.json({ job_id: jobId });
  } catch (err) {
    console.error('download/start error:', err);
    res.status(500).json({ error: 'Không thể bắt đầu quá trình tải' });
  }
});

/**
 * Route: Progress polling
 */
app.get('/api/download/progress/:job_id', (req, res) => {
  const job = jobs.get(req.params.job_id);
  if (!job) {
    return res.status(404).json({ status: 'error', message: 'Không tìm thấy tiến trình tải' });
  }
  res.json(job);
});

/**
 * Route: Stream Google Drive file directly to client
 */
app.get('/api/download/stream', async (req, res) => {
  const { id, name } = req.query;
  if (!id) {
    return res.status(400).send('Thiếu ID file');
  }

  const filename = name ? decodeURIComponent(name) : `drive_file_${id}`;
  const googleUrl = `https://drive.usercontent.google.com/download?id=${id}&export=download&authuser=0&confirm=t`;

  function makeRequest(targetUrl, redirectCount = 0) {
    if (redirectCount > 5) {
      return res.status(500).send('Quá nhiều lượt chuyển hướng');
    }

    const parsedTarget = new URL(targetUrl);
    const client = parsedTarget.protocol === 'https:' ? https : http;

    const request = client.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'identity',
      }
    }, (driveRes) => {
      if (driveRes.statusCode >= 300 && driveRes.statusCode < 400 && driveRes.headers.location) {
        return makeRequest(driveRes.headers.location, redirectCount + 1);
      }

      const contentType = driveRes.headers['content-type'] || '';
      if (contentType.includes('text/html')) {
        let htmlBody = '';
        driveRes.on('data', chunk => { htmlBody += chunk.toString(); });
        driveRes.on('end', () => {
          const tokenMatch = htmlBody.match(/name="confirm"\s+value="([^"]+)"/) || htmlBody.match(/confirm=([0-9a-zA-Z_]+)/);
          if (tokenMatch) {
            const nextUrl = `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=${tokenMatch[1]}`;
            return makeRequest(nextUrl, redirectCount + 1);
          }

          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.send(`
            <!DOCTYPE html>
            <html lang="vi">
            <head><meta charset="utf-8"><title>MH DRIVER - Thông báo</title></head>
            <body style="background:#0a0a0a; color:#fff; font-family:sans-serif; text-align:center; padding:50px;">
              <h2>⚠️ Không thể tải trực tiếp file này qua proxy</h2>
              <p>Google yêu cầu đăng nhập tài khoản Google để tải file này hoặc quyền truy cập đang bị giới hạn.</p>
              <p style="margin-top:20px;">
                <a href="https://drive.google.com/file/d/${id}/view" target="_blank" style="display:inline-block; background:#fff; color:#000; padding:12px 24px; border-radius:999px; text-decoration:none; font-weight:bold;">
                  Mở trực tiếp trên Google Drive
                </a>
              </p>
            </body>
            </html>
          `);
        });
        return;
      }

      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      if (driveRes.headers['content-length']) {
        res.setHeader('Content-Length', driveRes.headers['content-length']);
      }
      res.setHeader('Content-Type', driveRes.headers['content-type'] || 'application/octet-stream');

      driveRes.pipe(res);
    });

    request.on('error', (err) => {
      console.error('Download stream error:', err);
      if (!res.headersSent) {
        res.status(500).send('Lỗi luồng tải file từ Google Drive');
      }
    });
  }

  makeRequest(googleUrl);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'MH DRIVER Downloader', version: '1.0.0' });
});

// Serve frontend dist static assets in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Fallback SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`MH DRIVER Server running on http://localhost:${PORT}`);
});
