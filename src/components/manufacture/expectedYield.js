export function getExpectedYield(recipe, count) {
    const min = Number(recipe.CreateItemMin1);
    const max = Number(recipe.CreateItemMax1 ?? min);
    return ((min + max) / 2) * count;
}
