import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { getAccessToken, checkUnauthenticatedRouteOnly, checkAuthenticatedRoute } from '../utils/auth';
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
      console.warn("Drawer button or navigation drawer not found");
      return;
    }

    this.#drawerButton.addEventListener('click', () => {
      const isHidden = this.#navigationDrawer.classList.contains('hidden');
      this.#navigationDrawer.classList.toggle('hidden', !isHidden);
      this.#navigationDrawer.classList.toggle('animate-slide-down', isHidden);
      this.#drawerButton.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
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
        <div class="alert alert-error shadow-lg animate-fade-in">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h tombé6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Halaman tidak dapat dimuat</span>
          </div>
        </div>
      `;
    }
  }
}

export default App;