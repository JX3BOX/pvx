// Analyze records for one client and adventure.
export function analyzeResearch(records, excludedIds = []) {
    const seen = new Set();
    const samples = records.filter((record) => {
        const key = record.role.jx3id;
        if (!record.snapshot.synced || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
    const excluded = new Set(excludedIds.map(String));
    const counts = new Map();
    const dailies = new Map();
    samples.forEach((record) => {
        [...new Set(record.snapshot.completedIds.map(String))].forEach((id) => {
            if (!excluded.has(id)) counts.set(id, (counts.get(id) || 0) + 1);
        });
        [...new Set(record.completedDailies || [])].forEach((name) => dailies.set(name, (dailies.get(name) || 0) + 1));
    });
    const points = samples.map((r) => r.snapshot.points).filter((p) => typeof p === "number" && Number.isFinite(p));
    return {
        sampleCount: samples.length,
        minimumPoints: points.length ? Math.min(...points) : null,
        achievements: [...counts]
            .map(([id, count]) => ({ id, count, rate: count / samples.length, common: count === samples.length }))
            .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id)),
        dailies: [...dailies].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    };
}

export function formatResearchTime(value) {
    if (!value || !Number.isFinite(new Date(value).getTime())) return "未知";
    return new Date(value).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false });
}
