<template>
    <div class="grid w-full content-center justify-items-center gap-3 p-4">
        <PvxActionButton v-if="!loggedIn" @click="login">{{ $t("exterior.modelLogin") }}</PvxActionButton>
        <template v-else>
            <el-radio-group v-if="roles.length > 1" v-model="role" :aria-label="$t('exterior.bodyType')">
                <el-radio-button v-for="id in roles" :key="id" :value="id">
                    {{ $t(`exterior.bodyTypes.${bodyTypes[id]}`) }}
                </el-radio-button>
            </el-radio-group>
            <el-button v-if="!model || loadedRole !== role" :loading="loading" type="primary" @click="load">
                {{ $t("exterior.loadModel") }}
            </el-button>
            <slot v-else :model="model" :role="role">
                <span class="text-sm text-slate-600">{{ $t("exterior.modelLoaded") }}</span>
            </slot>
            <p v-if="error && errorRole === role" class="m-0 text-sm text-red-700" role="alert">{{ error }}</p>
        </template>
    </div>
</template>

<script>
import User from "@jx3box/jx3box-common/js/user";
import PvxActionButton from "@/components/design/PvxActionButton.vue";
import { exteriorBodyTypes, getExteriorModel } from "@/service/exterior";

export default {
    name: "ExteriorModelPreview",
    components: { PvxActionButton },
    props: {
        item: { type: Object, required: true },
        initialRole: { type: Number, default: null },
    },
    data() {
        const bodyTypes = exteriorBodyTypes;
        const supported = Object.keys(bodyTypes).map(Number);
        const roles = ["outfit", "part", "hair"].includes(this.item.domain)
            ? supported.filter((id) => !this.item.roles.length || this.item.roles.includes(id))
            : [0];
        return {
            bodyTypes,
            roles,
            role: roles.includes(this.initialRole) ? this.initialRole : roles[0],
            loggedIn: User.isLogin(),
            loading: false,
            model: null,
            loadedRole: null,
            error: "",
            errorRole: null,
        };
    },
    methods: {
        login() {
            User.toLogin();
        },
        async load() {
            const role = this.role;
            this.loading = true;
            this.error = "";
            try {
                this.model = await getExteriorModel(this.item.key, role);
                this.loadedRole = role;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                this.errorRole = role;
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>
