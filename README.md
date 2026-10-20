# Kotoba Flashcards (言葉)

Aplikasi web flashcard modern untuk belajar dan menghafal kosakata Bahasa Jepang (Minna no Nihongo) yang dilengkapi fitur import PDF otomatis dan Asisten AI pintar.

---

## Fitur Utama

- **Import Kosakata dari PDF**:
  - Upload file PDF langsung atau tempel link PDF dari Google Drive publik.
  - Ekstraksi tabel otomatis menggunakan AI (Google Gemini) dan fallback karakter (Kanji, Kana, Romaji).
  - Editor tabel bawaan untuk mengoreksi atau mengedit kata sebelum disimpan.

- **Belajar dengan Flashcard**:
  - **Pilih Multi-Bab**: Bebas memilih satu atau beberapa bab sekaligus (misal: Bab 1, 4, 6).
  - **Filter Nomor & Acak**: Batasi rentang nomor kosakata dan acak urutan kartu (*shuffle*).
  - **Tampilan Depan Fleksibel**: Pilih sisi depan kartu menampilkan Hiragana/Kana, Kanji, atau Arti bahasa Indonesia.
  - **Mode Layar Penuh (*Fullscreen*)**: Belajar fokus dengan navigasi keyboard (`Spasi`/`Enter` untuk membalik kartu, `Panah Kiri`/`Kanan` untuk navigasi).

- **Tanya Asisten AI (Kotoba Sensei)**:
  - AI mempelajari materi kosakata dari bab-bab yang dipilih.
  - Tanya contoh kalimat (*reibun*), penjelasan tata bahasa (*bunpou*), perbedaan kata, atau minta kuis latihan interaktif.
  - Kolom chat otomatis memanjang ke bawah dengan **Shift + Enter**.
  - Mendukung mode Layar Penuh (*Fullscreen*).

- **Penyimpanan Data**:
  - Terintegrasi dengan Firebase Firestore (dengan caching multi-tab).
  - Fallback otomatis ke `localStorage` browser jika Firebase belum dikonfigurasi.

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router) & [React 19](https://react.dev/)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI**: [Google Gemini API](https://ai.google.dev/) (`gemini-3.8-flash`)
- **Database**: [Firebase Firestore](https://firebase.google.com/)

---

## Memulai (Getting Started)

### 1. Clone & Install Dependensi

```bash
git clone https://github.com/username/flashcard-nihongo.git
cd flashcard-nihongo
pnpm install
```

### 2. Konfigurasi Environment Variable

Salin file `.env.example` menjadi `.env.local`:

```bash
cp .env.example .env.local
```

Buka `.env.local` dan lengkapi konfigurasi:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# Google Gemini API Key
GEMINI_API_KEY="your-gemini-api-key"
```

### 3. Jalankan Aplikasi

```bash
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## Lisensi

Private personal project.
