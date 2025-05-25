export function generateNavigationAuthenticated() {
  return `
    <li class="menu-item">
      <a href="#/home" class="flex items-center gap-2" aria-label="Ke halaman Home">
        <i class="fas fa-home"></i> Home
      </a>
    </li>
    <li class="menu-item">
      <a href="#/add-info" class="flex items-center gap-2" aria-label="Tambah informasi baru">
        <i class="fas fa-plus-circle"></i> Tambah Informasi
      </a>
    </li>
    <li class="menu-item">
      <a href="#/save-info" class="flex items-center gap-2" aria-label="Lihat informasi tersimpan">
        <i class="fas fa-save"></i> Informasi Tersimpan
      </a>
    </li>
    <li class="menu-item">
      <a href="#/logout" class="flex items-center gap-2" aria-label="Keluar dari akun">
        <i class="fas fa-sign-out-alt"></i> Keluar
      </a>
    </li>
  `;
}

export function generateNavigationUnauthenticated() {
  return `
    <li class="menu-item">
      <a href="#/" class="flex items-center gap-2" aria-label="Ke halaman Beranda">
        <i class="fas fa-home"></i> Beranda
      </a>
    </li>
    <li class="menu-item">
      <a href="#/about" class="flex items-center gap-2" aria-label="Ke halaman Tentang InfoinYuk">
        <i class="fas fa-info-circle"></i> Tentang InfoinYuk
      </a>
    </li>
    <li class="menu-item">
      <a href="#/login" class="flex items-center gap-2" aria-label="Masuk ke akun">
        <i class="fas fa-sign-in-alt"></i> Masuk
      </a>
    </li>
    <li class="menu-item">
      <a href="#/register" class="flex items-center gap-2" aria-label="Daftar akun baru">
        <i class="fas fa-user-plus"></i> Daftar
      </a>
    </li>
  `;
}

export const generateCardStory = ({
  id,
  name,
  createdAt,
  description,
  location,
  photoUrl,
}) => {
  return `
    <div tabindex="0" data-storyid="${id}" class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300 animate-fade-in" role="article" aria-labelledby="story-title-${id}">
      <div class="flex flex-col gap-2">
        <div class="relative w-full h-64 overflow-hidden rounded-t-lg">
          <img src="${photoUrl}" alt="Gambar informasi berjudul ${name} oleh pengguna" class="h-64 w-full object-cover rounded-t-lg transition-transform duration-300 hover:scale-105"/>
        </div>
        <div class="card-body">
          <h2 id="story-title-${id}" class="card-title text-lg font-semibold">${name}</h2>
          <div class="flex items-start flex-wrap justify-between w-full">
            ${
              location
                ? `<p class="text-base"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> ${location.placeName}</p>`
                : ''
            }
            <p class="text-sm">${new Date(createdAt).toLocaleDateString(
              'id-ID',
              {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }
            )}</p>
          </div>
          <p class="text-base line-clamp-3">${description}</p>
          <div class="card-actions justify-end">
            <a class="btn btn-primary btn-sm" href="#/story/${id}" aria-label="Lihat detail informasi berjudul ${name}">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Lihat Detail
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const generatePopoutMap = ({ story }) => {
  return `
    <div class="flex flex-col gap-2 p-2 bg-base-100 rounded-lg shadow animate-fade-in" role="dialog" aria-label="Detail lokasi informasi ${story.name}">
      <p class="font-bold">${story.name}</p>
      <div class="relative w-32 h-32 sm:w-60 sm:h-60 overflow-hidden rounded-lg">
        <img src="${story.photoUrl}" alt="Gambar informasi berjudul ${story.name} pada peta" class="object-cover rounded-lg w-full h-full"/>
      </div>
      <p class="text-sm line-clamp-2">${story.description}</p>
    </div>
  `;
};
