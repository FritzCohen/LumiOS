/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,json}"],
	corePlugins: {
		textColor: true,
	},
	theme: {
		colors: {
			// ---- Core palette ----
			background: "var(--background)",
			backgroundAlt: "var(--background-alt)",

			surface: "var(--surface)",
			surfaceAlt: "var(--surface-alt)",

			accent: "var(--accent)",
			accentAlt: "var(--accent-alt)",

			// ---- Intent colors ----
			success: "var(--success)",
			warning: "var(--warning)",
			danger: "var(--danger)",
			info: "var(--info)",

			// ---- Text colors ----
			text: {
				primary: "var(--text-primary)",
				secondary: "var(--text-secondary)",
				disabled: "var(--text-disabled)",
			},

			// ---- Border colors ----
			border: {
				default: "var(--border)",
				subtle: "var(--border-subtle)",
			},
		},

		extend: {},
	},

	keyframes: {
		focusGlow: {
			"0%": { boxShadow: "0 0 0 0 rgba(0, 120, 212, 0.7)" },
			"100%": { boxShadow: "0 0 0 6px rgba(0, 120, 212, 0)" },
		},
	},
	animation: {
		glow: "focusGlow 0.4s ease-out",
	},
	plugins: [
		function ({ addComponents }) {
			const newUtilities = {
				".fade-in": {
					"@apply opacity-0 transition-opacity ease-linear duration-700":
						{},
					"&.show": {
						"@apply opacity-100": {},
					},
				},
			};
			addComponents(newUtilities);
		},
	],
};
