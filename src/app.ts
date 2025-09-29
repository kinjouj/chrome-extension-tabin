import { Tabin, noop } from './tabin';

const TABIN_CTX_MENU_SAVE_ALL = 'tabin_ctx_menu_save_all';
const TABIN_CTX_MENU_SAVE = 'tabin_ctx_menu_save';
const TABIN_CTX_MENU_CLEAR = 'tabin_ctx_menu_clear';

Tabin.getSavedUrls().then((urls: string[]): void => {
  Tabin.updateBadge(urls);
}).catch(noop);

chrome.runtime.onInstalled.addListener((): void => {
  chrome.contextMenus.create({
    id: TABIN_CTX_MENU_SAVE_ALL,
    title: '全てのタブを保管',
  });
  chrome.contextMenus.create({
    id: TABIN_CTX_MENU_SAVE,
    title: 'このタブを保管',
  });
  chrome.contextMenus.create({
    id: TABIN_CTX_MENU_CLEAR,
    title: '保管したタブをクリア',
  });
});

chrome.browserAction.onClicked.addListener((): void => {
  Tabin.getSavedUrls().then((urls: string[]): void => {
    urls.forEach(url => chrome.tabs.create({ url: url }, noop));
  }).catch(noop);
});

chrome.contextMenus.onClicked.addListener((info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab): void => {
  switch (info.menuItemId) {
    case TABIN_CTX_MENU_SAVE_ALL: {
      Tabin.getTabUrls().then((urls: string[]): void => {
        Tabin.save(urls).then((): void => {
          urls.forEach(url => Tabin.notify('SAVE', `SAVE: ${url}`));
          Tabin.updateBadge(urls);
        }).catch(noop);
      }).catch(noop);
      break;
    }

    case TABIN_CTX_MENU_SAVE: {
      const url = Tabin.extractTabUrl(tab);
      Tabin.getSavedUrls().then((urls: string[]): void => {
        Tabin.save([...urls, url]).then((new_urls: string[]): void => {
          Tabin.notify('SAVE', `SAVE: ${url}`);
          Tabin.updateBadge(new_urls);
        }).catch(noop);
      }).catch(noop);

      break;
    }

    case TABIN_CTX_MENU_CLEAR: {
      Tabin.count().then((count: number): void => {
        if (count <= 0) return;

        Tabin.clear().then((): void => {
          Tabin.notify('CLEAR', `${count} cleared`);
          Tabin.updateBadge([]);
        }).catch(noop);
      }).catch(noop);

      break;
    }

    default: {
      break;
    }
  }
});
