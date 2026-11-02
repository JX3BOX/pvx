const images = require.context("@/assets/img/wiki/overview/item", false, /\.(png|svg)$/);

// Progress and recommendation categories share the same game icons.
export const achievementCategoryImages = images.keys().reduce((assets, path) => {
    assets[path.replace(/^\.\//, "").replace(/\.(png|svg)$/, "")] = images(path);
    return assets;
}, {});
