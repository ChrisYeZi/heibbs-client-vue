/**
 * Vuex 系统状态模块（命名空间隔离）
 * 主要用于管理全局系统级状态，当前核心维护全局加载状态
 */
const system = {
    // 开启命名空间，避免不同模块间状态/方法命名冲突
    namespaced: true,

    /**
     * 模块状态集
     * 存储系统相关的状态数据，采用函数返回对象避免单例问题
     */
    state: () => ({
        /**
         * 全局加载状态标识
         * - true: 正在加载中（可用于控制加载动画显示）
         * - false: 加载完成/未加载（控制加载动画隐藏）
         * 默认值：false（初始状态无加载动作）
         */
        loading: false
    }),

    /**
     * 状态修改方法集（同步操作）
     * 仅负责直接修改state，不包含业务逻辑，通过commit触发
     */
    mutations: {
        /**
         * 修改全局加载状态
         * @param state 模块状态对象（Vuex自动传入）
         * @param value 目标加载状态（true-加载中，false-加载完成）
         */
        SET_SYSLOADING(state: any, value: Boolean): void {
            state.loading = value;
        },
    },

    /**
     * 异步操作方法集
     * 可包含异步逻辑（如接口请求），通过dispatch触发，最终通过commit调用mutation修改状态
     * 此处虽为同步操作，仍遵循Vuex规范放在actions中，便于后续扩展异步逻辑
     */
    actions: {
        /**
         * 触发全局加载状态修改的动作
         * @param commit 用于调用mutation的方法（Vuex自动传入）
         * @param value 目标加载状态（true-加载中，false-加载完成）
         */
        SET_SYSLOADING_ACTION({ commit }: any, value: Boolean): void {
            // 提交mutation修改状态
            commit("SET_SYSLOADING", value);
        },
    },

    /**
     * 状态获取方法集（计算属性）
     * 用于封装状态的获取逻辑，支持对state进行二次处理后返回
     */
    getters: {
        /**
         * 获取当前全局加载状态
         * @param state 模块状态对象（Vuex自动传入）
         * @returns 当前加载状态（boolean）
         */
        GET_SYSLOADING: (state: any) => {
            return state.loading;
        },
    }
}

export default system;