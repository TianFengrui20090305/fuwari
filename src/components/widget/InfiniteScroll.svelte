<script lang="ts">
import type { CollectionEntry } from "astro:content";
import { getPostUrlBySlug } from "@utils/url-utils";
import { onMount } from "svelte";

// 使用Svelte 4的props语法
export let initialPosts: CollectionEntry<"posts">[];
export let totalPages: number;
export let currentPage: number;

let posts = initialPosts;
let loading = false;
let hasMore = currentPage < totalPages;
let delay = initialPosts.length * 50;
const interval = 50;

async function loadMore() {
	if (loading || !hasMore) return;

	loading = true;
	const nextPage = currentPage + 1;

	try {
		// 使用API路由获取下一页文章数据
		const response = await fetch(`/api/posts?page=${nextPage}`);
		const data = await response.json();

		posts = [...posts, ...data.posts];
		currentPage = nextPage;
		hasMore = currentPage < totalPages;
	} catch (error) {
		console.error("Failed to load more posts:", error);
	} finally {
		loading = false;
	}
}

// 监听滚动事件
function handleScroll() {
	if (loading || !hasMore) return;

	const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	const scrollHeight = document.documentElement.scrollHeight;
	const clientHeight = document.documentElement.clientHeight;

	// 当滚动到距离底部200px时，加载更多内容
	if (scrollTop + clientHeight >= scrollHeight - 200) {
		loadMore();
	}
}

// 添加滚动事件监听器
onMount(() => {
	window.addEventListener("scroll", handleScroll);
	return () => {
		window.removeEventListener("scroll", handleScroll);
	};
});
</script>

<div class="transition flex flex-col rounded-[var(--radius-large)] bg-[var(--card-bg)] py-1 md:py-0 md:bg-transparent md:gap-4 mb-4">
	{#each posts as post}
		<!-- 直接在Svelte组件中渲染文章卡片，不使用Astro组件 -->
		<a
			href={getPostUrlBySlug(post.slug)}
			class="onload-animation block rounded-lg overflow-hidden bg-white/5 dark:bg-slate-800/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-white/10 dark:border-slate-700/50"
			style={`animation-delay: calc(var(--content-delay) + ${delay++ * interval}ms);`}
		>
			<div class="p-4 md:p-6">
				<h2 class="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
					{post.data.title}
				</h2>
				<p class="text-slate-600 dark:text-slate-400 text-sm mb-4">
					{post.data.description}
				</p>
				<div class="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
					<span>{new Date(post.data.published).toLocaleDateString()}</span>
					{#if post.data.updated && post.data.updated > post.data.published}
						<span>• Updated {new Date(post.data.updated).toLocaleDateString()}</span>
					{/if}
					{#if post.data.category}
						<span>•</span>
						<span class="bg-primary/10 text-primary px-2 py-1 rounded-full">
							{post.data.category}
						</span>
					{/if}
					{#if post.data.tags && post.data.tags.length > 0}
						<span>•</span>
						{#each post.data.tags as tag, index}
							<span class="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
								{tag}
							</span>
							{#if index < post.data.tags.length - 1}
								<span>•</span>
							{/if}
						{/each}
					{/if}
				</div>
			</div>
		</a>
	{/each}

	{#if loading}
		<div class="flex justify-center items-center py-8">
			<div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
			<p class="ml-2">Loading more posts...</p>
		</div>
	{/if}

	{#if !hasMore && posts.length > 0}
		<div class="text-center py-8 text-muted">
			No more posts to load
		</div>
	{/if}
</div>
