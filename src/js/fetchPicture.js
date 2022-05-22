export default async function fetchPictures(name, pageNumber) {
  const axios = require('axios');

  const API_KEY = '27580629-0dcde42b9c8f51584518cfd0d';

  const BASE_URL = `https://pixabay.com/api/?key=${API_KEY}&q=${name}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${pageNumber}`;

  const pictures = await axios.get(BASE_URL);

  return pictures;

}
