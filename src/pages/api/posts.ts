import { PAGE_SIZE } from "@constants/constants";
import { getSortedPosts } from "@utils/content-utils";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const page = Number.parseInt(url.searchParams.get("page") || "1");

	const allPosts = await getSortedPosts();
	const totalPages = Math.ceil(allPosts.length / PAGE_SIZE);

	// 计算当前页的文章范围
	const start = (page - 1) * PAGE_SIZE;
	const end = start + PAGE_SIZE;
	const posts = allPosts.slice(start, end);

	// 转换文章数据，只返回需要的字段
	const postsData = posts.map((post) => ({
		slug: post.slug,
		data: {
			title: post.data.title,
			tags: post.data.tags,
			category: post.data.category,
			published: post.data.published,
			updated: post.data.updated,
			image: post.data.image,
			description: post.data.description,
			draft: post.data.draft,
		},
	}));

	return new Response(
		JSON.stringify({
			posts: postsData,
			totalPages,
			currentPage: page,
			hasMore: page < totalPages,
		}),
		{
			headers: {
				"Content-Type": "application/json",
			},
		},
	);
};
