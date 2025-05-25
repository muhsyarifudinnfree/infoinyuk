export default class AddinfoPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showNewFormMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showNewFormMap: error:', error);
      this.#view.storeFailed('Gagal memuat peta');
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async postinfo({ description, lat, lon, photo }) {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#model.mutateinfo({
        description,
        lat,
        lon,
        photo,
      });

      if (!response.ok) {
        console.error('postinfo: response:', response);
        this.#view.storeFailed(response.message);
        return;
      }

      this.#view.storeSuccessfully('Informasi berhasil dibagikan!');
    } catch (error) {
      console.error('postinfo: error:', error);
      let errorMessage = 'Gagal membagikan informasi';
      if (error.message.includes('name is not allowed')) {
        errorMessage = "Field 'name' tidak diizinkan oleh server";
      } else {
        errorMessage = error.message || errorMessage;
      }
      this.#view.storeFailed(errorMessage);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
