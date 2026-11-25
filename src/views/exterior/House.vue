<!-- 新版双模式外观仓库：支持囤货理财与自用穿搭分账、分币种资产总览、多件批次入库、分批出售盈亏及角色绑定分组管理。 -->
<template>
    <div class="m-ext-house-page">
        <ExteriorBackNav :to="{ name: 'exterior-list' }" />
        <PvxSurface tag="header" padding="medium" class="m-house-header">
            <div class="m-house-title">
                <h1>{{ $t("exterior.warehouse.title") }}</h1>
                <p>{{ $t("exterior.warehouse.subtitle") }}</p>
            </div>

            <div class="m-house-header__actions">
                <div class="m-currency-switch" role="group" :aria-label="$t('exteriorHouse.currencySwitcher')">
                    <button
                        type="button"
                        class="u-curr-btn"
                        :class="{ 'is-active': activeCurrency === 'cny' }"
                        @click="activeCurrency = 'cny'"
                    >
                        {{ $t('exterior.warehouse.cny') }}
                    </button>
                    <button
                        type="button"
                        class="u-curr-btn"
                        :class="{ 'is-active': activeCurrency === 'gold' }"
                        @click="activeCurrency = 'gold'"
                    >
                        {{ $t('exterior.warehouse.gold') }}
                    </button>
                </div>

                <template v-if="loggedIn">
                    <el-button round @click="openGroupDrawer">
                        <el-icon class="el-icon--left"><FolderOpened /></el-icon>
                        {{ $t("exterior.warehouse.manageGroups") }}
                    </el-button>
                    <el-button type="primary" round @click="openAddDialog()">
                        <el-icon class="el-icon--left"><Plus /></el-icon>
                        {{ $t('exteriorHouse.addStock') }}
                    </el-button>
                </template>
            </div>
        </PvxSurface>

        <PvxSurface v-if="!loggedIn" padding="large" class="m-house-login-gate">
            <PvxEmptyState :title="$t('exterior.warehouse.loginRequired')" illustrated>
                <template #action>
                    <el-button type="primary" round size="large" @click="login">
                        {{ $t("exterior.warehouse.login") }}
                    </el-button>
                </template>
            </PvxEmptyState>
        </PvxSurface>

        <template v-else>
            <!-- 资产总览四格 KPI 卡片 -->
            <section class="m-house-kpis" :aria-label="$t('exteriorHouse.overview')">
                <PvxSurface padding="medium" class="m-kpi-card">
                    <div class="u-kpi-label">{{ $t('exteriorHouse.holdingCostTitle', { currency: currencyLabel }) }}</div>
                    <div class="u-kpi-value is-num">{{ formatMoney(currencySummary.invest.holding_cost, activeCurrency) }}</div>
                    <div class="u-kpi-sub">
                        {{ $t('exteriorHouse.holdingSummary', { lots: currencySummary.invest.holding_lots, quantity: currencySummary.invest.holding_quantity }) }}
                    </div>
                </PvxSurface>

                <PvxSurface padding="medium" class="m-kpi-card">
                    <div class="u-kpi-label">{{ $t('exteriorHouse.selfUseTitle', { currency: currencyLabel }) }}</div>
                    <div class="u-kpi-value is-num">{{ formatMoney(currencySummary.self_use.total_cost, activeCurrency) }}</div>
                    <div class="u-kpi-sub">
                        {{ $t('exteriorHouse.selfUseSummary', { lots: currencySummary.self_use.lots, quantity: currencySummary.self_use.quantity }) }}
                    </div>
                </PvxSurface>

                <PvxSurface padding="medium" class="m-kpi-card">
                    <div class="u-kpi-label">{{ $t('exteriorHouse.netProfitTitle', { currency: currencyLabel }) }}</div>
                    <div class="u-kpi-value is-num" :class="profitTone(currencySummary.invest.realized_profit)">
                        {{ formatSignedMoney(currencySummary.invest.realized_profit, activeCurrency) }}
                    </div>
                    <div class="u-kpi-sub">
                        {{ $t('exteriorHouse.returnSummary', { rate: formatRate(currencySummary.invest.profit_rate), fee: formatMoney(currencySummary.invest.total_fee, activeCurrency) }) }}
                    </div>
                </PvxSurface>

                <PvxSurface padding="medium" class="m-kpi-card">
                    <div class="u-kpi-label">{{ $t('exteriorHouse.totalStockTitle', { currency: currencyLabel }) }}</div>
                    <div class="u-kpi-value is-num">
                        {{ totalStock.toLocaleString($i18n.locale) }}
                        <span class="u-kpi-unit">{{ $t('exteriorHouse.unit', totalStock) }}</span>
                    </div>
                    <div class="u-kpi-sub">
                        {{ $t('exteriorHouse.soldSummary', { quantity: currencySummary.invest.sold_quantity, sales: currencySummary.invest.sold_count }) }}
                    </div>
                </PvxSurface>
            </section>

            <PvxSurface padding="medium" class="m-house-main">
                <div class="m-house-tabs">
                    <button
                        type="button"
                        class="u-tab-btn"
                        :class="{ 'is-active': activeTab === 'holding' }"
                        @click="switchTab('holding')"
                    >
                        {{ $t("exterior.warehouse.holdingTab") }}
                    </button>
                    <button
                        type="button"
                        class="u-tab-btn"
                        :class="{ 'is-active': activeTab === 'sales' }"
                        @click="switchTab('sales')"
                    >
                        {{ $t("exterior.warehouse.salesTab") }}
                    </button>
                </div>

                <!-- 在仓持仓页签 -->
                <template v-if="activeTab === 'holding'">
                    <div class="m-group-bar">
                        <button
                            type="button"
                            class="u-group-chip"
                            :class="{ 'is-active': filterGroup === 'all' }"
                            @click="setGroupFilter('all')"
                        >
                            {{ $t("exterior.warehouse.allGroups") }}
                        </button>
                        <button
                            type="button"
                            class="u-group-chip"
                            :class="{ 'is-active': filterGroup === '0' }"
                            @click="setGroupFilter('0')"
                        >
                            {{ $t("exterior.warehouse.ungrouped") }}
                        </button>
                        <button
                            v-for="grp in groups"
                            :key="grp.id"
                            type="button"
                            class="u-group-chip"
                            :class="{ 'is-active': filterGroup === String(grp.id) }"
                            @click="setGroupFilter(String(grp.id))"
                        >
                            <span>{{ grp.name }}</span>
                            <span v-if="grp.role" class="u-role-pill">
                                {{ roleBadgeText(grp.role) }}
                            </span>
                        </button>
                    </div>

                    <div class="m-filter-row">
                        <el-select v-model="filterPurpose" class="u-filter-select" @change="loadItems">
                            <el-option :label="$t('exteriorHouse.allPurposes')" value="" />
                            <el-option :label="$t('exterior.warehouse.invest')" value="invest" />
                            <el-option :label="$t('exterior.warehouse.selfUse')" value="self_use" />
                        </el-select>

                        <el-select v-model="filterStatus" class="u-filter-select" @change="loadItems">
                            <el-option :label="$t('exteriorHouse.inStock')" value="holding" />
                            <el-option :label="$t('exteriorHouse.soldOut')" value="sold_out" />
                            <el-option :label="$t('exteriorHouse.allLots')" value="all" />
                        </el-select>

                        <el-input
                            v-model="filterKeyword"
                            clearable
                            :placeholder="$t('exteriorHouse.filterHint')"
                            class="u-filter-keyword"
                            @input="debouncedLoadItems"
                            @clear="loadItems"
                        >
                            <template #prefix>
                                <el-icon><Search /></el-icon>
                            </template>
                        </el-input>
                    </div>

                    <div v-loading="itemsLoading" class="m-item-list-wrap">
                        <PvxEmptyState
                            v-if="!itemsLoading && !items.length"
                            :title="$t('exterior.warehouse.empty')"
                            illustrated
                        >
                            <template #action>
                                <el-button type="primary" round @click="openAddDialog()">{{ $t('exteriorHouse.addStock') }}</el-button>
                            </template>
                        </PvxEmptyState>

                        <div v-else class="m-holding-list">
                            <article
                                v-for="row in items"
                                :key="row.id"
                                class="m-holding-card"
                                :class="{ 'is-soldout': row.remaining === 0, 'is-pinned': row.pinned }"
                            >
                                <router-link
                                    v-if="row.exterior"
                                    :to="{ name: 'exterior-list', query: { id: row.exterior.key } }"
                                    class="u-cover-link"
                                >
                                    <img v-if="itemCover(row)" :src="itemCover(row)" alt="" class="u-cover-img" />
                                    <span v-else class="u-cover-fallback">{{ $t('exterior.imageUnavailable') }}</span>
                                </router-link>
                                <div v-else class="u-cover-link">
                                    <span class="u-cover-fallback">{{ $t('exteriorHouse.unlisted') }}</span>
                                </div>

                                <div class="m-holding-info">
                                    <div class="m-holding-title-row">
                                        <router-link
                                            v-if="row.exterior"
                                            :to="{ name: 'exterior-list', query: { id: row.exterior.key } }"
                                            class="u-item-name"
                                        >
                                            {{ row.exterior.name }}
                                        </router-link>
                                        <span v-else class="u-item-name">{{ row.exterior_key }}</span>

                                        <span class="u-tag" :class="row.purpose === 'invest' ? 'is-amber' : 'is-indigo'">
                                            {{ row.purpose === "invest" ? $t('exteriorHouse.investTag') : $t('exteriorHouse.selfUseTag') }}
                                        </span>
                                        <span v-if="row.pinned" class="u-tag is-pin">{{ $t('exterior.star.pin') }}</span>
                                        <span v-if="row.group" class="u-tag is-slate">
                                            {{ row.group.name }}
                                            <template v-if="row.group.role"> · {{ row.group.role.name }}</template>
                                        </span>
                                    </div>

                                    <div class="m-holding-metrics">
                                        <i18n-t keypath="exteriorHouse.remaining" tag="span">
                                            <template #remaining><strong>{{ row.remaining }}</strong></template>
                                            <template #quantity>{{ row.quantity }}</template>
                                        </i18n-t>
                                        <span>
                                            {{ $t('exterior.warehouse.inPrice') }} <strong>{{ formatMoney(row.in_price, row.currency) }}</strong>
                                        </span>
                                        <span>
                                            {{ $t('exteriorHouse.holdingCost') }} <strong>{{ formatMoney(row.holding_cost, row.currency) }}</strong>
                                        </span>
                                        <i18n-t v-if="row.sold_quantity > 0" keypath="exteriorHouse.soldProfit" tag="span" :class="profitTone(row.realized_profit)">
                                            <template #quantity>{{ row.sold_quantity }}</template>
                                            <template #profit><strong>{{ formatSignedMoney(row.realized_profit, row.currency) }}</strong></template>
                                        </i18n-t>
                                        <span class="u-date-text">{{ $t('exteriorHouse.stockedOn', { date: formatDate(row.in_date) }) }}</span>
                                    </div>

                                    <p v-if="row.remark" class="m-holding-remark">{{ row.remark }}</p>
                                </div>

                                <div class="m-holding-actions">
                                    <el-button
                                        v-if="row.remaining > 0"
                                        type="primary"
                                        size="small"
                                        plain
                                        round
                                        @click="openSellDialog(row)"
                                    >
                                        {{ $t('exteriorHouse.sell') }}
                                    </el-button>
                                    <el-button
                                        v-if="row.exterior"
                                        size="small"
                                        plain
                                        round
                                        @click="tryOnItem(row)"
                                    >
                                        {{ $t('exteriorHouse.tryOn') }}
                                    </el-button>
                                    <el-button size="small" plain round @click="toggleItemPin(row)">
                                        {{ row.pinned ? $t('exterior.star.unpin') : $t('exterior.star.pin') }}
                                    </el-button>
                                    <el-button size="small" plain round @click="openEditDialog(row)">{{ $t('exterior.warehouse.edit') }}</el-button>
                                    <el-button size="small" type="danger" plain round @click="removeItem(row)">{{ $t('exteriorHouse.delete') }}</el-button>
                                </div>
                            </article>
                        </div>
                    </div>
                </template>

                <!-- 出售流水台账页签 -->
                <template v-else>
                    <div class="m-filter-row">
                        <el-select v-model="saleChannel" class="u-filter-select" @change="loadSales(1)">
                            <el-option :label="$t('exteriorHouse.allChannels')" value="" />
                            <el-option :label="$t('exteriorHouse.wbl')" value="wbl" />
                            <el-option :label="$t('exteriorHouse.private')" value="private" />
                            <el-option :label="$t('exteriorHouse.otherChannel')" value="other" />
                        </el-select>
                    </div>

                    <div v-loading="salesLoading" class="m-sales-wrap">
                        <PvxEmptyState
                            v-if="!salesLoading && !sales.length"
                            :title="$t('exteriorHouse.emptySales')"
                            illustrated
                        />

                        <el-table v-else :data="sales" class="w-full" stripe>
                            <el-table-column :label="$t('exteriorHouse.appearance')" min-width="220">
                                <template #default="{ row }">
                                    <div class="flex items-center gap-2.5">
                                        <img
                                            v-if="itemCover(row)"
                                            :src="itemCover(row)"
                                            alt=""
                                            class="size-10 shrink-0 rounded-lg border border-slate-100 object-cover object-top"
                                        />
                                        <div class="min-w-0">
                                            <router-link
                                                v-if="row.exterior"
                                                :to="{ name: 'exterior-list', query: { id: row.exterior.key } }"
                                                class="font-medium text-slate-800 hover:text-indigo-600"
                                            >
                                                {{ row.exterior.name }}
                                            </router-link>
                                            <span v-else class="text-slate-600">{{ row.exterior_key }}</span>
                                            <p v-if="row.remark" class="m-0 truncate text-xs text-slate-400">
                                                {{ row.remark }}
                                            </p>
                                        </div>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column prop="quantity" :label="$t('exterior.warehouse.count')" width="76" align="center" />
                            <el-table-column :label="$t('exterior.warehouse.inPrice')" width="110" align="right">
                                <template #default="{ row }">{{ formatMoney(row.in_price, row.currency) }}</template>
                            </el-table-column>
                            <el-table-column :label="$t('exterior.warehouse.outPrice')" width="110" align="right">
                                <template #default="{ row }">{{ formatMoney(row.out_price, row.currency) }}</template>
                            </el-table-column>
                            <el-table-column :label="$t('exteriorHouse.fee')" width="100" align="right">
                                <template #default="{ row }">{{ formatMoney(row.fee, row.currency) }}</template>
                            </el-table-column>
                            <el-table-column :label="$t('exteriorHouse.netProfit')" width="128" align="right">
                                <template #default="{ row }">
                                    <span class="font-semibold tabular-nums" :class="profitTone(row.profit)">
                                        {{ formatSignedMoney(row.profit, row.currency) }}
                                    </span>
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('exteriorHouse.channel')" width="96" align="center">
                                <template #default="{ row }">
                                    <span class="u-tag is-slate">{{ channelLabel(row.channel) }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('exteriorHouse.soldAt')" width="118" align="center">
                                <template #default="{ row }">{{ formatDate(row.out_date) }}</template>
                            </el-table-column>
                            <el-table-column :label="$t('exterior.warehouse.actions')" width="110" align="right">
                                <template #default="{ row }">
                                    <el-button size="small" type="warning" plain round @click="undoSale(row)">
                                        {{ $t('exteriorHouse.undo') }}
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>

                        <div v-if="salesTotal > salesPer" class="mt-4 flex justify-end">
                            <el-pagination
                                :size="isPaginationPhoneViewport ? 'small' : 'default'"
                                :pager-count="responsivePagerCount"
                                layout="prev, pager, next"
                                :total="salesTotal"
                                :page-size="salesPer"
                                :current-page="salesPage"
                                @current-change="loadSales"
                            />
                        </div>
                    </div>
                </template>
            </PvxSurface>
        </template>

        <!-- 入库 / 编辑持仓弹窗 -->
        <el-dialog
            v-model="itemDialogVisible"
            class="m-house-dialog m-house-entry-dialog"
            :title="editingItemId ? $t('exteriorHouse.editStock') : $t('exteriorHouse.newStock')"
            width="min(600px, 94vw)"
            top="5vh"
            append-to-body
        >
            <el-form label-position="top" class="m-entry-form">
                <el-form-item v-if="!editingItemId" :label="$t('exteriorHouse.pick')" required>
                    <div class="w-full space-y-2">
                        <el-input
                            v-if="!itemForm.selectedExterior"
                            v-model="pickSearch"
                            clearable
                            :placeholder="$t('exteriorHouse.pickHint')"
                            @input="debouncedSearchExteriors"
                        >
                            <template #prefix>
                                <el-icon><Search /></el-icon>
                            </template>
                        </el-input>

                        <div v-if="itemForm.selectedExterior" class="m-picked-chip">
                            <div class="u-preview-cover">
                                <img
                                    v-if="pickExteriorCover(itemForm.selectedExterior.images, preferredRole)"
                                    :src="pickExteriorCover(itemForm.selectedExterior.images, preferredRole)"
                                    alt=""
                                />
                            </div>
                            <div class="min-w-0 flex-1">
                                <div class="u-preview-name">
                                    {{ itemForm.selectedExterior.name }}
                                </div>
                                <div class="u-preview-meta">
                                    <span class="u-preview-domain">{{ domainLabel(itemForm.selectedExterior.domain) }}</span>
                                    <span>{{ itemForm.selectedExterior.key }}</span>
                                </div>
                            </div>
                            <el-button link type="primary" @click="itemForm.selectedExterior = null; itemForm.exterior_key = ''">
                                {{ $t('exteriorHouse.chooseAgain') }}
                            </el-button>
                        </div>

                        <div v-else v-loading="pickLoading" class="m-pick-results">
                            <div v-if="!pickCandidates.length && !pickLoading" class="p-3 text-center text-xs text-slate-400">
                                {{ $t('exteriorHouse.pickPrompt') }}
                            </div>
                            <button
                                v-for="cand in pickCandidates"
                                :key="cand.key"
                                type="button"
                                class="u-pick-row"
                                @click="selectExteriorCandidate(cand)"
                            >
                                <img
                                    v-if="pickExteriorCover(cand.images, preferredRole)"
                                    :src="pickExteriorCover(cand.images, preferredRole)"
                                    alt=""
                                />
                                <div class="min-w-0 flex-1 text-left">
                                    <div class="truncate font-medium text-slate-800">{{ cand.name }}</div>
                                    <div class="text-xs text-slate-400">{{ domainLabel(cand.domain) }} · {{ cand.key }}</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </el-form-item>

                <div class="m-entry-fields">
                    <el-form-item :label="$t('exteriorHouse.purpose')">
                        <el-radio-group v-model="itemForm.purpose">
                            <el-radio-button value="invest">{{ $t('exterior.warehouse.invest') }}</el-radio-button>
                            <el-radio-button value="self_use">{{ $t('exterior.warehouse.selfUse') }}</el-radio-button>
                        </el-radio-group>
                    </el-form-item>

                    <el-form-item :label="$t('exteriorHouse.currency')">
                        <el-radio-group v-model="itemForm.currency">
                            <el-radio-button value="cny">{{ $t('exterior.warehouse.cny') }}</el-radio-button>
                            <el-radio-button value="gold">{{ $t('exterior.warehouse.gold') }}</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                </div>

                <el-form-item :label="$t('exterior.warehouse.group')">
                    <el-select v-model="itemForm.group_id" clearable :placeholder="$t('exterior.warehouse.ungrouped')" class="w-full">
                        <el-option v-for="grp in groups" :key="grp.id" :label="grp.name" :value="grp.id" />
                    </el-select>
                </el-form-item>

                <div class="m-entry-fields">
                    <el-form-item :label="$t('exterior.warehouse.count')">
                        <el-input-number v-model="itemForm.quantity" :min="minEditableQty" :max="999" class="!w-full" />
                    </el-form-item>
                    <el-form-item :label="$t('exterior.warehouse.inPrice')">
                        <el-input-number
                            v-model="itemForm.in_price"
                            :min="0"
                            :max="99999999"
                            :precision="2"
                            :step="10"
                            class="!w-full"
                        />
                    </el-form-item>
                </div>

                <div class="m-entry-fields">
                    <el-form-item :label="$t('exteriorHouse.stockDate')">
                        <el-date-picker
                            v-model="itemForm.in_date"
                            type="date"
                            :format="$t('exteriorHouse.dateFormat')"
                            value-format="YYYY-MM-DD"
                            class="!w-full"
                        />
                    </el-form-item>
                    <el-form-item :label="$t('exteriorHouse.pinDisplay')">
                        <el-switch v-model="itemForm.pinned" />
                    </el-form-item>
                </div>

                <el-form-item :label="$t('exteriorHouse.lotNote')">
                    <el-input v-model="itemForm.remark" maxlength="200" :placeholder="$t('exteriorHouse.lotHint')" />
                </el-form-item>

                <div class="m-cost-preview">
                    <span>{{ $t('exteriorHouse.lotCost') }}</span>
                    <strong>{{ formatMoney((itemForm.quantity || 1) * (itemForm.in_price || 0), itemForm.currency) }}</strong>
                </div>
            </el-form>

            <template #footer>
                <div class="m-entry-actions">
                    <el-button @click="itemDialogVisible = false">{{ $t('exteriorHouse.cancel') }}</el-button>
                    <el-button type="primary" :loading="itemSaving" @click="submitItemForm">
                        {{ $t("exterior.warehouse.save") }}
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 分批出售弹窗 -->
        <el-dialog class="m-house-dialog" v-model="sellDialogVisible" :title="$t('exterior.warehouse.checkout')" width="min(500px, 94vw)" append-to-body>
            <template v-if="sellingItem">
                <div class="m-sell-header">
                    <img v-if="itemCover(sellingItem)" :src="itemCover(sellingItem)" alt="" />
                    <div class="min-w-0 flex-1">
                        <div class="truncate text-base font-bold text-slate-800">
                            {{ sellingItem.exterior?.name || sellingItem.exterior_key }}
                        </div>
                        <div class="mt-0.5 text-xs text-slate-500">
                            {{ $t('exteriorHouse.saleHeader', { remaining: sellingItem.remaining, price: formatMoney(sellingItem.in_price, sellingItem.currency) }) }}
                        </div>
                    </div>
                </div>

                <el-form label-width="96px" class="mt-4">
                    <el-form-item :label="$t('exteriorHouse.sellQuantity')">
                        <el-input-number v-model="sellForm.quantity" :min="1" :max="sellingItem.remaining" class="!w-full" />
                    </el-form-item>
                    <el-form-item :label="$t('exterior.warehouse.outPrice')">
                        <el-input-number
                            v-model="sellForm.out_price"
                            :min="0"
                            :max="99999999"
                            :precision="2"
                            :step="10"
                            class="!w-full"
                        />
                    </el-form-item>
                    <el-form-item :label="$t('exteriorHouse.salesChannel')">
                        <el-radio-group v-model="sellForm.channel" @change="onSellChannelChange">
                            <el-radio-button value="wbl">{{ $t('exteriorHouse.wbl') }}</el-radio-button>
                            <el-radio-button value="private">{{ $t('exteriorHouse.private') }}</el-radio-button>
                            <el-radio-button value="other">{{ $t('exteriorHouse.other') }}</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item :label="$t('exteriorHouse.fee')">
                        <div class="w-full space-y-2">
                            <div class="flex items-center gap-2">
                                <el-input-number
                                    v-model="sellForm.fee"
                                    :min="0"
                                    :max="99999999"
                                    :precision="2"
                                    :disabled="sellForm.autoWblFee"
                                    class="!flex-1"
                                />
                                <el-checkbox v-model="sellForm.autoWblFee" border size="small">{{ $t('exteriorHouse.marketFee') }}</el-checkbox>
                            </div>
                        </div>
                    </el-form-item>
                    <el-form-item :label="$t('exteriorHouse.saleDate')">
                        <el-date-picker
                            v-model="sellForm.out_date"
                            type="date"
                            :format="$t('exteriorHouse.dateFormat')"
                            value-format="YYYY-MM-DD"
                            class="!w-full"
                        />
                    </el-form-item>
                    <el-form-item :label="$t('exteriorHouse.saleNote')">
                        <el-input v-model="sellForm.remark" maxlength="200" :placeholder="$t('exteriorHouse.saleHint')" />
                    </el-form-item>
                </el-form>

                <div class="m-profit-preview">
                    <div>
                        <span>{{ $t('exteriorHouse.purchaseCost') }}</span>
                        <strong>{{ formatMoney(sellPreview.cost, sellingItem.currency) }}</strong>
                    </div>
                    <div>
                        <span>{{ $t('exteriorHouse.revenue') }}</span>
                        <strong>{{ formatMoney(sellPreview.revenue, sellingItem.currency) }}</strong>
                    </div>
                    <div>
                        <span>{{ $t('exteriorHouse.estimatedProfit') }}</span>
                        <strong :class="profitTone(sellPreview.profit)">
                            {{ formatSignedMoney(sellPreview.profit, sellingItem.currency) }}
                            <template v-if="sellPreview.cost > 0">({{ formatRate(sellPreview.rate) }})</template>
                        </strong>
                    </div>
                </div>
            </template>

            <template #footer>
                <el-button round @click="sellDialogVisible = false">{{ $t('exteriorHouse.cancel') }}</el-button>
                <el-button type="primary" round :loading="sellSaving" @click="submitSellForm">{{ $t('exteriorHouse.confirmSale') }}</el-button>
            </template>
        </el-dialog>

        <!-- 分组与绑定角色管理抽屉 -->
        <el-drawer
            v-model="groupDrawerVisible"
            :title="$t('exterior.warehouse.manageGroups')"
            header-class="m-exterior-drawer-header"
            body-class="m-exterior-drawer-body"
            size="min(100%, 460px)"
            append-to-body
        >
            <template #header="{ titleId }">
                <div class="flex min-w-0 items-center gap-2.5">
                    <span class="grid size-8 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                        <FolderOpened class="size-4" aria-hidden="true" />
                    </span>
                    <h2 :id="titleId" class="m-0 text-base font-semibold text-slate-800">{{ $t('exterior.warehouse.manageGroups') }}</h2>
                </div>
            </template>
            <div class="grid gap-3">
                <PvxSurface padding="small" radius="medium" class="m-house-group-form grid gap-2.5">
                    <div class="text-sm font-semibold text-slate-800">
                        {{ groupForm.id ? $t('exteriorHouse.editGroup') : $t('exterior.warehouse.createGroup') }}
                    </div>
                    <el-input :aria-label="$t('exteriorHouse.groupName')" v-model="groupForm.name" maxlength="64" :placeholder="$t('exteriorHouse.groupNameHint')" />
                    <el-select :aria-label="$t('exteriorHouse.linkRole')" v-model="groupForm.role_id" clearable :placeholder="$t('exteriorHouse.linkRole')" class="w-full">
                        <el-option
                            v-for="r in userRoles"
                            :key="r.ID"
                            :label="$t('exteriorHouse.roleOption', { name: r.name, server: r.server || $t('exteriorHouse.unknownServer'), body: bodyLabel(r.body_type) })"
                            :value="Number(r.ID)"
                        />
                    </el-select>
                    <el-input :aria-label="$t('exteriorHouse.groupNote')" v-model="groupForm.remark" maxlength="200" :placeholder="$t('exteriorHouse.groupNote')" />
                    <div class="flex justify-end gap-2">
                        <el-button v-if="groupForm.id" size="small" round @click="resetGroupForm">{{ $t('exteriorHouse.cancelEdit') }}</el-button>
                        <el-button type="primary" size="small" round :loading="groupSaving" @click="saveGroupForm">
                            {{ groupForm.id ? $t('exteriorHouse.saveChanges') : $t('exteriorHouse.addGroup') }}
                        </el-button>
                    </div>
                </PvxSurface>

                <PvxEmptyState v-if="!groups.length" :title="$t('exteriorHouse.emptyGroups')" illustrated />
                <div v-else class="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
                    <div v-for="grp in groups" :key="grp.id" class="flex items-center justify-between gap-2 px-3 py-2.5 text-sm sm:gap-3 sm:px-4">
                        <div class="min-w-0 flex-1">
                            <div class="flex flex-wrap items-center gap-1.5">
                                <span class="break-all font-semibold text-slate-800">{{ grp.name }}</span>
                                <span v-if="grp.role" class="u-role-pill">{{ roleBadgeText(grp.role) }}</span>
                            </div>
                            <p v-if="grp.remark" :title="grp.remark" class="m-0 mt-0.5 truncate text-xs text-slate-500">{{ grp.remark }}</p>
                        </div>
                        <div class="flex shrink-0 items-center gap-1">
                            <el-button size="small" plain @click="editGroup(grp)">{{ $t('exterior.warehouse.edit') }}</el-button>
                            <el-button size="small" type="danger" plain @click="removeGroup(grp)">{{ $t('exteriorHouse.delete') }}</el-button>
                        </div>
                    </div>
                </div>
            </div>
        </el-drawer>
    </div>
</template>

<script>
import ExteriorBackNav from "@/components/exterior/ExteriorBackNav.vue";
import { FolderOpened, Plus, Search } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import User from "@jx3box/jx3box-common/js/user";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import responsivePagination from "@/mixins/responsive-pagination";
import PvxSurface from "@/components/design/PvxSurface.vue";
import { BODY_LABEL_MAP, DOMAIN_META, localizedExteriorLabel, normalizeBodyType, pickExteriorCover } from "@/components/exterior/meta";
import { getUserRoles } from "@/service/team";
import {
    createWarehouseGroup,
    createWarehouseItem,
    deleteWarehouseGroup,
    deleteWarehouseItem,
    getExteriorsDetail,
    getExteriorsList,
    getWarehouseGroups,
    getWarehouseItems,
    getWarehouseSales,
    getWarehouseSummary,
    sellWarehouseItem,
    undoWarehouseSale,
    updateWarehouseGroup,
    updateWarehouseItem,
} from "@/service/exterior";

const roundMoney = (val) => Math.round((Number(val || 0) + Number.EPSILON) * 100) / 100;
const todayIso = () => new Date().toISOString().slice(0, 10);

const EMPTY_SUMMARY = () => ({
    cny: {
        invest: { holding_lots: 0, holding_quantity: 0, holding_cost: 0, sold_count: 0, sold_quantity: 0, realized_revenue: 0, realized_cost: 0, total_fee: 0, realized_profit: 0, profit_rate: 0 },
        self_use: { lots: 0, quantity: 0, total_cost: 0 },
    },
    gold: {
        invest: { holding_lots: 0, holding_quantity: 0, holding_cost: 0, sold_count: 0, sold_quantity: 0, realized_revenue: 0, realized_cost: 0, total_fee: 0, realized_profit: 0, profit_rate: 0 },
        self_use: { lots: 0, quantity: 0, total_cost: 0 },
    },
});

export default {
    mixins: [responsivePagination],
    name: "ExteriorHouse",
    components: {
        ExteriorBackNav,
        FolderOpened,
        Plus,
        PvxEmptyState,
        PvxSurface,
        Search,
    },
    data() {
        return {
            loggedIn: User.isLogin(),
            activeCurrency: "cny",
            activeTab: "holding",
            summary: EMPTY_SUMMARY(),
            groups: [],
            userRoles: [],
            items: [],
            itemsLoading: false,
            filterGroup: "all",
            filterPurpose: "",
            filterStatus: "holding",
            filterKeyword: "",
            keywordTimer: null,
            sales: [],
            salesLoading: false,
            saleChannel: "",
            salesPage: 1,
            salesPer: 20,
            salesTotal: 0,

            itemDialogVisible: false,
            editingItemId: null,
            editingSoldQty: 0,
            itemSaving: false,
            pickSearch: "",
            pickLoading: false,
            pickCandidates: [],
            pickTimer: null,
            itemForm: {
                exterior_key: "",
                selectedExterior: null,
                group_id: null,
                purpose: "invest",
                currency: "cny",
                quantity: 1,
                in_price: 0,
                in_date: todayIso(),
                pinned: false,
                remark: "",
            },

            sellDialogVisible: false,
            sellingItem: null,
            sellSaving: false,
            sellForm: {
                quantity: 1,
                out_price: 0,
                fee: 0,
                autoWblFee: true,
                channel: "wbl",
                out_date: todayIso(),
                remark: "",
            },

            groupDrawerVisible: false,
            groupSaving: false,
            groupForm: {
                id: null,
                name: "",
                role_id: null,
                remark: "",
            },
        };
    },
    computed: {
        preferredRole() {
            return this.$store.state.preferredRole || 2;
        },
        currencyLabel() {
            return this.activeCurrency === "cny" ? this.$t("exteriorHouse.cnyName") : this.$t("exterior.warehouse.gold");
        },
        currencySummary() {
            return this.summary[this.activeCurrency] || EMPTY_SUMMARY()[this.activeCurrency];
        },
        totalStock() {
            return this.currencySummary.invest.holding_quantity + this.currencySummary.self_use.quantity;
        },
        minEditableQty() {
            return Math.max(1, this.editingSoldQty || 0);
        },
        sellPreview() {
            if (!this.sellingItem) return { cost: 0, revenue: 0, fee: 0, profit: 0, rate: 0 };
            const qty = Number(this.sellForm.quantity) || 1;
            const cost = roundMoney(qty * Number(this.sellingItem.in_price));
            const revenue = roundMoney(qty * (Number(this.sellForm.out_price) || 0));
            const fee = this.sellForm.autoWblFee
                ? roundMoney(revenue * 0.05)
                : roundMoney(Number(this.sellForm.fee) || 0);
            const profit = roundMoney(revenue - cost - fee);
            const rate = cost > 0 ? roundMoney((profit / cost) * 100) : 0;
            return { cost, revenue, fee, profit, rate };
        },
    },
    watch: {
        activeCurrency() {
            if (!this.loggedIn) return;
            if (this.activeTab === "sales") this.loadSales(1);
            else this.loadItems();
        },
        "sellForm.autoWblFee"(enabled) {
            if (enabled) this.syncAutoFee();
        },
        "sellForm.quantity"() {
            if (this.sellForm.autoWblFee) this.syncAutoFee();
        },
        "sellForm.out_price"() {
            if (this.sellForm.autoWblFee) this.syncAutoFee();
        },
        "$route.query.add"(key) {
            if (key && this.loggedIn) this.handleAddQueryKey(String(key));
        },
    },
    created() {
        this.$store.dispatch("initPreferredRole");
        if (this.loggedIn) {
            this.loadAll();
            if (this.$route.query.add) {
                this.handleAddQueryKey(String(this.$route.query.add));
            }
        }
    },
    beforeUnmount() {
        clearTimeout(this.keywordTimer);
        clearTimeout(this.pickTimer);
    },
    methods: {
        pickExteriorCover,
        login() {
            User.toLogin();
        },
        domainLabel(domain) {
            return localizedExteriorLabel(this.$t, DOMAIN_META[domain]?.label || domain || "");
        },
        bodyLabel(raw) {
            const role = normalizeBodyType(raw);
            return localizedExteriorLabel(this.$t, BODY_LABEL_MAP[role] || String(raw || ""));
        },
        roleBadgeText(role) {
            if (!role) return "";
            const body = this.bodyLabel(role.body_type);
            return body ? `${role.name}·${body}` : role.name;
        },
        itemCover(row) {
            const groupRole = row.group?.role ? normalizeBodyType(row.group.role.body_type) : null;
            return pickExteriorCover(row.exterior?.images, groupRole || this.preferredRole);
        },
        formatMoney(val, currency = "cny", signed = false) {
            const num = roundMoney(val);
            const options = {
                minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
                maximumFractionDigits: 2,
                signDisplay: signed ? "exceptZero" : "auto",
            };
            if (currency === "gold") {
                const amount = num.toLocaleString(this.$i18n.locale, options);
                return this.$t("exteriorHouse.goldAmount", { amount }, Math.abs(num) === 1 ? 1 : 2);
            }
            return num.toLocaleString(this.$i18n.locale, { ...options, style: "currency", currency: "CNY" });
        },
        formatSignedMoney(val, currency = "cny") {
            return this.formatMoney(val, currency, true);
        },
        formatRate(val) {
            return (roundMoney(val) / 100).toLocaleString(this.$i18n.locale, {
                style: "percent", signDisplay: "exceptZero", minimumFractionDigits: 1, maximumFractionDigits: 1,
            });
        },
        profitTone(val) {
            const num = Number(val) || 0;
            if (num > 0) return "is-profit";
            if (num < 0) return "is-loss";
            return "";
        },
        channelLabel(ch) {
            const keys = { wbl: "exteriorHouse.wbl", private: "exteriorHouse.private", other: "exteriorHouse.other" };
            return keys[ch] ? this.$t(keys[ch]) : ch;
        },
        formatDate(raw) {
            if (!raw) return "-";
            return new Date(String(raw).slice(0, 10) + "T00:00:00Z").toLocaleDateString(this.$i18n.locale, { timeZone: "UTC" });
        },
        errMsg(err, fallback = this.$t("exterior.requestError")) {
            return err?.response?.data?.msg || err?.message || fallback;
        },
        async loadAll() {
            await Promise.all([this.loadSummary(), this.loadGroups(), this.loadItems(), this.loadUserRoles()]);
        },
        async loadSummary() {
            try {
                const data = await getWarehouseSummary();
                if (data) this.summary = data;
            } catch (err) {
                ElMessage.error(this.errMsg(err, this.$t("exteriorHouse.loadSummaryError")));
            }
        },
        async loadGroups() {
            try {
                this.groups = await getWarehouseGroups();
            } catch (err) {
                ElMessage.error(this.errMsg(err, this.$t("exteriorHouse.loadGroupsError")));
            }
        },
        async loadUserRoles() {
            try {
                const res = await getUserRoles();
                this.userRoles = res?.data?.data?.list || [];
            } catch {
                this.userRoles = [];
            }
        },
        async loadItems() {
            this.itemsLoading = true;
            try {
                const params = {
                    status: this.filterStatus,
                    currency: this.activeCurrency,
                };
                if (this.filterGroup !== "all") params.group_id = Number(this.filterGroup);
                if (this.filterPurpose) params.purpose = this.filterPurpose;
                if (this.filterKeyword.trim()) params.keyword = this.filterKeyword.trim();
                this.items = await getWarehouseItems(params);
            } catch (err) {
                ElMessage.error(this.errMsg(err, this.$t("exteriorHouse.loadStockError")));
            } finally {
                this.itemsLoading = false;
            }
        },
        debouncedLoadItems() {
            clearTimeout(this.keywordTimer);
            this.keywordTimer = setTimeout(() => this.loadItems(), 260);
        },
        setGroupFilter(val) {
            this.filterGroup = val;
            this.loadItems();
        },
        switchTab(tab) {
            this.activeTab = tab;
            if (tab === "sales") this.loadSales(1);
            else this.loadItems();
        },
        async loadSales(page = 1) {
            this.salesPage = page;
            this.salesLoading = true;
            try {
                const params = { page, per: this.salesPer, currency: this.activeCurrency };
                if (this.saleChannel) params.channel = this.saleChannel;
                const res = await getWarehouseSales(params);
                this.sales = res?.list || [];
                this.salesTotal = Number(res?.total) || 0;
            } catch (err) {
                ElMessage.error(this.errMsg(err, this.$t("exteriorHouse.loadSalesError")));
            } finally {
                this.salesLoading = false;
            }
        },
        async handleAddQueryKey(key) {
            try {
                const ext = await getExteriorsDetail(key);
                this.openAddDialog(ext);
            } catch {
                this.openAddDialog();
            }
        },
        openAddDialog(presetExterior = null) {
            this.editingItemId = null;
            this.editingSoldQty = 0;
            this.pickSearch = "";
            this.pickCandidates = [];
            this.itemForm = {
                exterior_key: presetExterior?.key || "",
                selectedExterior: presetExterior || null,
                group_id: this.filterGroup !== "all" && this.filterGroup !== "0" ? Number(this.filterGroup) : null,
                purpose: "invest",
                currency: this.activeCurrency,
                quantity: 1,
                in_price: 0,
                in_date: todayIso(),
                pinned: false,
                remark: "",
            };
            this.itemDialogVisible = true;
        },
        openEditDialog(row) {
            this.editingItemId = row.id;
            this.editingSoldQty = Number(row.quantity) - Number(row.remaining);
            this.itemForm = {
                exterior_key: row.exterior_key,
                selectedExterior: row.exterior || null,
                group_id: row.group_id || null,
                purpose: row.purpose || "invest",
                currency: row.currency || "cny",
                quantity: Number(row.quantity),
                in_price: Number(row.in_price),
                in_date: String(row.in_date || "").slice(0, 10),
                pinned: Boolean(row.pinned),
                remark: row.remark || "",
            };
            this.itemDialogVisible = true;
        },
        debouncedSearchExteriors() {
            clearTimeout(this.pickTimer);
            const kw = this.pickSearch.trim();
            if (!kw) {
                this.pickCandidates = [];
                return;
            }
            this.pickTimer = setTimeout(async () => {
                this.pickLoading = true;
                try {
                    const res = await getExteriorsList({ keyword: kw, limit: 15, include_total: false });
                    this.pickCandidates = res?.list || [];
                } catch {
                    this.pickCandidates = [];
                } finally {
                    this.pickLoading = false;
                }
            }, 220);
        },
        selectExteriorCandidate(cand) {
            this.itemForm.exterior_key = cand.key;
            this.itemForm.selectedExterior = cand;
        },
        async submitItemForm() {
            if (!this.editingItemId && !this.itemForm.exterior_key) {
                ElMessage.warning(this.$t("exteriorHouse.pickFirst"));
                return;
            }
            this.itemSaving = true;
            try {
                const payload = {
                    group_id: this.itemForm.group_id || null,
                    purpose: this.itemForm.purpose,
                    currency: this.itemForm.currency,
                    quantity: this.itemForm.quantity,
                    in_price: this.itemForm.in_price,
                    in_date: this.itemForm.in_date || todayIso(),
                    pinned: this.itemForm.pinned,
                    remark: this.itemForm.remark || "",
                };
                if (this.editingItemId) {
                    await updateWarehouseItem(this.editingItemId, payload);
                    ElMessage.success(this.$t("exteriorHouse.stockUpdated"));
                } else {
                    await createWarehouseItem({ ...payload, exterior_key: this.itemForm.exterior_key });
                    ElMessage.success(this.$t("exteriorHouse.stockAdded"));
                }
                this.itemDialogVisible = false;
                await Promise.all([this.loadSummary(), this.loadItems()]);
            } catch (err) {
                ElMessage.error(this.errMsg(err));
            } finally {
                this.itemSaving = false;
            }
        },
        async toggleItemPin(row) {
            try {
                await updateWarehouseItem(row.id, { pinned: !row.pinned });
                await this.loadItems();
            } catch (err) {
                ElMessage.error(this.errMsg(err));
            }
        },
        async removeItem(row) {
            try {
                await ElMessageBox.confirm(this.$t("exterior.warehouse.confirmRemove"), this.$t("exteriorHouse.confirmDelete"), {
                    type: "warning",
                    confirmButtonText: this.$t("exteriorHouse.delete"),
                    cancelButtonText: this.$t("exteriorHouse.cancel"),
                });
                await deleteWarehouseItem(row.id);
                ElMessage.success(this.$t("exteriorHouse.stockRemoved"));
                await Promise.all([this.loadSummary(), this.loadItems()]);
            } catch (err) {
                if (err !== "cancel") ElMessage.error(this.errMsg(err));
            }
        },
        openSellDialog(row) {
            this.sellingItem = row;
            this.sellForm = {
                quantity: 1,
                out_price: Number(row.in_price) || 0,
                fee: 0,
                autoWblFee: true,
                channel: "wbl",
                out_date: todayIso(),
                remark: "",
            };
            this.syncAutoFee();
            this.sellDialogVisible = true;
        },
        onSellChannelChange(ch) {
            this.sellForm.autoWblFee = ch === "wbl";
            if (this.sellForm.autoWblFee) this.syncAutoFee();
            else this.sellForm.fee = 0;
        },
        syncAutoFee() {
            const total = (Number(this.sellForm.quantity) || 1) * (Number(this.sellForm.out_price) || 0);
            this.sellForm.fee = roundMoney(total * 0.05);
        },
        async submitSellForm() {
            if (!this.sellingItem) return;
            this.sellSaving = true;
            try {
                await sellWarehouseItem(this.sellingItem.id, {
                    quantity: this.sellForm.quantity,
                    out_price: this.sellForm.out_price,
                    fee: this.sellForm.autoWblFee ? this.sellPreview.fee : this.sellForm.fee,
                    channel: this.sellForm.channel,
                    out_date: this.sellForm.out_date || todayIso(),
                    remark: this.sellForm.remark || "",
                });
                ElMessage.success(this.$t("exteriorHouse.saleSaved"));
                this.sellDialogVisible = false;
                await Promise.all([this.loadSummary(), this.loadItems()]);
            } catch (err) {
                ElMessage.error(this.errMsg(err));
            } finally {
                this.sellSaving = false;
            }
        },
        async undoSale(sale) {
            try {
                await ElMessageBox.confirm(this.$t("exterior.warehouse.confirmUndoSale"), this.$t("exteriorHouse.undoSale"), {
                    type: "warning",
                    confirmButtonText: this.$t("exteriorHouse.confirmUndo"),
                    cancelButtonText: this.$t("exteriorHouse.cancel"),
                });
                await undoWarehouseSale(sale.id);
                ElMessage.success(this.$t("exteriorHouse.saleUndone"));
                await Promise.all([this.loadSummary(), this.loadSales(this.salesPage), this.loadItems()]);
            } catch (err) {
                if (err !== "cancel") ElMessage.error(this.errMsg(err));
            }
        },
        tryOnItem(row) {
            const role = row.group?.role ? normalizeBodyType(row.group.role.body_type) : this.preferredRole;
            this.$router.push({
                name: "exterior-studio",
                query: { role: String(role || 2), wear: row.exterior_key },
            });
        },
        openGroupDrawer() {
            this.resetGroupForm();
            this.groupDrawerVisible = true;
        },
        editGroup(grp) {
            this.groupForm = {
                id: grp.id,
                name: grp.name,
                role_id: grp.role_id ? Number(grp.role_id) : null,
                remark: grp.remark || "",
            };
        },
        resetGroupForm() {
            this.groupForm = { id: null, name: "", role_id: null, remark: "" };
        },
        async saveGroupForm() {
            const name = this.groupForm.name.trim();
            if (!name) {
                ElMessage.warning(this.$t("exteriorHouse.enterName"));
                return;
            }
            this.groupSaving = true;
            try {
                const payload = {
                    name,
                    role_id: this.groupForm.role_id || null,
                    remark: this.groupForm.remark || "",
                };
                if (this.groupForm.id) {
                    await updateWarehouseGroup(this.groupForm.id, payload);
                    ElMessage.success(this.$t("exteriorHouse.groupUpdated"));
                } else {
                    await createWarehouseGroup(payload);
                    ElMessage.success(this.$t("exteriorHouse.groupCreated"));
                }
                this.resetGroupForm();
                await Promise.all([this.loadGroups(), this.loadItems()]);
            } catch (err) {
                ElMessage.error(this.errMsg(err));
            } finally {
                this.groupSaving = false;
            }
        },
        async removeGroup(grp) {
            try {
                await ElMessageBox.confirm(this.$t('exteriorHouse.confirmRemoveGroup', { name: grp.name }), this.$t("exteriorHouse.removeGroup"), {
                    type: "warning",
                    confirmButtonText: this.$t("exteriorHouse.delete"),
                    cancelButtonText: this.$t("exteriorHouse.cancel"),
                });
                await deleteWarehouseGroup(grp.id);
                if (this.filterGroup === String(grp.id)) this.filterGroup = "all";
                await Promise.all([this.loadGroups(), this.loadItems()]);
            } catch (err) {
                if (err !== "cancel") ElMessage.error(this.errMsg(err));
            }
        },
    },
};
</script>

<style lang="less" scoped>
@import (reference) "~@/assets/css/design-system/_tokens.less";

.m-ext-house-page {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: @pvx-space-5;

    @media (max-width: @phone) {
        gap: 14px;
    }
}

.m-house-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 14px;
}

.m-house-title {
    h1 {
        margin: 0;
        font-size: 32px;
        font-weight: 750;
        line-height: 1.3;

        @media (max-width: @phone) {
            font-size: 22px;
        }
        color: @pvx-text-primary;
    }

    p {
        margin: 4px 0 0;
        font-size: 13px;
        color: @pvx-text-secondary;
    }
}

.m-house-header__actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: @pvx-space-1;

    .el-button {
        min-height: 40px;
        margin: 0;
        border-radius: @pvx-radius-control;
    }
}

.m-currency-switch {
    display: inline-flex;
    padding: 3px;
    border-radius: @pvx-radius-pill;
    background: #f1f5f9;
}

.u-curr-btn {
    padding: 6px 14px;
    border: none;
    border-radius: @pvx-radius-pill;
    background: transparent;
    color: @pvx-text-secondary;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.16s;

    &.is-active {
        background: @pvx-primary;
        color: @pvx-text-inverse;
        box-shadow: @pvx-shadow-xs;
    }
}

.m-house-kpis {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;

    @media (max-width: 980px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: @phone) {
        grid-template-columns: minmax(0, 1fr);
    }
}

.m-kpi-card {
    display: grid;
    gap: 6px;

    .u-kpi-label {
        font-size: 12px;
        font-weight: 600;
        color: @pvx-text-secondary;
    }

    .u-kpi-value {
        font-size: 26px;
        font-weight: 750;
        line-height: 1.15;
        color: @pvx-text-primary;
        font-variant-numeric: tabular-nums;
    }

    .u-kpi-unit {
        font-size: 14px;
        font-weight: 600;
        color: @pvx-text-secondary;
    }

    .u-kpi-sub {
        font-size: 12px;
        color: @pvx-text-secondary;
    }
}

.is-profit {
    color: #059669 !important;
}

.is-loss {
    color: #dc2626 !important;
}

.m-house-main {
    display: grid;
    gap: 16px;
}

.m-house-tabs {
    display: flex;
    gap: 8px;
    border-bottom: 1px solid @pvx-border;
    padding-bottom: 12px;
}

.u-tab-btn {
    min-height: 38px;
    padding: 7px 16px;
    border: none;
    border-radius: @pvx-radius-pill;
    background: transparent;
    color: @pvx-text-regular;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    &.is-active {
        background: @pvx-primary;
        color: @pvx-text-inverse;
    }
}

.m-group-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.u-group-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 13px;
    border: 1px solid @pvx-border;
    border-radius: @pvx-radius-pill;
    background: #ffffff;
    color: @pvx-text-regular;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.16s;

    &.is-active {
        border-color: @pvx-primary;
        background: @pvx-primary-soft;
        color: @pvx-primary-hover;
        font-weight: 600;
    }
}

.u-role-pill {
    padding: 1px 7px;
    border-radius: @pvx-radius-pill;
    background: #eef2ff;
    color: #4f46e5;
    font-size: 11px;
    font-weight: 600;
}

.m-filter-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
}

.u-filter-select {
    width: 148px;
}

.u-filter-keyword {
    width: min(320px, 100%);
}

@media (max-width: @phone) {
    .m-filter-row {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .u-filter-select, .u-filter-keyword { width: 100%; }
    .u-filter-keyword { grid-column: 1 / -1; }

    .m-group-bar {
        flex-wrap: nowrap;
        overflow-x: auto;
        scrollbar-width: thin;
    }
    .u-group-chip { flex: none; }
}

.m-holding-list {
    display: grid;
    gap: 10px;
}

.m-holding-card {
    display: grid;
    grid-template-columns: 76px minmax(0, 1fr) auto;
    align-items: center;
    gap: 14px;
    padding: 12px 14px;
    border: 1px solid @pvx-border;
    border-radius: 14px;
    background: #ffffff;
    transition: border-color 0.16s;

    &:hover {
        border-color: #cbd5e1;
    }

    &.is-pinned {
        border-color: #f59e0b;
        background: linear-gradient(90deg, rgba(255, 251, 235, 0.55) 0%, #ffffff 35%);
    }

    &.is-soldout {
        opacity: 0.78;
    }

    @media (max-width: 760px) {
        grid-template-columns: 64px minmax(0, 1fr);
    }
}

.u-cover-link {
    display: grid;
    place-items: center;
    width: 76px;
    height: 92px;
    border-radius: 10px;
    overflow: hidden;
    background: #f8fafc;
    border: 1px solid #eef2f7;

    .u-cover-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top center;
    }

    .u-cover-fallback {
        font-size: 11px;
        color: #94a3b8;
    }
}

.m-holding-info {
    min-width: 0;
    display: grid;
    gap: 6px;
}

.m-holding-title-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;

    .u-item-name {
        font-size: 15px;
        font-weight: 700;
        color: @pvx-text-primary;

        &:hover {
            color: @pvx-primary-hover;
        }
    }
}

.u-tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: @pvx-radius-pill;
    font-size: 11px;
    font-weight: 600;

    &.is-amber {
        background: #fffbeb;
        color: #b45309;
    }

    &.is-indigo {
        background: #eef2ff;
        color: #4338ca;
    }

    &.is-pin {
        background: #fef3c7;
        color: #92400e;
    }

    &.is-slate {
        background: #f1f5f9;
        color: #475569;
    }
}

.m-holding-metrics {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
    font-size: 13px;
    color: @pvx-text-secondary;

    strong {
        color: @pvx-text-primary;
        font-weight: 650;
        font-variant-numeric: tabular-nums;
    }

    .u-date-text {
        color: #94a3b8;
        font-size: 12px;
    }
}

.m-holding-remark {
    margin: 0;
    font-size: 12px;
    color: @pvx-text-secondary;
}

.m-holding-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 6px;

    @media (max-width: 760px) {
        grid-column: 1 / -1;
        justify-content: flex-start;
    }
}

.m-house-group-form {
    --el-border-radius-base: @pvx-radius-small;
    --el-component-size: 36px;
}

.m-entry-form,
.m-entry-fields {
    display: grid;
    gap: @pvx-space-2 @pvx-space-3;
}

.m-entry-form {
    --el-border-radius-base: @pvx-radius-small;
    --el-component-size: 38px;

    :deep(.el-form-item) {
        min-width: 0;
        margin-bottom: 0;
    }

    :deep(.el-form-item__label) {
        margin-bottom: 4px;
        line-height: 20px;
        color: @pvx-text-regular;
        font-weight: 600;
    }

    :deep(.el-radio-group) {
        display: inline-flex;
        gap: @pvx-space-1;
        padding: 3px;
        border-radius: @pvx-radius-pill;
        background: @pvx-surface-muted;
    }

    :deep(.el-radio-button .el-radio-button__inner) {
        border: 0;
        border-radius: @pvx-radius-pill;
        background: transparent;
        box-shadow: none;
    }

    :deep(.el-radio-button.is-active .el-radio-button__inner) {
        background: @pvx-primary;
        color: @pvx-text-inverse;
    }
}

.m-entry-fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    @media (max-width: 540px) {
        grid-template-columns: minmax(0, 1fr);
    }
}

.m-picked-chip {
    display: flex;
    align-items: center;
    gap: @pvx-space-2;
    padding: @pvx-space-1 @pvx-space-2;
    border: 1px solid @pvx-border;
    border-radius: @pvx-radius-control;
    background: @pvx-surface-muted;

    .u-preview-cover {
        flex: none;
        width: 52px;
        height: 64px;
        overflow: hidden;
        border-radius: @pvx-radius-small;
        background: url("~@/assets/img/exterior/stage-bg.webp") center / cover;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: top center;
        }
    }

    .u-preview-name {
        color: @pvx-text-primary;
        font-size: 18px;
        font-weight: 700;
        line-height: 1.35;
        overflow-wrap: anywhere;
    }

    .u-preview-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px 8px;
        margin-top: 6px;
        color: @pvx-text-secondary;
        font-size: 12px;
        line-height: 1.5;
        overflow-wrap: anywhere;
    }

    .u-preview-domain {
        padding: 2px 8px;
        border-radius: @pvx-radius-pill;
        background: @pvx-primary-soft;
        color: @pvx-primary-hover;
    }
}

.m-entry-actions {
    display: flex;
    justify-content: flex-end;
    gap: @pvx-space-1;
    padding-top: @pvx-space-2;
    border-top: 1px solid @pvx-border-light;

    .el-button {
        min-width: 80px;
        min-height: 40px;
        margin: 0;
        border-radius: @pvx-radius-control;
        font-weight: 600;
    }
}

.m-pick-results {
    max-height: 210px;
    overflow-y: auto;
    border: 1px solid @pvx-border;
    border-radius: 12px;
    background: #fff;
}

.u-pick-row {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border: none;
    border-bottom: 1px solid #f1f5f9;
    background: transparent;
    cursor: pointer;

    &:hover {
        background: #f8fafc;
    }

    &:last-child {
        border-bottom: none;
    }

    img {
        width: 36px;
        height: 44px;
        border-radius: 6px;
        object-fit: cover;
        object-position: top center;
    }
}

:global(.m-house-dialog) {
    --el-dialog-border-radius: @pvx-radius-panel;
    --el-dialog-padding-primary: clamp(16px, 4vw, 24px);
}

:global(.el-dialog.m-house-entry-dialog) {
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    max-height: 90dvh;
    box-sizing: border-box;
}

:global(.m-house-entry-dialog > .el-dialog__header) {
    padding-bottom: @pvx-space-2;
}

:global(.m-house-entry-dialog > .el-dialog__body) {
    min-height: 0;
    overflow-y: auto;
}

:global(.m-house-entry-dialog > .el-dialog__footer) {
    padding-top: @pvx-space-2;
}

.m-entry-form .m-cost-preview {
    padding-block: @pvx-space-1;
}

.m-cost-preview {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: @pvx-space-2;
    padding: 12px 16px;
    border: 1px solid @pvx-border;
    border-radius: 14px;
    background: @pvx-surface-muted;
    font-size: 13px;
    color: @pvx-text-secondary;
    text-align: right;

    strong {
        color: @pvx-primary-hover;
        font-size: 18px;
        font-variant-numeric: tabular-nums;
    }
}

.m-sell-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 12px;
    background: #f8fafc;

    img {
        width: 52px;
        height: 64px;
        border-radius: 8px;
        object-fit: cover;
        object-position: top center;
    }
}

.m-profit-preview {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 8px;
    padding: 12px 14px;
    border-radius: 12px;
    background: #f8fafc;
    font-size: 13px;
    color: @pvx-text-secondary;
}
</style>
