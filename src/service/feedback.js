import { $next } from "@jx3box/jx3box-common/js/api";

export function submitFeedback(data) {
    return $next().post("/api/next2/miscfeedback", data);
}
