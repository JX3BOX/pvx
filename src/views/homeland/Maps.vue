<template>
	<div class="v-homeland-maps">
		<!-- <h1 class="u-title">家园地图</h1> -->
		<div class="m-homeland-maps-tabs">
			<el-tabs v-model="active">
				<el-tab-pane v-for="(label, map_id) in data" :key="map_id" :label="label" :name="map_id">
					<div class="m-house-map">
						<div class="m-house-model">
							<div class="u-map">
								<img class="u-map-bg" :src="getMapImage(map_id)" />
							</div>
							<div class="u-house">
								<el-tooltip class="item" effect="light" placement="top" v-for="(house, i) in active_coords" :key="'house-' + i" popper-class="m-house-map-pop">
									<span slot="content" class="u-house-desc">
										{{ house.name }} <br />
										面积：{{ house.area }} <br />
										价格：<GamePrice :price="~~house.price * 10000" />
									</span>
									<span class="u-house-item" :class="'u-house-index-' + i" :style="buildStyle(house)">
										<i :class="'u-house-icon u-house-area-' + house.area"></i>
									</span>
								</el-tooltip>
							</div>
						</div>
					</div>
				</el-tab-pane>
			</el-tabs>
		</div>
	</div>
</template>

<script>
import homeland_maps from "@/assets/data/homeland_maps.json";
import { __imgPath, __ossRoot } from "@/utils/config";
import { resolveImagePath } from "@jx3box/jx3box-common/js/utils";
import { getHomelandCoord } from "@/service/homeland.js";
import GamePrice from "@jx3box/jx3box-common-ui/src/wiki/GamePrice.vue";

// 初始数据设置
const DEFAULT_MAP_ID = "455"; //默认地图

export default {
	name: "Maps",
	props: [],
	components: { GamePrice },
	data: function () {
		return {
			active: this.$route.query.map_id || DEFAULT_MAP_ID,
			data: homeland_maps,

			coords: {},
			active_coords: [],

			map_id: "",
		};
	},
	computed: {},
	watch: {
		// 重载坐标数据
		active: {
			handler: function (map_id) {
				this.loadCoords(map_id);

				this.$router
					.push({
						query: {
							map_id,
						},
					})
					.catch((err) => err);
			},
		},
	},
	methods: {
		// 显示家园地图图片
		getMapImage: function (map_id) {
			// return resolveImagePath(__ossRoot + "image/house/map/" + map_id + ".png")
			return __imgPath + "image/house/map/" + map_id + ".png";
		},
		// 坐标计算
		buildStyle: function (house) {
			let x = (house.x / 1024) * 100 + "%";
			let y = (house.y / 896) * 100 + "%";
			return {
				left: x,
				top: y,
			};
		},
		// 获取坐标数据
		loadCoords: function (map_id) {
			if (this.coords[map_id]?.length) {
				this.active_coords = this.coords[map_id];
			} else {
				getHomelandCoord(map_id).then((res) => {
					this.coords[map_id] = res.data;
					this.active_coords = res.data;
				});
			}
		},
		// 初始化坐标仓库
		init: function () {
			Object.keys(homeland_maps).forEach((map_id) => {
				this.coords[map_id] = [];
			});
		},
	},
	mounted: function () {
		this.init();
		this.loadCoords(this.active);
	},
};
</script>

<style lang="less">
@import "~@/assets/css/homeland/maps.less";
</style>
