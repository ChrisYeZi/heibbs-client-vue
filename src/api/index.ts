import instance from "../config/request/request"

// 登录
interface Login {
    username: String
    password: String
}
// 忘记密码
interface ForgotPassword {
    email: String
    captchacode: String
    password: String
}
// 注册
interface Register {
    username: String
    email: String
    password: String
    invitation: String
    captcha: String
}
// 注册请求验证码
interface RegisterCaptcha {
    email: String
    invitation: String
}

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

// 登录接口封装
export const LoginAPI = (data: Login): Res<String> => instance.post("/member/login", data)

// 获取忘记密码验证码
export const GetForgotCaptchaAPI = (params: { email: String }): Res<String> => instance.get("/member/getForgetCaptcha", { params })

// 忘记密码修改密码
export const UpdateForgotPasswordAPI = (data: ForgotPassword): Res<String> => instance.post("/member/forgetPassword", data)

// 获取用户信息
export const GetUserInfoAPI = (): Res<String> => instance.get("/member/getUserInfo")

// 注册获取验证码
export const GetRegisterCaptchaAPI = (data: RegisterCaptcha): Res<String> => instance.post("/member/getRegisterCaptcha", data)

// 注册
export const RegisterAPI = (data: Register): Res<String> => instance.post("/member/register", data)

// 获取所有邀请码
export const GetUserInvitationAPI = (): Res<String> => instance.get("/member/getInvitation")

// 创建邀请码
export const CreateInvitationAPI = (): Res<String> => instance.get("/member/createInvitation")

// 获取当前用户所有消息
export const GetChatListAPI = (): Res<String> => instance.get("/system/getChatList")