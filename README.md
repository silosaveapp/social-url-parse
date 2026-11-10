# Social URL Parse

Pure TypeScript URL validation, normalization and post-ID parsing for eight social platforms. Zero runtime dependencies. MIT. Built by [SiloSave](https://silosave.com/), which uses these rules in its website and extension build.

The library makes no requests, follows no redirects, reads no page content and downloads no media. A matching URL does not prove that content exists, is public, or may be saved.

## Run from source

Requires Node 20 or later. Clone this repository, then:

```sh
npm ci
npm test
```

The test command builds JavaScript and TypeScript declarations into `dist/`, then runs 25 tests with Node's built-in test runner. TypeScript is the only development dependency. `npm run build` builds without testing. This release is published on GitHub; the proposed npm package name `@silosave/social-url-parse` has **not** been registered or published to npm.

## ESM examples

After building, import the local output:

```js
import { detectPlatform, parseSocialURL, normalizeSocialURL, extractPostID } from './dist/index.js';

detectPlatform('https://x.com/maker/status/123456');
// 'x'

parseSocialURL('https://bilibili.com/video/BV123abc?p=2&utm_source=copy');
// { platform: 'bilibili', url: 'https://bilibili.com/video/BV123abc?p=2',
//   kind: 'post', postId: 'BV123abc', shareCode: null }

parseSocialURL('https://b23.tv/AbC123');
// { platform: 'bilibili', url: 'https://b23.tv/AbC123',
//   kind: 'share', postId: null, shareCode: 'AbC123' }

extractPostID('https://youtu.be/dQw4w9WgXcQ');
// 'dQw4w9WgXcQ'

normalizeSocialURL('https://m.bilibili.com/video/av123?p=2&utm_source=copy#part');
// 'https://m.bilibili.com/video/av123?p=2'

parseSocialURL('http://x.com/maker/status/123456');
// null
```

## Supported URL families

| Platform | Accepted patterns include |
| --- | --- |
| Threads | Posts, profiles and unresolved share links; threads.com and legacy threads.net hosts |
| Instagram | Posts, Reels, profiles, Stories and Highlights |
| YouTube | Individual watch videos, Shorts and youtu.be links |
| Facebook | Supported public post, photo, Reel, watch and share URL forms; group targets excluded |
| TikTok | Video/photo post URLs and short shares |
| Douyin | Videos, photo notes, profiles, modal_id and short shares; copied share text can be extracted locally |
| X/Twitter | Individual status URLs and photo/video suffixes |
| Bilibili | BV/AV videos, optional part parameter and unresolved b23.tv shares; copied share text can be extracted locally |

## API and boundaries

- `detectPlatform(input)` recognizes a supported exact HTTPS host; it does not validate the target path.
- `isSupportedPlatformURL(platform, input)` checks that platform's supported target patterns.
- `parseSocialURL(input)` returns `{ platform, url, kind, postId, shareCode }` or null. Kinds are post, profile, collection and share. Unresolved shares have no post ID; the redirect token stays in shareCode.
- `normalizeSocialURL(input)` removes fragments and known tracking keys, sorts query keys and keeps functional parameters such as `p`, `v`, `modal_id` and `story_fbid`. It preserves host aliases and does not resolve redirects.
- `extractPostID(input)` returns the ID encoded in a supported post address, otherwise null.

Also exports platform-specific validators and copied-share-text helpers. See `dist/index.d.ts` after building for types. Direct URLs require HTTPS, an exact allowlisted host, no credentials and no explicit port. This describes this application's accepted inputs, not every URL form the platforms support. Normalization is intentionally conservative and is not an SSRF filter or a substitute for authorization.

## Tests and feedback

The tests cover all eight families, copied share text, ID extraction, normalization, unresolved share tokens, functional query preservation, malformed paths, duplicate identity parameters, lookalike hosts, credentials and explicit ports. The original website validation cases are preserved.

Please report a reproducible public or synthetic URL pattern and the expected result through [Issues](https://github.com/silosaveapp/social-url-parse/issues). Do not post private URLs, cookies, credentials or access tokens. No platform affiliation is claimed.

For the free web product, visit [SiloSave](https://silosave.com/). This repository contains the URL parser only; it does not contain the website backend or desktop product.
