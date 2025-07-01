import { openDb, saveTranslationData } from './utils.js';

const BASE_URL_GAME_API = window.config.BASE_URL_GAME_API;
const BASE_URL_CONTENT_API = window.config.BASE_URL_CONTENT_API;

export const getPlayerData = async () => {
  const initData = sessionStorage.getItem('initData');

  if (!initData) {
    const message = 'Authorization data is missing in sessionStorage. Please restart the application.';
    console.error(message);
    throw new Error(message);
  }

  try {
    const playerData = await fetch(`${BASE_URL_GAME_API}/player`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'TelegramAuthorization': initData,
      }
    }).then(response => {
      if (!response.ok) {
        const error = `Error ${response.status}: ${response.statusText}`;
        console.error(error);
        throw new Error(error);
      }
      return response.json();
    });

    sessionStorage.setItem('playerData', JSON.stringify(playerData));

    const isEmptyData =
      !playerData.character &&
      !playerData.pet &&
      !playerData.statusLevel &&
      (!playerData.purchased_items || playerData.purchased_items.length === 0);

    return isEmptyData;
  } catch (error) {
    console.error('Error fetching player data:', error);
    throw error;
  }
};

export const getTranslations = async (languageCode) => {
  try {
    let jsonLang, jsonEnglish;

    if (languageCode === 'en') {
      const enResponse = await fetch(`${BASE_URL_CONTENT_API}/translation?language=en`, {
        method: 'GET',
        headers: { 'Accept': 'text/plain' },
      });

      if (!enResponse.ok) {
        const error = `Error ${enResponse.status}: ${enResponse.statusText}`;
        console.error(error);
        throw new Error(error);
      }

      jsonLang = await enResponse.json();
      jsonEnglish = jsonLang;
    } else {
      const [langResponse, enResponse] = await Promise.all([
        fetch(`${BASE_URL_CONTENT_API}/translation?language=${languageCode}`, {
          method: 'GET',
          headers: { 'Accept': 'text/plain' },
        }),
        fetch(`${BASE_URL_CONTENT_API}/translation?language=en`, {
          method: 'GET',
          headers: { 'Accept': 'text/plain' },
        }),
      ]);

      if (!langResponse.ok) {
        const error = `Error ${langResponse.status}: ${langResponse.statusText}`;
        console.error(error);
        throw new Error(error);
      }
      if (!enResponse.ok) {
        const error = `Error ${enResponse.status}: ${enResponse.statusText}`;
        console.error(error);
        throw new Error(error);
      }

      [jsonLang, jsonEnglish] = await Promise.all([
        langResponse.json(),
        enResponse.json(),
      ]);
    }

    const db = await openDb();
    await saveTranslationData(db, languageCode, jsonLang);

    if (languageCode !== 'en') {
      await saveTranslationData(db, 'en', jsonEnglish);
    }

    const textSplashScreen = {
      splash_screen_header: jsonLang.data?.splash_screen_header ?? 'Error',
      splash_screen_commentary: jsonLang.data?.splash_screen_commentary ?? 'Error',
      splash_screen_qrcode: jsonLang.data?.splash_screen_qrcode ?? 'Error',
      splash_screen_1_mvp: jsonLang.data?.splash_screen_1_mvp ?? 'Error',
      splash_screen_2_getready: jsonLang.data?.splash_screen_2_getready ?? 'Error',
      splash_screen_3_dating: jsonLang.data?.splash_screen_3_dating ?? 'Error',
      splash_screen_4_p2p: jsonLang.data?.splash_screen_4_p2p ?? 'Error',
      splash_screen_5_pvp: jsonLang.data?.splash_screen_5_pvp ?? 'Error',
      splash_screen_6_ios_android: jsonLang.data?.splash_screen_6_ios_android ?? 'Error',
      splash_screen_7_nft: jsonLang.data?.splash_screen_7_nft ?? 'Error',
      splash_screen_button_continue: jsonLang.data?.splash_screen_button_continue ?? 'Error',
      splash_screen_invite: jsonLang.data?.splash_screen_invite ?? 'Error',
      splash_screen_invite_commentary: jsonLang.data?.splash_screen_invite_commentary ?? 'Error',
    };

    return textSplashScreen;
  } catch (error) {
    console.error('Error fetching translations data:', error);
    throw error;
  }
};

export const getLocalizationVersions = async () => {
  try {
    const response = await fetch(`${BASE_URL_CONTENT_API}/version`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = `Error ${response.status}: ${response.statusText}`;
      console.error(error);
      throw new Error(error);
    }

    const data = await response.json();

    for (const [lang, version] of Object.entries(data)) {
      localStorage.setItem(`localization_version_${lang}`, version);
    }

    return data;
  } catch (error) {
    console.error('Error fetching localization versions:', error);
    throw error;
  }
};
