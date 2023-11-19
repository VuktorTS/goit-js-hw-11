import axios from 'axios';
const BASE_URL = 'https://pixabay.com/api/';

async function fetchImages(options) {
  try {
    const data = await axios.get(BASE_URL, options);
    return data;
  } catch (error) {
    console.log('error: ', error);
  }
}

export { fetchImages };
