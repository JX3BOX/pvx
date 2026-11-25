import { facedatMessages, translateFacedat } from "@jx3box/jx3box-facedat/src/locale";
import studioZh from "@/locale/zh-CN/exteriorStudio";

const { face, terms } = facedatMessages["zh-CN"].facedat;
const faceKeys = new Map();
for (const [prefix, labels] of [
    ["face.old.tabs", face.old.tabs],
    ["face.old.fields", face.old.fields],
    ["face.new.tabs", face.new.tabs],
    ["terms", terms],
]) {
    for (const [key, label] of Object.entries(labels)) {
        faceKeys.set(label, `facedat.${prefix}.${key}`);
    }
}
faceKeys.set("浓密度", "facedat.terms.density");

export function faceControlLabel(locale, label) {
    const key = faceKeys.get(label);
    return key ? translateFacedat(locale, key) : label;
}

const petKeys = new Map(Object.entries(studioZh.petPoses).map(([key, label]) => [label, key]));

export function petPoseLabel(t, label) {
    const key = petKeys.get(label);
    return key ? t(`exteriorStudio.petPoses.${key}`) : label;
}

export function expressionLabel(t, key, name) {
    return Object.hasOwn(studioZh.expressions, key) ? t(`exteriorStudio.expressions.${key}`) : name;
}
