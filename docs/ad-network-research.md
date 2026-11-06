# Ad network comparison: NyaNudge, Qozi, future apps (2026-11-06)

Status: verified for the facts that decide it: Galaxy Store eligibility (re-checked on Google's page), plugin version, consent tooling. eCPM, Brazil payout methods and tax are unverified.

## Recommendation
- **NyaNudge:** Google AdMob via `@capacitor-community/admob` v8.3.0 (2026-10-29; needs Capacitor ≥ 8.5, and the repo is on ^8.5.1).
  - Serve non-personalized ads only. Google restricts personalization in health-related apps.
  - Use a small banner or native placement, plus optional rewarded ads.
  - Handle consent with Google UMP, which covers LGPD, US state laws and GDPR.
- **Qozi web:** stay ad-free, as AD-003 already decides. If ads come later, use AdSense, but only after moving off Vercel Hobby, whose terms forbid ads.
- **Portfolio:** one Google account (AdMob + AdSense). Consider AppLovin MAX mediation only once an app is on Google Play with real volume.
- **Why AdMob:** it is the only network that both officially accepts Galaxy-Store-only apps and has a maintained Capacitor 8 plugin with built-in consent.

## Comparison
| Provider | Capacitor/web fit | Galaxy Store only OK? | Consent | Key risk |
|---|---|---|---|---|
| AdMob (+AdSense/Ad Manager) | Maintained community plugin, recommended by the Capacitor docs | **Yes** (verified quote: "AdMob supports the Amazon Appstore, OPPO App Market, Samsung Galaxy Store, VIVO App Store, and Xiaomi GetApps") | UMP | Limited serving until the readiness review and store link |
| AppLovin MAX | No Capacitor plugin (you'd write a native bridge) | unverified | own | Bridge maintenance |
| Unity LevelPlay | Community plugin only, v0.1.x | unverified | ? | Immature |
| Meta Audience Network | Bidding only | **No**: needs a Play or App Store listing | — | Blocked until on Play |
| Pangle | No plugin | **No**: Play or App Store only | — | Blocked until on Play |
| InMobi | No plugin | unverified | ? | $300+ payout threshold |
| Samsung Ads | No public SDK docs found | — | — | Nothing to integrate |
| EthicalAds / Carbon (web) | JS embed | n/a | Cookie-free | Developer-audience ads; doesn't fit these apps |
| No ads (IAP / tip jar) | Galaxy IAP or RevenueCat | Yes | none needed | Low revenue; keeps "no telemetry" |

## AdMob requirements and gotchas
- **Readiness review:** apps get limited ad serving until reviewed, and an unpublished app isn't reviewed until it's linked to its store listing. https://support.google.com/admob/answer/9989980
- **app-ads.txt:** apps listed only in a third-party store are *currently* exempt. The same page says "Eventually all AdMob publishers will be required…", so plan a developer website. https://support.google.com/admob/answer/14538460
- **Package name:** `com.quoryn.nyanudge.app` must be identical in every store. https://support.google.com/admob/answer/10037806
- **Health personalization:** Google restricts personalizing ads with health information, so serve non-personalized ads only. https://support.google.com/publisherpolicies/answer/15101728
- **Samsung ad rules:**
  - consent is required before ads based on user data (3.1.7);
  - ads must be clearly marked, with visible close/skip buttons, and not excessive (2.7.x);
  - no ads in notifications (2.7.4);
  - block pharmaceutical ad categories.

  Source: https://developer.samsung.com/galaxy-store/distribution-guide.html
- **LGPD:** Brazilian traffic is served only by certified ad-tech vendors; offer a choice between personalized and non-personalized ads, or serve non-personalized only. Link Google's "How Google uses information" page from the privacy policy. https://support.google.com/admob/answer/9930897
- **No AdSense inside the WebView:** in the app, use the native plugin. https://support.google.com/adsense/answer/48182
- **Disclosures:** the privacy policy and store listing must disclose ads and name third parties, and the PRD's "no telemetry" promise has to change.
- **Payments:** payment setup unlocks at $10 in earnings; payouts are monthly once you pass the threshold. https://support.google.com/admob/answer/2772140

## Unverified
- AdMob payout methods for Brazil, the actual payout threshold, and whether a CNPJ or specific tax forms are required. Check the payments profile in AdMob.
- eCPM figures. Only illustrative or 2024 games data exists: US interstitial around $9–14, Brazil-tier interstitial around $1–2.
- Whether AppLovin, LevelPlay and InMobi accept apps that are only on the Galaxy Store.
- Whether the Galaxy Store listing has an ads declaration field.
