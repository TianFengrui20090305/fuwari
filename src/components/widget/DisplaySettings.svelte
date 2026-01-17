<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { getDefaultHue, getHue, setHue, getRainbowMode, setRainbowMode, startRainbowMode, stopRainbowMode, getRainbowSpeed, setRainbowSpeed, updateRainbowSpeed, getBackgroundEnabled, setBackgroundEnabled, getBackgroundBlur, setBackgroundBlur } from "@utils/setting-utils";
import LightDarkSwitch from "../LightDarkSwitch.svelte";
import { siteConfig } from "@/config";

let hue = getHue();
let rainbowMode = getRainbowMode();
let backgroundEnabled = getBackgroundEnabled();
let backgroundBlur = getBackgroundBlur();
let showAdvancedSettings = false;
let showOtherFeatures = false;

// Wallpaper feature
let wallpaperList: string[] = JSON.parse(localStorage.getItem('wallpaperList') || '[]');
let useCustomWallpaper = localStorage.getItem('useCustomWallpaper') === 'true';

// 速率拖动条的最小值和最大值
const minSpeed = 5;
const maxSpeed = 150;

// 获取原始速率值并转换为拖动条显示值（反转映射）
function getSliderValueFromSpeed(speed: number): number {
	return maxSpeed - speed + minSpeed;
}

// 将拖动条值转换为实际速率值（反转映射）
function getSpeedFromSliderValue(sliderValue: number): number {
	return maxSpeed - sliderValue + minSpeed;
}

// 初始化拖动条值
let rainbowSpeedSlider = getSliderValueFromSpeed(getRainbowSpeed());
let rainbowSpeed = getSpeedFromSliderValue(rainbowSpeedSlider);

const defaultHue = getDefaultHue();

function resetHue() {
	hue = getDefaultHue();
}

$: if (hue || hue === 0) {
	setHue(hue);
}

$: {
	setRainbowMode(rainbowMode);
	if (rainbowMode) {
		startRainbowMode();
	} else {
		stopRainbowMode();
		hue = getHue(); // Sync hue with stored value when turning off rainbow mode
	}
}

$: {
	rainbowSpeed = getSpeedFromSliderValue(rainbowSpeedSlider);
	setRainbowSpeed(rainbowSpeed);
	updateRainbowSpeed();
}

$: {
	setBackgroundEnabled(backgroundEnabled);
}

$: {
	setBackgroundBlur(backgroundBlur);
}

$: {
	localStorage.setItem('wallpaperList', JSON.stringify(wallpaperList));
	localStorage.setItem('useCustomWallpaper', String(useCustomWallpaper));
}

function randomizeWallpaper() {
	const wallpaper = document.getElementById('wallpaper');
	if (!wallpaper) return;
	
	if (useCustomWallpaper) {
		if (wallpaperList.length === 0) {
			alert('请先导入壁纸！');
			return;
		}
		const randomIndex = Math.floor(Math.random() * wallpaperList.length);
		wallpaper.style.backgroundImage = `url('${wallpaperList[randomIndex]}')`;
	} else {
		const urlList = getWallpaperUrls();
		if (urlList.length === 0) return;
		
		const randomIndex = Math.floor(Math.random() * urlList.length);
		const imageUrl = urlList[randomIndex];
		
		const finalUrl = addCacheBuster(imageUrl);
		
		const img = new Image();
		img.onload = () => {
			wallpaper.style.backgroundImage = `url('${finalUrl}')`;
		};
		img.onerror = () => {
			console.warn('Failed to load wallpaper image:', finalUrl);
		};
		img.src = finalUrl;
	}
}

function getWallpaperUrls() {
	const deviceType = getDeviceType();
	const urls = siteConfig.wallpaper.urls;
	
	let urlList;
	if (deviceType === 'desktop' && urls.h && urls.h.length > 0) {
		urlList = urls.h;
	} else if (deviceType === 'mobile' && urls.v && urls.v.length > 0) {
		urlList = urls.v;
	} else {
		urlList = urls.all || [];
	}
	
	return urlList;
}

function getDeviceType() {
	const width = window.innerWidth;
	return width > 768 ? 'desktop' : 'mobile';
}

function addCacheBuster(url) {
	if (url.includes('?')) {
		return `${url}&t=${Date.now()}`;
	} else {
		return `${url}?t=${Date.now()}`;
	}
}

function removeWallpaper(index: number) {
	wallpaperList = wallpaperList.filter((_, i) => i !== index);
	if (wallpaperList.length === 0) {
		const wallpaper = document.getElementById('wallpaper');
		if (wallpaper) {
			wallpaper.style.backgroundImage = '';
		}
	}
}

function setWallpaper(url: string) {
	const wallpaper = document.getElementById('wallpaper');
	if (wallpaper) {
		wallpaper.style.backgroundImage = `url('${url}')`;
	}
}

function addWallpaperFromUrl(url: string) {
	if (url) {
		wallpaperList = [...wallpaperList, url];
	}
}

function downloadCurrentWallpaper() {
	const wallpaper = document.getElementById('wallpaper');
	if (!wallpaper) return;
	
	const backgroundImage = wallpaper.style.backgroundImage;
	if (!backgroundImage) {
		alert('当前没有设置壁纸！');
		return;
	}
	
	const urlMatch = backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
	if (!urlMatch || !urlMatch[1]) {
		alert('无法获取壁纸URL！');
		return;
	}
	
	const url = urlMatch[1];
	
	fetch(url)
		.then(response => response.blob())
		.then(blob => {
			const blobUrl = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = blobUrl;
			const timestamp = new Date().getTime();
			link.download = `wallpaper_${timestamp}.jpg`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(blobUrl);
		})
		.catch(error => {
			console.error('下载壁纸失败:', error);
			alert('下载壁纸失败，请检查网络连接！');
		});
}
</script>

<div id="display-setting" class="float-panel float-panel-closed absolute transition-all w-80 right-4 px-4 py-4">
    <div class="flex flex-row gap-2 mb-3 items-center justify-between">
        <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
            before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:-left-3 before:top-[0.33rem]"
        >
            {i18n(I18nKey.themeColor)}
            <button aria-label="Reset to Default" class="btn-regular w-7 h-7 rounded-md  active:scale-90 will-change-transform"  
                    class:opacity-0={hue === defaultHue} class:pointer-events-none={hue === defaultHue} onclick={resetHue}>
                <div class="text-[var(--btn-content)]">
                    <Icon icon="fa6-solid:arrow-rotate-left" class="text-[0.875rem]"></Icon>
                </div>
            </button>
        </div>
        <div class="flex gap-1">
            <div id="hueValue" class="transition bg-[var(--btn-regular-bg)] w-10 h-7 rounded-md flex justify-center
            font-bold text-sm items-center text-[var(--btn-content)]">
                {hue}
            </div>
        </div>
    </div>
    <div class="w-full h-6 px-1 bg-[oklch(0.80_0.10_0)] dark:bg-[oklch(0.70_0.10_0)] rounded select-none mb-6">
        <input aria-label={i18n(I18nKey.themeColor)} type="range" min="0" max="360" bind:value={hue}
               class="slider" id="colorSlider" step="5" style="width: 100%" disabled={rainbowMode}>
    </div>
    
    <div class="flex flex-row gap-2 items-center justify-between mb-3">
        <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
            before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:-left-3 before:top-[0.33rem]"
        >
            开启背景
        </div>
        <button aria-label="Toggle Background" class="w-11 h-7 rounded-full bg-[var(--btn-regular-bg)] flex items-center px-1 active:scale-95 transition"
                onclick={() => backgroundEnabled = !backgroundEnabled}>
            <div class="w-5 h-5 rounded-full transition-all duration-300 transform {backgroundEnabled ? 'translate-x-4 bg-[var(--primary)]' : 'translate-x-0 bg-white dark:bg-gray-300'}"></div>
        </button>
    </div>
    
    <div class="flex flex-row gap-2 mb-3 items-center justify-between">
        <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
            before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:-left-3 before:top-[0.33rem]"
        >
            {useCustomWallpaper ? '切换自定义壁纸' : '切换随机壁纸'}
        </div>
        <button aria-label="Randomize Wallpaper Now" class="w-11 h-7 rounded-full bg-[var(--btn-regular-bg)] flex items-center px-2 active:scale-95 transition justify-center"
                onclick={randomizeWallpaper}>
            <Icon icon="fa6-solid:shuffle" class="text-[0.875rem] text-[var(--btn-content)]"></Icon>
        </button>
    </div>
    
    <div class="flex flex-row gap-2 mb-3 items-center justify-between">
        <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
            before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:-left-3 before:top-[0.33rem]"
        >
            背景模糊
        </div>
        <div id="backgroundBlurValue" class="transition bg-[var(--btn-regular-bg)] w-14 h-7 rounded-md flex justify-center
        font-bold text-sm items-center text-[var(--btn-content)]">
            {backgroundBlur}px
        </div>
    </div>
    <div class="w-full h-6 px-1 bg-[oklch(0.80_0.10_0)] dark:bg-[oklch(0.70_0.10_0)] rounded select-none mb-6">
        <input aria-label="Background Blur" type="range" min="0" max="20" bind:value={backgroundBlur}
               class="slider" id="backgroundBlurSlider" step="1" style="width: 100%">
    </div>
    
    <div class="flex flex-row gap-2 items-center justify-between mb-3">
        <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
            before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:-left-3 before:top-[0.33rem]"
        >
            {i18n(I18nKey.colorScheme)}
        </div>
        <LightDarkSwitch />
    </div>
    
    <div class="border-t border-[var(--btn-regular-bg)] my-4"></div>
    
    <div class="flex flex-row gap-2 items-center justify-between mb-3">
        <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
            before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:-left-3 before:top-[0.33rem]"
        >
            高级设置
        </div>
        <button aria-label="Toggle Advanced Settings" class="w-11 h-7 rounded-full bg-[var(--btn-regular-bg)] flex items-center px-1 active:scale-95 transition"
                onclick={() => showAdvancedSettings = !showAdvancedSettings}>
            <div class="w-5 h-5 rounded-full transition-all duration-300 transform {showAdvancedSettings ? 'translate-x-4 bg-[var(--primary)]' : 'translate-x-0 bg-white dark:bg-gray-300'}"></div>
        </button>
    </div>
    
    {#if showAdvancedSettings}
        <div class="advanced-settings-panel">
            <div class="flex flex-row gap-2 items-center justify-between mb-3">
                <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
                    before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
                    before:absolute before:-left-3 before:top-[0.33rem]"
                >
                    彩虹模式
                </div>
                <button aria-label="Toggle Rainbow Mode" class="w-11 h-7 rounded-full bg-[var(--btn-regular-bg)] flex items-center px-1 active:scale-95 transition"
                        onclick={() => rainbowMode = !rainbowMode}>
                    <div class="w-5 h-5 rounded-full transition-all duration-300 transform {rainbowMode ? 'translate-x-4 bg-[var(--primary)]' : 'translate-x-0 bg-white dark:bg-gray-300'}"></div>
                </button>
            </div>
            
            <div class="flex flex-row gap-2 items-center justify-between mb-3">
                <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
                    before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
                    before:absolute before:-left-3 before:top-[0.33rem]"
                >
                    变换速率
                </div>
                <div id="rainbowSpeedValue" class="transition bg-[var(--btn-regular-bg)] w-14 h-7 rounded-md flex justify-center
                font-bold text-sm items-center text-[var(--btn-content)]">
                    {rainbowSpeed}ms
                </div>
            </div>
            <div class="w-full h-6 px-1 bg-[oklch(0.80_0.10_0)] dark:bg-[oklch(0.70_0.10_0)] rounded select-none mb-6">
                <input aria-label="Rainbow Speed" type="range" min={minSpeed} max={maxSpeed} bind:value={rainbowSpeedSlider}
                       class="slider" id="rainbowSpeedSlider" step="5" style="width: 100%">
            </div>
            
            <div class="border-t border-[var(--btn-regular-bg)] my-4"></div>
            
            <div class="flex flex-row gap-2 items-center justify-between mb-3">
                <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
                    before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
                    before:absolute before:-left-3 before:top-[0.33rem]"
                >
                    启用自定义壁纸
                </div>
                <button aria-label="Toggle Custom Wallpaper" class="w-11 h-7 rounded-full bg-[var(--btn-regular-bg)] flex items-center px-1 active:scale-95 transition"
                        onclick={() => useCustomWallpaper = !useCustomWallpaper}>
                    <div class="w-5 h-5 rounded-full transition-all duration-300 transform {useCustomWallpaper ? 'translate-x-4 bg-[var(--primary)]' : 'translate-x-0 bg-white dark:bg-gray-300'}"></div>
                </button>
            </div>
            
            <div class="flex flex-row gap-2 items-center justify-between mb-3">
                <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
                    before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
                    before:absolute before:-left-3 before:top-[0.33rem]"
                >
                    壁纸导入
                </div>
                <div class="flex gap-1">
                    <button aria-label="Import Wallpaper" class="btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90 transition justify-center flex items-center"
                            onclick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.multiple = true;
                                input.onchange = (e) => {
                                    const files = (e.target as HTMLInputElement).files;
                                    if (files) {
                                        Array.from(files).forEach(file => {
                                            const reader = new FileReader();
                                            reader.onload = (e) => {
                                                wallpaperList = [...wallpaperList, e.target?.result as string];
                                                localStorage.setItem('wallpaperList', JSON.stringify(wallpaperList));
                                            };
                                            reader.readAsDataURL(file);
                                        });
                                    }
                                };
                                input.click();
                            }}>
                        <Icon icon="fa6-regular:images" class="text-[0.875rem]"></Icon>
                    </button>
                </div>
            </div>
            
            <div class="flex flex-row gap-2 mb-3 items-center justify-between">
                <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
                    before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
                    before:absolute before:-left-3 before:top-[0.33rem]"
                >
                    壁纸URL
                </div>
                <div class="flex gap-1">
                    <input type="text" placeholder="输入壁纸URL" 
                           class="bg-[var(--btn-regular-bg)] rounded-md px-2 py-1 text-sm w-40 text-[var(--btn-content)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                           onchange={(e) => {
                               const url = (e.target as HTMLInputElement).value;
                               if (url) {
                                   addWallpaperFromUrl(url);
                                   (e.target as HTMLInputElement).value = '';
                               }
                           }}>
                </div>
            </div>
            
            {#if wallpaperList.length > 0}
                <div class="mb-3">
                    <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3 mb-2
                        before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
                        before:absolute before:-left-3 before:top-[0.33rem]"
                    >
                        壁纸列表 ({wallpaperList.length})
                    </div>
                    <div class="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-[var(--btn-regular-bg)] rounded-md custom-scrollbar">
                        {#each wallpaperList as wallpaper, index}
                            <div class="relative group cursor-pointer" onclick={() => setWallpaper(wallpaper)}>
                                <div class="w-full h-16 bg-cover bg-center rounded-md" style={`background-image: url('${wallpaper}')`}></div>
                                <button aria-label="Remove Wallpaper" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        onclick={(e) => { e.stopPropagation(); removeWallpaper(index); }}>
                                    ×
                                </button>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    {/if}
    
    <div class="border-t border-[var(--btn-regular-bg)] my-4"></div>
    
    <div class="flex flex-row gap-2 items-center justify-between mb-3">
        <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
            before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:-left-3 before:top-[0.33rem]"
        >
            其他功能
        </div>
        <button aria-label="Toggle Other Features" class="w-11 h-7 rounded-full bg-[var(--btn-regular-bg)] flex items-center px-1 active:scale-95 transition"
                onclick={() => showOtherFeatures = !showOtherFeatures}>
            <div class="w-5 h-5 rounded-full transition-all duration-300 transform {showOtherFeatures ? 'translate-x-4 bg-[var(--primary)]' : 'translate-x-0 bg-white dark:bg-gray-300'}"></div>
        </button>
    </div>
    
    {#if showOtherFeatures}
        <div class="other-features-panel">
            <div class="flex flex-row gap-2 items-center justify-between mb-3">
                <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
                    before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
                    before:absolute before:-left-3 before:top-[0.33rem]"
                >
                    下载壁纸
                </div>
                <div class="flex gap-1">
                    <button aria-label="Download Wallpaper" class="btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90 transition justify-center flex items-center"
                            onclick={downloadCurrentWallpaper}>
                        <Icon icon="fa6-solid:download" class="text-[0.875rem]"></Icon>
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>


<style lang="stylus">
    #display-setting
      input[type="range"]
        -webkit-appearance none
        height 1.5rem
        background-image var(--color-selection-bar)
        transition background-image 0.15s ease-in-out

        /* Input Thumb */
        &::-webkit-slider-thumb
          -webkit-appearance none
          height 1rem
          width 0.5rem
          border-radius 0.125rem
          background rgba(255, 255, 255, 0.7)
          box-shadow none
          &:hover
            background rgba(255, 255, 255, 0.8)
          &:active
            background rgba(255, 255, 255, 0.6)

        &::-moz-range-thumb
          -webkit-appearance none
          height 1rem
          width 0.5rem
          border-radius 0.125rem
          border-width 0
          background rgba(255, 255, 255, 0.7)
          box-shadow none
          &:hover
            background rgba(255, 255, 255, 0.8)
          &:active
            background rgba(255, 255, 255, 0.6)

        &::-ms-thumb
          -webkit-appearance none
          height 1rem
          width 0.5rem
          border-radius 0.125rem
          background rgba(255, 255, 255, 0.7)
          box-shadow none
          &:hover
            background rgba(255, 255, 255, 0.8)
          &:active
            background rgba(255, 255, 255, 0.6)

      .custom-scrollbar
        &::-webkit-scrollbar
          width 8px
        &::-webkit-scrollbar-track
          background transparent
        &::-webkit-scrollbar-thumb
          background rgba(128, 128, 128, 0.3)
          border-radius 4px
          &:hover
            background rgba(128, 128, 128, 0.5)

</style>
