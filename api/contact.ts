// Vercel Serverless Function: /api/contact
// Handles lead form submissions and forwards them to the Google Apps Script Web App for Google Sheets logging.

export const config = {
  maxDuration: 15,
};

interface ContactRequestBody {
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  service?: string;
  serviceNeeded?: string;
  message?: string;
  hp?: string; // Honeypot spam prevention
}

export default async function handler(req: any, res: any) {
  // Enforce POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Only POST requests are supported.',
    });
  }

  try {
    // Parse request body if needed
    let body: ContactRequestBody = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({
          success: false,
          error: 'Invalid JSON body.',
        });
      }
    }

    if (!body || typeof body !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Missing request body.',
      });
    }

    const {
      name,
      phone,
      email = '',
      city,
      service,
      serviceNeeded,
      message = '',
      hp = '',
    } = body;

    // Honeypot spam check - if filled, silently return success without forwarding
    if (hp && hp.trim().length > 0) {
      console.warn('Honeypot field triggered, submission dropped.');
      return res.status(200).json({
        success: true,
        message: 'Submission received.',
      });
    }

    // Sanitize and trim values
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanPhone = typeof phone === 'string' ? phone.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim() : '';
    const cleanCity = typeof city === 'string' ? city.trim() : '';
    const cleanService = typeof (service || serviceNeeded) === 'string' ? (service || serviceNeeded).trim() : '';
    const cleanMessage = typeof message === 'string' ? message.trim() : '';

    // Validate required fields
    if (!cleanName || cleanName.length < 2 || cleanName.length > 150) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid full name (2-150 characters).',
      });
    }

    if (!cleanPhone || cleanPhone.length < 7 || cleanPhone.length > 30) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid contact phone number.',
      });
    }

    if (!cleanCity) {
      return res.status(400).json({
        success: false,
        error: 'Please select or provide your city/location.',
      });
    }

    if (!cleanService) {
      return res.status(400).json({
        success: false,
        error: 'Please select the service needed.',
      });
    }

    // Optional email format validation
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address format.',
      });
    }

    // Google Sheets Webhook Configuration
    const webhookUrl =
      process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
      'https://script.google.com/macros/s/AKfycbz0v3r0fYvggUx5qGUFUgqIyRopT687iE_wZqYqCvtAWNTEKtA0ovub2yp60GiQTMh0/exec';

    // Payload mapped strictly to Google Spreadsheet tab specifications
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

    // Forward to Google Apps Script Web App
    const gasResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    if (!gasResponse.ok) {
      const errorStatus = gasResponse.status;
      console.error(`Google Apps Script responded with HTTP error status: ${errorStatus}`);
      return res.status(502).json({
        success: false,
        error: 'Failed to record lead in Google Sheets.',
      });
    }

    const contentType = gasResponse.headers.get('content-type') || '';
    let gasResult: any = {};
    if (contentType.includes('application/json')) {
      gasResult = await gasResponse.json();
    } else {
      const textResult = await gasResponse.text();
      gasResult = { text: textResult, success: true };
    }

    if (gasResult && gasResult.success === false) {
      console.error('Google Apps Script indicated failure:', gasResult);
      return res.status(502).json({
        success: false,
        error: gasResult.error || 'Google Sheets logging failed.',
      });
    }

    return res.status(200).json({
      success: true,
      message: "Thank you. Your request has been received. We'll be in touch shortly.",
    });
  } catch (err: any) {
    console.error('Server error processing /api/contact:', err);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred while processing your request.',
    });
  }
}
