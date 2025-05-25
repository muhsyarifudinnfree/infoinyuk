import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import {
  getAccessToken,
  checkUnauthenticatedRouteOnly,
  checkAuthenticatedRoute,
} from '../utils/auth';
import Camera from '../utils/camera';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
  }

  #setupDrawer() {
    if (!this.#drawerButton || !this.#navigationDrawer) {
      console.warn('Drawer button or navigation drawer not found');
      return;
    }

    this.#drawerButton.addEventListener('click', () => {
      const isHidden = this.#navigationDrawer.classList.contains('hidden');
      this.#navigationDrawer.classList.toggle('hidden', !isHidden);
      this.#navigationDrawer.classList.toggle('animate-slide-down', isHidden);
      this.#drawerButton.setAttribute(
        'aria-expanded',
        isHidden ? 'true' : 'false'
      );
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.add('hidden');
        this.#navigationDrawer.classList.remove('animate-slide-down');
        this.#drawerButton.setAttribute('aria-expanded', 'false');
      }
    });

    this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        this.#navigationDrawer.classList.add('hidden');
        this.#navigationDrawer.classList.remove('animate-slide-down');
        this.#drawerButton.setAttribute('aria-expanded', 'false');
      });
    });
  }

  async renderPage() {
    try {
      const url = getActiveRoute();
      const isAuthenticated = !!getAccessToken();

      // Redirect authenticated users from /, /login, /register to /home
      if (isAuthenticated && ['/', '/login', '/register'].includes(url)) {
        location.hash = '/home';
        return;
      }

      let page = routes[url];

      if (!page) {
        throw new Error(`Page not found for route: ${url}`);
      }

      // Apply authentication checks
      if (['/login', '/register'].includes(url)) {
        page = checkUnauthenticatedRouteOnly(page);
      } else if (['/home', '/add-info', '/story/:id'].includes(url)) {
        page = checkAuthenticatedRoute(page);
      }

      if (!page) {
        return; // Redirect handled by auth utils
      }

      // Stop all camera streams before rendering new page
      Camera.stopAllStreams();

      // Use View Transition API if supported
      if (!document.startViewTransition) {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
        return;
      }

      // Update DOM with view transition
      document.startViewTransition(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      });
    } catch (error) {
      console.error('Error rendering page:', error);
      this.#content.innerHTML = `
      <section class="container mx-auto px-4 py-12 animate-fade-in min-h-[60vh] flex items-center justify-center bg-primary text-primary-content" role="main" aria-label="Halaman error">
          <div class="hero min-h-[40vh] bg-primary rounded-lg flex items-center justify-center">
            <div class="hero-content text-center">
              <div class="max-w-md">
                <h1 class="text-3xl sm:text-4xl font-bold mb-6 text-primary-content">Halaman Tidak Ditemukan</h1>
                <p class="text-lg sm:text-xl mb-8 text-primary-content">Maaf, halaman yang Anda cari tidak tersedia. Kembali ke halaman utama untuk melihat informasi dari komunitas kami!</p>
                <a href="#/home" class="btn bg-secondary text-secondary-content btn-lg hover:bg-secondary-focus" aria-label="Kembali ke halaman utama">Kembali</a>
              </div>
            </div>
          </div>
        </section>
      `;
    }
  }
}

export default App;
