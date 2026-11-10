export const platforms = [
  {
    id: "threads",
    hostname: ["threads.com", "www.threads.com", "threads.net", "www.threads.net"],
    route: "threads-downloader",
    enabled: true
  },
  {
    id: "instagram",
    hostname: ["instagram.com", "www.instagram.com", "m.instagram.com"],
    route: "instagram-downloader",
    enabled: true
  },
  {
    id: "youtube",
    hostname: ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtu.be"],
    route: "youtube-downloader",
    enabled: true
  },
  {
    id: "facebook",
    hostname: ["facebook.com", "www.facebook.com", "m.facebook.com", "mbasic.facebook.com", "web.facebook.com", "fb.watch"],
    route: "facebook-downloader",
    enabled: true
  },
  {
    id: "tiktok",
    hostname: ["tiktok.com", "www.tiktok.com", "m.tiktok.com", "vm.tiktok.com", "vt.tiktok.com"],
    route: "tiktok-downloader",
    enabled: true
  },
  {
    id: "douyin",
    hostname: ["douyin.com", "www.douyin.com", "m.douyin.com", "v.douyin.com", "iesdouyin.com", "www.iesdouyin.com"],
    route: "douyin-downloader",
    enabled: true
  },
  {
    id: "x",
    hostname: ["x.com", "www.x.com", "mobile.x.com", "twitter.com", "www.twitter.com", "mobile.twitter.com"],
    route: "twitter-video-downloader",
    enabled: true
  },
  {
    id: "bilibili",
    hostname: ["bilibili.com", "www.bilibili.com", "m.bilibili.com", "b23.tv", "www.b23.tv"],
    route: "bilibili-downloader",
    enabled: true
  }
] as const;

export type PlatformID = (typeof platforms)[number]["id"];
export type ThreadsTargetType = "post" | "profile" | "share";

export function platformLabel(platform: PlatformID): string {
  return ({ threads: "Threads", instagram: "Instagram", youtube: "YouTube", facebook: "Facebook", tiktok: "TikTok", douyin: "Douyin", x: "X (Twitter)", bilibili: "Bilibili" } as const)[platform];
}

export function detectPlatform(input: string): PlatformID | null {
  const candidate = input.trim();
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port || hasExplicitPort(candidate)) return null;
  const host = parsed.hostname.toLowerCase();
  return platforms.find((platform) => (platform.hostname as readonly string[]).includes(host))?.id || null;
}

export function isInstagramPostURL(input: string): boolean {
  if (detectPlatform(input) !== "instagram") return false;
  try {
    return /^\/(?:[A-Za-z0-9._]{1,30}\/)?(?:p|reels?)\/[A-Za-z0-9_-]+\/?$/.test(new URL(input.trim()).pathname);
  } catch {
    return false;
  }
}

export function isInstagramProfileURL(input: string): boolean {
  if (detectPlatform(input) !== "instagram") return false;
  try {
    const path = new URL(input.trim()).pathname.replace(/\/$/, "");
    const match = /^\/([A-Za-z0-9._]{1,30})$/.exec(path);
    if (!match) return false;
    return !new Set(["about", "accounts", "api", "challenge", "developer", "directory", "direct", "emails", "explore", "legal", "p", "press", "privacy", "reel", "reels", "stories", "terms", "web"]).has(match[1].toLowerCase());
  } catch {
    return false;
  }
}

export function isInstagramHighlightURL(input: string): boolean {
  if (detectPlatform(input) !== "instagram") return false;
  try {
    return /^\/stories\/highlights\/[0-9]+\/?$/.test(new URL(input.trim()).pathname);
  } catch {
    return false;
  }
}

export function isInstagramStoryURL(input: string): boolean {
  if (detectPlatform(input) !== "instagram") return false;
  try {
    const match = /^\/stories\/([A-Za-z0-9._]{1,30})(?:\/[0-9]+)?\/?$/.exec(new URL(input.trim()).pathname);
    return Boolean(match && match[1].toLowerCase() !== "highlights");
  } catch {
    return false;
  }
}

export function isInstagramSupportedURL(input: string): boolean {
  return isInstagramPostURL(input) || isInstagramProfileURL(input) || isInstagramHighlightURL(input) || isInstagramStoryURL(input);
}

export function threadsTargetType(input: string): ThreadsTargetType | null {
  if (detectPlatform(input) !== "threads") return null;
  try {
    const path = decodeURIComponent(new URL(input.trim()).pathname).replace(/\/+$/, "") || "/";
    if (/^\/@[^/]+\/post\/[A-Za-z0-9_-]+(?:\/.*)?$/.test(path)) return "post";
    if (/^\/@[^/]+$/.test(path)) return "profile";
    if (/^\/share\/[A-Za-z0-9_-]+(?:\/.*)?$/.test(path)) return "share";
    return null;
  } catch {
    return null;
  }
}

export function isThreadsSupportedURL(input: string): boolean {
  return threadsTargetType(input) !== null;
}

export function isYouTubeSupportedURL(input: string): boolean {
  if (detectPlatform(input) !== "youtube") return false;
  try {
    const parsed = new URL(input.trim());
    const host = parsed.hostname.toLowerCase();
    const videoID = host === "youtu.be" || host === "www.youtu.be"
      ? parsed.pathname.replace(/^\//, "").replace(/\/$/, "")
      : parsed.pathname === "/watch"
        ? parsed.searchParams.get("v") || ""
        : /^\/shorts\/([A-Za-z0-9_-]{11})\/?$/.exec(parsed.pathname)?.[1] || "";
    return /^[A-Za-z0-9_-]{11}$/.test(videoID);
  } catch {
    return false;
  }
}

export function isFacebookSupportedURL(input: string): boolean {
  if (detectPlatform(input) !== "facebook") return false;
  try {
    const parsed = new URL(input.trim());
    if (hasExplicitFacebookGroupQuery(parsed)) return false;
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.replace(/\/+$/, "") || "/";
    if (host === "fb.watch") return /^\/[A-Za-z0-9_-]+$/.test(path);

    if (/^\/(?:story|permalink)\.php$/.test(path)) return hasOneFacebookQueryValue(parsed, "story_fbid", isFacebookPostID) && hasOptionalFacebookNumericID(parsed, "id");
    if (/^\/photo(?:\.php)?$/.test(path)) return hasOneFacebookQueryValue(parsed, "fbid", isFacebookNumericID) && hasOptionalFacebookNumericID(parsed, "id");
    if (path === "/watch") return hasOneFacebookQueryValue(parsed, "v", isFacebookNumericID);
    if (/^\/reel\/[0-9]+$/.test(path)) return true;
    if (/^\/share\/(?:v|r|p)\/[A-Za-z0-9_-]+$/.test(path)) return true;

    const scoped = /^\/([A-Za-z0-9._-]{1,100})\/(posts|videos)\/([^/]+)$/.exec(path);
    if (!scoped || isReservedFacebookScope(scoped[1])) return false;
    return scoped[2] === "videos" ? /^[0-9]+$/.test(scoped[3]) : isFacebookPostID(scoped[3]);
  } catch {
    return false;
  }
}

export function isTikTokSupportedURL(input: string): boolean {
  if (detectPlatform(input) !== "tiktok") return false;
  try {
    const parsed = new URL(input.trim());
    const host = parsed.hostname.toLowerCase();
    const path = decodeURIComponent(parsed.pathname).replace(/\/+$/, "") || "/";
    if (host === "vm.tiktok.com" || host === "vt.tiktok.com") return /^\/[A-Za-z0-9_-]{4,128}$/.test(path);
    return /^\/@[A-Za-z0-9._]{1,50}\/(?:video|photo)\/[0-9]{5,25}$/.test(path)
      || /^\/t\/[A-Za-z0-9_-]{4,128}$/.test(path);
  } catch {
    return false;
  }
}

export function extractDouyinURL(input: string): string {
  const secureMatch = input.match(/https:\/\/(?:www\.|m\.|v\.)?douyin\.com\/[^\s<>"']+|https:\/\/(?:www\.)?iesdouyin\.com\/[^\s<>"']+/i);
  const schemelessMatch = secureMatch ? null : input.match(/(?:^|[\s([<{「『【《])((?:(?:www\.|m\.|v\.)?douyin\.com|(?:www\.)?iesdouyin\.com)\/[^\s<>"']+)/iu);
  const candidate = secureMatch?.[0] || (schemelessMatch?.[1] ? `https://${schemelessMatch[1]}` : input.trim());
  return candidate.replace(/[),.;!?，。；！？、）】》]+$/u, "");
}

export function isDouyinSupportedURL(input: string): boolean {
  const candidate = extractDouyinURL(input);
  if (detectPlatform(candidate) !== "douyin") return false;
  try {
    const parsed = new URL(candidate);
    const host = parsed.hostname.toLowerCase();
    const path = decodeURIComponent(parsed.pathname).replace(/\/+$/, "") || "/";
    if (host === "v.douyin.com") return /^\/[A-Za-z0-9_-]{4,128}$/.test(path);
    if (host === "iesdouyin.com" || host === "www.iesdouyin.com") return /^\/share\/(?:video|slides|note)\/[0-9]{5,25}$/.test(path);
    if (/^\/(?:video|note)\/[0-9]{5,25}$/.test(path)) return true;
    if (path === "/jingxuan") {
      const modalValues = parsed.searchParams.getAll("modal_id");
      return modalValues.length === 1 && /^[0-9]{5,25}$/.test(modalValues[0] || "");
    }
    if (/^\/user\/[A-Za-z0-9_-]{10,200}$/.test(path)) {
      const modalValues = parsed.searchParams.getAll("modal_id");
      const modal = modalValues[0];
      return modalValues.length === 0 || (modalValues.length === 1 && Boolean(modal && /^[0-9]{5,25}$/.test(modal)));
    }
    return false;
  } catch {
    return false;
  }
}

export function isXSupportedURL(input: string): boolean {
  if (detectPlatform(input) !== "x") return false;
  try {
    const parsed = new URL(input.trim());
    const path = decodeURIComponent(parsed.pathname);
    return /^\/[A-Za-z0-9_]{1,15}\/status\/[0-9]{2,20}(?:\/(?:photo|video)\/[1-4])?\/?$/.test(path)
      || /^\/i\/(?:web\/)?status\/[0-9]{2,20}(?:\/(?:photo|video)\/[1-4])?\/?$/.test(path);
  } catch {
    return false;
  }
}

export function isBilibiliSupportedURL(input: string): boolean {
  const candidate = extractBilibiliURL(input);
  if (detectPlatform(candidate) !== "bilibili") return false;
  try {
    const parsed = new URL(candidate);
    const host = parsed.hostname.toLowerCase();
    const path = decodeURIComponent(parsed.pathname).replace(/\/+$/, "") || "/";
    if (host === "b23.tv" || host === "www.b23.tv") return /^\/[A-Za-z0-9_-]{4,128}$/.test(path);
    if (!/^\/video\/(?:BV[A-Za-z0-9]{3,30}|av[0-9]{1,20})$/i.test(path)) return false;
    const pages = parsed.searchParams.getAll("p");
    return pages.length === 0 || (pages.length === 1 && /^[1-9][0-9]{0,3}$/.test(pages[0]));
  } catch {
    return false;
  }
}

export function extractBilibiliURL(input: string): string {
  const match = input.match(/https:\/\/(?:www\.|m\.)?bilibili\.com\/video\/(?:BV[A-Za-z0-9]{3,30}|av[0-9]{1,20})[^\s<>"']*|https:\/\/(?:www\.)?b23\.tv\/[A-Za-z0-9_-]{4,128}[^\s<>"']*/i);
  return (match?.[0] || input.trim())
    .replace(/\\([&?#=])/g, "$1")
    .replace(/[),\].;!?，。；！？、）】》]+$/u, "");
}

export function isSupportedPlatformURL(platform: PlatformID, input: string): boolean {
  switch (platform) {
    case "threads":
      return isThreadsSupportedURL(input);
    case "instagram":
      return isInstagramSupportedURL(input);
    case "youtube":
      return isYouTubeSupportedURL(input);
    case "facebook":
      return isFacebookSupportedURL(input);
    case "tiktok":
      return isTikTokSupportedURL(input);
    case "douyin":
      return isDouyinSupportedURL(input);
    case "x":
      return isXSupportedURL(input);
    case "bilibili":
      return isBilibiliSupportedURL(input);
  }
}

export interface ParsedSocialURL {
  platform: PlatformID;
  url: string;
  kind: "post" | "profile" | "share" | "collection";
  /** Null when the address identifies a profile, collection or unresolved share. */
  postId: string | null;
  /** An opaque redirect token, never a resolved post ID. */
  shareCode: string | null;
}

/** Local parsing only. A recognized URL does not imply public content exists. */
export function parseSocialURL(input: string): ParsedSocialURL | null {
  let candidate = input.trim();
  if (!detectPlatform(candidate)) {
    const douyin = extractDouyinURL(candidate);
    const bilibili = extractBilibiliURL(candidate);
    candidate = detectPlatform(douyin) === "douyin" ? douyin : detectPlatform(bilibili) === "bilibili" ? bilibili : candidate;
  }
  const platform = detectPlatform(candidate);
  if (!platform || !isSupportedPlatformURL(platform, candidate)) return null;
  const parsed = new URL(candidate);
  const path = decodeURIComponent(parsed.pathname).replace(/\/+$/, "");
  const parts = path.split("/").filter(Boolean);
  let kind: ParsedSocialURL["kind"] = "post";
  let postId: string | null = null;
  let shareCode: string | null = null;
  switch (platform) {
    case "threads":
      kind = threadsTargetType(candidate)!;
      if (kind === "post") postId = parts[2];
      if (kind === "share") shareCode = parts[1];
      break;
    case "instagram":
      if (isInstagramPostURL(candidate)) postId = parts[parts.length - 1];
      else if (isInstagramStoryURL(candidate) && parts[2]) postId = parts[2];
      else kind = isInstagramProfileURL(candidate) ? "profile" : "collection";
      break;
    case "youtube":
      postId = parsed.hostname.endsWith("youtu.be") ? parts[0] : parsed.pathname === "/watch" ? parsed.searchParams.get("v") : parts[1];
      break;
    case "facebook":
      if (parsed.hostname === "fb.watch" || parts[0] === "share") {
        kind = "share"; shareCode = parts[parts.length - 1];
      } else if (/^\/(?:story|permalink)\.php$/.test(path)) postId = parsed.searchParams.get("story_fbid");
      else if (/^\/photo(?:\.php)?$/.test(path)) postId = parsed.searchParams.get("fbid");
      else if (path === "/watch") postId = parsed.searchParams.get("v");
      else postId = parts[parts.length - 1];
      break;
    case "tiktok":
      if (parsed.hostname === "vm.tiktok.com" || parsed.hostname === "vt.tiktok.com" || parts[0] === "t") {
        kind = "share"; shareCode = parts[parts.length - 1];
      } else postId = parts[2];
      break;
    case "douyin":
      if (parsed.hostname === "v.douyin.com") { kind = "share"; shareCode = parts[0]; }
      else if (parts[0] === "user" || parts[0] === "jingxuan") {
        postId = parsed.searchParams.get("modal_id");
        if (!postId) kind = "profile";
      } else postId = parts[parts.length - 1];
      break;
    case "bilibili":
      if (parsed.hostname === "b23.tv" || parsed.hostname === "www.b23.tv") { kind = "share"; shareCode = parts[0]; }
      else postId = parts[1];
      break;
    case "x":
      postId = parts[parts.indexOf("status") + 1];
      break;
  }
  // Normalize transport syntax and known tracking only; keep identity/part parameters.
  parsed.hash = "";
  const tracking = new Set(["igsh", "igshid", "igsi", "xmt", "si", "feature", "share_source", "vd_source"]);
  for (const key of [...parsed.searchParams.keys()]) {
    if (key.toLowerCase().startsWith("utm_") || tracking.has(key.toLowerCase())) parsed.searchParams.delete(key);
  }
  parsed.searchParams.sort();
  return { platform, url: parsed.href, kind, postId, shareCode };
}

export function normalizeSocialURL(input: string): string | null {
  return parseSocialURL(input)?.url ?? null;
}

export function extractPostID(input: string): string | null {
  return parseSocialURL(input)?.postId ?? null;
}

function isFacebookPostID(value: string | null): boolean {
  return Boolean(value && (/^[0-9]+$/.test(value) || /^pfbid[A-Za-z0-9]+$/.test(value)));
}

function isFacebookNumericID(value: string | null): boolean {
  return Boolean(value && /^[0-9]+$/.test(value));
}

function hasOneFacebookQueryValue(parsed: URL, key: string, validate: (value: string | null) => boolean): boolean {
  const values = parsed.searchParams.getAll(key);
  return values.length === 1 && validate(values[0]);
}

function hasOptionalFacebookNumericID(parsed: URL, key: string): boolean {
  const values = parsed.searchParams.getAll(key);
  return values.length === 0 || (values.length === 1 && isFacebookNumericID(values[0]));
}

function hasExplicitFacebookGroupQuery(parsed: URL): boolean {
  for (const [rawKey, rawValue] of parsed.searchParams) {
    const key = rawKey.trim().toLowerCase();
    if (["group", "group_id", "groupid", "group_fbid", "group_post_id", "gid"].includes(key)) return true;
    if (key === "set" && rawValue.trim().toLowerCase().startsWith("gm.")) return true;
  }
  return false;
}

function hasExplicitPort(value: string): boolean {
  const authority = /^[A-Za-z][A-Za-z0-9+.-]*:\/\/([^/?#]*)/.exec(value)?.[1] || "";
  const hostAndPort = authority.slice(authority.lastIndexOf("@") + 1);
  return /:[0-9]+$/.test(hostAndPort);
}

function isReservedFacebookScope(value: string): boolean {
  return new Set(["groups", "marketplace", "stories", "events", "pages", "profile.php", "login", "help", "watch", "share", "reel", "videos", "photo", "photo.php", "story.php", "permalink.php"]).has(value.toLowerCase());
}
