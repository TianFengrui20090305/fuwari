<script lang="ts">
// 无限滚动加载器组件
// 监听滚动事件，当用户滚动到底部时，自动加载下一页

// 可选的加载状态回调
export let onLoadingStart: () => void = () => {};
export let onLoadingEnd: () => void = () => {};
export let onNoMorePages: () => void = () => {};

let loading = false;
let hasMore = true;
let currentPage = 1;

// 加载下一页的函数
async function loadNextPage() {
	if (loading || !hasMore) return;

	loading = true;
	onLoadingStart();

	try {
		const nextPage = currentPage + 1;
		const response = await fetch(`/page/${nextPage}/`);

		if (!response.ok) {
			throw new Error(`Failed to load page ${nextPage}`);
		}

		const html = await response.text();
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, "text/html");

		// 查找文章列表容器
		const currentList = document.querySelector(".transition.flex.flex-col");
		if (!currentList) {
			throw new Error("Article list container not found");
		}

		// 从响应中提取新的文章卡片
		const nextList = doc.querySelector(".transition.flex.flex-col");
		if (!nextList) {
			hasMore = false;
			onNoMorePages();
			return;
		}

		const newCards = nextList.querySelectorAll(">*");
		if (newCards.length === 0) {
			hasMore = false;
			onNoMorePages();
			return;
		}

		// 添加新卡片到当前列表
		newCards.forEach((card) => {
			currentList.appendChild(card);
		});

		currentPage = nextPage;
	} catch (error) {
		console.error("Failed to load next page:", error);
		hasMore = false;
		onNoMorePages();
	} finally {
		loading = false;
		onLoadingEnd();
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
		loadNextPage();
	}
}

// 添加滚动事件监听器
let scrollEventListenerAdded = false;

function addScrollEventListener() {
	if (!scrollEventListenerAdded) {
		window.addEventListener("scroll", handleScroll);
		scrollEventListenerAdded = true;
	}
}

function removeScrollEventListener() {
	if (scrollEventListenerAdded) {
		window.removeEventListener("scroll", handleScroll);
		scrollEventListenerAdded = false;
	}
}

// 组件挂载时添加事件监听器
let mounted = false;

function mount() {
	if (!mounted) {
		mounted = true;
		addScrollEventListener();
	}
}

function unmount() {
	if (mounted) {
		mounted = false;
		removeScrollEventListener();
	}
}

// 使用onMount和onDestroy生命周期函数
import { onDestroy, onMount } from "svelte";

onMount(() => {
	mount();
});

onDestroy(() => {
	unmount();
});
</script>

<!-- 可选的加载指示器 -->
{#if loading}
	<div class="flex justify-center items-center py-8">
		<div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
		<p class="ml-2">Loading more posts...</p>
	</div>
{/if}

<!-- 可选的无更多内容指示器 -->
{#if !hasMore}
	<div class="text-center py-8 text-muted">
		No more posts to load
	</div>
{/if}
