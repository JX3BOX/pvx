const path = require("path");
const { spawnSync } = require("child_process");

const suites = [
    "statistics",
    "difficulty-stars",
    "workbench",
    "progress",
    "compare",
    "leap",
    "service",
    "recommendation",
    "recommendation-tags",
    "web-contract",
];

for (const suite of suites) {
    console.log(`\n[achievement] ${suite}`);
    const result = spawnSync(process.execPath, [path.join(__dirname, `test-achievement-${suite}.js`)], {
        cwd: path.resolve(__dirname, ".."),
        stdio: "inherit",
    });
    if (result.error || result.status !== 0) {
        console.error(`[achievement] ${suite} failed`, result.error || result.signal || "");
        process.exit(result.status || 1);
    }
}

console.log(`\nAll ${suites.length} achievement test suites passed.`);
