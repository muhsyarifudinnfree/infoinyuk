export default class BerandaPage {
  async render() {
    return `
      <section class="container mx-auto px-4 py-12 animate-fade-in">
        <div class="hero min-h-[50vh] bg-base-200 rounded-lg flex items-center justify-center">
          <div class="hero-content text-center">
            <div class="max-w-md">
              <h1 class="text-5xl font-bold mb-6">Selamat Datang di InfoinYuk</h1>
              <p class="text-xl mb-8">Bagikan informasi menarik dari sekitarmu. Temukan inspirasi dari komunitas kami!</p>
              <a href="#/login" class="btn btn-primary btn-lg">Mulai Sekarang</a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // No dynamic content needed for static landing page
  }
}
