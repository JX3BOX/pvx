const assert = require("assert");
const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");
const { parse, compileTemplate } = require("@vue/compiler-sfc");
const { createSSRApp, h } = require("vue");
const { renderToString } = require("@vue/server-renderer");

const componentPath = path.resolve(__dirname, "../src/components/wiki/leap/AchievementRecommendationItems.vue");

function evaluateModule(source, filename, localRequire = require) {
    const result = babel.transformSync(source, {
        filename,
        babelrc: false,
        configFile: false,
        presets: [[require.resolve("@babel/preset-env"), { targets: { node: "current" } }]],
    });
    const loadedModule = { exports: {} };
    new Function("module", "exports", "require", result.code)(loadedModule, loadedModule.exports, localRequire);
    return loadedModule.exports;
}

function loadComponent() {
    const { descriptor, errors } = parse(fs.readFileSync(componentPath, "utf8"), { filename: componentPath });
    assert.deepStrictEqual(errors, []);

    const draggable = {
        props: ["modelValue"],
        render() {
            return h("div", this.$attrs, [
                ...this.modelValue.flatMap((element, index) => this.$slots.item({ element, index })),
                this.$slots.footer?.(),
            ]);
        },
    };
    const icon = { render: () => h("svg") };
    const component = evaluateModule(descriptor.script.content, componentPath, (request) => {
        if (request === "vuedraggable") return draggable;
        if (request === "@element-plus/icons-vue") return { Delete: icon, Rank: icon, Top: icon };
        if (request === "@jx3box/jx3box-common/js/utils") {
            return { getLink: (_, id) => `/achievement/${id}`, iconLink: (id) => `/icons/${id}.png` };
        }
        if (request === "@/components/wiki/AchievementDifficultyStars.vue") return { render: () => h("span") };
        if (request === "@/utils/achievementWorkbench") return { getAchievementWorkbenchDimensionValue: () => null };
        return require(request);
    }).default;
    const template = compileTemplate({ source: descriptor.template.content, filename: componentPath, id: "recommendation-tags-test" });
    assert.deepStrictEqual(template.errors, []);
    component.render = evaluateModule(template.code, `${componentPath}?template`).render;
    return component;
}

const component = loadComponent();
const translations = {
    "achievementRecommendation.camp": "阵营",
    "achievementRecommendation.campRestricted": "阵营受限",
    "achievementRecommendation.remove": "移除",
    "achievementRecommendation.moveToCurrent": "移入当前阶段",
};

async function renderItems(items, props = {}) {
    const app = createSSRApp(component, { items, group: "current", selectedIds: new Set(), ...props });
    app.config.globalProperties.$t = (key) => translations[key] || key;
    app.component("el-tooltip", {
        props: ["content"],
        render() { return h("span", { title: this.content }, this.$slots.default?.()); },
    });
    app.component("el-button", {
        render() { return h("button", this.$attrs, [this.$slots.icon?.(), this.$slots.default?.()]); },
    });
    return renderToString(app);
}

function makeItem(tags, extra = {}) {
    return { id: "101", name: "江湖见闻", category: { name: "足迹", subName: "行走江湖" }, map: {}, points: 20, tags, ...extra };
}

function renderedTagLabels(html) {
    return Array.from(html.matchAll(/class="u-recommendation-achievement-tag"[^>]*>([^<]*)<\/span>/g), (match) => match[1]);
}

async function main() {
    const tags = Object.freeze([
        { id: 1, label: "活动：江湖行", type: "activity", description: "参加江湖行活动" },
        { id: 2, label: "门派：万花", type: "school" },
        { id: 3, label: "节日：中秋", type: "festival" },
        { id: 4, label: "阵营：浩气盟", type: "camp" },
        { id: 5, label: "门派：七秀", type: "school" },
        { id: 6, label: "其他标签", type: "unknown" },
    ].map(Object.freeze));
    const item = makeItem(tags);
    const ordered = component.methods.getDisplayTags(item);
    assert.deepStrictEqual(ordered.map((tag) => tag.id), [2, 5, 1, 3, 4, 6], "门派前置，同类及其余标签保持输入顺序");
    assert.deepStrictEqual(tags.map((tag) => tag.id), [1, 2, 3, 4, 5, 6], "展示排序不能修改父组件传入的标签");
    const html = await renderItems([item], { promoteTo: "next" });
    const described = await renderItems([makeItem([], { shortDescription: "完成江湖游历\n<script>说明</script>" })]);
    assert.match(described, /m-recommendation-item-description/);
    assert.ok(described.includes("完成江湖游历\n&lt;script&gt;说明&lt;/script&gt;"), "成就描述保留换行并按纯文本安全渲染");
    assert.doesNotMatch(html, /m-recommendation-item-description/, "没有描述时不显示空占位");
    assert.deepStrictEqual(renderedTagLabels(html), ordered.map((tag) => tag.label), "模板应实际渲染排序后的标签");
    assert.match(html, /title="参加江湖行活动"/, "业务标签保留描述提示");
    assert.match(html, /aria-label="移除"/, "标签展示不能移除已有操作");
    assert.match(html, /aria-label="移入当前阶段"/);
    assert.match(html, /class="m-recommendation-item-handle"/, "拖动排序入口仍存在");

    for (const emptyTags of [undefined, null, [], {}, [null, {}, { label: "" }, { label: "  " }, { label: 0 }]]) {
        assert.deepStrictEqual(component.methods.getDisplayTags(makeItem(emptyTags)), []);
        const emptyHtml = await renderItems([makeItem(emptyTags)]);
        assert.doesNotMatch(emptyHtml, /m-recommendation-item-tags/, "空或非法标签不创建空标签区");
    }
    const genericHtml = await renderItems([makeItem([
        { id: 7, label: "普通成就", type: "unknown" },
        { id: 8, label: " 常规成就 ", type: "unknown" },
        { id: 9, label: "活动：普通试炼", type: "activity" },
    ])]);
    assert.deepStrictEqual(renderedTagLabels(genericHtml), ["活动：普通试炼"], "仅去掉通用成就标签，保留真实业务标签");

    const restrictedHtml = await renderItems([makeItem([], { campRestricted: true })]);
    assert.match(restrictedHtml, /title="阵营受限"/, "保留原有阵营条件提示");
    assert.match(restrictedHtml, /u-recommendation-warning/);
    assert.deepStrictEqual(renderedTagLabels(restrictedHtml), [], "campRestricted 不能推导出具体阵营业务标签");
    const taggedRestrictedHtml = await renderItems([makeItem(tags, { campRestricted: true })]);
    assert.match(taggedRestrictedHtml, /title="阵营受限"/, "存在具体阵营标签时也不能丢失原有条件提示");
    assert.deepStrictEqual(renderedTagLabels(taggedRestrictedHtml), ordered.map((tag) => tag.label));

    const longLabel = `活动：${"跨服江湖同行".repeat(20)}`;
    const longHtml = await renderItems([makeItem([{ id: 10, label: longLabel, type: "activity" }])], { editable: false });
    assert.deepStrictEqual(renderedTagLabels(longHtml), [longLabel], "长标签文案完整保留");
    assert.doesNotMatch(longHtml, /class="m-recommendation-item-handle"|aria-label="移除"/, "查看态继续保持只读");
    const escapedHtml = await renderItems([makeItem([{ id: 11, label: "活动：<script>test</script>", type: "unknown" }])]);
    assert.ok(escapedHtml.includes("活动：&lt;script&gt;test&lt;/script&gt;"), "标签按普通文本渲染");
    assert.doesNotMatch(escapedHtml, /<script>/);

    console.log("achievement recommendation tag tests passed");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
