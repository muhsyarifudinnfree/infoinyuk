export default class AboutPage {
  async render() {
    return `
      <section class="container mx-auto px-4 py-12 animate-fade-in min-h-[80vh]" role="main" aria-label="Halaman tentang InfoinYuk">
        <div class="hero bg-base-200 rounded-box py-12">
          <div class="hero-content text-center">
            <div class="max-w-2xl">
              <h1 class="text-3xl sm:text-4xl font-bold">Tentang InfoinYuk</h1>
              <p class="text-lg sm:text-xl mt-4">
                InfoinYuk adalah platform untuk berbagi informasi dengan mudah. Dibuat sebagai bagian dari proyek
                <strong>Dicoding Belajar Pengembangan Web Intermediate</strong> oleh Muhammad Syarifudin.
              </p>
              <p class="text-base sm:text-lg mt-4">
                Kami percaya bahwa setiap informasi memiliki makna. Dengan InfoinYuk, Anda dapat membagikan pengalaman Anda,
                menambahkan foto, dan menandai lokasi untuk terhubung dengan komunitas.
              </p>
              <div class="mt-8">
                <a href="#/home" class="btn btn-primary" aria-label="Kembali ke halaman beranda">
                  <i class="fas fa-home mr-2"></i> Kembali ke Beranda
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="card bg-base-100 shadow-xl max-w-2xl mx-auto mt-8">
          <div class="card-body">
            <h2 class="card-title text-2xl">Kontak Kami</h2>
            <p class="text-base">
              Punya pertanyaan atau saran? Hubungi kami melalui:
            </p>
            <ul class="list-none mt-4 space-y-2">
              <li>
                <a href="mailto:infoinyuk@infoinyuk.com" class="flex items-center gap-2 text-primary hover:underline" aria-label="Kirim email ke InfoinYuk">
                  <i class="fas fa-envelope"></i> infoinyuk@infoinyuk.com
                </a>
              </li>
              <li>
                <a href="https://github.com/" class="flex items-center gap-2 text-primary hover:underline" aria-label="Kunjungi profil GitHub Muhammad Syarifudin">
                  <i class="fab fa-github"></i> GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // No additional setup needed for static page
  }
}
