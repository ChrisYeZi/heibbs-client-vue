import UserState from "../states/userType";

const user = {
    namespaced: true,
    state: (): UserState => ({
        info: {},
        login: false
    }),
    mutations: {
        SET_USERINFO(state: any, value: Object): void {
            state.info = value;
        },
        SET_USERLOGIN(state: any, value: Boolean): void {
            state.login = value
        }
    },
    actions: {
        SET_USERINFO_ACTION({ commit }: any, value: Object): void {
            commit("SET_USERINFO", value);
        },
        SET_USERLOGIN_ACTION({ commit }: any, value: Boolean): void {
            commit("SET_USERLOGIN", value)
        }
    },
    getters: {
        GET_USERINFO: (state: any) => {
            return state.info;
        },
        GET_USERLOGIN: (state: any) => {
            return state.login
        }
    }
}

export default user;