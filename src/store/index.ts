import { createStore } from 'vuex'
import user from './modules/user'
import system from './modules/system'
import OtherType from './states'

type states = OtherType;

const store = createStore<states>({
  state() {
    return {}
  },
  mutations: {},
  actions: {},
  modules: {
    user, system
  },
})

export default store;

/**
 * 子模块开启命名空间之后，使用子模块的方法，只需要在方法前面加上模块名字就行。
 * 我上面的模块名称是user,如果使用changeName这个函数，就是store.commit("user/changeName",'123') store.dispatch("user/changeName",'123')。
 * 访问子模块state中的数据,store.state.user.name1
 */
