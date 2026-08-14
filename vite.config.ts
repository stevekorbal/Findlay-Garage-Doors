import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function apiContactPlugin(): Plugin {
  return {
    name: 'api-contact-dev-server',
    configureServer(server) {
      server.middlewares.use('/api/contact', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
          return;
        }

        let rawBody = '';
        req.on('data', (chunk) => {
          rawBody += chunk;
        });

        req.on('end', async () => {
          try {
            const body = JSON.parse(rawBody || '{}');
            const { name, phone, email = '', city, service, serviceNeeded, message = '', hp = '' } = body;

            if (hp && hp.trim().length > 0) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'Submission received.' }));
              return;
            }

            const cleanName = typeof name === 'string' ? name.trim() : '';
            const cleanPhone = typeof phone === 'string' ? phone.trim() : '';
            const cleanEmail = typeof email === 'string' ? email.trim() : '';
            const cleanCity = typeof city === 'string' ? city.trim() : '';
            const cleanService = typeof (service || serviceNeeded) === 'string' ? (service || serviceNeeded).trim() : '';
            const cleanMessage = typeof message === 'string' ? message.trim() : '';

            if (!cleanName || !cleanPhone || !cleanCity || !cleanService) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Please fill in all required fields.' }));
              return;
            }

            const webhookUrl =
              process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
              'https://script.google.com/macros/s/AKfycbz0v3r0fYvggUx5qGUFUgqIyRopT687iE_wZqYqCvtAWNTEKtA0ovub2yp60GiQTMh0/exec';

            const payload = {
              sheet: 'Findlay',
              website: 'findlaygaragedoorrepair.com',
              name: cleanName,
              phone: cleanPhone,
              email: cleanEmail,
              city: cleanCity,
              service: cleanService,
              message: cleanMessage,
            };

            const gasResponse = await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
              redirect: 'follow',
            });

            if (!gasResponse.ok) {
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'Google Sheets webhook request failed' }));
              return;
            }

            const contentType = gasResponse.headers.get('content-type') || '';
            let gasResult: any = {};
            if (contentType.includes('application/json')) {
              gasResult = await gasResponse.json();
            } else {
              gasResult = { success: true };
            }

            if (gasResult && gasResult.success === false) {
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: gasResult.error || 'Google Sheets logging failed.' }));
              return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              message: "Thank you. Your request has been received. We'll be in touch shortly."
            }));
          } catch (error: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: error.message || 'Internal server error' }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiContactPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
