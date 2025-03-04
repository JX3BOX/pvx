<template>
	<div class="m-furniture-set">
		<!-- <el-popover class="m-popover"  placement="top-start" width="200" trigger="hover">
			<div class="u-info">
				<span class="u-name">{{ item.szName }}</span>
				<span v-if="item.Attribute1"><span class="u-label u-blue">观赏</span>{{ item.Attribute1 }}</span>
				<span v-if="item.Attribute2"><span class="u-label u-pink">实用</span>{{ item.Attribute2 }}</span>
				<span v-if="item.Attribute3"><span class="u-label u-yellow">坚固</span>{{ item.Attribute3 }}</span>
				<span v-if="item.Attribute4"><span class="u-label u-green">风水</span>{{ item.Attribute4 }}</span>
				<span v-if="item.Attribute5"><span class="u-label u-purple">趣味</span>{{ item.Attribute5 }}</span>
				<span><span class="u-label">园宅等级：</span>{{ item.LevelLimit }}级</span>
			</div>

		</el-popover> -->
		<router-link v-for="(item, i) in furnitures" :key="i" class="u-item" :class="quality(item.Quality)" slot="reference" :to="`/${item.dwID}`">
			<img class="u-pic" :src="formatImg(item.Path)" />
			<span class="u-name">{{ item.szName }}</span>
		</router-link>
	</div>
</template>
<script>
export default {
	name: "Set",
	props: ["data"],
	inject: ["__imgRoot"],
	data: function () {
		return {};
	},
	computed: {
		furnitures: function () {
			return this.data?.furnitures || [];
		},
		client: function () {
			return this.$store.state.client;
		},
	},
	methods: {
		quality: function (id) {
			return id ? "quality_" + id : "";
		},
		formatImg(link) {
			if (!link) return;
			let img = link.toLowerCase().match(/.*[\/,\\]homeland(.*?).tga/);
			let name = img?.[1].replace(/\\/g, "/");

			if (img?.[1] == "default") return this.__imgRoot + `homeland/${this.client}` + "/default/default.png";
			return this.__imgRoot + `homeland/${this.client}` + name + ".png";
		},
	},
	created() {},
};
</script>

<style lang="less" scoped>
.m-furniture-set {
	.flex;
	flex-wrap: wrap;
	align-items: center;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
	.u-item {
		.db;
		transition: all 0.1s ease-in-out;
		.mr(40px);
		.mb(20px);
		&:hover {
			filter: brightness(110%) saturate(120%);
			.u-name {
				color: @pink;
			}
		}
	}
	.u-pic {
		.h(100px);
	}
	.u-name {
		.db;
		color: @color;
		.x;
	}
}
</style>
