import node from "@astrojs/node";
import react from "@astrojs/react";
import { auditLogPlugin } from "@emdash-cms/plugin-audit-log";
import { defineConfig, fontProviders } from "astro/config";
import emdash, { local } from "emdash/astro";
import { sqlite } from "emdash/db";

// Google OAuth credentials
// These are set as environment variables for the OAuth routes to consume
process.env.EMDASH_OAUTH_GOOGLE_CLIENT_ID = "360824854013-mnlffhgjru4tfjnql1kmk97leobmtj8n.apps.googleusercontent.com";
process.env.EMDASH_OAUTH_GOOGLE_CLIENT_SECRET = "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";

// Production domain - change this before building for production
const SITE_URL = process.env.EMDASH_SITE_URL || process.env.SITE_URL || "https://iot.admin.id";

// Extract hostname from SITE_URL for passkey rpId
const getHostname = (url) => {
	try {
		return new URL(url).hostname;
	} catch {
		return "localhost";
	}
};

export default defineConfig({
	output: "server",
	adapter: node({
		mode: "standalone",
	}),
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		emdash({
			database: sqlite({ url: "file:./data.db" }),
			storage: local({
				directory: "./uploads",
				baseUrl: "/_emdash/api/media/file",
			}),
			plugins: [auditLogPlugin()],
			// Site URL - set via env var before build or update the default above
			siteUrl: SITE_URL,
			// Auth configuration with passkeys
			auth: {
				// Generate a secure secret: npx emdash auth secret
				secret: process.env.EMDASH_AUTH_SECRET || "jTSfPtth1SDTOy5e1WShse0EIu0SUD6fq5LoifYjs9c",
				passkeys: {
					rpName: "IoT Admin",
					rpId: getHostname(SITE_URL),
				},
			},
		}),
	],
	fonts: [
		{
			provider: fontProviders.google(),
			name: "Inter",
			cssVariable: "--font-sans",
			weights: [400, 500, 600, 700],
			fallbacks: ["sans-serif"],
		},
		{
			provider: fontProviders.google(),
			name: "JetBrains Mono",
			cssVariable: "--font-mono",
			weights: [400, 500],
			fallbacks: ["monospace"],
		},
	],
	devToolbar: { enabled: false },
});
