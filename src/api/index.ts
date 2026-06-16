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
/**
 * 罗小黑妖灵论坛 获取主题帖列表（最新发帖）
 * @param params 分页数据
 * @returns 列表数据
 */
export const GetPostListAPI = (params?: GetPostListParams): Res<PostDo[]> => {
  // 拼接默认参数：若前端未传，则使用与后端一致的默认值（current=1，size=10）
  const requestParams = {
    current: 1,
    size: 10,
    ...params // 前端传递的参数会覆盖默认值
  };

  return instance.get("/post/getlist", { params: requestParams });
};

/**
 * 罗小黑妖灵论坛 获取主题帖列表（最新回帖）
 * @param params 分页数据
 * @returns 列表数据
 */
export const GetPostListReplyAPI = (params?: GetPostListParams): Res<PostDo[]> => {
  // 拼接默认参数：若前端未传，则使用与后端一致的默认值（current=1，size=10）
  const requestParams = {
    current: 1,
    size: 10,
    ...params // 前端传递的参数会覆盖默认值
  };

  return instance.get("/post/getlistreply", { params: requestParams });
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
  order?: string;
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

/**
 * 罗小黑妖灵论坛 管理员设置帖子状态
 * @param data 包含 pid 和 state 的对象
 * state: 0正常、1隐藏内容、2关闭、3屏蔽并关闭、4全局置顶、5板块内置顶
 */
export const SetPostStateAPI = (data: { pid: number; state: number }): Res<String> =>
  instance.post("/post/setstate", data);

/**
 * 罗小黑妖灵论坛 管理员移动帖子到目标板块
 * @param data 包含 pid 和 targetFid 的对象
 */
export const MovePostAPI = (data: { pid: number; targetFid: number }): Res<String> =>
  instance.post("/post/movepost", data);

/**
 * 罗小黑妖灵论坛 管理员删除帖子
 * @param pid 帖子ID
 */
export const DeletePostAPI = (pid: number): Res<String> =>
  instance.delete(`/post/deletepost/${pid}`);


// ——————Like 点赞模块
// 点赞操作返回结果接口
interface LikeToggleResult {
  liked: boolean;    // 当前是否已点赞
  likeCount: number; // 最新点赞数
}

/**
 * 罗小黑妖灵论坛 切换帖子点赞状态（点赞/取消点赞）
 * @param pid 帖子ID
 * @returns 操作结果（liked状态 + 最新点赞数）
 */
export const ToggleLikeAPI = (pid: number): Res<LikeToggleResult> =>
  instance.post(`/like/toggle/${pid}`);

/**
 * 罗小黑妖灵论坛 获取帖子点赞数
 * @param pid 帖子ID
 * @returns 点赞数
 */
export const GetLikeCountAPI = (pid: number): Res<number> =>
  instance.get(`/like/count/${pid}`);

/**
 * 罗小黑妖灵论坛 获取当前用户点赞过的帖子ID列表
 * @returns 帖子ID列表
 */
export const GetMyLikesAPI = (): Res<number[]> =>
  instance.get("/like/mylikes");


// ——————Report 举报模块
// 举报实体接口
interface ReportItem {
  id: number;
  pid: number;
  reporterUid: number;
  reason: string;
  status: number;      // 0-待处理 1-已处理 2-已驳回
  handlerUid?: number;
  handleMsg?: string;
  dateline: number;
  handleTime?: number;
}

/**
 * 罗小黑妖灵论坛 用户提交举报
 * @param data 包含 pid(帖子ID) 和 reason(举报原因)
 */
export const SubmitReportAPI = (data: { pid: number; reason: string }): Res<String> =>
  instance.post("/report/submit", data);

/**
 * 罗小黑妖灵论坛 管理员获取举报列表
 * @param params 分页参数和可选的status筛选
 */
export const GetReportListAPI = (params?: {
  pageNum?: number;
  pageSize?: number;
  status?: number;
}): Res<PageResult<ReportItem>> => {
  const requestParams = { pageNum: 1, pageSize: 30, ...params };
  return instance.get("/report/list", { params: requestParams });
};

/**
 * 罗小黑妖灵论坛 管理员处理举报
 * @param data 包含 id, status(1已处理/2已驳回), handleMsg
 */
export const HandleReportAPI = (data: {
  id: number;
  status: number;
  handleMsg?: string;
}): Res<String> => instance.post("/report/handle", data);


// ——————Notification 通知模块
interface NotificationItem {
  id: number;
  uid: number;
  type: string;
  title: string;
  content: string;
  relatedPid?: number;
  fromUid?: number;
  isRead: number;
  dateline: number;
}

export const GetNotificationListAPI = (params?: {
  pageNum?: number;
  pageSize?: number;
}): Res<PageResult<NotificationItem>> => {
  const requestParams = { pageNum: 1, pageSize: 20, ...params };
  return instance.get("/notification/list", { params: requestParams });
};

export const GetUnreadCountAPI = (): Res<number> =>
  instance.get("/notification/unread-count");

export const ReadNotificationAPI = (id: number): Res<String> =>
  instance.post(`/notification/read/${id}`);

export const ReadAllNotificationAPI = (): Res<String> =>
  instance.post("/notification/read-all");


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

// 注册请求验证码
interface RegisterCaptcha {
  email: String
  invitation: String
}
export const GetRegisterCaptchaAPI = (data: RegisterCaptcha): Res<String> => instance.post("/user/getRegisterCaptcha", data)

// 注册
interface Register {
  username: String
  email: String
  password: String
  invitation: String
  captcha: String
}
export const RegisterAPI = (data: Register): Res<String> => instance.post("/user/register", data)

//获取用户信息
export const GetUserInformationAPI = (params: { id?: number }): Res<any> => instance.get(`/user/get-userinfo`, { params });

//获取用户信息
export const GetUsernameInformationAPI = (params: { username?: string }): Res<any> => instance.get(`/user/get-usernameinfo`, { params });

/**
 * 获取用户头像（相对地址）
 * @param params uid: 用户ID
 */
export const GetUserAvatarAPI = (uid: number): Res<string> => {
  return instance.get("/user/get-useravatar", { params: { uid } });
};

/**
 * 上传用户头像（从token解析uid，前端仅传文件）
 * @param file 头像文件（File类型）
 */
export const UploadAvatarAPI = (file: File): Res<string> => {
  // 构建FormData（匹配后端MultipartFile接收）
  const formData = new FormData();
  formData.append("file", file); // 字段名需与@RequestParam("file")一致

  // 上传需设置Content-Type为multipart/form-data（axios会自动处理）
  return instance.post("/attachment/upload/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
}

// 修改密码啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊
interface ChangeUserPasswordItem {
  oldPassword: String // 旧密码
  newPassword: String // 新密码
}
/**
 * 罗小黑妖灵论坛 已登录用户修改账户密码
 * @param data ChangeUserPasswordItem
 * @returns 是否修改成功
 */
export const ChangeUserPassword = (data: ChangeUserPasswordItem): Res<String> => instance.post("/user/change-password", data)

/**|　 碎觉觉啦！　 |
＼　　　　　　　　/
　￣￣￣￣∨￣￣
　　　　　　　。
　　　∧ ∧　.・
　|￣￣( ´Д｀)￣|
|＼⌒⌒⌒⌒⌒⌒＼
|　 ＼⌒⌒⌒⌒⌒⌒＼
＼　｜⌒⌒⌒⌒⌒⌒⌒|
 */

// ——————Count 积分模块
//获取旧论坛积分（暂时 以后会废除）
export const GetUserQYCountAPI = (): Res<String> => instance.get("/count/getqycount")

//旧论坛积分转换（暂时 以后会废除）
export const ChangeUserQYCountAPI = (): Res<String> => instance.get("/count/changeqycount")

/**
 * 罗小黑妖灵论坛获取积分规则
 * @returns 积分规则List
 */
export const GetCountExtreditsRules = (): Res<String> => instance.get("/count/ratingrules")

/**
 * 评分记录实体类 (对应 ExtcreditsRecordDo)
 * 定义用户进行评分操作时，需要发送给后端的数据结构。
 * 注意：只有需要变动的积分字段才需要包含。
 */
interface ExtcreditsRecordDo {
  // id, time 等字段通常由后端处理或自动生成，前端发送时不需要

  /** 被评分的帖子 PID (目标贴) - 必须 */
  pid: number;
  /** 评分留言/理由 (评分消息) - 必须 */
  message: string;
  /** 操作方 UID (评分人) - 通常由 Token 解析，但保险起见可以包含 */
  uid?: number;
  /** 用户名 (操作方) - 通常由 Token 解析，但保险起见可以包含 */
  username?: string;
  /** 积分类型 变动值 (可以为正/负) */
  extcredits1: number | null;
  extcredits2: number | null;
  extcredits3: number | null;
  extcredits4: number | null;
  extcredits5: number | null;
  extcredits6: number | null;
  extcredits7: number | null;
  extcredits8: number | null;
}

/**
 * 罗小黑妖灵论坛评分接口
 * @param extcreditsRecordDo 评分实体类
 * @return RestFul接口 (返回成功/失败消息，类型为 String)
 */
export const UserExtcreditsChangeAPI = (data: ExtcreditsRecordDo): Res<string> => instance.post("/count/rating", data);

// 获取评分剩余额度
interface RatingRemainingItem {
  name: string;
  usedPositive: number;
  usedNegative: number;
  dailyLimit: number;
  singleMax: number;
  remainingPositive: number;
}
export const GetRatingRemainingAPI = (): Res<Record<string, RatingRemainingItem>> =>
  instance.get("/count/rating-remaining");

/**
 * 罗小黑妖灵论坛获取积分列表接口
 * @returns 论坛的积分及启用情况
 */
export const UserExtreditsListAPI = (): Res<String> => instance.get("/count/extreditslist")

// ——————Announcement 公告模块
interface AnnouncementItem {
  id?: number;
  title: string;
  content: string;
  authorid?: number;
  fid?: number;         // 0=全局公告
  status?: number;      // 0-禁用 1-启用
  displayOrder?: number;
  dateline?: number;
}

/**
 * 罗小黑妖灵论坛 获取启用公告列表
 * @param fid 板块ID（可选，默认0=全局公告）
 */
export const GetAnnouncementListAPI = (fid?: number): Res<AnnouncementItem[]> =>
  instance.get("/announcement/list", { params: { fid } });

/**
 * 罗小黑妖灵论坛 后台获取公告列表
 */
export const SelectAnnouncementAPI = (params?: {
  pageNum?: number;
  pageSize?: number;
}): Res<PageResult<AnnouncementItem>> => {
  const requestParams = { pageNum: 1, pageSize: 30, ...params };
  return instance.get("/admin/select-announcement", { params: requestParams });
};

export const InsertAnnouncementAPI = (data: AnnouncementItem): Res<String> =>
  instance.post("/admin/insert-announcement", data);

export const UpdateAnnouncementAPI = (data: AnnouncementItem): Res<String> =>
  instance.post("/admin/update-announcement", data);

export const DeleteAnnouncementAPI = (id: number): Res<String> =>
  instance.get("/admin/delete-announcement", { params: { id } });

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

// 发起新会话
export const StartConversationAPI = (data: { targetUid: number; content: string }): Res<{ plid: number; mid?: number }> =>
  instance.post("/message/start", data);

// ——————Banner 轮播图模块
// 轮播图Banner接口（对应BannerDo）
interface BannerItem {
  id: number; // 主键ID
  title: string; // Banner标题
  pid?: number; // 跳转目标帖ID
  url: string; // 展示图片地址
  status: number; // 是否启用（0-禁用，1-启用）
  bindex: number; // 排序优先级（数值越高越靠前）
}

// 获取展示Banner
export const GetAdminBannerAPI = (): Res<String> => instance.get("/admin/get-banner");

// 后台获取所有Banner
export const SelectBannerAPI = (): Res<BannerItem[]> => instance.get("/admin/select-banner");

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
  taxRate?: number; // 普通税率
  itemTaxRate: number; // 商品税率
  stockTaxRate: number; // 股票税率
  bankInterestRate: number; // 银行利率（月息）
  title?: string; // 板块可选内容标题
  imgUrl?: string; // 板块图标地址
  bindex?: number; // 排序序列（数值越高越靠前）
  bannerurl?: string; // 横幅地址
  players?: string; // 加入会馆的用户列表（存储格式可能为uid数组字符串）
}

// 添加会馆
export const InsertBlockAPI = (data: BlockItem): Res<String> => instance.post("/admin/insert-block", data);

// 更新会馆
export const GetAdminBlockListAPI = (): Res<BlockItem[]> => instance.get("/admin/select-block-all");
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

// ————Version 版本控制模块
// 版本实体类
interface VersionItem {
  /** 版本ID，数据库自动增加 */
  id?: number;
  /** 版本号（如：1.0.0） */
  version?: string;
  /** 版本发布时间时间戳，前端不填 */
  time?: string;
  /** 发布人UID，前端不填后端填写 */
  uid?: number;
  /** 版本状态（1-启用，0-禁用） */
  state?: number;
  /** 是否强制推送（1-是，0-否） */
  push?: number;
  /** 版本更新说明 */
  message?: string;
}

/**
 * 罗小黑妖灵论坛 获取最新版本信息
 * @returns 最新版本实体类
 */
interface VersionData {
  id: number; version: string; time: string; uid: number;
  state: number; push: number; message: string; downloadUrl: string;
}
export const GetLatestVersionAPI = (): Res<VersionData> => instance.get("/version/getlatest");

// 版本列表查询参数
interface GetVersionListQuery {
  pageNum?: number; // 默认1
  pageSize?: number; // 默认30
}

/**
 * 罗小黑妖灵论坛 获取版本信息列表
 * @param params 分页查询参数
 * @returns 版本信息列表
 */
export const GetVersionListAPI = (params?: GetVersionListQuery): Res<String> => {
  const requestParams = {
    pageNum: 1,
    pageSize: 10,
    ...params
  };
  return instance.get("/version/getlist", { params: requestParams })
};

/**
 * 罗小黑妖灵论坛 后台用 获取版本信息列表
 * @param params 分页查询参数
 * @returns 版本信息列表
 */
export const GetAdminVersionListAPI = (params?: GetVersionListQuery): Res<PageResult<VersionItem>> => {
  const requestParams = {
    pageNum: 1,
    pageSize: 10,
    ...params
  };
  return instance.get("/admin/select-version", { params: requestParams })
};

/**
 * 罗小黑妖灵论坛 更新版本信息
 * @param data 版本实体类
 * @returns RestFul响应 是否成功
 */
export const UpdateVersionAPI = (data: VersionItem): Res<String> => instance.post("/admin/update-version", data)

/**
 * 罗小黑妖灵论坛 添加版本信息
 * @param data 版本实体类
 * @returns RestFul响应 是否成功
 */
export const InsertVersionAPI = (data: VersionItem): Res<String> => instance.post("/admin/insert-version", data)

/**
 * 罗小黑妖灵论坛 删除版本信息
 * @param id 版本实体类
 * @returns RestFul响应 是否成功
 */
export const DeleteVersion = (id?: number): Res<String> => instance.get("/admin/delete-version", {
  params: { id }
})

// ——————Task 任务模块
interface TaskItem {
  id?: number; title: string; description?: string; icon?: string;
  type: string; conditionType: string; conditionValue: number;
  rewardType: string; rewardValue: number; rewardItemId?: number; rewardItemQuantity?: number;
  status?: number; displayOrder?: number;
  cycleType: string; acceptType: string;
}
export const GetTaskListAPI = (): Res<any> => instance.get("/task/list");
export const AcceptTaskAPI = (taskId: number): Res<String> => instance.post(`/task/accept/${taskId}`);
export const CancelTaskAPI = (taskId: number): Res<String> => instance.post(`/task/cancel/${taskId}`);
export const CompleteTaskAPI = (taskId: number): Res<String> => instance.post(`/task/complete/${taskId}`);
export const ClaimTaskRewardAPI = (taskId: number): Res<String> => instance.post(`/task/claim/${taskId}`);
export const AdminConfirmTaskAPI = (userTaskId: number): Res<String> => instance.post(`/task/admin/confirm/${userTaskId}`);
export const AdminRejectTaskAPI = (userTaskId: number): Res<String> => instance.post(`/task/admin/reject/${userTaskId}`);
export const GetPendingConfirmListAPI = (params?: any): Res<any> => instance.get("/task/admin/pending-confirm", { params });
export const GetCompletedTasksAPI = (): Res<any> => instance.get("/task/completed");
export const GetAdminTaskListAPI = (params?: any): Res<any> => instance.get("/task/admin/list", { params });
export const InsertTaskAPI = (data: TaskItem): Res<String> => instance.post("/task/admin/insert", data);
export const UpdateTaskAPI = (data: TaskItem): Res<String> => instance.post("/task/admin/update", data);
export const DeleteTaskAPI = (id: number): Res<String> => instance.get("/task/admin/delete", { params: { id } });

// ——————Item 物品模块
interface ItemItem {
  id?: number; name: string; description?: string; icon?: string;
  type?: string; rarity?: number; price?: number;
  effectType?: string; effectValue?: number; status?: number;
  // 系统售卖
  sysSell?: number; sysSellPrice?: number;
  sysSellLimitType?: string; sysSellLimitQty?: number;
  // 系统收购
  sysBuy?: number; sysBuyPrice?: number;
  sysBuyLimitType?: string; sysBuyLimitQty?: number;
}
export const GetMyItemsAPI = (): Res<any> => instance.get("/item/mylist");
export const UseItemAPI = (userItemId: number): Res<String> => instance.post(`/item/use/${userItemId}`);
export const GetAdminItemListAPI = (params?: any): Res<any> => instance.get("/item/admin/list", { params });
export const InsertItemAPI = (data: ItemItem): Res<String> => instance.post("/item/admin/insert", data);
export const UpdateItemAPI = (data: ItemItem): Res<String> => instance.post("/item/admin/update", data);
export const DeleteItemAPI = (id: number): Res<String> => instance.get("/item/admin/delete", { params: { id } });
export const GetAdminUserItemsAPI = (uid: number): Res<any> => instance.get("/item/admin/user-items", { params: { uid } });
export const GrantItemAPI = (data: { itemId: number; quantity: number; uids: string }): Res<String> =>
  instance.post("/item/admin/grant", data);

// ——————Medal 勋章模块
interface MedalItem {
  id?: number; name: string; description?: string; imageUrl: string;
  categoryId: number; conditionDesc?: string; status?: number; displayOrder?: number;
}
export const GetMedalListAPI = (): Res<any> => instance.get("/medal/list");
export const GetUserMedalsAPI = (uid: number): Res<any> => instance.get(`/medal/user/${uid}`);
export const ReorderMedalsAPI = (medalIds: string): Res<String> => instance.post("/medal/reorder", { medalIds });
export const SetPrimaryMedalAPI = (userMedalId: number): Res<String> => instance.post(`/medal/set-primary/${userMedalId}`);
export const GetAdminMedalListAPI = (params?: any): Res<any> => instance.get("/medal/admin/list", { params });
export const InsertMedalAPI = (data: MedalItem): Res<String> => instance.post("/medal/admin/insert", data);
export const UpdateMedalAPI = (data: MedalItem): Res<String> => instance.post("/medal/admin/update", data);
export const DeleteMedalAPI = (id: number): Res<String> => instance.get("/medal/admin/delete", { params: { id } });
export const GrantMedalAPI = (data: { medalId: number; uids: string }): Res<String> =>
  instance.post("/medal/admin/grant", data);
export const RevokeMedalAPI = (id: number): Res<String> => instance.get("/medal/admin/revoke", { params: { id } });

// ——————Shop 集市模块
export const GetShopListingsAPI = (params?: { pageNum?: number; pageSize?: number; type?: string }): Res<any> => {
  const p = { pageNum:1, pageSize:20, ...params };
  return instance.get("/shop/listings", { params: p });
};
export const SellItemAPI = (data: { userItemId: number; quantity: number; price: number; type: string; auctionDays?: number }): Res<String> =>
  instance.post("/shop/sell", data);
export const BuyFixedAPI = (listingId: number): Res<String> => instance.post(`/shop/buy/${listingId}`);
export const PlaceBidAPI = (listingId: number, amount: number): Res<String> => instance.post(`/shop/bid/${listingId}`, { amount });
export const GetBidsAPI = (listingId: number): Res<any> => instance.get(`/shop/bids/${listingId}`);
export const CancelListingAPI = (listingId: number): Res<String> => instance.post(`/shop/cancel/${listingId}`);
// 系统商品
export const GetSystemItemsAPI = (params?: { pageNum?: number; pageSize?: number }): Res<any> => {
  const p = { pageNum: 1, pageSize: 20, ...params };
  return instance.get("/shop/system", { params: p });
};
export const BuySystemItemAPI = (data: { itemId: number; quantity: number }): Res<String> =>
  instance.post("/shop/system/buy", data);
export const SellSystemItemAPI = (data: { itemId: number; quantity: number }): Res<String> =>
  instance.post("/shop/system/sell", data);
export const GetTradeHistoryAPI = (params?: { pageNum?: number; pageSize?: number }): Res<any> => {
  const p = { pageNum: 1, pageSize: 20, ...params };
  return instance.get("/shop/history", { params: p });
};

// ——————Stamp 图章模块
interface StampItem { id?:number; name:string; imageUrl?:string; displayOrder?:number; status?:number }
export const GetStampListAPI = (): Res<StampItem[]> => instance.get("/admin/stamp/list");
export const GetActiveStampsAPI = (): Res<StampItem[]> => instance.get("/admin/stamp/active");
export const InsertStampAPI = (data:StampItem): Res<String> => instance.post("/admin/stamp/insert",data);
export const UpdateStampAPI = (data:StampItem): Res<String> => instance.post("/admin/stamp/update",data);
export const DeleteStampAPI = (id:number): Res<String> => instance.get("/admin/stamp/delete",{params:{id}});
export const SetPostStampAPI = (pid:number, stampId:number|null): Res<String> => instance.post("/admin/stamp/set-post-stamp",{pid,stampId});

// ——————UserPosts 用户帖子
export const GetUserTopicsAPI = (params?:any): Res<any> => instance.get("/post/getuserpost",{params});
export const GetUserRepliesAPI = (params?:any): Res<any> => instance.get("/post/getuserrepost",{params});

// ——————SystemConfig 系统配置
export const GetSystemConfigAPI = (): Res<any> => instance.get("/admin/config/all");
export const SetSystemConfigAPI = (key:string,value:string): Res<String> => instance.post("/admin/config/set",{key,value});

// ——————CreditManage 积分管理
export const GetCreditDefsAPI = (): Res<any> => instance.get("/admin/credit/defs");
export const UpdateCreditDefAPI = (data:any): Res<String> => instance.post("/admin/credit/update-def",data);
export const GetCreditRulesAPI = (): Res<any> => instance.get("/admin/credit/rules");
export const UpdateCreditRuleAPI = (data:any): Res<String> => instance.post("/admin/credit/update-rule",data);
export const InsertCreditRuleAPI = (data:any): Res<String> => instance.post("/admin/credit/insert-rule",data);
export const DeleteCreditRuleAPI = (id:number): Res<String> => instance.get("/admin/credit/delete-rule",{params:{id}});
export const GrantCreditsAPI = (data:any): Res<String> => instance.post("/admin/credit/grant",data);
export const GetUserCountAPI = (uid: number): Res<any> => instance.get("/admin/credit/user-count", { params: { uid } });
export const SetUserCreditsAPI = (data: { uid: number; extcredits1?: number; extcredits2?: number; extcredits3?: number; extcredits4?: number }): Res<String> =>
  instance.post("/admin/credit/set", data);
export const UpdateUserItemAPI = (data: { userItemId: number; quantity: number }): Res<String> =>
  instance.post("/item/admin/user-item/update", data);
export const DeleteUserItemAPI = (data: { userItemId: number }): Res<String> =>
  instance.post("/item/admin/user-item/delete", data);

// ——————BlockFinance 会馆财政
export const GetBlockFinanceAPI = (blockId:number, params?:any): Res<any> => instance.get(`/block-finance/finance/${blockId}`,{params});
export const GetMyStockAPI = (): Res<any> => instance.get("/block-finance/stock/my");
export const BuyStockAPI = (amount:number): Res<String> => instance.post("/block-finance/stock/buy",{amount});
export const SellStockAPI = (amount:number): Res<String> => instance.post("/block-finance/stock/sell",{amount});

// ——————CreditDetail 积分明细
export const GetCreditDetailAPI = (params?:any): Res<any> => instance.get("/count/detail",{params});

// ——————Attachment 附件管理(admin)
export const GetAdminAttachmentListAPI = (params?:any): Res<any> => instance.get("/admin/attachment/list",{params});
export const DeleteAdminAttachmentAPI = (aid:number): Res<String> => instance.delete("/admin/attachment/"+aid);

// ——————Gugu 番剧
export const GetGuguEpisodesAPI = (epId?:number): Res<any> => instance.get("/gugu/episodes",{params:{epId:epId||32374}});

// 勋章新接口
export const GetAllMedalsAPI = (): Res<any> => instance.get("/medal/all");
export const GetUserPrimaryMedalAPI = (uid: number): Res<any> => instance.get(`/medal/primary/${uid}`);
export const PurchaseMedalAPI = (medalId: number): Res<String> => instance.post(`/medal/purchase/${medalId}`);
export const GetRecentMedalLogsAPI = (): Res<any[]> => instance.get("/medal/recent-logs");

// ——————Promotion 晋升模块
export const GetPromotionStatusAPI = (): Res<any> => instance.get("/user/promotion-status");
export const ConfirmPromotionAPI = (logId: number): Res<String> => instance.post(`/user/confirm-promotion/${logId}`);
export const RejectPromotionAPI = (logId: number): Res<String> => instance.post(`/user/reject-promotion/${logId}`);

// ——————Attachment 附件管理模块
interface AttachmentItem {
  aid: number; filename: string; filesize: number; attachment: string;
  category: string; attachmentType: string; systemCategory: string;
  isimage: number; formattedDateline: string;
}
export const GetAttachmentListAPI = (params?: {
  pageNum?: number; pageSize?: number; category?: string; attachmentType?: string;
}): Res<PageResult<AttachmentItem>> => {
  const p = { pageNum:1, pageSize:30, ...params };
  return instance.get("/admin/attachment/list", { params: p });
};
export const GetSystemAttachmentListAPI = (systemCategory?: string): Res<AttachmentItem[]> =>
  instance.get("/admin/attachment/system-list", { params: { systemCategory } });
export const DeleteAttachmentAPI = (aid: number): Res<String> =>
  instance.delete("/admin/attachment/"+aid);

// ——————Dashboard 仪表盘模块
// 仪表盘统计数据接口
interface DashboardVo {
  totalUsers: number;       // 用户总数
  todayNewUsers: number;    // 今日新增用户数
  totalPosts: number;       // 帖子总数
  todayNewPosts: number;    // 今日新增帖子数
  totalBlocks: number;      // 板块总数
  todayActiveUsers: number; // 今日活跃用户数
  latestUsers: UserItem[];  // 最新注册的5个用户
  latestPosts: PostDo[];    // 最新发布的5个帖子
}

/**
 * 罗小黑妖灵论坛 获取后台仪表盘统计数据
 * @returns 仪表盘统计数据
 */
export const GetDashboardAPI = (): Res<DashboardVo> => instance.get("/admin/dashboard")
