import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSocialURL, normalizeSocialURL, extractPostID, platforms } from '../dist/index.js';
const fixtures = [
 ['threads','https://threads.net/@maker/post/AbC123/slug?xmt=1','AbC123'],
 ['instagram','https://instagram.com/maker/reel/Code_1/','Code_1'],
 ['youtube','https://youtu.be/dQw4w9WgXcQ?t=10','dQw4w9WgXcQ'],
 ['facebook','https://facebook.com/story.php?story_fbid=pfbidABC&id=1','pfbidABC'],
 ['tiktok','https://tiktok.com/@maker/photo/123456','123456'],
 ['douyin','https://douyin.com/user/abcdefghijk?modal_id=123456','123456'],
 ['x','https://x.com/i/web/status/123456/photo/1','123456'],
 ['bilibili','https://bilibili.com/video/BV123abc?p=2','BV123abc']
];
for (const [platform, url, id] of fixtures) test(platform+' parses post identity and normalized URL', () => {
 const parsed=parseSocialURL(url);
 assert.equal(parsed.platform,platform); assert.equal(parsed.postId,id); assert.equal(parsed.kind,'post');
 assert.equal(extractPostID(url),id);
 assert.equal(extractPostID(parsed.url),id);
 assert.equal(normalizeSocialURL(parsed.url),parsed.url);
});
test('normalization preserves identity and part parameters', () => {
 assert.equal(normalizeSocialURL('https://m.bilibili.com/video/av123?p=2&utm_source=copy&vd_source=test#part'), 'https://m.bilibili.com/video/av123?p=2');
 assert.equal(extractPostID('https://facebook.com/reel/123?v=999&fbid=888'), '123');
 assert.equal(normalizeSocialURL('https://youtube.com/watch?v=dQw4w9WgXcQ&t=10&si=foo'), 'https://youtube.com/watch?t=10&v=dQw4w9WgXcQ');
});
test('shares remain unresolved and collections do not invent post IDs', () => {
 for (const url of ['https://threads.com/share/AbC123','https://fb.watch/AbC123','https://facebook.com/share/r/AbC123','https://vm.tiktok.com/ZMexample','https://tiktok.com/t/ZMexample','https://v.douyin.com/AbC123','https://b23.tv/AbC123']) {
  const parsed=parseSocialURL(url); assert.equal(parsed.kind,'share'); assert.equal(parsed.postId,null); assert.ok(parsed.shareCode);
 }
 for (const url of ['https://threads.com/@maker', 'https://instagram.com/maker', 'https://instagram.com/stories/highlights/123', 'https://instagram.com/stories/maker', 'https://douyin.com/user/abcdefghijk']) assert.equal(extractPostID(url),null);
 assert.equal(extractPostID('https://instagram.com/stories/maker/123'), '123');
 assert.equal(extractPostID('https://iesdouyin.com/share/slides/123456'), '123456');
});
test('share text extraction is local for Douyin and Bilibili', () => {
 assert.equal(extractPostID('Copied https://douyin.com/video/123456 open app'), '123456');
 assert.equal(extractPostID('[Video](https://bilibili.com/video/BV123abc?p=2)'), 'BV123abc');
});
test('all platforms reject malformed, insecure, credentialed and lookalike inputs', () => {
 for (const [,url] of fixtures) {
  const parsed=new URL(url);
  for (const candidate of [url.replace('https:', 'http:'), url.replace('https://','https://user:pw@'), url.replace(parsed.hostname,parsed.hostname+'.evil.example'), url.replace(parsed.hostname,parsed.hostname+':443')]) assert.equal(parseSocialURL(candidate),null,candidate);
 }
 for (const url of ['', 'not a URL', 'javascript:alert(1)', 'https://x.com/a/status/%E0%A4%A', 'https://bilibili.com/video/BV123abc?p=1&p=2']) assert.equal(parseSocialURL(url),null);
 assert.equal(platforms.length,8);
});
