<template>
	<div class="v-homeland-tutorial">
		<!-- <h1 class="m-homeland-title">家园指南</h1> -->

		<div class="m-homeland-info">
			<div class="m-homeland-games">
				<div v-for="(item, i) in game_data" :key="'game-' + i" class="u-game">
					<el-popover placement="top" width="200" trigger="hover" :content="showGameTip(item.szTip)" popper-class="m-homeland-games-pop" v-if="showGameTip(item.szTip)">
						<div class="u-box" slot="reference">
							<i class="u-pic"><img :src="showGamePic(item.nUnLockFrame)" /></i> <span class="u-name">{{ item.szName }}</span>
						</div>
					</el-popover>
					<template v-else>
						<div class="u-box">
							<i class="u-pic"><img :src="showGamePic(item.nUnLockFrame)" /></i> <span class="u-name">{{ item.szName }}</span>
						</div>
					</template>
				</div>
			</div>

			<div class="m-homeland-levels">
				<el-table :data="level_data" stripe>
					<el-table-column align="center">
						<template slot="header">
							<h2 class="u-header"><i class="el-icon-s-home"></i> 家园升级需求</h2>
						</template>
						<el-table-column prop="Level" label="等级" align="center" width="100px"> </el-table-column>
						<el-table-column prop="Record" label="收藏分" align="center"> </el-table-column>
						<el-table-column prop="Currency" label="园宅币" align="center"> </el-table-column>
					</el-table-column>
				</el-table>
			</div>

			<!-- <div class="m-homeland-posts" v-if="posts && posts.length">
				<h2 class="u-header"><i class="el-icon-star-on"></i> 家园攻略</h2>
				<div class="u-list">
					<a class="u-item" :href="item.link" target="_blank" v-for="(item, i) in posts" :key="i">{{ item.label }}</a>
				</div>
			</div> -->
		</div>
	</div>
</template>

<script>
import { getHomelandLevelUp, getHomelandGame } from "@/service/homeland.js";
import { getMenu } from "@jx3box/jx3box-common/js/api_misc";
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";
export default {
	name: "Tutorial",
	props: [],
	inject : ['__imgRoot'],
	components: {},
	data: function () {
		return {
			level_data: [],
			game_data: [],

			posts: [],
		};
	},
	computed: {},
	watch: {},
	methods: {
		// 加载基本信息
		loadInfo: function () {
			getHomelandLevelUp().then((res) => {
				this.level_data = res?.data;
			});
			getHomelandGame().then((res) => {
				this.game_data = res?.data;
			});
		},
		// 加载推荐作品
		loadData: function () {
			getMenu("homeland_rec").then((data) => {
				this.posts = data || [];
			});
		},

		// 显示日常图标
		showGamePic: function (index) {
			return __imgPath + "/image/game/homeland/seasonfurniture_" + index + ".png";
		},

		// 显示活动介绍
		showGameTip: function (str) {
			let output = str?.split("\\n");
			return output.length > 0 ? output[1] : "";
		},
	},
	mounted: function () {
		this.loadInfo();
		// this.loadData();
	},
};
</script>
<style lang="less">
@import "~@/assets/css/homeland/tutorial.less";
</style>
