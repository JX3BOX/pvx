const assert = require("assert");
const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");
const { parse, compileTemplate } = require("@vue/compiler-sfc");
const root = path.resolve(__dirname, "..");
function load(file, dependencies) {
    const filename = path.join(root, file);
    const { descriptor } = parse(fs.readFileSync(filename, "utf8"));
    assert.deepStrictEqual(compileTemplate({ source: descriptor.template.content, filename, id: "consultation" }).errors, []);
    const { code } = babel.transformSync(descriptor.script.content, { babelrc: false, configFile: false,
        plugins: [require.resolve("@babel/plugin-transform-modules-commonjs")] });
    const module = { exports: {} };
    new Function("module", "exports", "require", code)(module, module.exports, (key) => {
        assert(key in dependencies, `Unexpected dependency: ${key}`);
        return dependencies[key];
    });
    return module.exports.default;
}
function instance(component, props = {}) {
    const vm = { ...component.data(), $t: (key) => key, $emit() {}, $message: { success() {}, error() {} }, ...props };
    Object.entries(component.methods).forEach(([name, method]) => { vm[name] = method.bind(vm); });
    Object.entries(component.computed || {}).forEach(([name, get]) => Object.defineProperty(vm, name, { get: get.bind(vm) }));
    return vm;
}
async function run() {
    const writes = [];
    let record = null;
    let failReply = false;
    const api = {
        getConsultations: async () => ({ list: record ? [record] : [], total: record ? 1 : 0, pending_id: record?.status === "pending" ? record.id : null }),
        getConsultationExperts: async () => [{ user_id: 7 }, { user_id: 42 }],
        createConsultation: async (payload) => { writes.push(payload); record = { id: 1, ...payload, status: "pending" }; },
        getConsultation: async () => ({ ...record, plan: { schema: [1, 3] }, completion: { ids: [1, 2] } }),
        replyConsultation: async (id, html) => { if (failReply) throw new Error("offline"); Object.assign(record, { advice_html: html, status: "answered" }); },
        rateConsultation: async (id, payload) => Object.assign(record, payload),
        cancelConsultation: async () => { record.status = "cancelled"; },
    };
    const player = load("src/components/wiki/consultation/PlanConsultations.vue", {
        "@/service/achievementConsultation": api, "./ConsultationDetail.vue": {}, "@element-plus/icons-vue": {},
        "@/components/design/PvxSurface.vue": {},
    });
    const vm = instance(player, { plan: { id: "10", raw: { user_id: 7 } }, roles: [{ id: "991", roleId: 77 }], defaultRoleId: "991" });
    await vm.openCreate();
    await vm.loadExperts();
    assert.strictEqual(vm.form.role_id, 77, "submit database role ID, not jx3id");
    assert.deepStrictEqual(vm.selectableExperts.map((row) => row.user_id), [42]);
    vm.form.question = "Please help";
    await vm.submit();
    assert.deepStrictEqual(writes[0], { plan_id: 10, role_id: 77, target_expert_id: null, question: "Please help" });
    assert.strictEqual(vm.dialog, false);
    assert.strictEqual(vm.pendingId, 1);
    await vm.openCreate();
    assert.strictEqual(vm.detailId, 1);
    assert.strictEqual(vm.dialog, false, "pending consultation opens details instead of duplicate form");
    assert.strictEqual(writes.length, 1);

    const detail = load("src/components/wiki/consultation/ConsultationDetail.vue", {
        "@tinymce/tinymce-vue": {}, "@jx3box/jx3box-editor/src/Article.vue": {}, "./ConsultationAchievements.vue": {},
        "@/service/achievementConsultation": api,
        "@/utils/achievementWorkbench": { resolveAchievementWorkbenchDimensions: () => [] },
        "@/service/achievementWorkbench": { fetchAchievementWorkbenchCatalog: async () => ({ metadata: {}, menus: {} }),
            fetchAchievementWorkbenchMaps: async () => [], fetchAchievementWorkbenchDifficultyDimensions: async () => [] },
    });
    const expert = instance(detail, { id: 1, $confirm: async () => {} });
    await expert.load();
    assert.deepStrictEqual(expert.planIds, ["1", "3"]);
    assert.deepStrictEqual(expert.completedIds, [1, 2]);
    expert.tab = "completed";
    assert.deepStrictEqual(expert.visibleIds, [1, 2]);
    expert.advice = "<p><strong>Start here</strong></p>";
    failReply = true;
    await expert.submit("reply");
    assert.strictEqual(expert.advice, "<p><strong>Start here</strong></p>", "failed submission retains draft");
    assert.strictEqual(expert.saving, false);
    failReply = false;
    await expert.submit("reply");
    assert.strictEqual(record.status, "answered");
    await vm.load();
    assert.strictEqual(vm.pendingId, null);
    const owner = instance(detail, { id: 1, $confirm: async () => {} });
    await owner.load();
    assert.strictEqual(owner.record.advice_html, expert.advice);
    owner.rating = 5; owner.review = "Helpful";
    await owner.submit("rate");
    assert.strictEqual(record.rating, 5);
    assert.strictEqual(record.review, "Helpful");
    owner.handleEditorLoadError({ target: { tagName: "SCRIPT", src: "https://cdn.jx3box.com/static/tinymce/tinymce.min.js" } });
    assert.strictEqual(owner.editorError, true);

    await vm.openCreate();
    vm.form.target_expert_id = 42;
    vm.form.question = "Directed request";
    await vm.submit();
    assert.strictEqual(writes[1].target_expert_id, 42);
    await owner.load();
    owner.$confirm = async () => { throw "cancel"; };
    await owner.submit("cancel");
    assert.strictEqual(record.status, "pending");
    owner.$confirm = async () => {};
    await owner.submit("cancel");
    assert.strictEqual(record.status, "cancelled");
    const workspace = fs.readFileSync(path.join(root, "src/components/wiki/consultation/ConsultationWorkspace.vue"), "utf8");
    assert(!workspace.includes("statistics"));
    assert(!fs.readFileSync(path.join(root, "src/service/achievementConsultation.js"), "utf8").includes("statistics/me"));
    console.log("Player submission, pending requests, live plan/completion preview, rich-text reply, rating and cancellation tests passed.");
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
