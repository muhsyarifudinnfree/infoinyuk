import { storyMapper } from '../../data/api-mapper';

export default class DetailPresenter {
  #storyId;
  #view;
  #model;

  constructor(storyId, { view, model }) {
    this.#storyId = storyId;
    this.#view = view;
    this.#model = model;
  }

  async initialStory() {
    this.#view.showLoading();

    try {
      const response = await this.#model.getDetailStory(this.#storyId);
      if (!response.ok) {
        console.error('initialStory: error:', response);
        this.#view.populateStoryError(response.message);
        return;
      }

      const storyData = await storyMapper(response.story);
      this.#view.populateStory('Success', storyData);
    } catch (error) {
      console.error('initialStory: error:', error);
      this.#view.populateStoryError('Gagal memuat informasi');
    } finally {
      this.#view.hideLoading();
    }
  }
}
