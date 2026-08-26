import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { driveUrl } = await req.json();

    if (!driveUrl || typeof driveUrl !== 'string') {
      return NextResponse.json({ error: 'URL Google Drive tidak boleh kosong' }, { status: 400 });
    }

    // Extract File ID from Google Drive URL
    const fileIdMatch =
      driveUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
      driveUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);

    const fileId = fileIdMatch ? fileIdMatch[1] : null;

    if (!fileId) {
      return NextResponse.json(
        { error: 'Format link Google Drive tidak valid. Pastikan link berisi ID file (misal: .../file/d/ID_FILE/...)' },
        { status: 400 }
      );
    }

    // Initial fetch to Google Drive export download URL
    const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    let response = await fetch(directUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    // Handle Google Drive large file confirmation redirect/cookie if any
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('text/html')) {
      const htmlText = await response.text();
      // Check for confirm token in HTML
      const confirmMatch = htmlText.match(/confirm=([a-zA-Z0-9_-]+)/) || htmlText.match(/name="confirm" value="([^"]+)"/);
      if (confirmMatch) {
        const confirmToken = confirmMatch[1];
        const confirmUrl = `https://drive.google.com/uc?export=download&confirm=${confirmToken}&id=${fileId}`;
        response = await fetch(confirmUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
        });
      } else {
        return NextResponse.json(
          { error: 'File Google Drive tidak dapat diakses. Pastikan akses file di-set menjadi "Siapa saja yang memiliki link" (Public).' },
          { status: 403 }
        );
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Gagal mengunduh PDF dari Google Drive (Status: ${response.status})` },
        { status: response.status }
      );
    }

    const pdfArrayBuffer = await response.arrayBuffer();

    return new Response(pdfArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="kotoba_drive_${fileId}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Google Drive Proxy Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal memproses file dari Google Drive' },
      { status: 500 }
    );
  }
}
