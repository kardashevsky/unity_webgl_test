window.config = {
  TELEGRAM_BOT_URL: "https://t.me/genza_game_dev_1_bot",
  BASE_URL_GAME_API: "https://dev1-game-service.neuragames.online",
  BASE_URL_CONTENT_API: "https://dev1-content-service.neuragames.online",
  ONBOARDING_BUNDLE_URL: "https://ng-st-static.s3.eu-central-1.amazonaws.com/bundles/onboarding/mainscene_assets_all_8841b8fe12702fe623112649d92f3db2.bundle",
  MAIN_SCENE_BUNDLE_URL: "https://ng-st-static.s3.eu-central-1.amazonaws.com/bundles/game/mainscene_assets_all_8841b8fe12702fe623112649d92f3db2.bundle"
};

Object.keys(window.config).forEach(key => {
  sessionStorage.setItem(key, window.config[key]);
});
