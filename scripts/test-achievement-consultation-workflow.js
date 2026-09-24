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
    let accountLevel = 2;
    let failLevel = false;
    let record = null;
    let failReply = false;
    let replyCalls = 0;
    let claimConflict = false;
    const api = {
        getConsultations: async () => ({ list: record ? [record] : [], total: record ? 1 : 0, pending_id: record?.status === "pending" ? record.id : null }),
        getConsultationExperts: async () => [{ user_id: 7 }, { user_id: 42 }],
        createConsultation: async (payload) => { writes.push(payload); record = { id: 1, ...payload, status: "pending" }; },
        getConsultation: async () => ({ ...record, server_now: new Date().toISOString(),
            can_reply: record.status === "pending" && (record.target_expert_id != null || Boolean(record.claim_expires_at)),
            can_claim: record.status === "pending" && !record.target_expert_id && !record.claim_expires_at,
            can_cancel_claim: record.status === "pending" && Boolean(record.claim_expires_at), plan: { schema: [1, 3] }, completion: { ids: [1, 2] } }),
        replyConsultation: async (id, html) => { replyCalls++; if (failReply) throw new Error("offline"); Object.assign(record, { advice_html: html, status: "answered" }); },
        claimConsultation: async () => {
            if (claimConflict) throw { response: { status: 409, data: { msg: "Already claimed" } } };
            record.claim_expires_at = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
        },
        cancelConsultationClaim: async () => { record.claim_expires_at = null; },
        rateConsultation: async (id, payload) => Object.assign(record, payload),
        cancelConsultation: async () => { record.status = "cancelled"; },
    };
    const player = load("src/components/wiki/consultation/PlanConsultations.vue", {
        "@jx3box/jx3box-common/js/utils": { showAvatar: (value) => value },
        "@jx3box/jx3box-common/js/user": { getInfo: () => ({ uid: "7" }), getLevel: (experience) => experience,
            getAsset: async () => { if (failLevel) throw new Error("offline"); return { experience: accountLevel }; } },
        "@/service/achievementConsultation": api, "./ConsultationDetail.vue": {}, "@element-plus/icons-vue": {},
        "@/components/design/PvxSurface.vue": {},
    });
    let replacedQuery;
    const vm = instance(player, { plan: { id: "10", raw: { user_id: 7 } }, roles: [{ id: "991", roleId: 77 }], defaultRoleId: "991",
        $route: { query: { consultation_id: "9", client: "std" } }, $router: { replace: (route) => { replacedQuery = route.query; } } });
    player.watch['plan.id'].handler.call(vm);
    assert.strictEqual(vm.detailId, "9", "notification opens the owner's consultation dialog without expert authorization");
    vm.closeDetail();
    assert.strictEqual(vm.detailId, null);
    assert.deepStrictEqual(replacedQuery, { client: "std" }, "closing preserves unrelated query parameters");
    vm.$route.query = { consultation_id: ["9", "10"] };
    assert.strictEqual(vm.notificationId, null);
    vm.$route.query = {};
    await vm.openCreate();
    await vm.loadExperts();
    assert.strictEqual(vm.form.role_id, 77, "submit database role ID, not jx3id");
    assert.deepStrictEqual(vm.experts.map((row) => row.user_id), [42], "expert options exclude the current user, including string IDs");
    vm.form.question = "Please help";
    vm.form.target_expert_id = 7;
    await vm.submit();
    assert.strictEqual(writes.length, 0, "cannot submit a consultation to yourself");
    vm.form.target_expert_id = null;
    await vm.submit();
    assert.deepStrictEqual(writes[0], { plan_id: 10, role_id: 77, target_expert_id: null, question: "Please help" });
    assert.strictEqual(vm.dialog, false);
    assert.strictEqual(vm.pendingId, 1);
    await vm.openCreate();
    assert.strictEqual(vm.detailId, 1);
    assert.strictEqual(vm.dialog, false, "pending consultation opens details instead of duplicate form");
    assert.strictEqual(writes.length, 1);

    const detail = load("src/components/wiki/consultation/ConsultationDetail.vue", {
        "@/components/design/PvxSurface.vue": {},
        "@tinymce/tinymce-vue": {}, "@jx3box/jx3box-editor/src/Article.vue": {}, "./ConsultationPlan.vue": {},
        "@/components/wiki/progress/AchievementProgressPage.vue": {},
        "@/service/achievementConsultation": api,
        "@/utils/achievementWorkbench": { resolveAchievementWorkbenchDimensions: () => [] },
        "@/service/achievementWorkbench": { fetchAchievementWorkbenchCatalog: async () => ({ metadata: {}, menus: {} }),
            fetchAchievementWorkbenchMaps: async () => [], fetchAchievementWorkbenchDifficultyDimensions: async () => [] },
    });
    const expert = instance(detail, { id: 1, $confirm: async () => {} });
    await expert.load();
    assert.deepStrictEqual(expert.completedIds, [1, 2]);
    expert.tab = "progress";
    assert.deepStrictEqual(expert.progressSnapshot.completedIds, [1, 2]);
    assert.strictEqual(expert.canReply, false, "public consultation cannot open the editor before claiming");
    assert.strictEqual(expert.canClaim, true);
    await expert.submit("reply");
    assert.strictEqual(replyCalls, 0, "cannot bypass the editor gate by calling submit");
    await expert.submit("claim");
    assert.strictEqual(expert.canReply, true);
    assert.strictEqual(expert.canClaim, false);
    expert.advice = "<p>Draft</p>";
    expert.$confirm = async () => { throw "cancel"; };
    await expert.submit("cancelClaim");
    assert.strictEqual(expert.canReply, true, "dismissing release keeps the claim and draft");
    assert.strictEqual(expert.advice, "<p>Draft</p>");
    expert.$confirm = async () => {};
    await expert.submit("cancelClaim");
    assert.strictEqual(expert.canReply, false);
    assert.strictEqual(expert.advice, "");
    await expert.submit("claim");
    expert.advice = "<p><strong>Start here</strong></p>";
    expert.serverOffset = 10 * 60 * 1000;
    expert.now = new Date(expert.record.claim_expires_at).getTime() - expert.serverOffset;
    assert.strictEqual(expert.canReply, false, "editor closes at the exact server deadline with clock offset");
    assert.strictEqual(expert.claimExpired, true);
    assert.strictEqual(expert.canClaim, true);
    assert.strictEqual(expert.advice, "<p><strong>Start here</strong></p>", "expiry preserves the local draft");
    expert.record.claim_expires_at = new Date(Date.now() - 1000).toISOString();
    await expert.submit("reply");
    assert.strictEqual(replyCalls, 0, "expired reply is blocked before making a request");
    record.claim_expires_at = null;
    await expert.submit("claim");
    assert.strictEqual(expert.canReply, true);
    assert.strictEqual(expert.advice, "<p><strong>Start here</strong></p>", "reclaim keeps the draft");
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
    assert.strictEqual(owner.canReply, true, "directed requests do not require claiming");
    owner.$confirm = async () => { throw "cancel"; };
    await owner.submit("cancel");
    assert.strictEqual(record.status, "pending");
    owner.$confirm = async () => {};
    await owner.submit("cancel");
    assert.strictEqual(record.status, "cancelled");
    // Direct consultations reuse the player workflow without inventing a saved plan.
    record = null;
    let directRoute;
    const direct = instance(player, { plan: null, roles: [{ id: "991", roleId: 77 }], defaultRoleId: "991",
        defaultQuestion: "Help me reach 113000 points", $route: { query: {} }, $router: { push: (route) => { directRoute = route; } } });
    await direct.openCreate();
    assert.strictEqual(direct.dialog, true);
    assert.strictEqual(direct.form.role_id, 77);
    assert.strictEqual(direct.form.question, "Help me reach 113000 points");
    const create = api.createConsultation;
    api.createConsultation = async () => { throw new Error("plan_id is required"); };
    await direct.submit();
    assert.strictEqual(direct.dialog, true, "backend rejection keeps the form open");
    assert.strictEqual(direct.form.question, "Help me reach 113000 points", "failure retains the question");
    assert.strictEqual(direct.saving, false);
    api.createConsultation = create;
    await direct.submit();
    assert.deepStrictEqual(writes[2], { role_id: 77, target_expert_id: null, question: "Help me reach 113000 points" });
    assert.deepStrictEqual(directRoute, { name: "consultation" }, "direct requests use the shared player queue");
    await direct.openCreate();
    assert.deepStrictEqual(directRoute, { name: "consultation-detail", params: { id: 1 } }, "server pending ID opens the existing consultation");
    const getDetail = api.getConsultation;
    api.getConsultation = async () => ({ ...record, plan_id: null, plan: null, role: { name: "Player" }, completion: { ids: [1] } });
    await owner.load();
    assert.strictEqual(owner.withoutPlan, true);
    assert.strictEqual(owner.tab, "progress", "direct consultations open completion progress");
    api.getConsultation = async () => ({ ...record, plan_id: 10, plan: null });
    await owner.load();
    assert.strictEqual(owner.withoutPlan, false, "a deleted saved plan is still distinguished from a direct consultation");
    assert.strictEqual(owner.tab, "progress", "missing plan data also defaults to progress when a plan ID remains");
    api.getConsultation = getDetail;
    record = { id: 1, plan_id: null, target_expert_id: null, status: "pending" };
    await expert.load();
    claimConflict = true;
    await expert.submit("claim");
    assert.strictEqual(expert.canReply, false, "claim conflict never opens the editor");
    assert.strictEqual(expert.saving, false);
    claimConflict = false;
    record = null;
    accountLevel = 1;
    direct.dialog = false;
    await direct.openCreate();
    assert.strictEqual(direct.dialog, true, "Lv.1 can start a consultation");
    const writeCount = writes.length;
    await direct.submit();
    assert.strictEqual(writes.length, writeCount + 1, "Lv.1 can submit a direct consultation");
    record = null;
    failLevel = true;
    await direct.openCreate();
    assert.strictEqual(direct.dialog, true, "consultation does not depend on the account level service");
    await direct.submit();
    assert.strictEqual(writes.length, writeCount + 2, "unavailable level service does not block submission");
    record = null;
    await vm.openCreate();
    assert.strictEqual(vm.dialog, true, "saved-plan consultations also have no level gate");
    vm.form.question = "Low-level plan consultation";
    await vm.submit();
    assert.strictEqual(writes.length, writeCount + 3);
    failLevel = false;
    const page = load("src/components/wiki/leap/AchievementLeapPage.vue", new Proxy({}, {
        has: () => true,
        get: () => ({}),
    }));
    let opened = 0;
    const entry = { canConsultPlan: true, $refs: { consultations: { openCreate: () => opened++ } } };
    page.methods.requestPlanGuidance.call(entry);
    assert.strictEqual(opened, 1, "eligible saved-plan entry opens without a level check");
    entry.canConsultPlan = false;
    page.methods.requestPlanGuidance.call(entry);
    assert.strictEqual(opened, 1, "existing plan eligibility checks remain");
    const header = load("src/components/wiki/leap/AchievementLeapDetailHeader.vue", {
        "@element-plus/icons-vue": {}, "@/components/design/PvxSurface.vue": {},
    });
    const actions = [];
    const headerVm = { actionsDisabled: false, guidanceDisabled: true, plan: { id: 10 }, $emit: (action) => actions.push(action) };
    header.methods.emitPlanAction.call(headerVm, "request-guidance");
    header.methods.emitPlanAction.call(headerVm, "edit");
    assert.deepStrictEqual(actions, ["edit"], "explicit guidance disable only affects consultation, not plan editing");
    headerVm.guidanceDisabled = false;
    header.methods.emitPlanAction.call(headerVm, "request-guidance");
    assert.deepStrictEqual(actions, ["edit", "request-guidance"]);
    const workspace = fs.readFileSync(path.join(root, "src/components/wiki/consultation/ConsultationWorkspace.vue"), "utf8");
    assert(!workspace.includes("statistics"));
    assert(!fs.readFileSync(path.join(root, "src/service/achievementConsultation.js"), "utf8").includes("statistics/me"));
    console.log("Player submission, pending requests, live plan/completion preview, rich-text reply, rating and cancellation tests passed.");
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
