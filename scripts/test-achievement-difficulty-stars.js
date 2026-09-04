const assert = require("assert");
const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");
const { compileTemplate, parse } = require("@vue/compiler-sfc");
const { createSSRApp, h } = require("vue");
const { renderToString } = require("@vue/server-renderer");

const ROOT = path.resolve(__dirname, "..");
const COMPONENT_PATH = path.join(ROOT, "src/components/wiki/AchievementDifficultyStars.vue");
const SUMMARY_COMPONENT_PATH = path.join(ROOT, "src/components/wiki/leap/AchievementLeapSummary.vue");
const WORKBENCH_PATH = path.join(ROOT, "src/utils/achievementWorkbench.js");

function transformModule(source, filename) {
    return babel.transformSync(source, {
        filename,
        babelrc: false,
        configFile: false,
        presets: [[require.resolve("@babel/preset-env"), { targets: { node: "current" } }]],
    }).code;
}

function evaluateModule(source, filename, localRequire = require) {
    const loadedModule = { exports: {} };
    new Function("module", "exports", "require", transformModule(source, filename))(
        loadedModule,
        loadedModule.exports,
        localRequire
    );
    return loadedModule.exports;
}

function loadDifficultyStars() {
    const source = fs.readFileSync(COMPONENT_PATH, "utf8");
    const { descriptor, errors } = parse(source, { filename: COMPONENT_PATH });
    assert.deepStrictEqual(errors, []);

    const workbench = evaluateModule(fs.readFileSync(WORKBENCH_PATH, "utf8"), WORKBENCH_PATH);
    const componentModule = evaluateModule(descriptor.script.content, COMPONENT_PATH, (request) => {
        if (request === "@/utils/achievementWorkbench") return workbench;
        return require(request);
    });
    const templateResult = compileTemplate({
        source: descriptor.template.content,
        filename: COMPONENT_PATH,
        id: "achievement-difficulty-stars",
    });
    assert.deepStrictEqual(templateResult.errors, []);
    const templateModule = evaluateModule(templateResult.code, `${COMPONENT_PATH}?template`);

    const component = componentModule.default || componentModule;
    component.render = templateModule.render;
    return component;
}

async function renderRating(value, label = "金钱") {
    return renderToString(createSSRApp(loadDifficultyStars(), { value, label }));
}

function loadLeapSummary() {
    const source = fs.readFileSync(SUMMARY_COMPONENT_PATH, "utf8");
    const { descriptor, errors } = parse(source, { filename: SUMMARY_COMPONENT_PATH });
    assert.deepStrictEqual(errors, []);

    const workbench = evaluateModule(fs.readFileSync(WORKBENCH_PATH, "utf8"), WORKBENCH_PATH);
    const difficultyStars = loadDifficultyStars();
    const surface = {
        name: "PvxSurface",
        render() {
            return h("section", this.$attrs, this.$slots.default?.());
        },
    };
    const asEsModule = (value) => ({ __esModule: true, default: value });
    const componentModule = evaluateModule(descriptor.script.content, SUMMARY_COMPONENT_PATH, (request) => {
        if (request === "@/utils/achievementWorkbench") return workbench;
        if (request === "@/components/wiki/AchievementDifficultyStars.vue") return asEsModule(difficultyStars);
        if (request === "@/components/design/PvxSurface.vue") return asEsModule(surface);
        return require(request);
    });
    const templateResult = compileTemplate({
        source: descriptor.template.content,
        filename: SUMMARY_COMPONENT_PATH,
        id: "achievement-leap-summary",
    });
    assert.deepStrictEqual(templateResult.errors, []);
    const templateModule = evaluateModule(templateResult.code, `${SUMMARY_COMPONENT_PATH}?template`);

    const component = componentModule.default || componentModule;
    component.render = templateModule.render;
    return component;
}

async function renderLeapSummary(averageDifficulty) {
    const route = {
        averageDifficulty,
        items: [],
        projectedPoints: 100,
        reached: true,
        remainingGap: 0,
        requestedStrategy: "balanced",
        selectedPoints: 20,
        strategy: "balanced",
        targetGap: 10,
        totalMinutes: 30,
    };
    const translations = {
        "pages.wiki.leap.ui.workbench.averageDifficulty": "平均难度",
    };
    const app = createSSRApp(loadLeapSummary(), { route, title: "测试方案" });
    app.config.globalProperties.$t = (key) => translations[key] || key;
    return renderToString(app);
}

async function main() {
    const oneStar = await renderRating(1);
    assert.match(oneStar, />☆☆☆☆☆<\/span>/, "未填充星应使用空心星，避免被误读为已点亮");
    assert.match(oneStar, /c-achievement-stars__value[^>]*>1\.0<\/span>/, "星级后应显示一位小数");
    assert.match(oneStar, /aria-label="金钱：1\/5"/);

    const fractional = await renderRating(2.5, "时间成本");
    assert.match(fractional, /c-achievement-stars__value[^>]*>2\.5<\/span>/);
    assert.match(fractional, /aria-label="时间成本：2\.5\/5"/);

    const empty = await renderRating(null);
    assert.match(empty, />—<\/span>/);
    assert.doesNotMatch(empty, /c-achievement-stars__value/);

    const leapSummary = await renderLeapSummary(2.5);
    assert.match(
        leapSummary,
        /c-achievement-stars__filled[^>]*style="width:50%;"[^>]*>★★★★★<\/span>/,
        "渡劫概览平均难度应复用五颗星填充"
    );
    assert.match(
        leapSummary,
        /c-achievement-stars__value[^>]*>2\.5<\/span>/,
        "渡劫概览星级后应显示一位小数"
    );
    assert.match(leapSummary, /aria-label="平均难度：2\.5\/5"/, "渡劫概览应提供完整的可访问星级标签");
    assert.doesNotMatch(leapSummary, />2\.5 ★<\//, "渡劫概览不应继续输出旧的数值加星号格式");

    const emptyLeapSummary = await renderLeapSummary(null);
    assert.match(emptyLeapSummary, /c-achievement-stars__empty-value[^>]*>—<\/span>/);
    assert.doesNotMatch(emptyLeapSummary, /aria-label="平均难度：0\/5"/);

    console.log("Achievement difficulty star rendering tests passed.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
