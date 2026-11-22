/**
 *	@Project: @cldmv/digby-ext-resolver
 *	@Filename: /tests/engines.test.vitest.mjs
 */

import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Parse the lower bound of a `>=X.Y.Z` engines range.
 * @param {string} range - an engines.node range of the form ">=X.Y.Z"
 * @returns {number[]} [major, minor, patch]
 */
function floorOf(range) {
	const m = /^\s*>=\s*(\d+)(?:\.(\d+))?(?:\.(\d+))?\s*$/.exec(range);
	if (!m) throw new Error(`unsupported engines.node range: ${range}`);
	return [Number(m[1]), Number(m[2] ?? 0), Number(m[3] ?? 0)];
}

/**
 * Compare two [major, minor, patch] triples.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number} negative when a < b, zero when equal, positive when a > b
 */
function compare(a, b) {
	for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i];
	return 0;
}

/**
 * Find the installed slothlet package.json by walking up node_modules from the resolved @cldmv/rummage package.
 * @returns {string} absolute path of slothlet's package.json
 */
function findSlothlet() {
	const rummageDir = fs.realpathSync(path.join(root, "node_modules", "@cldmv", "rummage"));
	for (let dir = rummageDir; ; dir = path.dirname(dir)) {
		const candidate = path.join(dir, "node_modules", "@cldmv", "slothlet", "package.json");
		if (fs.existsSync(candidate)) return candidate;
		if (path.dirname(dir) === dir) throw new Error("@cldmv/slothlet is not installed beneath @cldmv/rummage");
	}
}

describe("engines.node", () => {
	it("is not below the floor of @cldmv/slothlet (a transitive runtime dependency via @cldmv/rummage)", () => {
		const own = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
		const slothlet = JSON.parse(fs.readFileSync(findSlothlet(), "utf8"));
		expect(slothlet.engines?.node, "slothlet declares engines.node").toBeTruthy();
		const ownFloor = floorOf(own.engines.node);
		const dependencyFloor = floorOf(slothlet.engines.node);
		expect(compare(ownFloor, dependencyFloor), `engines.node ${own.engines.node} vs slothlet ${slothlet.engines.node}`).toBeGreaterThanOrEqual(0);
	});
});
