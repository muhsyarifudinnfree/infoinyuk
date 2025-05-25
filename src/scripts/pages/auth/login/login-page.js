import LoginPresenter from './login-presenter';
import * as STORY_API from '../../../data/api';
import * as AUTH_MODEL from '../../../utils/auth';
import useToast from '../../../utils/toast';

export default class LoginPage {
  #presenter = null;

  async render() {
    return `
      <section class="container mx-auto px-4 py-12 min-h-[80vh] flex items-center justify-center animate-fade-in" role="main" aria-label="Formulir masuk">
        <div class="card bg-base-100 shadow-xl w-full max-w-md">
          <div class="card-body">
            <h1 class="text-2xl sm:text-3xl font-bold text-center mb-6">Masuk</h1>
            <form id="login-form" class="flex flex-col gap-6" role="form" aria-labelledby="login-title">
              <div class="form-control">
                <label for="email" class="label">
                  <span class="label-text">Email <span class="text-error" aria-hidden="true">*</span></span>
                </label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  placeholder="Masukkan email" 
                  class="input input-bordered w-full" 
                  required 
                  aria-required="true"
                  aria-describedby="email-error"
                />
                <span id="email-error" class="text-error text-sm hidden">Email tidak valid</span>
              </div>
              <div class="form-control">
                <label for="password" class="label">
                  <span class="label-text">Password <span class="text-error" aria-hidden="true">*</span></span>
                </label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  placeholder="Masukkan password" 
                  class="input input-bordered w-full" 
                  required 
                  aria-required="true"
                  aria-describedby="password-error"
                />
                <span id="password-error" class="text-error text-sm hidden">Password diperlukan</span>
              </div>
              <div id="submit-button-container" class="form-control mt-6">
                <button 
                  class="btn btn-primary w-full" 
                  type="submit" 
                  aria-label="Masuk ke akun"
                >Masuk</button>
              </div>
              <div class="text-center mt-4">
                <p>Belum punya akun? <a href="#/register" class="link link-primary" aria-label="Daftar akun baru">Daftar</a></p>
              </div>
            </form>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter({
      view: this,
      model: STORY_API,
      authModel: AUTH_MODEL,
    });

    this.#setupForm();
  }

  #setupForm() {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const data = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
      };
      await this.#presenter.getLogin(data);
    });
  }

  loginSuccessfully(message) {
    useToast(message, 'success');
    location.hash = '/home';
  }

  loginFailed(message) {
    useToast(message, 'error');
  }

  showSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
      <button 
        class="btn btn-primary w-full" 
        type="submit" 
        disabled 
        aria-disabled="true"
        aria-label="Sedang memproses masuk"
      >
        <span class="loading loading-spinner"></span> Masuk
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
      <button 
        class="btn btn-primary w-full" 
        type="submit" 
        aria-label="Masuk ke akun"
      >Masuk</button>
    `;
  }
}
