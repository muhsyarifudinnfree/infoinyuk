import SaveinfoPresenter from './save-info-presenter';
import * as STORY_API from '../../data/api';
import Database from '../../utils/database';
import { generateCardStory } from '../../components/templates';
import useToast from '../../utils/toast';

export default class SaveinfoPage {
  #presenter;

  async render() {
    return `
      <section class="container mx-auto px-4 py-12 animate-fade-in min-h-[80vh]" role="main" aria-label="Daftar informasi tersimpan">
        <h1 class="text-2xl sm:text-3xl font-bold text-center mb-8">Informasi Tersimpan</h1>
        <div id="saved-stories-list"></div>
        <div id="stories-loading-container" class="flex items-center justify-center h-64">
          <span class="loading loading-spinner loading-lg" aria-label="Memuat daftar informasi tersimpan"></span>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new SaveinfoPresenter({
      view: this,
      model: STORY_API,
      database: Database,
    });

    await this.#presenter.initialSavedStories();
  }

  populateSavedStoriesList(message, stories) {
    const container = document.getElementById('saved-stories-list');
    if (!stories || stories.length === 0) {
      container.innerHTML = `
        <section class="container mx-auto px-4 h-80 sm:h-96 flex items-center justify-center bg-primary text-primary-content rounded-lg mb-8" role="region" aria-label="Tidak ada informasi tersimpan">
          <div class="hero bg-primary rounded-lg flex items-center justify-center w-full">
            <div class="hero-content text-center">
              <div class="max-w-md">
                <h1 class="text-3xl sm:text-4xl font-bold mb-6 text-primary-content">Tidak Ada Informasi Tersimpan</h1>
                <p class="text-lg sm:text-xl mb-8 text-primary-content">Tidak ada informasi yang tersimpan. Kembali ke halaman utama untuk menyimpan informasi!</p>
                <a href="#/home" class="btn bg-secondary text-secondary-content btn-lg hover:bg-secondary-focus" aria-label="Kembali ke halaman utama">Kembali</a>
              </div>
            </div>
          </div>
        </section>
      `;
      return;
    }

    container.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${stories
          .map(
            (story) => `
            <div class="relative">
              ${generateCardStory(story)}
              <button 
                data-storyid="${story.id}" 
                class="btn btn-error btn-sm absolute top-2 right-2 action-delete-story" 
                aria-label="Hapus informasi ${story.name || 'tanpa judul'} dari daftar tersimpan"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          `
          )
          .join('')}
      </div>
    `;

    // Add event listeners for delete buttons
    container.querySelectorAll('.action-delete-story').forEach((button) => {
      button.addEventListener('click', async () => {
        const storyId = button.getAttribute('data-storyid');
        await this.#presenter.deleteSavedStory(storyId);
      });
    });
  }

  populateSavedStoriesError(message) {
    const container = document.getElementById('saved-stories-list');
    container.innerHTML = `
      <div class="alert alert-error shadow-lg animate-fade-in" role="alert">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>${message || 'Gagal memuat informasi tersimpan'}</span>
        </div>
      </div>
    `;
  }

  showLoading() {
    const container = document.getElementById('stories-loading-container');
    container.classList.remove('hidden');
  }

  hideLoading() {
    const container = document.getElementById('stories-loading-container');
    container.classList.add('hidden');
  }
}
