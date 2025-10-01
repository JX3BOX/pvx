import axios from "axios";
import { __dataPath } from "@/utils/config";
import { $team, $cms } from '@jx3box/jx3box-common/js/https';

const $ = axios.create({
	baseURL: __dataPath + "pvx/homeland/output/",
});

// 获取房屋升级需求表
function getHomelandLevelUp() {
	return $.get("house_level_up.json");
}

// 获取房屋日常活动奖励
function getHomelandGame() {
	return $.get("homeland_game_play.json");
}

// 获取地图房屋坐标
function getHomelandCoord(mapId) {
	return $.get(`landinfo/${mapId}.json`);
}

// 获取家具类别
function getFurnitureCategory() {
	return $.get("homeland_category.json");
}

// 园宅会赛
function getFurnitureMatch(params){
    /* return $team({mute:true}).get(`/api/team/share-ui/get/today`, {
        params
    }) */
    return $cms({mute: true}).get(`/api/cms/game/furniture/match`, {
        params
    })
}
// 获取家园BBS攻略
function getBbsList(params) {
    return $cms({mute: true}).get(`/api/cms/posts`, {
        params
    })
}

export { getHomelandLevelUp, getHomelandGame, getHomelandCoord, getFurnitureCategory, getFurnitureMatch, getBbsList };
