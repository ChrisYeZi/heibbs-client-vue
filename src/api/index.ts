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

// 定义分页结果接口
interface PageResult<T> {
  records: T[]; // 数据列表
  total?: number; // 总条数
  size?: number; // 每页条数
  current?: number; // 当前页
  pages?: number; // 总页数
  orders?: any[];
  optimizeCountSql?: boolean;
  hitCount?: boolean;
  countId?: any;
  maxLimit?: any;
  searchCount?: boolean;
}

interface SearchParams {
  pageNum?: number; // 默认1
  pageSize?: number; // 默认30
  keyword?: string;
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
  pid: number; //帖子唯一id
  fid: number; //板块id
  tid: number; //主题id
  first: number | null; //是否首帖
  author: string; //作者
  authorid: number; //作者uid
  subject: string | null; //标题
  dateline: number; //时间
  message: string; //帖子内容
  state: number; //状态(0正常、1隐藏内容、2关闭、3屏蔽并关闭、4置顶)
  viewCount: number; //帖子查阅数量
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

//获取会馆所有帖子数据（支持传递分页参数）
// 定义API请求参数类型（current和size均为可选，默认值与后端一致）
interface GetBlockPostListParams {
  bid?: number;
  current?: number; // 可选，默认1
  size?: number;    // 可选，默认10
}
export const GetBlockPostListAPI = (params?: GetBlockPostListParams): Res<PostDo[]> => {
  // 拼接默认参数：若前端未传，则使用与后端一致的默认值（current=1，size=10）
  const requestParams = {
    bid: 1,
    current: 1,
    size: 10,
    ...params // 前端传递的参数会覆盖默认值
  };

  return instance.get("/post/getblocklist", { params: requestParams });
};

//获取全局置顶主题帖子数据
export const GetPostTopAPI = (): Res<String> => instance.get("/post/gettoplist")

//获取所有用户发布主题帖子数据
export const GetUserPostListAPI = (): Res<String> => instance.get("/post/getuserpost")

//页面获取帖子数据
export const GetPostAPI = (params: {
  pid: any;
  current: number;
  size: number;
}): Res<String> => instance.get("/post/getpost", { params })

//页面获取帖子数据
export const GetPostDataAPI = (params: {
  pid: Number;
}): Res<String> => instance.get("/post/getpostdata", { params })

//编辑帖子
export const EditPostDataAPI = (data: PostDo): Res<String> => instance.post("/post/updatepost", data);

// 搜索帖子
export const SearchPostAPI = (params?: SearchParams): Res<String> => {
  const requestParams = {
    pageNum: 1,
    pageSize: 10,
    ...params
  };
  return instance.get("/post/searchPost", { params: requestParams });
};

// 请求参数类型定义
interface InsertPostQuery {
  // 板块id（必填）
  fid: number;
  // 主题id，带tid即为回复，不带即为发帖（可选）
  tid?: number;
  // 标题，不带标题为回复，带标题为发帖（可选）
  subject?: string;
  // 发帖内容（必填）
  message: string;
}

// 发布/回复帖子API
export const InsertPostAPI = (data: InsertPostQuery): Res<String> => {
  return instance.post("/post/insetpost", data);
};


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

//获取用户信息
export const GetUserInformationAPI = (params: { id?: number }): Res<any> => instance.get(`/user/get-userinfo`, { params });

//获取用户信息
export const GetUsernameInformationAPI = (params: { username?: string }): Res<any> => instance.get(`/user/get-usernameinfo`, { params });


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
export interface MessageItem {
  mid: number;
  plid: number;
  sid: number;
  content: string;
  delstatus: number;
  time: number;
  formattedTime?: string;
}
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

// ——————Banner 轮播图模块
// 轮播图Banner接口（对应BannerDo）
interface BannerItem {
  id: number; // 主键ID
  title: string; // Banner标题
  pid?: number; // 跳转目标帖ID
  url: string; // 展示图片地址
  status: number; // 是否启用（0-禁用，1-启用）
  index: number; // 排序优先级（数值越高越靠前）
}

// 获取展示Banner
export const GetAdminBannerAPI = (): Res<String> => instance.get("/admin/get-banner");

// 后台获取所有Banner
export const SelectBannerAPI = (): Res<String> => instance.get("/admin/select-banner");

// 增加Banner
export const InsertBannerAPI = (data: BannerItem): Res<String> => instance.post("/admin/insert-banner", data);

// 更新Banner
export const UpdateBannerAPI = (data: BannerItem): Res<String> => instance.post("/admin/update-banner", data);

// 删除Banner
export const DeleteBannerAPI = (id: number): Res<String> => instance.get("/admin/delete-banner", {
  params: { id }
});

// ——————Block 会馆管理模块
// 板块接口扩展
interface BlockItem {
  id?: number;
  name?: string;
  management?: string; // 板块管理者（用户uid数组）
  license?: number; // 是否仅管理员可见可发表
  type?: number; // 板块类型（1-会馆；2-地方会馆；3-小组）
  repost?: boolean; // 是否可发表搬运内容
  finance?: number; // 板块财政
  taxRate?: number; // 税率
  title?: string; // 板块可选内容标题
  imgUrl?: string; // 板块图标地址
  bindex?: number; // 排序序列（数值越高越靠前）
  bannerurl?: string; // 横幅地址
  players?: string; // 加入会馆的用户列表（存储格式可能为uid数组字符串）
}

// 添加会馆
export const InsertBlockAPI = (data: BlockItem): Res<String> => instance.post("/admin/insert-block", data);

// 更新会馆
export const UpdateBlockAPI = (data: BlockItem): Res<String> => instance.post("/admin/update-block", data);

// 删除会馆
export const DeleteBlockAPI = (id: number): Res<String> => instance.get("/admin/delete-block", {
  params: { id }
});



// 特殊权限组接口（对应ExtgroupDo）
interface ExtgroupItem {
  gid: number; // 权限组ID
  gname: string; // 权限组名称
  permission: string; // 权限列表（如["root","delete"]）
  gType: number; // 类型（1-管理组；2-地方会馆馆长）
  color: string; // 颜色值
  description: string; // 描述
}

// 获取特殊用户组列表
export const SelectExtGroupAPI = (): Res<String> => instance.get("/admin/select-extGroup");

// 添加特殊用户组
export const InsertExtGroupAPI = (data: ExtgroupItem): Res<String> => instance.post("/admin/insert-extGroup", data);

// 更新特殊用户组
export const UpdateExtGroupAPI = (data: ExtgroupItem): Res<String> => instance.post("/admin/update-extGroup", data);

// 删除特殊用户组
export const DeleteExtGroupAPI = (id: number): Res<String> => instance.get("/admin/delete-extGroup", {
  params: { id }
});


// 用户组接口（对应GroupDo）
interface GroupItem {
  gid: number; // 用户组ID
  gname: string; // 权限组名称
  permission: string; // 权限列表
  credits: number; // 用户组积分线
  description: string; // 用户组描述
  color: string; // 用户组颜色
}

// 查询普通用户组列表
export const SelectGroupAPI = (): Res<String> => instance.get("/admin/select-group");

// 添加新用户组
export const InsertGroupAPI = (data: GroupItem): Res<String> => instance.post("/admin/insert-group", data);

// 更新普通用户组
export const UpdateGroupAPI = (data: GroupItem): Res<String> => instance.post("/admin/update-group", data);

// 删除普通用户组
export const DeleteGroupAPI = (id: number): Res<String> => instance.get("/admin/delete-group", {
  params: { id }
});

// 用户组响应接口（替代原有GroupItem，包含普通用户组和特殊权限组）
interface GroupResponse {
  groupDo?: GroupItem[]; // 普通用户组列表
  extgroupDo?: ExtgroupItem[]; // 特殊权限组列表
}

// ——————Message 后台消息管理模块
// 消息列表查询参数
interface AdminSelectMessageParams {
  pageNum?: number; // 默认1
  pageSize?: number; // 默认30
}

// 后台获取所有消息
export const SelectMessageAPI = (params?: AdminSelectMessageParams): Res<PageResult<MessageItem>> => {
  const requestParams = {
    pageNum: 1,
    pageSize: 30,
    ...params
  };
  return instance.get("/admin/select-message", { params: requestParams });
};

// ——————User 后台用户管理模块
// 用户信息接口（对应UserDo）
interface UserItem {
  uid: number; // 用户id
  email: string; // 用户邮箱
  username: string; // 用户名
  status: number; // 用户状态
  emailstatus: number; // 邮箱验证状态（0-未验证，1-已验证）
  groupid: number; // 所属用户组
  extgroupids?: number; // 额外用户组（创作者/管理者）
  regdate: number; // 注册时间（时间戳，秒级）
  regip: string; // 脱敏后的注册IP
  credits: number; // 当前积分
  newpm: string; // 用户未读信息
  newprompt: number; // 系统未读消息数
  onlyacceptfriendpm: number; // 是否仅允许好友访问（0-否，1-是）
  lastvisit: number; // 最后访问时间（时间戳，秒级）
  lastip: string; // 脱敏后的最后访问IP
  userRegdate?: string; // 格式化注册时间（yyyy-MM-dd HH:mm:ss）
  userLastvisit?: string; // 格式化最后访问时间（yyyy-MM-dd HH:mm:ss）
}

// 用户列表查询参数
interface AdminSelectUserParams {
  pageNum?: number; // 默认1
  pageSize?: number; // 默认30
}



// 后台获取用户列表
export const SelectUserAPI = (params?: AdminSelectUserParams): Res<String> => {
  const requestParams = {
    pageNum: 1,
    pageSize: 30,
    ...params
  };
  return instance.get("/admin/select-user", { params: requestParams });
};

// 后台更新用户信息
export const UpdateUserAPI = (data: UserItem): Res<String> => instance.post("/admin/update-user", data);

// 后台搜索用户
export const SearchUserAPI = (params?: SearchParams): Res<String> => {
  const requestParams = {
    pageNum: 1,
    pageSize: 30,
    ...params
  };
  return instance.get("/admin/search-user", { params: requestParams });
};

// ——————Invitation 后台邀请码管理模块
// 邀请码列表查询参数
interface AdminSelectInvitationParams {
  pageNum?: number; // 默认1
  pageSize?: number; // 默认30
}

// 后台获取邀请码列表
export const SelectInvitationAPI = (params?: AdminSelectInvitationParams): Res<String> => {
  const requestParams = {
    pageNum: 1,
    pageSize: 30,
    ...params
  };
  return instance.get("/admin/select-invitation", { params: requestParams });
};

// ——————Permission 权限管理模块
// 权限实体接口
interface PermissionItem {
  pid?: number;
  type?: string;
  permission?: string;
  description?: string;
}

// 获取权限列表
export const SelectPermissionAPI = (): Res<String> => instance.get("/admin/select-permission");

// 更新权限
export const UpdatePermissionAPI = (data: PermissionItem): Res<String> => instance.post("/admin/update-permission", data);

// 添加权限
export const InsertPermissionAPI = (data: PermissionItem): Res<String> => instance.post("/admin/insert-permission", data);

// 删除权限
export const DeletePermissionAPI = (id: number): Res<String> => instance.get("/admin/delete-permission", {
  params: { id }
});
