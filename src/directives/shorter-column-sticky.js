const observers = new WeakMap();

export function getShorterColumnIndex(heights) {
    if (heights.length !== 2 || heights.some((height) => !Number.isFinite(height) || height <= 0)) return -1;
    if (Math.abs(heights[0] - heights[1]) < 1) return -1;
    return heights[0] < heights[1] ? 0 : 1;
}

export default {
    mounted(element) {
        const columns = Array.from(element.children);
        const update = () => {
            const heights = columns.map((column) => column.getBoundingClientRect().height);
            const shorterIndex = getShorterColumnIndex(heights);
            columns.forEach((column, index) => {
                column.classList.toggle("is-shorter-sticky-column", index === shorterIndex);
                column.style.setProperty("--sticky-column-height", `${heights[index]}px`);
            });
        };
        if (typeof ResizeObserver === "undefined") return;
        const observer = new ResizeObserver(update);
        columns.forEach((column) => observer.observe(column));
        observers.set(element, observer);
        update();
    },
    beforeUnmount(element) {
        observers.get(element)?.disconnect();
        observers.delete(element);
    },
};
