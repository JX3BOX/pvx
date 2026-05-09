export function formatFurnitureImg(link, imgRoot, client = "std") {
    if (!link) return;
    const img = link.toLowerCase().match(/.*[\/,\\]homeland(.*?).tga/);
    const name = img?.[1].replace(/\\/g, "/");
    if (img?.[1] == "default") return imgRoot + `homeland/${client}/default/default.png`;
    return imgRoot + `homeland/${client}` + name + ".png";
}

export function parseFurnitureDescription(value) {
    const matches = /text="(.*?)(\\\\\\n)?"/.exec(value);
    if (matches?.length > 1) value = matches[1].trim();
    if (value) value = value.replace(/\\n/g, "<br>");
    return value;
}
