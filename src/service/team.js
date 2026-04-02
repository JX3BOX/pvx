import { $team } from "@jx3box/jx3box-common/js/api";

// 获取用户角色
const getUserRoles = () => {
    return $team().get(`api/team/my-game-roles?nopage&custom=0`);
};

export { getUserRoles };
