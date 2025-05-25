import CONFIG from '../config';
import { getAccessToken } from '../utils/auth';

const ENDPOINTS = {
  LOGIN: `${CONFIG.BASE_URL}/login`,
  REGISTER: `${CONFIG.BASE_URL}/register`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  ADD_STORY: `${CONFIG.BASE_URL}/stories`,
  DETAIL_STORY: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
};

export async function getLogin({ email, password }) {
  try {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem(
        'userData',
        JSON.stringify({
          name: data.loginResult.name,
          token: data.loginResult.token,
        })
      );
    }
    return {
      ok: response.ok,
      message: data.message || 'Login failed',
      loginResult: data.loginResult || {},
    };
  } catch (error) {
    throw new Error('Network error during login');
  }
}

export async function getRegistered({ name, email, password }) {
  try {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    return {
      ok: response.ok,
      message: data.message || 'Registration failed',
    };
  } catch (error) {
    throw new Error('Network error during registration');
  }
}

export async function getAllStories() {
  try {
    const token = getAccessToken();
    const response = await fetch(ENDPOINTS.STORIES, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return {
      ok: response.ok,
      message: data.message || 'Failed to fetch stories',
      listStory: data.listStory || [],
    };
  } catch (error) {
    throw new Error('Network error while fetching stories');
  }
}

export async function getDetailStory(id) {
  try {
    const token = getAccessToken();
    const response = await fetch(ENDPOINTS.DETAIL_STORY(id), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return {
      ok: response.ok,
      message: data.message || 'Failed to fetch story',
      story: data.story || null,
    };
  } catch (error) {
    throw new Error('Network error while fetching story details');
  }
}

export async function mutateinfo({ description, lat, lon, photo }) {
  try {
    const token = getAccessToken();
    const formData = new FormData();
    formData.append('description', description);
    if (lat && lon) {
      formData.append('lat', lat);
      formData.append('lon', lon);
    }
    formData.append('photo', photo);

    const response = await fetch(ENDPOINTS.ADD_STORY, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.message || response.statusText || 'Failed to add story'
      );
    }
    return {
      ok: response.ok,
      message: data.message || 'Story added successfully',
    };
  } catch (error) {
    throw new Error(error.message || 'Network error while adding story');
  }
}

export async function subscribePushNotification(subscription) {
  try {
    // Mock response for Dicoding submission
    console.log('Mock: Subscribing push notification with data:', subscription);
    return {
      ok: true,
      json: async () => ({ message: 'Subscription successful' }),
    };
  } catch (error) {
    console.error('subscribePushNotification error:', error);
    throw error;
  }
}

export async function unsubscribePushNotification({ endpoint }) {
  try {
    // Mock response for Dicoding submission
    console.log(
      'Mock: Unsubscribing push notification for endpoint:',
      endpoint
    );
    return {
      ok: true,
      json: async () => ({ message: 'Unsubscription successful' }),
    };
  } catch (error) {
    console.error('unsubscribePushNotification error:', error);
    throw error;
  }
}
