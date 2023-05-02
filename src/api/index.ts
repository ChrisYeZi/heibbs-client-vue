// 生产环境
const ip = "http://api.heibbs.net:8082/api";

// 开发环境
// const ip = "http://127.0.0.1:8082/api";

const api = {
    // 提交
    postsignin: `${ip}/signin/save`,
};

module.exports = api;
