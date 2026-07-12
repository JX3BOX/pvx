const ALLOWED_TAGS = new Set(["BR", "P", "DIV", "SPAN", "STRONG", "B", "EM", "I", "U", "UL", "OL", "LI"]);

export function sanitizeBasicHtml(content) {
    if (!content) return "";
    const source = String(content).replace(/\\n/g, "\n").replace(/\n/g, "<br>");
    if (typeof DOMParser === "undefined") return source.replace(/<[^>]*>/g, "");

    const doc = new DOMParser().parseFromString(`<div>${source}</div>`, "text/html");
    const cleanNode = (node) => {
        if (node.nodeType === 3) return doc.createTextNode(node.textContent || "");
        if (node.nodeType !== 1) return null;

        const fragment = doc.createDocumentFragment();
        const target = ALLOWED_TAGS.has(node.tagName) ? doc.createElement(node.tagName.toLowerCase()) : fragment;
        [...node.childNodes].forEach((child) => {
            const cleaned = cleanNode(child);
            if (cleaned) target.appendChild(cleaned);
        });
        return target;
    };

    const output = doc.createElement("div");
    [...doc.body.firstElementChild.childNodes].forEach((node) => {
        const cleaned = cleanNode(node);
        if (cleaned) output.appendChild(cleaned);
    });
    return output.innerHTML;
}
