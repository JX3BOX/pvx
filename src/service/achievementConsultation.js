import { $cms } from "@jx3box/jx3box-common/js/api";

const base = "/api/cms/pvx/achievement_consultation";
async function data(request) {
    const response = await request;
    if (response.data?.code !== 0) throw new Error(response.data?.msg || "Consultation request failed");
    return response.data.data;
}
export const getConsultationAccess = () => data($cms().get(`${base}/access`));
export const getConsultationExperts = () => data($cms().get(`${base}/experts`));
export const getConsultations = (params) => data($cms().get(base, { params }));
export const createConsultation = (payload) => data($cms().post(base, payload));
export const getConsultation = (id) => data($cms().get(`${base}/${id}`));
export const replyConsultation = (id, advice_html) => data($cms().post(`${base}/${id}/reply`, { advice_html }));
export const cancelConsultation = (id) => data($cms().post(`${base}/${id}/cancel`));
export const rateConsultation = (id, payload) => data($cms().post(`${base}/${id}/rating`, payload));
