<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { getDefaultHue, getHue, setHue, getRainbowMode, setRainbowMode, startRainbowMode, stopRainbowMode, getRainbowSpeed, setRainbowSpeed, updateRainbowSpeed, getBackgroundEnabled, setBackgroundEnabled, getBackgroundBlur, setBackgroundBlur } from "@utils/setting-utils";
import LightDarkSwitch from "../LightDarkSwitch.svelte";

let hue = getHue();
let rainbowMode = getRainbowMode();
let backgroundEnabled = getBackgroundEnabled();
let backgroundBlur = getBackgroundBlur();

// Wallpaper rotation feature
let wallpaperList: string[] = JSON.parse(localStorage.getItem('wallpaperList') || '[]');
let autoRotate = localStorage.getItem('autoRotate') === 'true';
let rotateInterval: number | null = null;
let rotateIntervalTime = Number(localStorage.getItem('rotateIntervalTime')) || 5000;

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

// Wallpaper rotation logic
$: {
	localStorage.setItem('wallpaperList', JSON.stringify(wallpaperList));
	localStorage.setItem('autoRotate', String(autoRotate));
	localStorage.setItem('rotateIntervalTime', String(rotateIntervalTime));
	
	if (autoRotate && wallpaperList.length > 0) {
		if (rotateInterval) {
			clearInterval(rotateInterval);
		}
		rotateInterval = window.setInterval(() => {
			randomizeWallpaper();
		}, rotateIntervalTime);
	} else if (rotateInterval) {
		clearInterval(rotateInterval);
		rotateInterval = null;
	}
}

function randomizeWallpaper() {
	if (wallpaperList.length === 0) return;
	const randomIndex = Math.floor(Math.random() * wallpaperList.length);
	const wallpaper = document.getElementById('wallpaper');
	if (wallpaper) {
		wallpaper.style.backgroundImage = `url('${wallpaperList[randomIndex]}')`;
	}
}

function removeWallpaper(index: number) {
	wallpaperList.splice(index, 1);
	if (wallpaperList.length === 0) {
		const wallpaper = document.getElementById('wallpaper');
		if (wallpaper) {
			wallpaper.style.backgroundImage = '';
		}
	}
}

function addWallpaperFromUrl(url: string) {
	if (url) {
		wallpaperList.push(url);
	}
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
            彩虹模式
        </div>
        <button aria-label="Toggle Rainbow Mode" class="w-11 h-7 rounded-full bg-[var(--btn-regular-bg)] flex items-center px-1 active:scale-95 transition"
                onclick={() => rainbowMode = !rainbowMode}>
            <div class="w-5 h-5 rounded-full transition-all duration-300 transform {rainbowMode ? 'translate-x-4 bg-[var(--primary)]' : 'translate-x-0 bg-white dark:bg-gray-300'}"></div>
        </button>
    </div>
    
    <div class="flex flex-row gap-2 mb-3 items-center justify-between">
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
                                        wallpaperList.push(e.target?.result as string);
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
    
    <div class="flex flex-row gap-2 items-center justify-between mb-3">
        <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
            before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:-left-3 before:top-[0.33rem]"
        >
            随机切换
        </div>
        <button aria-label="Toggle Auto Rotate" class="w-11 h-7 rounded-full bg-[var(--btn-regular-bg)] flex items-center px-1 active:scale-95 transition"
                onclick={() => autoRotate = !autoRotate}>
            <div class="w-5 h-5 rounded-full transition-all duration-300 transform {autoRotate ? 'translate-x-4 bg-[var(--primary)]' : 'translate-x-0 bg-white dark:bg-gray-300'}"></div>
        </button>
    </div>
    
    <div class="flex flex-row gap-2 mb-3 items-center justify-between">
        <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
            before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:-left-3 before:top-[0.33rem]"
        >
            切换间隔
        </div>
        <div class="flex gap-1">
            <input type="range" min="1000" max="30000" step="1000" bind:value={rotateIntervalTime}
                   class="w-28 h-6 px-1 bg-[oklch(0.80_0.10_0)] dark:bg-[oklch(0.70_0.10_0)] rounded select-none slider">
            <div class="transition bg-[var(--btn-regular-bg)] w-16 h-7 rounded-md flex justify-center
            font-bold text-sm items-center text-[var(--btn-content)]">
                {rotateIntervalTime / 1000}s
            </div>
        </div>
    </div>
    
    <div class="flex flex-row gap-2 mb-3 items-center justify-between">
        <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
            before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:-left-3 before:top-[0.33rem]"
        >
            立即切换
        </div>
        <button aria-label="Randomize Wallpaper Now" class="w-11 h-7 rounded-full bg-[var(--btn-regular-bg)] flex items-center px-2 active:scale-95 transition justify-center"
                onclick={randomizeWallpaper}>
            <Icon icon="fa6-solid:shuffle" class="text-[0.875rem] text-[var(--btn-content)]"></Icon>
        </button>
    </div>
    
    <!-- Wallpaper List -->
    {#if wallpaperList.length > 0}
        <div class="mb-3">
            <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3 mb-2
                before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
                before:absolute before:-left-3 before:top-[0.33rem]"
            >
                壁纸列表 ({wallpaperList.length})
            </div>
            <div class="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-[var(--btn-regular-bg)] rounded-md">
                {#each wallpaperList as wallpaper, index}
                    <div class="relative group">
                        <div class="w-full h-16 bg-cover bg-center rounded-md" style={`background-image: url('${wallpaper}')`}></div>
                        <button aria-label="Remove Wallpaper" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                onclick={() => removeWallpaper(index)}>
                            ×
                        </button>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
    
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

</style>
