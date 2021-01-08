/**
 * Set up all variables from meta tags.
 */
const RAW_PRICE_EL = document.querySelector('meta[name="monetization:asset:max_amount"]');
const RAW_RATE_EL = document.querySelector('meta[name="monetization:asset:amount"]');
const CODE_EL = document.querySelector('meta[name="monetization:asset:code"]');
const SCALE_EL = document.querySelector('meta[name="monetization:asset:scale"]');

const monetizationEnabled = () => {
  let currency, scale;
  let raw = 0;
  let paidInXrp = 0;
  let paidinEur = 0;

  // The Ripple (XRP) value is currently very unstable. To best reflect actual value
  // change this to the most recent value: https://www.coingecko.com/en/coins/xrp/eur
  const RIPPLE2EUR = 0.262939;

  const RAW_PRICE = RAW_PRICE_EL.getAttribute('content');
  const RAW_RATE = RAW_RATE_EL.getAttribute('content');
  const CODE = CODE_EL.getAttribute('content');
  const SCALE = SCALE_EL.getAttribute('content');

  const PRICE = RAW_PRICE / Math.pow(10, SCALE);
  const RATE = (RAW_RATE / Math.pow(10, SCALE)) * 60; // set to rate per hour.

  /**
   * Web Monetization guard
   * ======================
   *
   * When the content's rate exceeds the user's maximum rate, the user is redirected
   * to a notification screen which lets the user either allow or deny the monetization.
   *
   */
  chrome.storage.sync.get(['wmAllowedUrl', 'rate'], (result) => {
    WM_MAX_RATE = result.rate;
    console.info(`Maximum rate: ${WM_MAX_RATE}`);

    if (result.wmAllowedUrl === document.documentURI) {
      chrome.storage.sync.set({ wmAllowedUrl: null }, undefined);
    }

    if (result.wmAllowedUrl !== document.documentURI && RATE > WM_MAX_RATE) {
      const wmRequestData = {
        wmRequestData: {
          mode: 'rate',
          wmBlockedPrice: RATE,
          wmBlockedUrl: document.documentURI,
        },
      };

      chrome.storage.sync.set(wmRequestData, () => {
        window.location = chrome.extension.getURL('monetization_blocked.html');
      });
    }
  });

  /**
   * Logging
   */

  console.info('Web Monetization Settings:');
  console.info(`Content rate: ${RATE}`);
  console.info(`Maximum content-price: ${PRICE} ${CODE}`);

  /**
   * Monetization Tracker
   * ====================
   *
   * Automatically stops monetization when maximum amount has been reached.
   * The eventlistener is placed on the document instead of document.monetization
   * because we can not reach that from here.
   */
  document.addEventListener('monetizationprogress', (e) => {
    if (raw === 0) {
      scale = e.detail.assetScale;
      currency = e.detail.assetCode;
    }

    raw += Number(e.detail.amount);
    paidInXrp = (raw * Math.pow(10, -scale)).toFixed(scale);

    // this is for mocking a higher price than Coil is currently providing us: $0.36 / €0.30 per hour
    const multiplier = RATE / 0.3;
    paidInEur = paidInXrp * RIPPLE2EUR * multiplier;

    console.log(`Paid € ${paidInEur} (with multiplier ${multiplier}) of € ${PRICE}`);
    console.log(`Paid XRP ${paidInXrp}`);

    if (PRICE !== 0 && paidInEur > PRICE) {
      console.log(`maximum price of ${PRICE} reached. Stopping monetization...`);
      document.querySelector('meta[name=monetization]').remove();
    }
  });
};

if ([CODE_EL, RAW_RATE_EL, RAW_PRICE_EL, SCALE_EL].every(Boolean)) monetizationEnabled();
