import { fetchImages } from './image-api';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const options = {
  params: {
    key: '40709536-90c82784c25641df8e09a41ce',
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
    page: 1,
    q: '',
  },
};
const refs = {
  galleryEl: document.querySelector('.gallery'),
  searchInput: document.querySelector('input[name="searchQuery"'),
  searchForm: document.getElementById('search-form'),
  loaderEl: document.querySelector('.loader'),
};

let totalHits = 0;
let isLoadingMore = false;
let reachedEnd = false;

const lightbox = new SimpleLightbox('.lightbox', {
  captionsData: 'alt',
  captionDelay: 250,
  enableKeyboard: true,
  showCounter: false,
  scrollZoom: false,
  close: false,
});

refs.searchForm.addEventListener('submit', onFormSybmit);
window.addEventListener('scroll', onScrollHandler);
document.addEventListener('DOMContentLoaded', hideLoader);

function showLoader() {
  refs.loaderEl.style.display = 'block';
}

function hideLoader() {
  refs.loaderEl.style.display = 'none';
}

function renderGallery(hits) {
  const markup = hits
    .map(
      ({
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
            <a href="${largeImageURL}" class="lightbox">
                <div class="photo-card">
                    <img src="${webformatURL}" alt="${tags}" loading="lazy" />
                    <div class="info">
                        <p class="info-item">
                            <b>Likes</b>
                            ${likes}
                        </p>
                        <p class="info-item">
                            <b>Views</b>
                            ${views}
                        </p>
                        <p class="info-item">
                            <b>Comments</b>
                            ${comments}
                        </p>
                        <p class="info-item">
                            <b>Downloads</b>
                            ${downloads}
                        </p>
                    </div>
                </div>
            </a>
            `;
      }
    )
    .join('');

  refs.galleryEl.insertAdjacentHTML('beforeend', markup);

  if (options.params.page * options.params.per_page >= totalHits) {
    if (!reachedEnd) {
      Notify.info("We're sorry, but you've reached the end of search results.");
      reachedEnd = true;
    }
  }
  lightbox.refresh();
}

async function loadMore() {
  isLoadingMore = true;
  options.params.page += 1;
  try {
    showLoader();
    const response = await fetchImages(options);
    const hits = response.data.hits;
    hideLoader();
    renderGallery(hits);
  } catch (err) {
    Notify.failure(err);
    hideLoader();
  } finally {
    hideLoader();
    isLoadingMore = false;
  }
}

function onScrollHandler() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  const scrollThreshold = 300;
  if (
    scrollTop + clientHeight >= scrollHeight - scrollThreshold &&
    refs.galleryEl.innerHTML !== '' &&
    !isLoadingMore &&
    !reachedEnd
  ) {
    loadMore();
  }
}

async function onFormSybmit(e) {
  e.preventDefault();
  options.params.q = refs.searchInput.value.trim();
  if (options.params.q === '') {
    return;
  }
  options.params.page = 1;
  refs.galleryEl.innerHTML = '';
  reachedEnd = false;

  try {
    showLoader();
    const response = await fetchImages(options);
    totalHits = response.data.totalHits;
    const hits = response.data.hits;
    if (hits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      Notify.success(`Hooray! We found ${totalHits} images.`);
      renderGallery(hits);
    }
    refs.searchInput.value = '';
    hideLoader();
  } catch (err) {
    Notify.failure(err);
    hideLoader();
  }
}
