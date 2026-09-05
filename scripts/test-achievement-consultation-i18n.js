const assert = require("assert");
const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");
const traverse = require("@babel/traverse").default;
const { parse, compileTemplate } = require("@vue/compiler-sfc");
const { createI18n } = require("vue-i18n");

const root = path.resolve(__dirname, "..");
const localeRoot = path.join(root, "src/locale");
const locales = ["zh-CN", "zh-TW", "en-US", "vi"];
const prefix = "achievementConsultation.";
const statuses = ["pending", "answered", "cancelled"];

function load(file, localRequire = require) {
    const { code } = babel.transformFileSync(file, { babelrc: false, configFile: false,
        plugins: [require.resolve("@babel/plugin-transform-modules-commonjs")] });
    const module = { exports: {} };
    new Function("module", "exports", "require", code)(module, module.exports, localRequire);
    return module.exports;
}

// Exercise the existing webpack locale discovery instead of manually registering the new module.
const localRequire = (name) => require(name);
localRequire.context = (directory, recursive, pattern) => {
    assert.strictEqual(directory, "./");
    assert.strictEqual(recursive, true);
    const keys = fs.readdirSync(localeRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory())
        .flatMap((entry) => fs.readdirSync(path.join(localeRoot, entry.name)).map((file) => `./${entry.name}/${file}`))
        .filter((file) => pattern.test(file));
    const context = (key) => load(path.join(localeRoot, key));
    context.keys = () => keys;
    return context;
};
const { mergeAppLocaleMessages } = load(path.join(localeRoot, "index.js"), localRequire);
const i18n = createI18n({ legacy: false, locale: "zh-CN", fallbackLocale: false, messages: {} });
mergeAppLocaleMessages(i18n);

function files(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const file = path.join(directory, entry.name);
        return entry.isDirectory() ? files(file) : /\.(js|vue)$/.test(entry.name) ? [file] : [];
    });
}
const usedKeys = new Set(statuses.map((status) => prefix + status));
for (const filename of files(path.join(root, "src"))) {
    const source = fs.readFileSync(filename, "utf8");
    if (!source.includes(prefix)) continue;
    let scripts = [source];
    if (filename.endsWith(".vue")) {
        const { descriptor } = parse(source);
        const template = compileTemplate({ source: descriptor.template.content, filename, id: "consultation-i18n" });
        assert.deepStrictEqual(template.errors, []);
        scripts = [descriptor.script.content, template.code];
    }
    for (const script of scripts) {
        const ast = babel.parseSync(script, { sourceType: "module", babelrc: false, configFile: false });
        traverse(ast, {
            StringLiteral({ node }) { if (node.value.startsWith(prefix)) usedKeys.add(node.value); },
            TemplateLiteral({ node }) {
                if (node.quasis[0].value.cooked !== prefix) return;
                const expression = node.expressions[0];
                assert(expression?.name === "value" || expression?.property?.name === "status", "Cover new dynamic consultation keys in this test");
                statuses.forEach((status) => usedKeys.add(prefix + status));
            },
        });
    }
}
assert(usedKeys.has(prefix + "title"));
assert(usedKeys.has(prefix + "submitAdvice"));
const baseline = Object.keys(i18n.global.getLocaleMessage("zh-CN").achievementConsultation).sort();
const missing = [];
i18n.global.missing = (locale, key) => { missing.push(`${locale}:${key}`); };
for (const locale of locales) {
    const messages = i18n.global.getLocaleMessage(locale).achievementConsultation;
    assert(messages, `Missing consultation module: ${locale}`);
    assert.deepStrictEqual(Object.keys(messages).sort(), baseline, `Locale keys differ: ${locale}`);
    i18n.global.locale.value = locale;
    for (const key of usedKeys) {
        assert(i18n.global.te(key, locale), `Missing translation: ${locale}:${key}`);
        const value = i18n.global.t(key, { submitted: 13, answered: 8, pending: 5 });
        assert(value.trim() && value !== key, `Untranslated key: ${locale}:${key}`);
    }
    const summary = i18n.global.t(prefix + "statsSummary", { submitted: 13, answered: 8, pending: 5 });
    for (const count of [13, 8, 5]) assert(summary.includes(String(count)), `Missing statistic: ${locale}:${count}`);
    assert(!summary.includes("{"), `Unresolved interpolation: ${locale}`);
}
assert.deepStrictEqual(missing, []);
assert.strictEqual(i18n.global.t(prefix + "title", {}, { locale: "zh-CN" }), "渡劫咨询");
i18n.dispose();
console.log(`Consultation i18n passed: ${usedKeys.size} keys across ${locales.length} locales, discovery and runtime interpolation.`);
