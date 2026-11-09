/**
 * ==============================================================================
 * © 2026 MH DRIVER (MH DIVER). ALL RIGHTS RESERVED.
 * Protected by MH DRIVER Anti-Theft Watermark.
 * ==============================================================================
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Developer Tools Console Watermark & Anti-Theft Signature
console.log(
  '%c⚡ MH DRIVER (MH DIVER) PRO %c\n© 2026 MH DRIVER. All rights reserved.\nPhát triển bởi: MH DRIVER (MH DIVER)\nNghiêm cấm mọi hành vi sao chép hoặc phát tán mã nguồn trái phép.',
  'background: linear-gradient(135deg, #0ea5e9, #6366f1, #a855f7); color: #fff; font-size: 16px; font-weight: 900; padding: 8px 16px; border-radius: 8px;',
  'color: #94a3b8; font-size: 12px; font-family: monospace; line-height: 1.6;'
);

// Global Anti-Tamper Watermark Signature
try {
  Object.defineProperty(window, '__MH_DRIVER__', {
    value: Object.freeze({
      brand: 'MH DRIVER',
      alias: 'MH DIVER',
      copyright: '© 2026 MH DRIVER (MH DIVER). All rights reserved.',
      signature: 'MH_DIVER_ORIGINAL_AUTHOR_SECURE_TOKEN_2026'
    }),
    writable: false,
    configurable: false
  });
} catch (e) {}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
