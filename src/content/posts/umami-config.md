---
title: 自建umami的相关配置
description: 因为官方的API请求时间太久，所以自建了一个umami

published: 2026-01-24
date: 2026-01-24
tags: [Umami]
category: '教程'
draft: false
pinned: false
image: './img/defalut-cover.png'
---

# 写在前面

Umami 是一个开源的分析工具，它可以帮助你了解你的网站的流量来源、用户行为、页面访问等信息。

Umami官方地址 [umami](https://umami.is)

Umami官方文档: [Umami - Doc](https://umami.is/docs)

Umami官方API: [Umami - API](https://umami.is/docs/api)

# 正文

这里需要注意一点，使用cloud，也就是官方的api 只需要申请一个`API KEY` 就可以调用api了，如果使用自建服务器，需要先获取token，再进行调用。

## 认证

**POST /api/auth/login**

首先你需要获得一个令牌，才能发起 API 请求。你需要向端点发送以下请求：POST/api/auth/login

```json
{
  "username": "admin",
  "password": "umami"
}
```

如果成功，你应该会收到如下回复：

```json
{
  "token": "eyTMjU2IiwiY...4Q0JDLUhWxnIjoiUE_A",
  "user": {
    "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "username": "admin",
    "role": "admin",
    "createdAt": "2000-00-00T00:00:00.000Z",
    "isAdmin": true
  }
}
```

保存标记值，并发送一个包含所有数据请求的头部，地址为 。你的请求头应该是这样的：AuthorizationBearer <token>

```sql
Authorization: Bearer eyTMjU2IiwiY...4Q0JDLUhWxnIjoiUE_A
```

每次需要权限的 API 调用都必须有授权令牌。


所以在使用自建的umami时，需要先进行登录，然后修改所有的请求头，添加Authorization 字段，值为Bearer <token>，

## 实现认证方式

这里贴出本站的一个js脚本，实现了登录并获取token和获取统计数据的功能。

```js
((global) => {
	const cacheKey = "umami-token-cache";
	const cacheTTL = 3600_000; // 1h




	async function fetchShareData(baseUrl, apiKey) {
		const cached = localStorage.getItem(cacheKey);
		if (cached) {
			try {
				const parsed = JSON.parse(cached);
				if (Date.now() - parsed.timestamp < cacheTTL) {
					return parsed.value;
				}
			} catch {
				localStorage.removeItem(cacheKey);
			}
		}
		const res = await fetch(`${baseUrl}/api/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: "admin",
				password: apiKey,
			}),
		});
		if (!res.ok) {
			throw new Error("获取 Umami 分享信息失败");
		}
		const data = await res.json();
		localStorage.setItem(
			cacheKey,
			JSON.stringify({ timestamp: Date.now(), value: data.token }),
		);
		return data.token;
	}

	/**
	 * 获取 Umami 分享数据（websiteId、token）
	 * 在缓存 TTL 内复用；并用全局 Promise 避免并发请求
	 * @param {string} baseUrl
	 * @param {string} apiKey
	 * @returns {Promise<{websiteId: string, token: string}>}
	 */
	global.getUmamiShareData = (baseUrl, apiKey) => {
		if (!global.__umamiSharePromise) {
			global.__umamiSharePromise = fetchShareData(baseUrl, apiKey).catch(
				(err) => {
					delete global.__umamiSharePromise;
					throw err;
				},
			);
		}
		return global.__umamiSharePromise;
	};

	global.clearUmamiShareCache = () => {
		localStorage.removeItem(cacheKey);
		delete global.__umamiSharePromise;
		if (global.__umamiDataCache) {
			global.__umamiDataCache.clear();
		}
	};


	// 初始化全局内存缓存
	// 使用内存缓存(Map)而不是 sessionStorage/localStorage
	// 这样在页面刷新(F5)时缓存会自动清空，符合"只有刷新的时候才再次获取"的需求
	// 而在 swup 单页跳转时，window 对象保留，缓存依然有效
	if (!global.__umamiDataCache) {
		global.__umamiDataCache = new Map();
	}

	/**
	 * 获取网站统计数据
	 * @param {string} baseUrl - Umami Cloud API基础URL
	 * @param {string} apiKey - API密钥
	 * @param {string} websiteId - 网站ID
	 * @returns {Promise<object>} 网站统计数据
	 */
	async function fetchWebsiteStats(baseUrl, apiKey, websiteId) {
		const currentTimestamp = Date.now();
		// 缓存键：site-{websiteId}
		// 注意：这里没有包含 timestamp，意味着只要不刷新，就一直用第一次加载的数据
		// 如果需要定期更新，可以在 value 里存 timestamp 并检查 TTL
		const cacheKey = `site-${websiteId}`;

		if (global.__umamiDataCache.has(cacheKey)) {
			return global.__umamiDataCache.get(cacheKey);
		}

		let res;

		//判断是否为官方网站
		if(baseUrl==='https://api.umami.is'){
			const statsUrl = `${baseUrl}/v1/websites/${websiteId}/stats?startAt=0&endAt=${currentTimestamp}`;

			res = await fetch(statsUrl, {
				headers: {
					"x-umami-api-key": apiKey,
				},
			});
		}else{

		const token = await global.getUmamiShareData(
				baseUrl,
				apiKey,
			);
		const statsUrl = `${baseUrl}/api/websites/${websiteId}/stats?startAt=0&endAt=${currentTimestamp}`;

		res = await fetch(statsUrl, {
			headers: {
				// "x-umami-api-key": apiKey,
				"Authorization": "Bearer "+token,
			},
		});
		}


		

		if (!res.ok) {
			throw new Error("获取网站统计数据失败");
		}

		const stats = await res.json();

		// 写入内存缓存
		global.__umamiDataCache.set(cacheKey, stats);

		return stats;
	}

	/**
	 * 获取特定页面的统计数据
	 * @param {string} baseUrl - Umami Cloud API基础URL
	 * @param {string} apiKey - API密钥
	 * @param {string} websiteId - 网站ID
	 * @param {string} urlPath - 页面路径
	 * @param {number} startAt - 开始时间戳
	 * @param {number} endAt - 结束时间戳
	 * @returns {Promise<object>} 页面统计数据
	 */
	async function fetchPageStats(
		baseUrl,
		apiKey,
		websiteId,
		urlPath,
		startAt = 0,
		endAt = Date.now(),
	) {
		// 只有查询全时段数据（startAt=0）时才使用缓存
		const shouldCache = startAt === 0;
		const cacheKey = `page-${websiteId}-${urlPath}`;

		if (shouldCache && global.__umamiDataCache.has(cacheKey)) {
			return global.__umamiDataCache.get(cacheKey);
		}

		
		let res;

		if(baseUrl==='https://api.umami.is'){

		const statsUrl = `${baseUrl}/v1/websites/${websiteId}/stats?startAt=${startAt}&endAt=${endAt}&path=${encodeURIComponent(urlPath)}`;

		res = await fetch(statsUrl, {
			headers: {
				"x-umami-api-key": apiKey,
			},
		});


		}else{
		const token = await global.getUmamiShareData(
			baseUrl,
			apiKey,
		);
		const statsUrl = `${baseUrl}/api/websites/${websiteId}/stats?startAt=${startAt}&endAt=${endAt}&path=${encodeURIComponent(urlPath)}`;

		res = await fetch(statsUrl, {
			headers: {
				// "x-umami-api-key": apiKey,
				"Authorization": "Bearer "+token,
			},
		});


		}




		

		if (!res.ok) {
			throw new Error("获取页面统计数据失败");
		}

		const stats = await res.json();

		if (shouldCache) {
			global.__umamiDataCache.set(cacheKey, stats);
		}

		return stats;
	}

	/**
	 * 获取 Umami 网站统计数据
	 * @param {string} baseUrl - Umami Cloud API基础URL
	 * @param {string} apiKey - API密钥
	 * @param {string} websiteId - 网站ID
	 * @returns {Promise<object>} 网站统计数据
	 */
	global.getUmamiWebsiteStats = async (baseUrl, apiKey, websiteId) => {
		try {
			return await fetchWebsiteStats(baseUrl, apiKey, websiteId);
		} catch (err) {
			throw new Error(`获取Umami统计数据失败: ${err.message}`);
		}
	};

	/**
	 * 获取特定页面的 Umami 统计数据
	 * @param {string} baseUrl - Umami Cloud API基础URL
	 * @param {string} apiKey - API密钥
	 * @param {string} websiteId - 网站ID
	 * @param {string} urlPath - 页面路径
	 * @param {number} startAt - 开始时间戳（可选）
	 * @param {number} endAt - 结束时间戳（可选）
	 * @returns {Promise<object>} 页面统计数据
	 */
	global.getUmamiPageStats = async (
		baseUrl,
		apiKey,
		websiteId,
		urlPath,
		startAt,
		endAt,
	) => {
		try {
			return await fetchPageStats(
				baseUrl,
				apiKey,
				websiteId,
				urlPath,
				startAt,
				endAt,
			);
		} catch (err) {
			throw new Error(`获取Umami页面统计数据失败: ${err.message}`);
		}
	};


})(window);

```

:::note
注意：这里为了最小的改动，使用`apiKey`进行存储密码，在请求的时候会漏信息，所以不建议使用。
:::


:::tip
注意：这里的代码仅适用于自建的umami服务器，如果你使用的是umami cloud，直接使用api key 即可。
:::