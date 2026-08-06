const PHONE_MEDIA_QUERY = "(max-width: 720px)";

export default {
    data() {
        return {
            paginationPhoneMediaQuery: null,
            isPaginationPhoneViewport: false,
        };
    },
    computed: {
        responsivePagerCount() {
            return this.isPaginationPhoneViewport ? 5 : 7;
        },
    },
    methods: {
        handlePaginationViewportChange(event) {
            this.isPaginationPhoneViewport = event.matches;
        },
    },
    mounted() {
        this.paginationPhoneMediaQuery = window.matchMedia(PHONE_MEDIA_QUERY);
        this.isPaginationPhoneViewport = this.paginationPhoneMediaQuery.matches;
        if (this.paginationPhoneMediaQuery.addEventListener) {
            this.paginationPhoneMediaQuery.addEventListener("change", this.handlePaginationViewportChange);
        } else {
            this.paginationPhoneMediaQuery.addListener(this.handlePaginationViewportChange);
        }
    },
    beforeUnmount() {
        if (this.paginationPhoneMediaQuery?.removeEventListener) {
            this.paginationPhoneMediaQuery.removeEventListener("change", this.handlePaginationViewportChange);
        } else {
            this.paginationPhoneMediaQuery?.removeListener(this.handlePaginationViewportChange);
        }
    },
};
