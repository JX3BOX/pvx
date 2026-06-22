const fs = require("fs");
const path = require("path");
const acorn = require("acorn");

const jsDir = path.resolve(__dirname, "../dist/js");

function collectJsFiles(dir) {
    if (!fs.existsSync(dir)) return [];

    return fs.readdirSync(dir).flatMap((name) => {
        const file = path.join(dir, name);
        const stat = fs.statSync(file);

        if (stat.isDirectory()) return collectJsFiles(file);
        return name.endsWith(".js") ? [file] : [];
    });
}

const failures = [];

for (const file of collectJsFiles(jsDir)) {
    const code = fs.readFileSync(file, "utf8");

    try {
        acorn.parse(code, {
            ecmaVersion: 2019,
            sourceType: "script",
        });
    } catch (error) {
        failures.push({
            file: path.relative(process.cwd(), file),
            message: error.message,
        });
    }
}

if (failures.length) {
    console.error("Legacy JS syntax check failed. Chrome 76 cannot parse these bundles:");
    failures.forEach((failure) => {
        console.error(`- ${failure.file}: ${failure.message}`);
    });
    process.exit(1);
}

console.log("Legacy JS syntax check passed.");
