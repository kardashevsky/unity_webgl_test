if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('js/service-worker.js')
    .then(reg => {
      console.log('Service Worker registered, scope:', reg.scope);
    })
    .catch(err => {
      console.error('Service Worker registration failed:', err);
    });
}

import initializeSplashScreen from './js/initializeSplashScreen.js';
import initializeUnity from './js/initializeUnity.js';
import { getPlayerData } from './js/api.js';

(async () => {
  const webApp = window.Telegram.WebApp;

  webApp.expand();
  webApp.lockOrientation();
  webApp.disableVerticalSwipes();

  const initData = 'user=%7B%22id%22%3A290427089%2C%22first_name%22%3A%22Dmitry%22%2C%22last_name%22%3A%22Kardashevsky%22%2C%22username%22%3A%22kardashevsky%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F8M2uOr8GnxXffT3bpc_x0jrJR7MqmO9xoZogHVS4v74.svg%22%7D&chat_instance=-9111634613009801482&chat_type=private&auth_date=1751384928&signature=imwK49bvCZMxsIy3S_0WRYrx95UnSV65xSnqbxH6XVgVX6Whx7Rc1w1rNmYDP1g2_9GdRgYK_dirn0jOl2LeCg&hash=afb11ccc83875659ae28b2d985e7399c3d1ef76449b4da7945c4b105d1bbf8f7';

  sessionStorage.setItem('initData', initData);
  sessionStorage.setItem('initDataUnsafe', JSON.stringify(webApp.initDataUnsafe));
  let language = localStorage.getItem('language');
  if (!language) {
    language = webApp?.initDataUnsafe?.user?.language_code || 'en';
    localStorage.setItem('language', language);
  }

  const isMobile = true;

  let isPlayerBlocked = false;

  try {
    await getPlayerData();
  } catch (error) {
    console.warn('Ошибка при получении данных игрока:', error);
    isPlayerBlocked = true;
  }

  await initializeSplashScreen(language, isMobile, isPlayerBlocked);

  webApp.ready();

  if (isMobile && !isPlayerBlocked) {
    try {
      await Promise.race([
        initializeUnity(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Unity initialization timed out')), 60000)
        ),
      ]);
    } catch (error) {
      console.error('Error during Unity initialization:', error);
    }
  } else {
    console.warn('Unity is not supported on non-mobile devices.');
  }
})();
