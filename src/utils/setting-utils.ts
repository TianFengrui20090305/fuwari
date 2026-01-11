import {
	AUTO_MODE,
	DARK_MODE,
	DEFAULT_THEME,
	LIGHT_MODE,
} from "@constants/constants.ts";
import { expressiveCodeConfig } from "@/config";
import type { LIGHT_DARK_MODE } from "@/types/config";

export function getDefaultHue(): number {
	const fallback = "250";
	const configCarrier = document.getElementById("config-carrier");
	return Number.parseInt(configCarrier?.dataset.hue || fallback, 10);
}

export function getHue(): number {
	const stored = localStorage.getItem("hue");
	return stored ? Number.parseInt(stored, 10) : getDefaultHue();
}

export function setHue(hue: number): void {
	localStorage.setItem("hue", String(hue));
	const r = document.querySelector(":root") as HTMLElement;
	if (!r) {
		return;
	}
	r.style.setProperty("--hue", String(hue));
}

// Rainbow mode functions
export function getRainbowMode(): boolean {
	return localStorage.getItem("rainbowMode") === "true";
}

export function setRainbowMode(enabled: boolean): void {
	localStorage.setItem("rainbowMode", String(enabled));
}

export function getRainbowSpeed(): number {
	return Number(localStorage.getItem("rainbowSpeed")) || 30; // 降低默认速率，从50ms改为30ms
}

export function setRainbowSpeed(speed: number): void {
	localStorage.setItem("rainbowSpeed", String(speed));
}

let rainbowInterval: number | null = null;

export function startRainbowMode(): void {
	if (rainbowInterval) return;

	let hue = getHue();
	const speed = getRainbowSpeed();
	rainbowInterval = window.setInterval(() => {
		hue = (hue + 3) % 360; // 增加每次变化的角度增量，从1度提高到3度
		const r = document.querySelector(":root") as HTMLElement;
		if (r) {
			r.style.setProperty("--hue", String(hue));
		}
	}, speed);
}

export function stopRainbowMode(): void {
	if (rainbowInterval) {
		clearInterval(rainbowInterval);
		rainbowInterval = null;
		// Reset hue to stored value when stopping rainbow mode
		const hue = getHue();
		const r = document.querySelector(":root") as HTMLElement;
		if (r) {
			r.style.setProperty("--hue", String(hue));
		}
	}
}

export function updateRainbowSpeed(): void {
	if (rainbowInterval) {
		stopRainbowMode();
		startRainbowMode();
	}
}

export function applyThemeToDocument(theme: LIGHT_DARK_MODE) {
	switch (theme) {
		case LIGHT_MODE:
			document.documentElement.classList.remove("dark");
			break;
		case DARK_MODE:
			document.documentElement.classList.add("dark");
			break;
		case AUTO_MODE:
			if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
				document.documentElement.classList.add("dark");
			} else {
				document.documentElement.classList.remove("dark");
			}
			break;
	}

	// Set the theme for Expressive Code
	document.documentElement.setAttribute(
		"data-theme",
		expressiveCodeConfig.theme,
	);
}

export function setTheme(theme: LIGHT_DARK_MODE): void {
	localStorage.setItem("theme", theme);
	applyThemeToDocument(theme);
}

export function getStoredTheme(): LIGHT_DARK_MODE {
	return (localStorage.getItem("theme") as LIGHT_DARK_MODE) || DEFAULT_THEME;
}

// Background settings functions
export function getBackgroundEnabled(): boolean {
	return localStorage.getItem("backgroundEnabled") === "true";
}

export function setBackgroundEnabled(enabled: boolean): void {
	localStorage.setItem("backgroundEnabled", String(enabled));
	const wallpaper = document.getElementById("wallpaper");
	if (wallpaper) {
		if (enabled) {
			wallpaper.classList.remove("hidden");
		} else {
			wallpaper.classList.add("hidden");
		}
	}
}

export function getBackgroundBlur(): number {
	return Number(localStorage.getItem("backgroundBlur")) || 0;
}

export function setBackgroundBlur(blur: number): void {
	localStorage.setItem("backgroundBlur", String(blur));
	const wallpaper = document.getElementById("wallpaper");
	if (wallpaper) {
		wallpaper.style.filter = `blur(${blur}px)`;
	}
}
