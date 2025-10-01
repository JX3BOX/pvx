import { $node, $cms } from "@jx3box/jx3box-common/js/https";
import { __dataPath, __imgPath } from "@/utils/config";
import axios from "axios";
// const $ = axios.create({
//     baseURL : 'http://localhost:9002/'
// })
const $ = $node();

function getPets(params) {
    return $.get("/pets", {
        params: params,
    });
}

function getPet(petid, params) {
    return $.get(`/pet/${petid}`, {
        params,
    });
}

function getPetSkill(petid, params) {
    return $.get(`/pet/${petid}/skill`, {
        params,
    });
}

function getShopInfo({ item_type, item_id, client = "std" }) {
    return $.get(`/shop`, {
        params: {
            client,
            itemType: item_type,
            itemId: item_id,
        },
    });
}

function getPetLucky(client) {
    return axios.get(__dataPath + `pvx/pet/output/pet_${client}_lucky.json`);
}

function getSkill(params) {
    return $.get("/skills", {
        params,
    });
}
// 海报
function getSliders(type, client, source_ids, per = 10) {
    let _params = {
        client: client,
        type: type,
        source_type: "pet",
        source_ids: source_ids,
    };
    if (per) {
        _params.per = per;
    }
    return $cms({ mute: true }).get(`/api/cms/news/v2`, {
        params: _params,
    });
}
function getMapList() {
    return axios.get(__imgPath + "map/data/map_index.json");
}
export { getPets, getPet, getPetSkill, getShopInfo, getPetLucky, getSkill, getSliders, getMapList };
