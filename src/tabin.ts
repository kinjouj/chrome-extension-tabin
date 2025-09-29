export const noop = (): void => {
  // noop
};

export class Tabin {
  public static getSavedUrls(): Promise<string[]> {
    return new Promise((resolve): void => {
      chrome.storage.local.get('tabin_urls', (res): void => {
        const urls = res.tabin_urls as string[] ?? [];
        resolve(urls);
      });
    });
  }

  public static count(): Promise<number> {
    return new Promise((resolve): void => {
      this.getSavedUrls().then((urls: string[]): void => {
        resolve(urls.length);
      }).catch(noop);
    });
  }

  public static getTabUrls(): Promise<string[]> {
    return new Promise((resolve): void => {
      chrome.tabs.getAllInWindow((tabs: chrome.tabs.Tab[]): void => {
        const urls: string[] = tabs
          .filter((tab): tab is { url: string } & typeof tab => tab.url != null)
          .map(({ url }) => url);
        resolve(urls);
      });
    });
  }

  public static save(urls: string[]): Promise<string[]> {
    return new Promise((resolve, reject): void => {
      const new_urls: string[] = [...new Set(urls)];

      if (urls.length == new_urls.length) {
        chrome.storage.local.set({ tabin_urls: new_urls }, (): void => {
          resolve(new_urls);
        });
      } else {
        reject(new Error('error'));
      }
    });
  }

  public static clear(): Promise<void> {
    return new Promise((resolve): void => {
      chrome.storage.local.clear(resolve);
    });
  }

  public static notify(title: string, message: string): void {
    chrome.notifications.create(
      { title: title, message: message, type: 'basic', iconUrl: 'icon48.png' },
      (notificationId: string): void => {
        setTimeout((): void => {
          chrome.notifications.clear(notificationId, (_wasCleared: boolean): void => { /* noop */ });
        }, 3000);
      },
    );
  }

  public static extractTabUrl(tab?: chrome.tabs.Tab): string {
    return tab?.url ?? ((): string => { throw new Error('url is missing'); })();
  }

  public static updateBadge(urls: string[]): void {
    chrome.browserAction.setBadgeText({ text: urls.length.toString() }, noop);
  }
}
