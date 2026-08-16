import html2canvas from "html2canvas";

const waitForImage = (image) => {
    if (image.complete) return Promise.resolve();

    return new Promise((resolve) => {
        const finish = () => {
            image.removeEventListener("load", finish);
            image.removeEventListener("error", finish);
            resolve();
        };

        image.addEventListener("load", finish, { once: true });
        image.addEventListener("error", finish, { once: true });
    });
};

const canvasToBlob = (canvas) =>
    new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
                return;
            }
            reject(new Error("Failed to create image blob"));
        }, "image/png");
    });

export async function saveElementAsImage(element, filename) {
    if (!element) throw new Error("Capture element not found");

    await Promise.all(Array.from(element.querySelectorAll("img")).map(waitForImage));
    if (document.fonts?.ready) await document.fonts.ready;

    const width = Math.ceil(Math.max(element.scrollWidth, element.offsetWidth));
    const height = Math.ceil(Math.max(element.scrollHeight, element.offsetHeight));
    const canvas = await html2canvas(element, {
        allowTaint: false,
        useCORS: true,
        backgroundColor: null,
        scale: 1,
        width,
        height,
        windowWidth: Math.max(document.documentElement.clientWidth, width),
        windowHeight: Math.max(document.documentElement.clientHeight, height),
    });
    const blob = await canvasToBlob(canvas);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
