function noop() {}

function ensureClipboardState(el) {
    if (!el.__pvxClipboard) {
        el.__pvxClipboard = {
            copy: "",
            success: noop,
            error: noop,
            onClick: async () => {
                const state = el.__pvxClipboard;
                try {
                    await navigator.clipboard.writeText(String(state.copy ?? ""));
                    state.success?.();
                } catch (error) {
                    state.error?.(error);
                }
            },
        };
    }
    return el.__pvxClipboard;
}

function bindClipboard(el, binding) {
    const state = ensureClipboardState(el);
    state[binding.arg] = binding.value;

    if (!state.bound && state.copy !== undefined) {
        el.addEventListener("click", state.onClick);
        state.bound = true;
    }
}

export function installClipboardDirective(app) {
    app.directive("clipboard", {
        beforeMount: bindClipboard,
        updated: bindClipboard,
        unmounted(el) {
            const state = el.__pvxClipboard;
            if (!state) return;
            el.removeEventListener("click", state.onClick);
            delete el.__pvxClipboard;
        },
    });
}
