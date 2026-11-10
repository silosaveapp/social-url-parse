import { describe, it } from "node:test";
import assert from "node:assert/strict";
const expect = value => ({ toBe: expected => assert.equal(value, expected), toBeNull: () => assert.equal(value, null) });
import { detectPlatform, extractBilibiliURL, extractDouyinURL, isBilibiliSupportedURL, isDouyinSupportedURL, isFacebookSupportedURL, isInstagramHighlightURL, isInstagramPostURL, isInstagramProfileURL, isInstagramStoryURL, isInstagramSupportedURL, isSupportedPlatformURL, isThreadsSupportedURL, isTikTokSupportedURL, isXSupportedURL, isYouTubeSupportedURL, threadsTargetType } from "../dist/index.js";

describe("platform URL validation", () => {
  it("detects Instagram and Threads without accepting lookalike hosts", () => {
    expect(detectPlatform("https://www.instagram.com/p/Code/?igsh=tracking")).toBe("instagram");
    expect(detectPlatform("https://www.threads.com/@maker/post/Code")).toBe("threads");
    expect(detectPlatform("https://instagram.com.evil.example/p/Code/")).toBeNull();
  });

  it("accepts only resolvable Threads posts, profiles, and shares", () => {
    expect(isThreadsSupportedURL("https://www.threads.com/@maker/post/AbC_123/slug?xmt=tracking")).toBe(true);
    expect(isThreadsSupportedURL("https://threads.net/@maker/")).toBe(true);
    expect(isThreadsSupportedURL("https://www.threads.com/share/AbC_123/")).toBe(true);
    expect(threadsTargetType("https://www.threads.com/@maker/post/AbC_123/slug?xmt=tracking")).toBe("post");
    expect(threadsTargetType("https://threads.net/@maker/")).toBe("profile");
    expect(threadsTargetType("https://www.threads.com/share/AbC_123/")).toBe("share");
    expect(isThreadsSupportedURL("https://www.threads.com/" )).toBe(false);
    expect(isThreadsSupportedURL("https://www.threads.com/explore" )).toBe(false);
    expect(threadsTargetType("https://www.threads.com/explore")).toBeNull();
    expect(isThreadsSupportedURL("https://user:secret@www.threads.com/@maker/post/AbC123" )).toBe(false);
    expect(isThreadsSupportedURL("https://www.threads.com:443/@maker/post/AbC123" )).toBe(false);
    expect(isSupportedPlatformURL("threads", "https://www.threads.com/@maker/post/AbC123")).toBe(true);
  });

  it("accepts only Instagram post and Reel paths", () => {
    expect(isInstagramPostURL("https://www.instagram.com/p/Code_1-/" )).toBe(true);
    expect(isInstagramPostURL("https://m.instagram.com/reel/Code_2/?igsi=tracking")).toBe(true);
    expect(isInstagramPostURL("https://www.instagram.com/reels/Code_3/")).toBe(true);
    expect(isInstagramSupportedURL("https://www.instagram.com/reels/DcGeUo8S0BC/")).toBe(true);
    expect(isInstagramPostURL("https://www.instagram.com/silosave0/reel/DewKXA5hAhP/?igsh=tracking")).toBe(true);
    expect(isInstagramSupportedURL("https://m.instagram.com/maker._/p/Code_1-/")).toBe(true);
    expect(isInstagramPostURL("https://www.instagram.com/maker/reels/Code_3/")).toBe(true);
    expect(isInstagramPostURL("https://www.instagram.com/maker/reel/Code/extra/")).toBe(false);
    expect(isInstagramPostURL("https://www.instagram.com/maker/other/reel/Code/")).toBe(false);
    expect(isInstagramPostURL("https://instagram.com.evil.example/maker/reel/Code/")).toBe(false);
    expect(isInstagramPostURL("https://www.instagram.com/maker/")).toBe(false);
    expect(isInstagramPostURL("https://www.instagram.com/stories/maker/1/")).toBe(false);
  });

  it("accepts public Instagram profile paths without reserved product routes", () => {
    expect(isInstagramProfileURL("https://www.instagram.com/eeunseo._.v/")).toBe(true);
    expect(isInstagramSupportedURL("https://www.instagram.com/eeunseo._.v/?utm_source=copy")).toBe(true);
    expect(isInstagramProfileURL("https://www.instagram.com/explore/")).toBe(false);
    expect(isInstagramProfileURL("https://www.instagram.com/stories/maker/1/")).toBe(false);
  });

  it("accepts numeric public Instagram Highlight paths", () => {
    const highlight = "https://www.instagram.com/stories/highlights/18070414736251089/?utm_source=copy";
    expect(isInstagramHighlightURL(highlight)).toBe(true);
    expect(isInstagramSupportedURL(highlight)).toBe(true);
    expect(isInstagramHighlightURL("https://www.instagram.com/stories/highlights/not-a-number/")).toBe(false);
    expect(isInstagramHighlightURL("https://www.instagram.com/stories/maker/123/")).toBe(false);
  });

  it("accepts current Instagram Story paths with or without an item ID", () => {
    expect(isInstagramStoryURL("https://www.instagram.com/stories/wendy_offcl/")).toBe(true);
    expect(isInstagramStoryURL("https://www.instagram.com/stories/wendy_offcl/123456789/?utm_source=copy")).toBe(true);
    expect(isInstagramSupportedURL("https://www.instagram.com/stories/wendy_offcl/123456789/")).toBe(true);
    expect(isInstagramStoryURL("https://www.instagram.com/stories/highlights/not-a-number/")).toBe(false);
  });

	it("accepts only single YouTube videos and Shorts", () => {
	  expect(detectPlatform("https://youtu.be/dQw4w9WgXcQ?t=10")).toBe("youtube");
	  expect(isYouTubeSupportedURL("https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=ignored")).toBe(true);
	  expect(isYouTubeSupportedURL("https://m.youtube.com/shorts/dQw4w9WgXcQ?feature=share")).toBe(true);
	  expect(isYouTubeSupportedURL("https://youtu.be/dQw4w9WgXcQ?t=10")).toBe(true);
	  expect(isYouTubeSupportedURL("https://www.youtube.com/playlist?list=PL123")).toBe(false);
	  expect(isYouTubeSupportedURL("https://www.youtube.com/live/dQw4w9WgXcQ")).toBe(false);
	  expect(isYouTubeSupportedURL("https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ")).toBe(false);
	});

  it("accepts supported public Facebook post aliases", () => {
    expect(isFacebookSupportedURL("https://www.facebook.com/maker/posts/123456789/?tracking=ignored")).toBe(true);
    expect(isFacebookSupportedURL("https://m.facebook.com/maker/posts/pfbidABC123")).toBe(true);
    expect(isFacebookSupportedURL("https://web.facebook.com/maker/videos/123456789")).toBe(true);
    expect(isFacebookSupportedURL("https://www.facebook.com/reel/123456789")).toBe(true);
    expect(isFacebookSupportedURL("https://www.facebook.com/watch?v=123456789")).toBe(true);
    expect(isFacebookSupportedURL("https://mbasic.facebook.com/story.php?story_fbid=123456789&id=1")).toBe(true);
    expect(isFacebookSupportedURL("https://www.facebook.com/photo.php?fbid=123456789")).toBe(true);
    expect(isFacebookSupportedURL("https://www.facebook.com/share/v/AbC_123-xyz/")).toBe(true);
    expect(isFacebookSupportedURL("https://fb.watch/AbC_123-xyz/")).toBe(true);
  });

  it("rejects Facebook collections, profiles, lookalikes, credentials, ports, and unsupported IDs", () => {
    expect(isFacebookSupportedURL("https://www.facebook.com/maker/")).toBe(false);
    expect(isFacebookSupportedURL("https://www.facebook.com/groups/123/posts/456")).toBe(false);
    expect(isFacebookSupportedURL("https://www.facebook.com/marketplace/item/123")).toBe(false);
    expect(isFacebookSupportedURL("https://www.facebook.com/stories/123/456")).toBe(false);
    expect(isFacebookSupportedURL("https://www.facebook.com/videos/123456789")).toBe(false);
    expect(isFacebookSupportedURL("https://www.facebook.com/reel/not-numeric")).toBe(false);
    expect(isFacebookSupportedURL("https://www.facebook.com/maker/posts/pfbidBad_ID")).toBe(false);
    expect(isFacebookSupportedURL("https://facebook.com.evil.example/maker/posts/123")).toBe(false);
    expect(isFacebookSupportedURL("https://user:secret@www.facebook.com/maker/posts/123")).toBe(false);
    expect(isFacebookSupportedURL("https://www.facebook.com:8443/maker/posts/123")).toBe(false);
    expect(isFacebookSupportedURL("https://www.facebook.com:443/maker/posts/123")).toBe(false);
    expect(isFacebookSupportedURL("https://www.facebook.com/watch?v=123&v=456")).toBe(false);
    expect(isFacebookSupportedURL("https://www.facebook.com/photo.php?fbid=pfbidABC123")).toBe(false);
    expect(isFacebookSupportedURL("https://www.facebook.com/story.php?story_fbid=123&id=42&group_id=42")).toBe(false);
    expect(isFacebookSupportedURL("https://www.facebook.com/photo.php?fbid=123&set=gm.42")).toBe(false);
  });

  it("accepts only exact TikTok video, photo, and short share URLs", () => {
    expect(detectPlatform("https://www.tiktok.com/@demo/video/7675122879293410591")).toBe("tiktok");
    expect(isTikTokSupportedURL("https://www.tiktok.com/@demo/video/7675122879293410591?share=1")).toBe(true);
    expect(isTikTokSupportedURL("https://m.tiktok.com/@demo/photo/7374062149091462405")).toBe(true);
    expect(isTikTokSupportedURL("https://vm.tiktok.com/ZMexample/")).toBe(true);
    expect(isTikTokSupportedURL("https://vt.tiktok.com/ZSexample/")).toBe(true);
    expect(isTikTokSupportedURL("https://www.tiktok.com/t/ZTexample/")).toBe(true);
    expect(isTikTokSupportedURL("https://www.tiktok.com/@demo")).toBe(false);
    expect(isTikTokSupportedURL("https://www.tiktok.com/live")).toBe(false);
    expect(isTikTokSupportedURL("https://tiktok.com.evil.example/@demo/video/7675122879293410591")).toBe(false);
    expect(isTikTokSupportedURL("https://www.tiktok.com:443/@demo/video/7675122879293410591")).toBe(false);
  });

  it("extracts and validates Douyin posts, notes, short shares, profiles, and modal_id", () => {
    const profile = "https://www.douyin.com/user/MS4wLjABAAAAp6ftwODuPyq21R3OopiChJ1CJuCClA663b-FbqXU8JE";
    const schemelessProfile = "douyin.com/user/MS4wLjABAAAApccPU6YjbUNvcBTQGJnn6kT2beDgMCAH5n5PC1f44nk?enter_from=author_profile";
    expect(detectPlatform(profile)).toBe("douyin");
    expect(isDouyinSupportedURL(profile)).toBe(true);
    expect(extractDouyinURL(schemelessProfile)).toBe(`https://${schemelessProfile}`);
    expect(isDouyinSupportedURL(schemelessProfile)).toBe(true);
    expect(isDouyinSupportedURL(`${profile}?modal_id=7665196219778482859`)).toBe(true);
    expect(isDouyinSupportedURL("https://www.douyin.com/jingxuan?modal_id=7676370975125998899")).toBe(true);
    expect(isDouyinSupportedURL("https://www.douyin.com/video/7665196219778482859")).toBe(true);
    expect(isDouyinSupportedURL("https://www.douyin.com/note/7665196219778482859")).toBe(true);
    expect(isDouyinSupportedURL("https://v.douyin.com/iFexample/")).toBe(true);
    expect(extractDouyinURL("长按复制此条消息，打开抖音搜索，查看TA的更多作品。 https://v.douyin.com/THU34ew3VBE/")).toBe("https://v.douyin.com/THU34ew3VBE/");
    expect(extractDouyinURL("9.79 03/10 dNJ:/ 巧了你也穿了白色入镜 https://v.douyin.com/LXJ-lmBGf98/ 复制此链接，打开Dou音搜索")).toBe("https://v.douyin.com/LXJ-lmBGf98/");
    expect(extractDouyinURL("5.15 :9pm VLj:/ i@C.us 06/30 美延胃镜初体验~ # 赵美延 # idle # 爱豆 # 女团 # kpop https://v.douyin.com/CsP_so9c2EU/ 复制此链接，打开Dou音搜索，直接观看视频！")).toBe("https://v.douyin.com/CsP_so9c2EU/");
    expect(extractDouyinURL("複製連結 v.douyin.com/CsP_so9c2EU/ 打開抖音")).toBe("https://v.douyin.com/CsP_so9c2EU/");
    expect(isDouyinSupportedURL("https://v.douyin.com/LXJ-lmBGf98/")).toBe(true);
    expect(isDouyinSupportedURL("https://www.iesdouyin.com/share/slides/7665196219778482859")).toBe(true);
    expect(extractDouyinURL(`複製這段文字 ${profile}?modal_id=7665196219778482859 立即查看！`)).toBe(`${profile}?modal_id=7665196219778482859`);
    expect(isDouyinSupportedURL("https://douyin.com.evil.example/video/7665196219778482859")).toBe(false);
    expect(isDouyinSupportedURL("douyin.com.evil.example/video/7665196219778482859")).toBe(false);
    expect(isDouyinSupportedURL("https://evil.example/douyin.com/video/7665196219778482859")).toBe(false);
    expect(isDouyinSupportedURL(`${profile}?modal_id=bad`)).toBe(false);
    expect(isDouyinSupportedURL("https://www.douyin.com/jingxuan")).toBe(false);
    expect(isDouyinSupportedURL("https://www.douyin.com/jingxuan?modal_id=bad")).toBe(false);
    expect(isDouyinSupportedURL(`${profile}?foo=tracking`)).toBe(true);
    expect(isDouyinSupportedURL("https://www.douyin.com:443/video/7665196219778482859")).toBe(false);
  });

  it("accepts only exact X and Twitter single-post URLs", () => {
    expect(detectPlatform("https://x.com/SiloSave/status/1234567890123456789/photo/1?utm_source=test")).toBe("x");
    expect(isXSupportedURL("https://twitter.com/i/web/status/1234567890123456789")).toBe(true);
    expect(isXSupportedURL("https://x.com/i/status/1234567890123456789/video/1")).toBe(true);
    expect(isSupportedPlatformURL("x", "https://x.com/SiloSave/status/1234567890123456789")).toBe(true);
    expect(isXSupportedURL("http://x.com/SiloSave/status/1234567890123456789")).toBe(false);
    expect(isXSupportedURL("https://x.com/SiloSave")).toBe(false);
    expect(isXSupportedURL("https://x.com/search?q=SiloSave")).toBe(false);
    expect(isXSupportedURL("https://x.com/i/spaces/1")).toBe(false);
    expect(isXSupportedURL("https://x.com.evil.example/SiloSave/status/1234567890123456789")).toBe(false);
    expect(isXSupportedURL("https://user:secret@x.com/SiloSave/status/1234567890123456789")).toBe(false);
    expect(isXSupportedURL("https://x.com:443/SiloSave/status/1234567890123456789")).toBe(false);
  });

  it("accepts only exact Bilibili BV, AV, b23.tv, and optional part URLs", () => {
    const copiedShareText = "【16G显卡畅跑Qwen3.8 27B！】 https://www.bilibili.com/video/BV1oz8R6FEQz/?share_source=copy_web&vd_source=7b3ec702b6b5a7ac051d4f7a993b1eca";
    const markdownShareText = "[影片](https://www.bilibili.com/video/BV1oz8R6FEQz/?share_source=copy_web\\&vd_source=7b3ec702b6b5a7ac051d4f7a993b1eca)";
    const extractedShareURL = "https://www.bilibili.com/video/BV1oz8R6FEQz/?share_source=copy_web&vd_source=7b3ec702b6b5a7ac051d4f7a993b1eca";
    expect(extractBilibiliURL(copiedShareText)).toBe(extractedShareURL);
    expect(extractBilibiliURL(markdownShareText)).toBe(extractedShareURL);
    expect(isBilibiliSupportedURL(copiedShareText)).toBe(true);
    expect(detectPlatform("https://www.bilibili.com/video/BV1xx411c7mD?p=2&utm_source=share")).toBe("bilibili");
    expect(isBilibiliSupportedURL("https://www.bilibili.com/video/BV1xx411c7mD?p=2&utm_source=share")).toBe(true);
    expect(isBilibiliSupportedURL("https://m.bilibili.com/video/av170001?p=1")).toBe(true);
    expect(isBilibiliSupportedURL("https://b23.tv/AbC_123")).toBe(true);
    expect(isSupportedPlatformURL("bilibili", "https://www.bilibili.com/video/av170001")).toBe(true);
    expect(isBilibiliSupportedURL("https://www.bilibili.com/bangumi/play/ep1")).toBe(false);
    expect(isBilibiliSupportedURL("https://www.bilibili.com/video/BV1xx411c7mD?p=0")).toBe(false);
    expect(isBilibiliSupportedURL("https://www.bilibili.com/video/BV1xx411c7mD?p=1&p=2")).toBe(false);
    expect(isBilibiliSupportedURL("https://bilibili.tv/video/123")).toBe(false);
    expect(isBilibiliSupportedURL("https://bilibili.com.evil.example/video/BV1xx411c7mD")).toBe(false);
    expect(isBilibiliSupportedURL("https://www.bilibili.com:443/video/BV1xx411c7mD")).toBe(false);
  });
});
