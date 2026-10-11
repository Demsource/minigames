import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAQpc53kOk51KpTvKjx33cBRvwyAcfXKIQ',
  authDomain: 'minigames-sdk.firebaseapp.com',
  projectId: 'minigames-sdk',
  storageBucket: 'minigames-sdk.firebasestorage.app',
  messagingSenderId: '173961068403',
  appId: '1:173961068403:web:667e4b720da3409cd30f06',
  measurementId: 'G-5MH2KF1H0Z',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
