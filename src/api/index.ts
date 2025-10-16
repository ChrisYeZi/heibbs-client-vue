import instance from "../config/request/request"

// Res是返回的参数，T是泛型，返回对数据统一管理
type Res<T> = Promise<ItypeAPI<T>>;

// RestFulAPI规范封装接口类型
interface ItypeAPI<T> {
    // 状态码
    status: Number
    // 返回请求状态信息
    msg: String | null
    // 请求数据
    data: T
}

// 注册请求验证码
interface RegisterCaptcha {
    email: String
    invitation: String
}
export const GetRegisterCaptchaAPI = (data: RegisterCaptcha): Res<String> => instance.post("/member/getRegisterCaptcha", data)

// 注册
interface Register {
    username: String
    email: String
    password: String
    invitation: String
    captcha: String
}
export const RegisterAPI = (data: Register): Res<String> => instance.post("/member/register", data)


// 获取当前用户所有消息
export const GetChatListAPI = (): Res<String> => instance.get("/system/getChatList")

// qwq
// 新论坛

// 定义接口返回数据的类型（根据实际返回结构调整，这里以PostDo数组为例）
interface PostDo {
    pid: number;
    fid: number;
    tid: number;
    first: number | null;
    author: string;
    authorid: number;
    subject: string | null;
    dateline: number;
    message: string;
    state: number;
    formattedCreateTime: string;
    // 其他字段根据实际接口返回补充
}

// 定义API请求参数类型（current和size均为可选，默认值与后端一致）
interface GetPostListParams {
    current?: number; // 可选，默认1
    size?: number;    // 可选，默认10
}

// ——————Post 帖子模块
//获取所有帖子数据（支持传递分页参数）
export const GetPostListAPI = (params?: GetPostListParams): Res<PostDo[]> => {
    // 拼接默认参数：若前端未传，则使用与后端一致的默认值（current=1，size=10）
    const requestParams = {
        current: 1,
        size: 10,
        ...params // 前端传递的参数会覆盖默认值
    };

    return instance.get("/post/getlist", { params: requestParams });
};

//获取所有用户发布主题帖子数据
export const GetUserPostListAPI = (): Res<String> => instance.get("/post/getuserpost")

//页面获取帖子数据
export const GetPostAPI = (params: {
    pid: any; current: number;
    size: number;
}): Res<String> => instance.get("/post/getpost", { params })


// ——————User 用户模块
//登录接口封装 
interface Login {
    username: String
    password: String
}
export const LoginAPI = (data: Login): Res<String> => instance.post("/user/login", data)

//获取用户信息
export const GetUserInfoAPI = (): Res<String> => instance.get("/user/securityverify")

//获取忘记密码验证码
export const GetForgotCaptchaAPI = (params: { email: String }): Res<String> => instance.get("/user/getForgetCaptcha", { params })

//忘记密码修改密码
interface ForgotPassword {
    email: String
    captchacode: String
    password: String
}
export const UpdateForgotPasswordAPI = (data: ForgotPassword): Res<String> => instance.post("/user/forgetPassword", data)


// ——————Count 积分模块
//获取旧论坛积分（暂时 以后会废除）
export const GetUserQYCountAPI = (): Res<String> => instance.get("/count/getqycount")

//旧论坛积分转换（暂时 以后会废除）
export const ChangeUserQYCountAPI = (): Res<String> => instance.get("/count/changeqycount")


// ——————Block 会馆板块模块
//获取会馆列表
export const GetBlockListAPI = (): Res<String> => instance.get("/block/getlist")


// ——————Group 用户组模块
//获取用户组数据
export const GetGroupListAPI = (): Res<String> => instance.get("/group/getall")


// ——————Invitation邀请码模块
// 获取所有邀请码
export const GetUserInvitationAPI = (): Res<String> => instance.get("/invitation/getInvitation")

// 创建邀请码
export const CreateInvitationAPI = (): Res<String> => instance.get("/invitation/createInvitation")


// ——————Message消息模块
// 获取个人消息列表
export const GetMessageListAPI = (): Res<String> => instance.get("/message/getlist")

// 获取消息会话
export const GetMessageAPI = (params: { plid: number }): Res<String> => instance.get("/message/get", { params });

// 回复消息
interface replyMessageQuery {
    plid: number
    content: String
}
export const ReplyMessageAPI = (data: replyMessageQuery): Res<String> => instance.post("/message/reply", data);