import { __spider2 } from "@/utils/config";
import { $next } from "@jx3box/jx3box-common/js/https";
import axios from "axios";

function getFlower(params) {
    return axios.get(__spider2 + "/api/spider/flower", {
        params: params,
    });
}

function getFlowerRank(query, vm) {
    return $next()
        .get("/api/flower/price/rank", {
            params: query,
        })
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(() => {
            if (vm) {
                vm.loading = false;
            }
        });
}

export { getFlower, getFlowerRank };
