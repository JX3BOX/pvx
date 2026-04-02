import { $node } from "@jx3box/jx3box-common/js/api";
const $ = $node();

export function getList(params) {
    return $.get(`/books`, { params });
}

export function getInfo(params) {
    return $.get(`/book`, { params });
}
