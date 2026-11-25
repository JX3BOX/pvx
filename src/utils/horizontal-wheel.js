// 鼠标纵向滚轮驱动分类栏；横向手势、缩放和边缘滚动交给浏览器。
export function scrollHorizontally(event) {
    if (event.ctrlKey || event.shiftKey || event.deltaX || !event.deltaY || !event.cancelable) return;

    const bar = event.currentTarget;
    const maxLeft = bar.scrollWidth - bar.clientWidth;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? bar.clientWidth : 1;
    const nextLeft = Math.max(0, Math.min(maxLeft, bar.scrollLeft + event.deltaY * unit));
    if (nextLeft === bar.scrollLeft) return;

    event.preventDefault();
    bar.scrollLeft = nextLeft;
}
