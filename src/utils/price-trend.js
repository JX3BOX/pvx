// 每次日线请求覆盖所有服务器；多个图表复用同一物品的请求与结果。
export function createPriceTrendLoader(fetchDaily) {
    const cache = new Map();
    const jobs = new Map();
    const queue = [];
    let active = 0;
    function pump() {
        while (active < 2 && queue.length) {
            const job = queue.shift();
            if (!job.listeners.size) continue;
            active++;
            job.started = true;
            Promise.resolve()
                .then(() => fetchDaily(job.id, job.controller.signal))
                .then((rows) => {
                    if (job.controller.signal.aborted || !job.listeners.size) return;
                    if (!Array.isArray(rows)) throw new Error("Invalid daily price response");
                    cache.delete(job.id);
                    cache.set(job.id, { rows, time: Date.now() });
                    if (cache.size > 60) cache.delete(cache.keys().next().value);
                    job.listeners.forEach((listener) => listener.success(rows));
                })
                .catch((error) => {
                    if (!job.controller.signal.aborted) job.listeners.forEach((listener) => listener.failure(error));
                })
                .finally(() => {
                    if (jobs.get(job.id) === job) jobs.delete(job.id);
                    active--;
                    pump();
                });
        }
    }
    return {
        load(id, success, failure) {
            const cached = cache.get(id);
            if (cached && Date.now() - cached.time < 300000) {
                success(cached.rows);
                return () => {};
            }
            let job = jobs.get(id);
            if (!job) {
                job = { id, controller: new AbortController(), listeners: new Set(), started: false };
                jobs.set(id, job);
                queue.push(job);
            }
            const listener = { success, failure };
            job.listeners.add(listener);
            pump();
            return () => {
                job.listeners.delete(listener);
                if (!job.listeners.size) {
                    job.controller.abort();
                    if (jobs.get(id) === job) jobs.delete(id);
                    const index = queue.indexOf(job);
                    if (index !== -1) queue.splice(index, 1);
                }
            };
        },
        clear() {
            cache.clear();
            jobs.forEach((job) => {
                job.listeners.clear();
                job.controller.abort();
            });
            jobs.clear();
            queue.length = 0;
        },
    };
}

// 以中国时区的自然日聚合，每天每服只计一次；缺失日期保留空点。
export function aggregateDailyTrend(rows, servers, now = Date.now()) {
    const day = 86400000;
    const today = Math.floor((now + 8 * 3600000) / day) * day - 8 * 3600000;
    const start = today - 7 * day;
    const allowed = new Set(servers);
    const days = new Map();
    rows.forEach((row) => {
        const price = Number(row.price);
        const timestamp = Number(row.timestamp) * 1000;
        if (
            !allowed.has(row.server) ||
            row.price == null ||
            !Number.isFinite(price) ||
            price < 0 ||
            !Number.isFinite(timestamp)
        )
            return;
        const date = Math.floor((timestamp + 8 * 3600000) / day) * day - 8 * 3600000;
        if (date < start || date >= today) return;
        if (!days.has(date)) days.set(date, new Map());
        const serversAtDate = days.get(date);
        const previous = serversAtDate.get(row.server);
        if (!previous || timestamp >= previous.timestamp) serversAtDate.set(row.server, { price, timestamp });
    });
    return Array.from({ length: 7 }, (_, index) => {
        const timestamp = start + index * day;
        const values = [...(days.get(timestamp)?.values() || [])];
        return {
            timestamp,
            price: values.length ? values.reduce((sum, value) => sum + value.price, 0) / values.length : null,
            count: values.length,
        };
    });
}

export function trendGeometry(points) {
    const values = points.filter((point) => point.price != null).map((point) => point.price);
    if (!values.length) return { path: "", dots: [] };
    const min = Math.min(...values),
        max = Math.max(...values);
    let pen = false;
    const dots = [];
    const segments = points.map((point, index) => {
        if (point.price == null) {
            pen = false;
            return "";
        }
        const x = 5 + (index * 150) / Math.max(1, points.length - 1);
        const y = max === min ? 28 : 48 - ((point.price - min) / (max - min)) * 40;
        dots.push({ x, y });
        const command = `${pen ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
        pen = true;
        return command;
    });
    return { path: segments.join(" "), dots };
}
