/**
 * Vuex 系统状态模块（命名空间隔离）
 */
const system = {
    namespaced: true,

    state: () => ({
        loading: false,
        /** NavbarUser 侧边栏显示状态 */
        navbarUserShow: false,
    }),

    mutations: {
        SET_SYSLOADING(state: any, value: Boolean): void {
            state.loading = value;
        },
        SET_NAVBARUSER_SHOW(state: any, value: Boolean): void {
            state.navbarUserShow = value;
        },
    },

    actions: {
        SET_SYSLOADING_ACTION({ commit }: any, value: Boolean): void {
            commit("SET_SYSLOADING", value);
        },
        SET_NAVBARUSER_SHOW_ACTION({ commit }: any, value: Boolean): void {
            commit("SET_NAVBARUSER_SHOW", value);
        },
    },

    getters: {
        GET_SYSLOADING: (state: any) => state.loading,
        GET_NAVBARUSER_SHOW: (state: any) => state.navbarUserShow,
    }
}

export default system;
