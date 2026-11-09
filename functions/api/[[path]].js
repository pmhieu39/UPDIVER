/**
 * ==============================================================================
 * © 2026 MH DRIVER (MH DIVER). TẤT CẢ CÁC QUYỀN ĐƯỢC BẢO LƯU.
 * ALL RIGHTS RESERVED. BẢN QUYỀN THUỘC VỀ MH DRIVER / MH DIVER.
 * Cloudflare Pages Functions - Native Worker API Engine.
 * Nghiêm cấm mọi hành vi sao chép trái phép.
 * ==============================================================================
 */

function parseDriveUrl(input) {
  if (!input || typeof input !== 'string') return null;
  const str = input.trim();

  const folderMatch = str.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch) return { type: 'folder', id: folderMatch[1] };

  const fileMatch = str.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return { type: 'file', id: fileMatch[1] };

  const idMatch = str.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return { type: 'file', id: idMatch[1] };

  if (/^[a-zA-Z0-9_-]{20,50}$/.test(str)) return { type: 'file', id: str };

  return null;
}

async function fetchFileInfo(fileId) {
  try {
    const res = await fetch(`https://drive.google.com/file/d/${fileId}/view`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'vi,en;q=0.9',
      }
    });
    const body = await res.text();
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
    if (sizeMatch) sizeFormatted = sizeMatch[1];

    return { id: fileId, name, sizeFormatted };
  } catch (e) {
    return { id: fileId, name: `Tệp Drive (${fileId.slice(0, 8)}...)`, sizeFormatted: 'Không rõ dung lượng' };
  }
}

async function fetchFolderFiles(folderId) {
  try {
    const res = await fetch(`https://drive.google.com/embeddedfolderview?id=${folderId}#list`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });
    const body = await res.text();
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

    return files;
  } catch (e) {
    return [{
      id: folderId,
      name: `Thư mục Drive (${folderId.slice(0, 8)}...)`,
      sizeFormatted: 'Đầy đủ thư mục'
    }];
  }
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Anti-theft CORS & Copyright headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'X-Powered-By': 'MH-DRIVER-Cloudflare',
    'X-Author': 'MH DRIVER (MH DIVER)',
    'X-Copyright': 'Copyright (C) 2026 MH DRIVER (MH DIVER). All Rights Reserved.',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // /api/health
  if (path === '/api/health') {
    return new Response(JSON.stringify({
      status: 'ok',
      service: 'MH DRIVER on Cloudflare',
      copyright: '© 2026 MH DRIVER (MH DIVER). All Rights Reserved.',
      version: '1.0.0'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // /api/list-files
  if (path === '/api/list-files' && request.method === 'POST') {
    try {
      const { driveUrl } = await request.json();
      if (!driveUrl) return new Response(JSON.stringify({ error: 'Thiếu liên kết Google Drive' }), { status: 400, headers: corsHeaders });

      const parsed = parseDriveUrl(driveUrl);
      if (!parsed) return new Response(JSON.stringify({ error: 'Định dạng link không hợp lệ' }), { status: 400, headers: corsHeaders });

      if (parsed.type === 'folder') {
        const files = await fetchFolderFiles(parsed.id);
        return new Response(JSON.stringify({ files, isFolder: true, folderId: parsed.id, copyright: 'MH DRIVER (MH DIVER)' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        const file = await fetchFileInfo(parsed.id);
        return new Response(JSON.stringify({ files: [file], isFolder: false, fileId: parsed.id, copyright: 'MH DRIVER (MH DIVER)' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Lỗi tải thông tin file' }), { status: 500, headers: corsHeaders });
    }
  }

  // /api/download/start
  if (path === '/api/download/start' && request.method === 'POST') {
    try {
      const { driveUrl, selectedFileIds } = await request.json();
      if (!driveUrl) return new Response(JSON.stringify({ error: 'Thiếu liên kết' }), { status: 400, headers: corsHeaders });

      const parsed = parseDriveUrl(driveUrl);
      if (!parsed) return new Response(JSON.stringify({ error: 'Link không hợp lệ' }), { status: 400, headers: corsHeaders });

      const targetFileId = (selectedFileIds && selectedFileIds.length > 0) ? selectedFileIds[0] : parsed.id;
      const fileInfo = await fetchFileInfo(targetFileId);

      const directStreamUrl = `/api/download/stream?id=${targetFileId}&name=${encodeURIComponent(fileInfo.name || 'download')}`;
      const googleDirectUrl = `https://drive.usercontent.google.com/download?id=${targetFileId}&export=download&confirm=t`;
      const driveLink = `https://drive.google.com/file/d/${targetFileId}/view`;

      const jobId = 'cf_' + targetFileId;
      return new Response(JSON.stringify({
        job_id: jobId,
        status: 'completed',
        progress: 100,
        message: 'MH DRIVER đã sẵn sàng tải xuống!',
        driveLink,
        directUrl: directStreamUrl,
        googleDirectUrl,
        file: fileInfo,
        copyright: 'MH DRIVER (MH DIVER)'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Lỗi bắt đầu tải' }), { status: 500, headers: corsHeaders });
    }
  }

  // /api/download/progress/:job_id
  if (path.startsWith('/api/download/progress/')) {
    const targetFileId = path.replace('/api/download/progress/', '').replace('cf_', '').replace(/^job_[^_]+_/, '');
    const fileInfo = await fetchFileInfo(targetFileId);
    const directStreamUrl = `/api/download/stream?id=${targetFileId}&name=${encodeURIComponent(fileInfo.name || 'download')}`;
    const googleDirectUrl = `https://drive.usercontent.google.com/download?id=${targetFileId}&export=download&confirm=t`;
    const driveLink = `https://drive.google.com/file/d/${targetFileId}/view`;

    return new Response(JSON.stringify({
      id: targetFileId,
      status: 'completed',
      progress: 100,
      message: 'MH DRIVER đã sẵn sàng tải xuống!',
      driveLink,
      directUrl: directStreamUrl,
      googleDirectUrl,
      file: fileInfo,
      copyright: 'MH DRIVER (MH DIVER)'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // /api/download/stream
  if (path === '/api/download/stream') {
    const id = url.searchParams.get('id');
    const name = url.searchParams.get('name') || `drive_file_${id}`;
    if (!id) return new Response('Thiếu ID file', { status: 400 });

    const googleUrl = `https://drive.usercontent.google.com/download?id=${id}&export=download&authuser=0&confirm=t`;
    try {
      const driveRes = await fetch(googleUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
      });

      const responseHeaders = new Headers(driveRes.headers);
      responseHeaders.set('Content-Disposition', `attachment; filename="${encodeURIComponent(name)}"`);
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('X-Author', 'MH DRIVER (MH DIVER)');
      responseHeaders.set('X-Copyright', '© 2026 MH DRIVER (MH DIVER)');

      return new Response(driveRes.body, {
        status: driveRes.status,
        headers: responseHeaders
      });
    } catch (err) {
      return new Response('Lỗi kết nối tới Google Drive CDN', { status: 500 });
    }
  }

  return new Response('Not Found', { status: 404 });
}
