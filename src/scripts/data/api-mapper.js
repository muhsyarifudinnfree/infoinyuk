import Map from '../utils/maps';

export async function storyMapper(story) {
  if (!story.lat || !story.lon) {
    return {
      id: story.id,
      name: story.name,
      description: story.description,
      photoUrl: story.photoUrl,
      createdAt: story.createdAt,
      location: null,
    };
  }

  return {
    id: story.id,
    name: story.name,
    description: story.description,
    photoUrl: story.photoUrl,
    createdAt: story.createdAt,
    location: {
      longitude: story.lon,
      latitude: story.lat,
      placeName: await Map.getPlaceNameByCoordinate(story.lat, story.lon),
    },
  };
}
