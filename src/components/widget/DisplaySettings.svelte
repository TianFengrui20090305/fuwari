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
</script>

<div id="display-setting" class="float-panel float-panel-closed absolute transition-all w-80 right-4 px-4 py-4">
    <div class="flex flex-row gap-2 mb-3 items-center justify-between">
        <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
            before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:-left-3 before:top-[0.33rem]"
        >
            {i18n(I18nKey.themeColor)}
            <button aria-label="Reset to Default" class="btn-regular w-7 h-7 rounded-md  active:scale-90 will-change-transform"
                    class:opacity-0={hue === defaultHue} class:pointer-events-none={hue === defaultHue} on:click={resetHue}>
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
                on:click={() => rainbowMode = !rainbowMode}>
            <div class="w-5 h-5 rounded-full transition-all duration-300 transform {rainbowMode ? 'translate-x-4 bg-[var(--primary)]' : 'translate-x-0 bg-white dark:bg-gray-300'}"></div>
        </button>
    </div>
    
    <div class="flex flex-row gap-2 items-center justify-between mb-3">
        <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
            before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:-left-3 before:top-[0.33rem]"
        >
            开启背景
        </div>
        <button aria-label="Toggle Background" class="w-11 h-7 rounded-full bg-[var(--btn-regular-bg)] flex items-center px-1 active:scale-95 transition"
                on:click={() => backgroundEnabled = !backgroundEnabled}>
            <div class="w-5 h-5 rounded-full transition-all duration-300 transform {backgroundEnabled ? 'translate-x-4 bg-[var(--primary)]' : 'translate-x-0 bg-white dark:bg-gray-300'}"></div>
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
