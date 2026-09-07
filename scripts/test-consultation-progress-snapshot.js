const assert = require("assert");
const fs = require("fs");
const babel = require("@babel/core");
const { parse, compileTemplate } = require("@vue/compiler-sfc");
const filename = "src/components/wiki/progress/AchievementProgressPage.vue";
const { descriptor } = parse(fs.readFileSync(filename, "utf8"));
assert.deepStrictEqual(compileTemplate({ source: descriptor.template.content, filename, id: "snapshot" }).errors, []);
const calls = [];
const service = new Proxy({}, { get: (_, key) => async () => { calls.push(key); throw new Error("Must use consultation snapshot"); } });
const { code } = babel.transformSync(descriptor.script.content, { babelrc: false, configFile: false,
    plugins: [require.resolve("@babel/plugin-transform-modules-commonjs")] });
const loaded = { exports: {} };
new Function("module", "exports", "require", code)(loaded, loaded.exports, (key) => {
    if (key === "@jx3box/jx3box-common/js/user") return { isLogin: () => true };
    if (key === "@/service/achievementWorkbench") return service;
    if (key === "@/utils/achievementWorkbench") return { resolveAchievementWorkbenchDimensions: () => [] };
    return {};
});
const component = loaded.exports.default;
const snapshot = { role: { id: "77", name: "Consultation role", server: "Server" }, completedIds: [1, 8],
    synced: true, syncedAt: "2026-09-01", catalog: { menus: { a: {} }, metadata: { 1: {} } }, maps: [], dimensions: [] };
const vm = { ...component.data(), snapshot, $store: { state: { client: "origin" }, commit() { throw new Error("Must not change expert session"); } } };
Object.entries(component.methods).forEach(([key, fn]) => vm[key] = fn.bind(vm));
for (const key of ["currentClient", "currentRole"]) Object.defineProperty(vm, key, { get: component.computed[key].bind(vm) });
vm.loadVisibleRecords = async () => calls.push("visibleRecords");
async function run() {
    assert.strictEqual(vm.currentClient, "std", "consultation progress stays on the snapshot game client");
    await vm.initializePage();
    assert.strictEqual(vm.currentRole.name, snapshot.role.name);
    assert.deepStrictEqual(vm.completedIds, [1, 8]);
    assert.strictEqual(vm.metadata, snapshot.catalog.metadata);
    assert.deepStrictEqual(calls, ["visibleRecords"], "no expert role fetch or live role snapshot fetch");
    await vm.selectRole("another-role");
    await vm.loadCurrentRole();
    assert.deepStrictEqual(calls, ["visibleRecords"]);
    assert.strictEqual(vm.currentRoleId, "77");
    assert.strictEqual(vm.pageLoading, false);
    console.log("Consultation progress snapshot isolation passed.");
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
