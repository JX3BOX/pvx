const assert = require("assert");
const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");
const { parse, compileTemplate } = require("@vue/compiler-sfc");
const root = path.resolve(__dirname, "..");
const requests = [];
const dependencies = {
    "@/service/achievementWorkbench": {
        fetchAchievementWorkbenchRecordsBatched: async (options) => {
            requests.push(options);
            return [{ id: "1", name: "First" }, { id: "2", name: "Second" }];
        },
        fetchAchievementWorkbenchDifficulty: async () => ({ 1: 2, 2: 4 }),
        fetchAchievementWorkbenchDifficultyMetrics: async () => ({}),
        fetchAchievementWorkbenchTags: async () => ({}),
    },
};
function load(file) {
    const text = fs.readFileSync(path.join(root, file), "utf8");
    let source = text;
    if (file.endsWith(".vue")) {
        const { descriptor } = parse(text);
        assert.deepStrictEqual(compileTemplate({ source: descriptor.template.content, filename: file, id: "plan" }).errors, []);
        source = descriptor.script.content;
    }
    const { code } = babel.transformSync(source, { babelrc: false, configFile: false,
        plugins: [require.resolve("@babel/plugin-transform-modules-commonjs")] });
    const module = { exports: {} };
    new Function("module", "exports", "require", code)(module, module.exports, (key) => {
        if (key in dependencies) return dependencies[key];
        if (key.endsWith(".json")) return require(key);
        if (key.endsWith(".vue")) return {};
        if (key.startsWith("@/utils/")) return load(key.replace("@/", "src/") + ".js");
        throw new Error(`Unexpected dependency: ${key}`);
    });
    return module.exports;
}
const component = load("src/components/wiki/consultation/ConsultationPlan.vue").default;
const vm = { ...component.data(), plan: { schema: [2, 1], meta: JSON.stringify({ targetPoints: 40 }) },
    metadata: { 1: { point: 20, general: 1, visible: true }, 2: { point: 30, general: 1, visible: true } },
    menus: {}, maps: [], dimensions: [], completedIds: [1] };
Object.entries(component.methods).forEach(([key, fn]) => vm[key] = fn.bind(vm));
Object.entries(component.computed).forEach(([key, fn]) => Object.defineProperty(vm, key, { get: fn.bind(vm) }));
async function run() {
    await vm.load();
    assert.strictEqual(vm.error, false);
    assert.deepStrictEqual(vm.route.items.map((item) => item.id), ["2", "1"], "preserve saved plan order");
    assert.deepStrictEqual(vm.route.items.map((item) => item.completed), [false, true]);
    assert.strictEqual(vm.route.currentPoints, 20);
    assert.strictEqual(vm.route.selectedPoints, 30, "completed plan items must not count toward expected gain");
    assert.strictEqual(vm.route.projectedPoints, 50);
    assert.strictEqual(vm.route.targetPoints, 40);
    assert.strictEqual(vm.route.reached, true);
    assert.deepStrictEqual(requests[0].completedIds, [1]);
    assert.strictEqual(requests[0].client, "std");
    console.log("Consultation plan: saved order, snapshot completion and shared summary calculation passed.");
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
