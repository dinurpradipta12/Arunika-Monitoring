# Deployment Guide - Cloudflare Pages

## Konfigurasi Build di Cloudflare Pages Dashboard

Pastikan Anda menggunakan konfigurasi berikut di Cloudflare Pages:

### Build Command
```
npm install && npm run build
```

### Build Output Directory
```
dist
```

### Root Directory
```
/
```

### Node.js Version
```
18
```

## Environment Variables

Di Cloudflare Pages Dashboard, navigasi ke **Settings** > **Environment variables** dan tambahkan:

```
VITE_API_KEY=your_google_api_key_here
```

## Langkah-Langkah Deployment

### 1. Persiapan Repository
- Pastikan semua file sudah di-push ke GitHub
- Branch utama: `main` atau `master`

### 2. Koneksi ke Cloudflare Pages
1. Login ke Cloudflare Dashboard
2. Pilih **Pages**
3. Klik **Create a project**
4. Pilih **Connect to Git**
5. Hubungkan GitHub account Anda
6. Pilih repository `Arunika-Monitoring`

### 3. Konfigurasi Build
1. Pilih branch: `main`
2. **Build command**: `npm install && npm run build`
3. **Build output directory**: `dist`
4. **Root directory**: `/` (kosongkan atau /)

### 4. Environment Variables
1. Di bagian **Environment variables**, klik **Add variable**
2. Tambahkan `VITE_API_KEY` dengan nilai API key Anda

### 5. Deploy
- Klik **Save and Deploy**
- Tunggu proses build selesai (biasanya 2-5 menit)
- Cek URL yang diberikan Cloudflare

## Troubleshooting

### ❌ Halaman Blank Setelah Deploy

**Solusi:**
1. Periksa Console di DevTools (F12) untuk error messages
2. Pastikan file `_redirects` ada di folder root
3. Verifikasi `index.html` memiliki `<div id="root"></div>`
4. Periksa build output folder adalah `dist`

### ❌ "Cannot find module"

**Solusi:**
1. Pastikan `npm install` berhasil di build
2. Cek dependencies di `package.json` lengkap
3. Jalankan `npm install` di local dan test dengan `npm run build`

### ❌ Styling Tidak Muncul

**Solusi:**
1. Tailwind CSS dimuat via CDN di `index.html`
2. Periksa Content Security Policy (CSP) headers
3. Buka DevTools dan lihat Network tab untuk CDN load

### ❌ API Key Tidak Terdeteksi

**Solusi:**
1. Pastikan environment variable sudah set di Cloudflare
2. Gunakan prefix `VITE_` untuk environment variable
3. Restart build setelah mengubah environment variable

## File Penting untuk Deployment

- ✅ `vite.config.ts` - Konfigurasi build Vite
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `package.json` - Dependencies dan scripts
- ✅ `index.html` - Entry point HTML dengan root div
- ✅ `_redirects` - Routing untuk SPA
- ✅ `.nvmrc` - Node.js version (18)
- ✅ `.env.example` - Contoh environment variables

## Tips Deployment

1. **Test Locally First**
   ```bash
   npm install
   npm run build
   npm run preview
   ```

2. **Periksa Build Output**
   - `dist` folder harus berisi file HTML, JS, CSS
   - Minimal `dist/index.html` ada

3. **Monitor Build Logs**
   - Klik pada deployment untuk melihat build logs
   - Cari warning atau error messages

4. **Use Custom Domain** (Opsional)
   - Di Cloudflare Pages Settings > Custom domains
   - Pointing ke nameserver Cloudflare

## Kapan Rebuild Otomatis Terjadi

- Setelah push ke GitHub branch yang connected
- Setup automatic deploys untuk production ready
- Manual redeploy tersedia di Cloudflare dashboard

---

Untuk pertanyaan lebih lanjut, buka Cloudflare Documentation:
https://developers.cloudflare.com/pages/
