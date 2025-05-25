import * as STORY_API from '../../data/api';
import AddinfoPresenter from './add-info-presenter';
import { convertBase64ToBlob } from '../../utils';
import Camera from '../../utils/camera';
import Map from '../../utils/maps';
import useToast from '../../utils/toast';

export default class Addinfo {
  #presenter;
  #form;
  #camera;
  #isCameraOpen = false;
  #takenPicture;
  #map;

  async render() {
    return `
      <section class="container mx-auto px-4 py-12 animate-fade-in min-h-[80vh]" role="main" aria-label="Formulir tambah informasi">
        <div class="text-center mb-8">
          <h1 class="text-2xl sm:text-3xl font-bold">Informasi Apa Hari Ini?</h1>
          <p class="text-base sm:text-lg mt-2">Lengkapi form di bawah untuk membagikan informasi</p>
        </div>
        <div class="card bg-base-100 shadow-xl w-full max-w-2xl mx-auto">
          <div class="card-body">
            <form id="add-info-form" class="flex flex-col gap-6" role="form" aria-labelledby="add-info-title">
              <div class="form-control">
                <label for="description" class="label">
                  <span class="label-text">Deskripsi <span class="text-error" aria-hidden="true">*</span></span>
                </label>
                <textarea 
                  id="description" 
                  name="description" 
                  placeholder="Informasikan kisahmu di sini..." 
                  required 
                  class="textarea textarea-bordered h-32 w-full" 
                  aria-required="true"
                  aria-describedby="description-error"
                ></textarea>
                <span id="description-error" class="text-error text-sm hidden">Deskripsi diperlukan</span>
              </div>
              <div class="form-control">
                <label for="input-picture" class="label">
                  <span class="label-text">Foto <span class="text-error" aria-hidden="true">*</span></span>
                </label>
                <div class="flex flex-col sm:flex-row gap-4">
                  <button 
                    id="action-input-picture" 
                    type="button" 
                    class="btn btn-outline btn-neutral w-full sm:w-auto" 
                    aria-label="Pilih gambar dari perangkat"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Pilih Gambar
                  </button>
                  <input
                    id="input-picture"
                    name="documentations"
                    type="file"
                    accept="image/*"
                    hidden
                    aria-hidden="true"
                  >
                  <button 
                    id="action-open-camera" 
                    type="button" 
                    class="btn btn-outline btn-neutral w-full sm:w-auto" 
                    aria-label="Buka kamera untuk mengambil gambar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Buka Kamera
                  </button>
                </div>
                <div id="camera-container" class="card bg-base-100 shadow-md mt-4 hidden">
                  <div class="card-body">
                    <video id="camera-video" class="rounded-lg w-full" aria-label="Pratinjau kamera">
                      Video stream tidak tersedia.
                    </video>
                    <canvas id="camera-canvas" class="hidden" aria-hidden="true"></canvas>
                    <div class="form-control mt-4">
                      <label for="camera-select" class="label">
                        <span class="label-text">Pilih Kamera</span>
                      </label>
                      <select 
                        id="camera-select" 
                        class="select select-bordered w-full" 
                        aria-label="Pilih perangkat kamera"
                      ></select>
                      <button 
                        id="camera-take-button" 
                        class="btn btn-neutral mt-4" 
                        type="button" 
                        aria-label="Ambil gambar dari kamera"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        Ambil Gambar
                      </button>
                    </div>
                  </div>
                </div>
                <div id="documentations-taken-list" class="mt-4"></div>
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Lokasi</span>
                </label>
                <div id="map" class="h-80 rounded-lg" role="region" aria-label="Peta interaktif untuk memilih lokasi"></div>
                <div id="map-loading-container" class="flex items-center justify-center h-80 bg-base-200 rounded-lg">
                  <span class="loading loading-spinner loading-lg" aria-label="Memuat peta"></span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div class="form-control">
                    <label for="latitude" class="label">
                      <span class="label-text">Latitude</span>
                    </label>
                    <input 
                      type="number" 
                      id="latitude" 
                      name="latitude" 
                      value="-6.175389" 
                      class="input input-bordered w-full" 
                      disabled 
                      aria-disabled="true"
                      aria-label="Koordinat latitude"
                    />
                  </div>
                  <div class="form-control">
                    <label for="longitude" class="label">
                      <span class="label-text">Longitude</span>
                    </label>
                    <input 
                      type="number" 
                      id="longitude" 
                      name="longitude" 
                      value="106.827139" 
                      class="input input-bordered w-full" 
                      disabled 
                      aria-disabled="true"
                      aria-label="Koordinat longitude"
                    />
                  </div>
                </div>
              </div>
              <div id="submit-button-container" class="form-control mt-6">
                <button 
                  type="submit" 
                  id="submit-button" 
                  class="btn btn-primary w-full" 
                  aria-label="Kirim info baru"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Kirim Informasi
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new AddinfoPresenter({
      view: this,
      model: STORY_API,
    });

    this.#takenPicture = null;
    this.#presenter.showNewFormMap();
    this.#setupForm();
  }

  #setupForm() {
    this.#form = document.getElementById('add-info-form');
    this.#form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!this.#takenPicture) {
        useToast('Silakan ambil atau pilih gambar terlebih dahulu', 'error');
        return;
      }

      const data = {
        description: this.#form.description.value,
        photo: this.#takenPicture.blob,
        lat: parseFloat(this.#form.latitude.value),
        lon: parseFloat(this.#form.longitude.value),
      };

      await this.#presenter.postinfo(data);
    });

    const actionInputPicture = document.getElementById('action-input-picture');
    const inputPicture = document.getElementById('input-picture');
    const cameraContainer = document.getElementById('camera-container');
    const actionOpenCamera = document.getElementById('action-open-camera');

    actionInputPicture?.addEventListener('click', () => {
      inputPicture.click();
    });

    inputPicture?.addEventListener('change', async (event) => {
      const insertingPicture = event.target.files?.[0];
      if (insertingPicture) {
        this.#takenPicture = { blob: insertingPicture };
        await this.#populateTakenPicture();
      }
    });

    actionOpenCamera?.addEventListener('click', async (event) => {
      cameraContainer.classList.toggle('hidden');
      this.#isCameraOpen = !this.#isCameraOpen;
      if (this.#isCameraOpen) {
        event.currentTarget.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Tutup Kamera
        `;
        event.currentTarget.setAttribute('aria-label', 'Tutup kamera');
        this.#setupCamera();
        await this.#camera?.launch();
      } else {
        event.currentTarget.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Buka Kamera
        `;
        event.currentTarget.setAttribute(
          'aria-label',
          'Buka kamera untuk mengambil gambar'
        );
        this.#camera?.stop();
        Camera.stopAllStreams(); // Stop all streams when closing camera
        this.#camera = null; // Reset camera object to ensure fresh initialization
      }
    });
  }

  async initialMap() {
    try {
      const mapElement = document.getElementById('map');
      if (mapElement && mapElement.clientHeight === 0) {
        mapElement.style.height = '320px';
      }

      this.#map = await Map.build('#map', {
        zoom: 10,
        locate: true,
      });

      const centeredCoordinate = this.#map.getCenter();

      if (
        this.#validateCoordinates(
          centeredCoordinate.latitude,
          centeredCoordinate.longitude
        )
      ) {
        this.#updateLatLngInput(
          centeredCoordinate.latitude,
          centeredCoordinate.longitude
        );

        const draggableMarker = this.#map.addMarker(
          [centeredCoordinate.latitude, centeredCoordinate.longitude],
          { draggable: true }
        );

        if (draggableMarker) {
          draggableMarker.addEventListener('move', (event) => {
            const coordinate = event.target.getLatLng();
            if (this.#validateCoordinates(coordinate.lat, coordinate.lng)) {
              this.#updateLatLngInput(coordinate.lat, coordinate.lng);
            }
          });

          this.#map.addMapEventListener('click', (event) => {
            const mouseEvent = event;
            if (
              this.#validateCoordinates(
                mouseEvent.latlng.lat,
                mouseEvent.latlng.lng
              )
            ) {
              draggableMarker.setLatLng(mouseEvent.latlng);
              this.#updateLatLngInput(
                mouseEvent.latlng.lat,
                mouseEvent.latlng.lng
              );
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to initialize map:', error);
      useToast('Gagal memuat peta', 'error');
    }
  }

  #validateCoordinates(lat, lng) {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  }

  #updateLatLngInput(latitude, longitude) {
    if (!this.#form) return;

    const lat = parseFloat(latitude.toFixed(6));
    const lng = parseFloat(longitude.toFixed(6));

    const longitudeInput = this.#form.elements.namedItem('longitude');
    const latitudeInput = this.#form.elements.namedItem('latitude');

    if (longitudeInput) longitudeInput.value = lng;
    if (latitudeInput) latitudeInput.value = lat;
  }

  async #addTakenPicture(image) {
    let blob = image;
    if (typeof image === 'string') {
      blob = await convertBase64ToBlob(image, 'image/png');
    }
    if (blob) {
      this.#takenPicture = { blob };
    }
  }

  #setupCamera() {
    // Initialize a new camera instance
    this.#camera = new Camera({
      video: document.getElementById('camera-video'),
      canvas: document.getElementById('camera-canvas'),
      cameraSelect: document.getElementById('camera-select'),
    });

    this.#camera.addCheeseButtonListener(
      document.getElementById('camera-take-button'),
      async () => {
        const image = await this.#camera?.takePicture();
        if (image) {
          await this.#addTakenPicture(image);
          await this.#populateTakenPicture();
        }
      }
    );
  }

  async #populateTakenPicture() {
    if (!this.#takenPicture) return;

    const imageUrl = URL.createObjectURL(this.#takenPicture.blob);
    const html = `
      <div class="relative w-full h-64 card bg-base-100 shadow-md animate-fade-in" role="figure" aria-label="Pratinjau gambar yang dipilih">
        <img 
          id="picture-preview"
          src="${imageUrl}"
          alt="Pratinjau gambar yang akan diunggah"
          class="object-contain rounded-lg w-full h-full"
        />
        <button 
          id="action-delete-picture" 
          type="button" 
          class="btn btn-error btn-sm absolute top-2 right-2" 
          aria-label="Hapus gambar yang dipilih"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    `;
    const container = document.getElementById('documentations-taken-list');
    container.innerHTML = html;

    const deleteButton = document.getElementById('action-delete-picture');
    deleteButton.addEventListener('click', () => {
      this.#takenPicture = null;
      container.innerHTML = '';
    });
  }

  storeSuccessfully(message) {
    useToast(message, 'success');
    this.clearForm();
    location.hash = '/home';
  }

  storeFailed(message) {
    useToast(message, 'error');
  }

  clearForm() {
    this.#form?.reset();
    document.getElementById('documentations-taken-list').innerHTML = '';
    this.#takenPicture = null;
    this.#camera?.stop();
    Camera.stopAllStreams(); // Stop all streams when clearing form
    this.#camera = null; // Reset camera object
    this.#isCameraOpen = false;
    const actionOpenCamera = document.getElementById('action-open-camera');
    if (actionOpenCamera) {
      actionOpenCamera.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Buka Kamera
      `;
      actionOpenCamera.setAttribute(
        'aria-label',
        'Buka kamera untuk mengambil gambar'
      );
    }
    document.getElementById('camera-container').classList.add('hidden');
  }

  showSubmitLoadingButton() {
    const submitButtonContainer = document.getElementById(
      'submit-button-container'
    );
    if (submitButtonContainer) {
      submitButtonContainer.innerHTML = `
        <button 
          class="btn btn-primary w-full" 
          type="submit" 
          disabled 
          aria-disabled="true"
          aria-label="Sedang mengirim informasi"
        >
          <span class="loading loading-spinner" aria-hidden="true"></span> Kirim Informasi
        </button>
      `;
    }
  }

  hideSubmitLoadingButton() {
    const submitButtonContainer = document.getElementById(
      'submit-button-container'
    );
    if (submitButtonContainer) {
      submitButtonContainer.innerHTML = `
        <button 
          class="btn btn-primary w-full" 
          type="submit" 
          aria-label="Kirim informasi baru"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Kirim Informasi
        </button>
      `;
    }
  }

  showMapLoading() {
    const container = document.getElementById('map-loading-container');
    container.classList.remove('hidden');
  }

  hideMapLoading() {
    const container = document.getElementById('map-loading-container');
    container.classList.add('hidden');
  }
}
