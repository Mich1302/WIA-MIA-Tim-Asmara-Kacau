import http.server
import json
import urllib.request
import os

PORT = 5000
API_KEY = os.environ.get("GEMINI_API_KEY", "")

PINTAR_SYSTEM_PROMPT = """Anda adalah Asisten AI Resmi PINTAR (Platform Layanan Publik Terpadu).
Tugas Anda adalah membantu warga masyarakat dengan sopan, ramah, jelas, dan akurat mengenai layanan publik di platform PINTAR.

Panduan Ketat:
1. Layanan utama PINTAR meliputi:
   - Pengaduan Infrastruktur & Fasilitas Umum (jalan rusak, PJU padam, saluran air tersumbat, halte rusak).
   - Perizinan & Surat Administrasi Kelurahan (surat keterangan domisili, SKU, SKTM, pengantar nikah).
   - Verifikasi & Peninjauan Bantuan Sosial (PKH, BPNT, BLT daerah, salah sasaran bantuan).
   - Informasi Publik & Berita Resmi (pemantauan hasil kerja dan perbaikan fasilitas).
2. Jangan pernah mengarang informasi kebijakan resmi pemerintah di luar yang diketahui, status tiket warga secara spesifik jika tidak ada nomor tiket, atau data pribadi pengguna.
3. Jika ditanya status tiket tertentu, arahkan warga untuk menggunakan menu 'Lacak Tiket' atau mengetikkan nomor tiketnya.
4. Jika tidak mengetahui jawaban pasti terkait kebijakan instansi di luar cakupan PINTAR, sampaikan dengan jujur keterbatasan Anda dan sarankan warga menghubungi kantor kelurahan atau dinas terkait.
5. Jawaban harus ringkas, jelas, berbahasa Indonesia yang baik, dan mudah dipahami masyarakat."""

class PintarChatHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        res = {"status": "ok", "service": "PINTAR AI Chatbot Server", "hasKey": bool(API_KEY)}
        self.wfile.write(json.dumps(res).encode("utf-8"))

    def do_POST(self):
        if self.path == "/api/chat":
            content_length = int(self.headers.get("Content-Length", 0))
            body_bytes = self.rfile.read(content_length)
            try:
                data = json.loads(body_bytes.decode("utf-8"))
            except Exception:
                data = {}

            user_prompt = data.get("prompt", "").strip()
            user_name = data.get("userName", "Warga")

            if not user_prompt:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Prompt tidak boleh kosong"}).encode("utf-8"))
                return

            if API_KEY:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"
                    payload = {
                        "contents": [
                            {"role": "user", "parts": [{"text": f"Sistem: {PINTAR_SYSTEM_PROMPT}\nPengguna Bernama: {user_name}\nPertanyaan Warga: {user_prompt}"}]}
                        ],
                        "generationConfig": {
                            "temperature": 0.4,
                            "maxOutputTokens": 400
                        }
                    }
                    req = urllib.request.Request(
                        url,
                        data=json.dumps(payload).encode("utf-8"),
                        headers={"Content-Type": "application/json"}
                    )
                    with urllib.request.urlopen(req, timeout=12) as response:
                        res_data = json.loads(response.read().decode("utf-8"))
                        reply = res_data["candidates"][0]["content"]["parts"][0]["text"]
                        self._send_json(200, {"reply": reply.strip(), "source": "gemini_ai"})
                        return
                except Exception as e:
                    # Fallback cerdas jika pemanggilan API eksternal gagal
                    reply = self._smart_knowledge_base(user_prompt, user_name)
                    self._send_json(200, {"reply": reply, "source": "pintar_knowledge_base"})
                    return
            else:
                # Local intelligent fallback based on PINTAR knowledge base
                reply = self._smart_knowledge_base(user_prompt, user_name)
                self._send_json(200, {"reply": reply, "source": "pintar_knowledge_base"})
        else:
            self.send_response(404)
            self.end_headers()

    def _smart_knowledge_base(self, q, name):
        ql = q.lower()
        if any(w in ql for w in ["batalkan", "batal", "cancel"]):
            return f"Halo {name}, Anda dapat membatalkan laporan yang baru dibuat melalui menu 'Lacak Tiket'. Buka tiket terkait, lalu tekan tombol 'Batalkan Laporan'. Perlu dicatat, pembatalan hanya dapat dilakukan selama laporan masih berstatus 'Baru Diterima' dan belum diproses petugas."
        elif any(w in ql for w in ["peta", "map", "lokasi", "koordinat"]):
            return "Pada formulir 'Pengaduan Fasilitas Umum', Anda dapat mengklik peta untuk memilih titik kerusakan atau mengaktifkan tombol 'Titik Saya (GPS)'. Koordinat latitude dan longitude akan otomatis terisi untuk memudahkan petugas menemukan lokasi di lapangan."
        elif any(w in ql for w in ["kamera", "foto", "bukti"]):
            return "Anda dapat menyertakan foto bukti melalui 2 pilihan: mengunggah dari galeri/file explorer, atau mengambil foto langsung menggunakan kamera perangkat. PINTAR akan otomatis menyematkan timestamp dokumentasi resmi pada foto yang dikirimkan."
        elif any(w in ql for w in ["bansos", "bantuan sosial", "pkh", "bpnt", "blt"]):
            return "Untuk pelaporan kendala bansos (seperti salah sasaran, layak bantu belum menerima, atau data ganda), silakan pilih menu 'Buat Pengaduan' lalu pilih 'Verifikasi Bansos'. Masukkan nama kepala keluarga dan nomor NIK aktif Anda untuk diverifikasi petugas Dinsos."
        elif any(w in ql for w in ["berita", "informasi publik", "news", "perkembangan"]):
            return "Anda dapat memantau perbaikan fasilitas dan pengumuman resmi pemerintah melalui menu baru 'Informasi Publik'. Di sana tersedia foto perbandingan sebelum dan sesudah pengerjaan oleh petugas lapangan."
        elif any(w in ql for w in ["surat", "domisili", "sktm", "sku", "izin"]):
            return "Untuk permohonan surat administrasi kelurahan (seperti Surat Domisili, SKU, atau SKTM), gunakan menu 'Buat Pengaduan' -> 'Perizinan & Surat Administrasi'. Petugas PTSP Kelurahan akan memproses dokumen dalam 1-3 hari kerja."
        else:
            return f"Terima kasih pertanyaannya, {name}. Sebagai asisten layanan publik PINTAR, saya siap memandu Anda terkait pembuatan laporan fasilitas, bansos, perizinan, pelacakan tiket, serta informasi publik. Bila memerlukan penanganan khusus, Anda dapat langsung membuat laporan melalui menu 'Buat Pengaduan'."

    def _send_json(self, code, obj):
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(obj, ensure_ascii=False).encode("utf-8"))

if __name__ == "__main__":
    server = http.server.HTTPServer(("127.0.0.1", PORT), PintarChatHandler)
    print(f"PINTAR AI Chatbot Server berjalan di http://127.0.0.1:{PORT}")
    server.serve_forever()
