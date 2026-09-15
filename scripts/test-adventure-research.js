const assert = require("assert");
const fs = require("fs");
const babel = require("@babel/core");
function load(file, modules = {}) {
    const source = fs.readFileSync(file, "utf8");
    const result = babel.transformSync(
        file.endsWith(".vue") ? source.match(/<script>([\s\S]*?)<\/script>/)[1] : source,
        {
            babelrc: false,
            configFile: false,
            presets: [[require.resolve("@babel/preset-env"), { targets: { node: "current" } }]],
        }
    );
    const module = { exports: {} };
    new Function("module", "exports", "require", result.code)(module, module.exports, (id) => modules[id] || {});
    return module.exports;
}
const { analyzeResearch } = load("src/utils/adventureResearch.js");
const record = (role, ids, extra = {}) => ({
    role: { jx3id: role },
    snapshot: { synced: true, completedIds: ids, points: 100 },
    ...extra,
});
const a = record("a", ["1", "1", "2", "target"]);
const b = record("b", ["1", "3", "target"]);
const unknown = record("c", [], { snapshot: { synced: false, completedIds: [], points: null } });
let result = analyzeResearch([a, b, a, unknown], ["target"]);
assert.equal(result.sampleCount, 2);
assert.deepEqual(
    result.achievements.map((r) => [r.id, r.count, r.common]),
    [
        ["1", 2, true],
        ["2", 1, false],
        ["3", 1, false],
    ]
);
assert.equal(result.minimumPoints, 100);
assert.deepEqual(analyzeResearch([record("daily", [], { completedDailies: ["大战", "大战"] })]).dailies, [
    { name: "大战", count: 1 },
]);
assert.equal(analyzeResearch([]).minimumPoints, null);
assert.equal(analyzeResearch([record("empty", [])]).sampleCount, 1, "synced empty is a valid sample");
assert.equal(
    analyzeResearch([record("zero", [], { snapshot: { synced: true, completedIds: [], points: 0 } })]).minimumPoints,
    0
);
const uploader = load("src/components/adventure/research/ResearchImageUpload.vue").default;
const uploadContext = { $message: { error() {} } };
assert.equal(uploader.methods.beforeUpload.call(uploadContext, { type: "image/png", size: 1024 }), true);
assert.equal(uploader.methods.beforeUpload.call(uploadContext, { type: "image/png", size: 6 * 1024 * 1024 }), false);
assert.equal(uploader.methods.beforeUpload.call(uploadContext, { type: "text/html", size: 1024 }), false);
const events = {};
uploader.watch.files.handler.call(
    {
        $emit: (name, value) => {
            events[name] = value;
        },
    },
    [{ status: "success", response: { url: "https://example.com/image.png" } }, { status: "uploading" }]
);
assert.equal(events.busy, true);
assert.deepEqual(events.change, ["https://example.com/image.png"]);
const storage = new Map();
global.localStorage = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
const service = load("src/service/adventure/research.js");
(async () => {
    const pendingSnapshots = {};
    const form = load("src/components/adventure/research/ResearchForm.vue", {
        "@/service/adventure/research": {
            loadResearchSnapshot: (role) =>
                new Promise((resolve, reject) => {
                    pendingSnapshots[role.jx3id] = { resolve, reject };
                }),
        },
    }).default;
    const validForm = {
        busy: false,
        loading: false,
        snapshotLoading: false,
        uploading: false,
        snapshot: {},
        role: { jx3id: "1" },
        adventureType: "perfect",
        filteredAdventures: [{ id: "1" }],
        adventureId: "1",
        maps: [{ id: "map" }],
        map: "map",
        triggeredAt: "2026-01-01T12:00:00",
        activity: "钓鱼",
    };
    assert.equal(form.computed.canSubmit.call(validForm), true);
    for (const missing of ["role", "snapshot", "adventureType", "adventureId", "map", "triggeredAt", "activity"]) {
        assert.equal(form.computed.canSubmit.call({ ...validForm, [missing]: "" }), false, missing);
    }
    assert.equal(form.computed.canSubmit.call({ ...validForm, activity: "  " }), false);
    assert.equal(form.computed.canSubmit.call({ ...validForm, uploading: true }), false);
    assert.equal(form.computed.canSubmit.call({ ...validForm, triggeredAt: "2999-01-01" }), false);
    const context = { role: { jx3id: "first" }, snapshotRequestId: 0 };
    const first = form.methods.load.call(context);
    context.role = { jx3id: "second" };
    const second = form.methods.load.call(context);
    pendingSnapshots.second.resolve({ completedIds: ["2"], updatedAt: "2026-09-15" });
    await second;
    pendingSnapshots.first.resolve({ completedIds: ["1"] });
    await first;
    assert.deepEqual(context.snapshot.completedIds, ["2"], "old role response must not overwrite current role");
    const unsynced = form.methods.load.call(context);
    pendingSnapshots.second.reject({ code: "ROLE_NOT_SYNCED" });
    await unsynced;
    assert.equal(context.unsynced, true);
    assert.equal(context.snapshot, null);
    assert.equal(context.snapshotLoading, false);
    const calls = [];
    const catalogService = load("src/service/adventure/research.js", {
        "./adventure": {
            getAdventures: async (params) => {
                calls.push(params.type);
                return { data: { list: [{ dwID: params.type === "perfect" ? 1 : 2, szName: params.type }], pages: 1 } };
            },
        },
    });
    const adventures = await catalogService.getResearchAdventures();
    assert.deepEqual(calls, ["perfect", "normal"]);
    assert.deepEqual(
        adventures.map((a) => a.type),
        ["perfect", "normal"]
    );
    const sample = { ...a, client: "std", adventure: { id: "12", name: "测试奇遇" } };
    assert.deepEqual(await service.listResearchRecords(), []);
    const saved = await service.saveResearchRecord(sample);
    sample.snapshot.completedIds.push("later");
    assert.ok(
        !(await service.listResearchRecords()).find((r) => r.id === saved.id).snapshot.completedIds.includes("later"),
        "persisted snapshot must not mutate"
    );
    await assert.rejects(service.saveResearchRecord(sample), /已提交/);
    await service.saveResearchRecord({ ...sample, adventure: { id: "13", name: "另一奇遇" } });
    await service.removeResearchRecord(saved.id);
    assert.ok(!(await service.listResearchRecords()).some((r) => r.id === saved.id));
    global.localStorage.setItem = () => {
        throw new Error("quota exceeded");
    };
    await assert.rejects(
        service.saveResearchRecord({ ...sample, adventure: { id: "14", name: "第三奇遇" } }),
        /quota exceeded/
    );
    console.log(
        "adventure research: statistics, deduplication, immutable snapshots, persistence and storage failure checks passed"
    );
})().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
