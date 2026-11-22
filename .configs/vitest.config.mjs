/**
 *	@Project: @cldmv/digby-ext-resolver
 *	@Filename: /.configs/vitest.config.mjs
 */

import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Anchor the project root to the package directory so include/exclude work no matter what cwd vitest is invoked from.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export default defineConfig({
	root,
	test: {
		include: ["tests/**/*.test.vitest.mjs"],
		exclude: ["node_modules"],
		environment: "node",
		// Inline slothlet and rummage so composed leaves are attributed in coverage (see slothlet docs/TESTING.md).
		server: { deps: { inline: [/@cldmv\/slothlet/, /@cldmv\/rummage/] } },
		testTimeout: 30000,
		reporters: ["dot"],
		coverage: {
			provider: "v8",
			include: ["src/**"],
			exclude: ["**/*.json"],
			reporter: ["text", "html", "json-summary", "json"]
		}
	}
});
