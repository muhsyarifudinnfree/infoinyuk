import HomePresenter from './home-presenter';
import * as STORY_API from '../../data/api';
import Map from '../../utils/maps';
import {
  generateCardStory,
  generatePopoutMap,
} from '../../components/templates';

export default class HomePage {
  #presenter;
  #map;

  async render() {
    return `
      <section class="container mx-auto px-4 py-12 animate-fade-in min-h-[80vh]" role="main" aria-label="Daftar semua informasi">
        <h1 class="text-2xl sm:text-3xl font-bold text-center mb-8">Semua Informasi</h1>
        <div id="map" class="h-80 sm:h-96 rounded-lg mb-8" role="region" aria-label="Peta lokasi informasi"></div>
        <div id="map-loading-container" class=" flex items-center justify-center h-80 sm:h-96 bg-base-200 rounded-lg">
          <span class="loading loading-spinner loading-lg" aria-label="Memuat peta"></span>
        </div>
        <div id="stories-list" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"></div>
        <div id="stories-loading-container" class=" flex items-center justify-center h-64">
          <span class="loading loading-spinner loading-lg" aria-label="Memuat daftar informasi"></span>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: STORY_API,
    });

    await this.#presenter.initialStories();
  }

  async initialMap() {
    try {
      const mapElement = document.getElementById('map');
      if (mapElement && mapElement.clientHeight === 0) {
        mapElement.style.height = '384px';
      }

      this.#map = await Map.build('#map', {
        zoom: 10,
        locate: true,
      });
    } catch (error) {
      console.error('Failed to initialize map:', error);
    }
  }

  populateStoriesList(message, stories) {
    const container = document.getElementById('stories-list');
    container.innerHTML = stories
      .map((story) => generateCardStory(story))
      .join('');

    stories.forEach((story) => {
      if (story.location) {
        this.#map?.addMarker(
          [story.location.latitude, story.location.longitude],
          { alt: `${story.name}-${story.description}` },
          { content: generatePopoutMap({ story }) }
        );
      }
    });
  }

  populateStoriesListError(message) {
    const container = document.getElementById('stories-list');
    container.innerHTML = `
      <div class="alert alert-error shadow-lg animate-fade-in" role="alert">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>${message || 'Gagal memuat informasi'}</span>
        </div>
      </div>
    `;
  }

  showMapLoading() {
    const container = document.getElementById('map-loading-container');
    container.classList.remove('hidden');
  }

  hideMapLoading() {
    const container = document.getElementById('map-loading-container');
    container.classList.add('hidden');
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
