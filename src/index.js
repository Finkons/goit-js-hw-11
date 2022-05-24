import './sass/main.scss';
import fetchPictures from './js/fetchPicture';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import LoadMoreBtn from './js/load-more-btn';
import InfiniteScroll from 'infinite-scroll';


const refs = {
  searchForm: document.querySelector('#search-form input'),
  galleryDivStructure: document.querySelector('.gallery'),
  buttonSearch: document.querySelector('#search-form button'),
  loadMoreButton: document.querySelector('.load-more'),
};
let name = '';
let pageNumber = 0;
let ifShowedMessage = true;

const { searchForm, galleryDivStructure, buttonSearch, loadMoreButton } = refs;

const loadMoreBtn = new LoadMoreBtn({
  selector: '.load-more',
  hidden: true,
});

buttonSearch.addEventListener('click', onSearch);

function onSearch(event) {
  event.preventDefault();
  ifShowedMessage = true;
  galleryDivStructure.innerHTML = '';
  loadMoreBtn.disable();

  let inputForSearch = searchForm.value.trim();
  name = inputForSearch;
  pageNumber = 0;

  if (name === '') {
    Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    loadMoreBtn.hide();
    searchForm.value = '';
    return;
  }

  // return fetchPictures(name, pageNumber)
  //   .then(pictures => renderPictures(pictures))
  //   .catch(error => {
  //     console.log(error);
  //   });
}

function renderPictures(pictures) {
  let pictureCounter = pictures.data.hits.length;
  let totalPictures = pictures.data.totalHits;

  if (!pictureCounter) {
    Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    loadMoreBtn.hide();
    searchForm.value = '';
    return;
  }

  if (pictureCounter > 0) {
    if (ifShowedMessage) {
      Notify.success(`Hooray! We found ${totalPictures} images.`);
      ifShowedMessage = false;
    }

    loadMoreBtn.enable();
    loadMoreBtn.show();

    const markupDivInfo = pictures.data.hits
      .map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
        return `
          <div class="photo-card">
          <a class="gallery__item" href="${largeImageURL}">
            <img src="${webformatURL}" alt="${tags}" width = "300" height = "200" loading="lazy"/></a>
            <div class="info">
                <p class="info-item">
                <b>Likes</b>
                <br>${likes}
                </p>
                <p class="info-item">
                <b>Views</b>
                <br>${views}
                </p>
                <p class="info-item">
                <b>Comments</b>
                <br>${comments}
                </p>
                <p class="info-item">
                <b>Downloads</b>
                <br>${downloads}
                </p>
                </div>
            </div>`;
      })
      .join('');
    galleryDivStructure.insertAdjacentHTML('beforeend', markupDivInfo);
    searchForm.value = '';

    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 0.25,
      behavior: 'smooth',
    });

    let lightbox = new SimpleLightbox('.photo-card a', {
      close: true,
      captions: true,
    });
  }
  if (pictureCounter < 40 && pictureCounter > 0) {
    loadMoreBtn.hide();
    Notify.info("We're sorry, but you've reached the end of search results.");
  }
}

const infiniteObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        pageNumber += 1;
        return fetchPictures(name, pageNumber)
          .then(pictures => renderPictures(pictures))
          .catch(error => {
            console.log(error);
          })
      }
    });
    // observer.unobserve(entry.turget)
  },
  {
    rootMargin: '150px 0px 0px',
  }
);

document.querySelectorAll('img').forEach((image) => infiniteObserver.observe(image))
