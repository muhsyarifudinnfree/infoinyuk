import RegisterPresenter from './register-presenter';
import * as STORY_API from '../../../data/api';
import useToast from '../../../utils/toast';

export default class RegisterPage {
  #presenter = null;

  async render() {
    return `
      <section class="container mx-auto px-4 py-12 min-h-[80vh] flex items-center justify-center animate-fade-in" role="main" aria-label="Formulir pendaftaran">
        <div class="card bg-base-100 shadow-xl w-full max-w-md">
          <div class="card-body">
            <h1 class="text-2xl sm:text-3xl font-bold text-center mb-6">Daftar</h1>
            <form id="register-form" class="flex flex-col gap-6" role="form" aria-labelledby="register-title">
              <div class="form-control">
                <label for="name" class="label">
                  <span class="label-text">Nama <span class="text-error" aria-hidden="true">*</span></span>
                </label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  placeholder="Masukkan nama" 
                  class="input input-bordered w-full" 
                  required 
                  aria-required="true"
                  aria-describedby="name-error"
                />
                <span id="name-error" class="text-error text-sm hidden">Nama diperlukan</span>
              </div>
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
                  aria-label="Daftar akun baru"
                >Daftar Akun</button>
              </div>
              <div class="text-center mt-4">
                <p>Sudah punya akun? <a href="#/login" class="link link-primary" aria-label="Masuk ke akun">Masuk</a></p>
              </div>
            </form>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter({
      view: this,
      model: STORY_API,
    });

    this.#setupForm();
  }

  #setupForm() {
    document
      .getElementById('register-form')
      .addEventListener('submit', async (event) => {
        event.preventDefault();

        const data = {
          name: document.getElementById('name').value,
          email: document.getElementById('email').value,
          password: document.getElementById('password').value,
        };
        await this.#presenter.getRegistered(data);
      });
  }

  registeredSuccessfully(message) {
    useToast(message, 'success');
    location.hash = '/login';
  }

  registeredFailed(message) {
    useToast(message, 'error');
  }

  showSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
      <button 
        class="btn btn-primary w-full" 
        type="submit" 
        disabled 
        aria-disabled="true"
        aria-label="Sedang memproses pendaftaran"
      >
        <span class="loading loading-spinner"></span> Daftar Akun
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
      <button 
        class="btn btn-primary w-full" 
        type="submit" 
        aria-label="Daftar akun baru"
      >Daftar Akun</button>
    `;
  }
}
