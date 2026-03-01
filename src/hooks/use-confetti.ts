import { useCallback } from "react";

type ConfettiPreset = "burst" | "fireworks" | "rain" | "side-cannons";

/**
 * useConfetti - Dynamic-import confetti hook (zero bundle cost until fired)
 *
 * Usage:
 * const { fire } = useConfetti();
 * fire("burst");       // center burst
 * fire("fireworks");   // 3 firework bursts
 * fire("side-cannons"); // cannons from both sides
 */
export function useConfetti() {
	const fire = useCallback(async (preset: ConfettiPreset = "burst") => {
		const confetti = (await import("canvas-confetti")).default;

		switch (preset) {
			case "burst":
				confetti({
					particleCount: 100,
					spread: 70,
					origin: { y: 0.6 },
				});
				break;

			case "fireworks": {
				const duration = 1500;
				const end = Date.now() + duration;

				const frame = () => {
					confetti({
						particleCount: 3,
						angle: 60,
						spread: 55,
						origin: { x: 0, y: 0.7 },
					});
					confetti({
						particleCount: 3,
						angle: 120,
						spread: 55,
						origin: { x: 1, y: 0.7 },
					});
					if (Date.now() < end) requestAnimationFrame(frame);
				};
				frame();
				break;
			}

			case "rain": {
				const duration = 2000;
				const end = Date.now() + duration;
				const defaults = { startVelocity: 15, spread: 360, ticks: 60, zIndex: 9999 };

				const frame = () => {
					confetti({
						...defaults,
						particleCount: 2,
						origin: { x: Math.random(), y: Math.random() * 0.3 },
					});
					if (Date.now() < end) requestAnimationFrame(frame);
				};
				frame();
				break;
			}

			case "side-cannons":
				confetti({
					particleCount: 80,
					angle: 60,
					spread: 55,
					origin: { x: 0, y: 0.65 },
				});
				confetti({
					particleCount: 80,
					angle: 120,
					spread: 55,
					origin: { x: 1, y: 0.65 },
				});
				break;
		}
	}, []);

	return { fire };
}
