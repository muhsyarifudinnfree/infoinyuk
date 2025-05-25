export default class RegisterPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async getRegistered({ name, email, password }) {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#model.getRegistered({
        name,
        email,
        password,
      });

      if (!response.ok) {
        console.error('getRegistered: response:', response);
        this.#view.registeredFailed(response.message || 'Gagal mendaftar');
        return;
      }

      this.#view.registeredSuccessfully('Pendaftaran berhasil! Silakan login.');
    } catch (error) {
      console.error('getRegistered: error:', error);
      this.#view.registeredFailed('Gagal mendaftar akun');
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
