import { storyMapper } from '../../data/api-mapper';
import useToast from '../../utils/toast';

export default class SaveinfoPresenter {
  #view;
  #model;
  #database;

  constructor({ view, model, database }) {
    this.#view = view;
    this.#model = model;
    this.#database = database;
  }

  async initialSavedStories() {
    this.#view.showLoading();

    try {
      const savedStories = await this.#database.getAllStories();
      const storiesData = await Promise.all(
        savedStories.map(async (story) => await storyMapper(story))
      );
      this.#view.populateSavedStoriesList('Success', storiesData);
    } catch (error) {
      console.error('initialSavedStories: error:', error);
      this.#view.populateSavedStoriesError('Gagal memuat informasi tersimpan');
    } finally {
      this.#view.hideLoading();
    }
  }

  async deleteSavedStory(storyId) {
    try {
      await this.#database.removeStory(storyId);
      useToast('Informasi berhasil dihapus dari daftar tersimpan', 'success');
      await this.initialSavedStories(); // Refresh the list
    } catch (error) {
      console.error('deleteSavedStory: error:', error);
      useToast('Gagal menghapus informasi', 'error');
    }
  }
}
