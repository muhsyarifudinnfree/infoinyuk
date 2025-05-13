import Map from "../../utils/maps";
import DetailPresenter from "./detail-presenter";
import * as STORY_API from "../../data/api";
import { parseActivePathname } from "../../utils/url-parser";
import { generatePopoutMap } from "../../components/templates";
import { getLocationName } from "../../utils/geocode";

export default class Detail {
  #presenter;
  #map;
  #pendingMarkers = {
    coordinate: [0, 0],
    markerOptions: {},
    popupOptions: {},
  };

  async render() {
    return `
      <section id="detail-container" class="container mx-auto px-4 py-12 animate-fade-in min-h-[80vh]" role="main" aria-label="Detail cerita">
        <div class="mb-6">
          <a href="#/home" class="btn btn-outline btn-neutral" aria-label="Kembali ke daftar cerita">Kembali</a>
        </div>
        <div id="detail-story"></div>
        <div id="detail-story-loading-container" class="flex items-center justify-center h-64">
          <span class="loading loading-spinner loading-lg" aria-label="Memuat detail cerita"></span>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new DetailPresenter(parseActivePathname().id, {
      view: this,
      model: STORY_API,
    });

    await this.#presenter.initialStory();
  }

  async populateStory(message, story) {
    if (!story) {
      this.populateStoryError(message);
      return;
    }

    const container = document.getElementById("detail-story");

    // Fetch location name if coordinates are available
    let locationName = "Lokasi tidak tersedia";
    if (story.location && story.location.latitude && story.location.longitude) {
      try {
        locationName = await getLocationName(story.location.latitude, story.location.longitude);
      } catch (error) {
        console.error("Failed to fetch location name:", error);
        locationName = "Gagal memuat nama lokasi";
      }
    }

    const html = `
      <div class="flex flex-col gap-6" role="article" aria-labelledby="story-title">
        <div class="text-center">
          <h1 id="story-title" class="text-2xl sm:text-3xl md:text-4xl font-bold">${story.name}</h1>
          <p class="text-base sm:text-lg mt-2 italic">"${story.description}"</p>
          <p class="text-base sm:text-lg mt-2"><strong>Lokasi:</strong> ${locationName}</p>
          <p class="text-base sm:text-lg mt-2"><strong>Dibuat pada:</strong> ${new Date(story.createdAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}</p>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body p-0">
              <img src="${story.photoUrl}" alt="Gambar cerita ${story.name}" class="w-full h-80 sm:h-96 object-contain rounded-t-lg"/>
            </div>
          </div>
          ${
            story.location
              ? `
                <div id="map" class="h-80 sm:h-96 rounded-lg card bg-base-100 shadow-xl">
                  <div class="card-body p-0">
                    <div id="map-inner" class="h-full w-full" role="region" aria-label="Peta lokasi cerita"></div>
                  </div>
                </div>
              `
              : ""
          }
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.storeMarkerData(story);
    if (story.location) {
      await this.initialMap();
    }
  }

  storeMarkerData(story) {
    if (
      !story?.location ||
      story.location.latitude == null ||
      story.location.longitude == null
    ) {
      console.warn("No valid location data for story:", story?.id);
      return;
    }

    const lat = parseFloat(story.location.latitude);
    const lng = parseFloat(story.location.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      console.warn("Invalid coordinates for story:", story.id);
      return;
    }

    this.#pendingMarkers = {
      coordinate: [lat, lng],
      markerOptions: { alt: `${story.name}-${story.description}` },
      popupOptions: {
        content: generatePopoutMap({ story }),
      },
    };
  }

  processPendingMarkers() {
    if (!this.#map || !this.#pendingMarkers) {
      console.warn("Map or pending markers not available");
      return;
    }

    const { coordinate, markerOptions, popupOptions } = this.#pendingMarkers;
    if (coordinate && markerOptions && popupOptions) {
      console.log("Adding marker at coordinates:", coordinate);
      this.#map.addMarker(coordinate, markerOptions, popupOptions);
    }
  }

  async initialMap() {
    try {
      const mapElement = document.getElementById("map-inner");
      if (!mapElement) {
        console.error("Map element #map-inner not found");
        return;
      }

      if (mapElement.clientHeight === 0) {
        console.log("Setting map-inner height to 100%");
        mapElement.style.height = "100%";
      }

      console.log("Initializing map with coordinates:", this.#pendingMarkers.coordinate);
      this.#map = await Map.build("#map-inner", {
        zoom: 12,
        center: this.#pendingMarkers.coordinate.length === 2 && !isNaN(this.#pendingMarkers.coordinate[0]) && !isNaN(this.#pendingMarkers.coordinate[1])
          ? this.#pendingMarkers.coordinate
          : [-6.175389, 106.827139], // Fallback to Jakarta coordinates
        locate: false,
      });

      this.processPendingMarkers();
    } catch (error) {
      console.error("Failed to initialize map:", error);
    }
  }

  populateStoryError(message) {
    const container = document.getElementById("detail-story");
    container.innerHTML = `
      <div class="alert alert-error shadow-lg animate-fade-in" role="alert">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>${message || "Gagal memuat cerita"}</span>
        </div>
      </div>
    `;
  }

  showLoading() {
    const container = document.getElementById("detail-story-loading-container");
    container.classList.remove("hidden");
  }

  hideLoading() {
    const container = document.getElementById("detail-story-loading-container");
    container.classList.add("hidden");
  }
}