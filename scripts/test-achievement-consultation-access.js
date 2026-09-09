const assert = require("assert");
const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");
const { parse } = require("@vue/compiler-sfc");
const root = path.resolve(__dirname, "..");
function load(file, dependencies) {
    const source = parse(fs.readFileSync(path.join(root, file), "utf8")).descriptor.script.content;
    const { code } = babel.transformSync(source, { babelrc: false, configFile: false,
        plugins: [require.resolve("@babel/plugin-transform-modules-commonjs")] });
    const module = { exports: {} };
    new Function("module", "exports", "require", code)(module, module.exports, (key) => {
        assert(key in dependencies, `Unexpected dependency: ${key}`);
        return dependencies[key];
    });
    return module.exports.default;
}
function instance(component, props = {}) {
    const vm = { ...component.data(), $route: { params: {} }, ...props };
    for (const [name, method] of Object.entries(component.methods)) vm[name] = method.bind(vm);
    for (const [name, get] of Object.entries(component.computed || {})) Object.defineProperty(vm, name, { get: get.bind(vm) });
    return vm;
}
async function run() {
    let isExpert = false;
    let loggedIn = true;
    let accessFailure = false;
    let accessCalls = 0;
    const calls = [];
    const records = [{ id: 1, status: "pending" }, { id: 2, status: "answered" }, { id: 3, status: "cancelled" }];
    const service = {
        getConsultationAccess: async () => {
            accessCalls++;
            if (accessFailure) throw new Error("offline");
            return { is_expert: isExpert };
        },
        getConsultations: async (params) => {
            calls.push(params);
            const list = params.status ? records.filter((row) => row.status === params.status) : records;
            return { list, total: list.length };
        },
    };
    const nav = load("src/components/wiki/AchievementWorkbenchNav.vue", {
        "@element-plus/icons-vue": {},
        "@/assets/img/wiki/figma/brand.svg": "brand.svg",
        "@/assets/img/wiki/figma/nav-progress.svg": "nav-progress.svg",
        "@/assets/img/wiki/figma/nav-compare.svg": "nav-compare.svg",
        "@/assets/img/wiki/figma/nav-leap.svg": "nav-leap.svg",
    });
    assert(nav.data().navItems.some((item) => item.routeName === "consultation"), "consultation navigation does not depend on expert access or login");
    const workspace = load("src/components/wiki/consultation/ConsultationWorkspace.vue", {
        "@/service/achievementConsultation": service,
        "./ConsultationDetail.vue": {},
        "@/components/design/PvxSurface.vue": {},
        "@/components/design/PvxEmptyState.vue": {},
        "@element-plus/icons-vue": {},
        "@jx3box/jx3box-common/js/utils": { showAvatar: (value) => value },
        "@jx3box/jx3box-common/js/user": { isLogin: () => loggedIn },
        "@/utils/config": { __Links: { account: { login: "/login" } } },
    });
    const player = instance(workspace);
    await player.initialize();
    assert.deepStrictEqual(player.tabs.map((tab) => tab.name), ["player"]);
    assert.deepStrictEqual(calls.at(-1), { scope: "player", status: undefined, page: 1, per: 20 });
    assert.deepStrictEqual(player.rows, records, "the default queue includes the player's pending, answered and cancelled records");
    records.push({ id: 4, status: "pending", plan_id: 10, plan_title: null },
        { id: 5, status: "pending", plan_id: null, plan_title: null },
        { id: 6, status: "pending", plan_id: 11, plan_title: "Existing plan" });
    await player.load();
    assert.deepStrictEqual(player.rows.map((row) => row.id), [1, 2, 3, 5, 6], "exclude unavailable associated plans, but retain direct consultations");
    records.splice(3);
    player.scope = "directed";
    await player.load();
    assert.strictEqual(calls.at(-1).scope, "player", "ordinary users cannot request expert queues through local state");
    const beforeDetail = calls.length;
    const detail = instance(workspace, { $route: { params: { id: "1" } } });
    await detail.initialize();
    assert.strictEqual(detail.isLogin, true);
    assert.strictEqual(detail.isExpert, false);
    assert.strictEqual(calls.length, beforeDetail, "ordinary players can open detail without querying expert queues; detail authorization stays on the server");
    isExpert = true;
    const expert = instance(workspace);
    await expert.initialize();
    assert.deepStrictEqual(expert.tabs.map((tab) => tab.name), ["player", "public", "directed", "answered"]);
    assert.strictEqual(calls.at(-1).scope, "player", "the same default tab has the same data scope for all users");
    for (const scope of ["public", "directed", "answered"]) {
        expert.scope = scope;
        expert.changeScope();
        assert.strictEqual(calls.at(-1).scope, scope);
        assert.strictEqual(calls.at(-1).status, scope === "answered" ? "answered" : "pending");
    }
    assert.strictEqual(expert.showStatusFilter, false, "answered queue does not show redundant status controls");
    expert.status = "cancelled";
    await expert.load();
    assert.strictEqual(calls.at(-1).status, "answered", "answered queue cannot request a conflicting status");
    for (const scope of ["player", "directed"]) {
        expert.scope = scope;
        assert.strictEqual(expert.showStatusFilter, true);
        expert.status = "cancelled";
        await expert.load();
        assert.strictEqual(calls.at(-1).status, "cancelled");
    }
    expert.scope = "public";
    assert.strictEqual(expert.showStatusFilter, false, "public consultations only contain pending requests");
    for (const status of ["", "answered", "cancelled"]) {
        expert.status = status;
        await expert.load();
        assert.strictEqual(calls.at(-1).status, "pending", "public queue ignores status left over from other tabs");
    }
    expert.scope = "directed";
    isExpert = false;
    await expert.initialize();
    assert.strictEqual(expert.scope, "player", "revoked permission returns to the player queue");
    assert.strictEqual(calls.at(-1).status, undefined);
    accessFailure = true;
    await player.initialize();
    assert(player.accessError);
    assert.deepStrictEqual(player.tabs.map((tab) => tab.name), ["player"]);
    assert.deepStrictEqual(player.rows, records, "failed expert access must not block personal consultations");
    loggedIn = false;
    const guest = instance(workspace);
    const beforeGuest = [accessCalls, calls.length];
    await guest.initialize();
    assert.deepStrictEqual([accessCalls, calls.length], beforeGuest, "logged-out visitors see the login prompt without private API requests");
    assert.strictEqual(guest.checking, false);
    console.log("Consultation navigation, player/expert scopes, all-status history, detail access, permission failure and logged-out state passed.");
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
