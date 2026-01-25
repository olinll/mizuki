import { siteConfig } from "@/config";

/**
 * 获取文章的封面图片。
 * 如果文章有封面图片，则返回它。
 * 否则，根据文章 ID 从 defaultCovers 列表中返回一个随机封面。
 */
export function getPostCover(
	image: string | undefined | null,
	postId: string,
): string | undefined {
	if (image && image !== "") {
		return image;
	}

	const defaultCovers = siteConfig.defaultCovers;
	if (!defaultCovers || defaultCovers.length === 0) {
		return undefined;
	}

	// 简单的哈希函数，用于获取文章的一致索引
	let hash = 0;
	for (let i = 0; i < postId.length; i++) {
		hash = (hash << 5) - hash + postId.charCodeAt(i);
		hash |= 0; // 转换为 32 位整数
	}

	const index = Math.abs(hash) % defaultCovers.length;
	const cover = defaultCovers[index];

	// 如果封面是 HTTP URL（可能是外部 API），则基于哈希附加一个唯一的查询参数
	// 以防止浏览器在用户提供随机图片 API 时为所有文章缓存相同的图片。
	if (cover.startsWith("http://") || cover.startsWith("https://")) {
		const separator = cover.includes("?") ? "&" : "?";
		return `${cover}${separator}v=${Math.abs(hash)}`;
	}

	return cover;
}

