import DOMPurify from 'dompurify'; // 需安装：npm install dompurify @types/dompurify

// 定义表情映射类型（TypeScript 类型约束）
type EmojiMap = Record<string, string>;

// -------------------------- 公共工具函数（减少代码冗余） --------------------------
/**
 * 公共文本格式转换（标题、字体、加粗等，两个函数共用）
 */
const convertTextFormat = (html: string): string => {
  return html
    // 1. 标题 [h1]-[h6]（优化嵌套匹配，非贪婪模式）
    .replace(/\[h([1-6])\]([\s\S]*?)\[\/h\1\]/g, "<h$1>$2</h$1>")
    // 2. 字体大小 [size=X]
    .replace(/\[size=(\d+)\]([\s\S]*?)\[\/size\]/g, '<span style="font-size: $1px;">$2</span>')
    // 3. 字体颜色 [color=色值]（兼容 # 开头和无 # 格式）
    .replace(/\[color=(\#?[a-zA-Z0-9]+)\]([\s\S]*?)\[\/color\]/g, '<span style="color: $1;">$2</span>')
    // 4. 字体 [font=字体名称]（兼容带空格的字体，如 "Microsoft YaHei"）
    .replace(/\[font=(.*?)\]([\s\S]*?)\[\/font\]/g, '<span style="font-family: $1;">$2</span>')
    // 5. 基础格式（加粗、斜体、下划线、删除线）
    .replace(/\[b\]([\s\S]*?)\[\/b\]/g, "<strong>$1</strong>")
    .replace(/\[i\]([\s\S]*?)\[\/i\]/g, "<em>$1</em>")
    .replace(/\[u\]([\s\S]*?)\[\/u\]/g, "<u>$1</u>")
    .replace(/\[s\]([\s\S]*?)\[\/s\]/g, "<del>$1</del>")
    // 6. 对齐（center/align）
    .replace(/\[center\]([\s\S]*?)\[\/center\]/g, '<div style="text-align: center;">$2</div>')
    .replace(/\[align=(left|center|right|justify)\]([\s\S]*?)\[\/align\]/g, '<div style="text-align: $1;">$2</div>')
    // 7. 补充换行（BBCode 换行转 <br>，解决排版混乱）
    .replace(/\n/g, "<br>")
    .replace(/\r\n/g, "<br>");
};

/**
 * 公共链接/引用/代码转换（两个函数共用）
 */
const convertLinksAndQuotes = (html: string): string => {
  return html
    // 1. URL 链接（兼容带参数的链接，如 ?id=1&name=test）
    .replace(/\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>')
    .replace(/\[url\]([\s\S]*?)\[\/url\]/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
    // 2. 邮件链接
    .replace(/\[email=([^\]]+)\]([\s\S]*?)\[\/email\]/g, '<a href="mailto:$1">$2</a>')
    .replace(/\[email\]([\s\S]*?)\[\/email\]/g, '<a href="mailto:$1">$1</a>')
    // 3. 引用（支持嵌套引用，优化作者显示）
    .replace(/\[quote=([^\]]*)\]([\s\S]*?)\[\/quote\]/g, '<div class="discuz-quote"><div class="quote-author">引用 $1 的发言：</div><div class="quote-content">$2</div></div>')
    .replace(/\[quote\]([\s\S]*?)\[\/quote\]/g, '<div class="discuz-quote"><div class="quote-content">$1</div></div>')
    // 4. 代码块（保留原始缩进，添加语法高亮兼容类）
    .replace(/\[code\]([\s\S]*?)\[\/code\]/g, '<pre class="discuz-code"><code>$1</code></pre>');
};

/**
 * 公共列表转换（无序列表/有序表，优化子列表处理）
 */
const convertLists = (html: string): string => {
  // 1. 无序列表 [list] + [*]（避免匹配子列表的 [*]）
  html = html.replace(/\[list\]([\s\S]*?)\[\/list\]/g, (match, content) => {
    const items = content.replace(/(?<!\[list\]>)\[(\*)\]([\s\S]*?)(?=\[\*]|$)/g, "<li>$2</li>");
    return `<ul class="discuz-list">${items}</ul>`;
  });

  // 2. 有序列表 [list=1/a/A]
  html = html.replace(/\[list=([1aA])\]([\s\S]*?)\[\/list\]/g, (match, type, content) => {
    const listStyle = type === "1" ? "decimal" : type === "a" ? "lower-alpha" : "upper-alpha";
    const items = content.replace(/(?<!\[list\]>)\[(\*)\]([\s\S]*?)(?=\[\*]|$)/g, "<li>$2</li>");
    return `<ol class="discuz-list" style="list-style-type: ${listStyle}">${items}</ol>`;
  });

  return html;
};

/**
 * 公共特殊标签转换（表情、编辑标记、分页、隐藏内容）
 */
const convertSpecialTags = (html: string, emojiMap: EmojiMap): string => {
  return html
    // 1. 表情（支持自定义映射，未匹配的标签保留原样）
    .replace(/\[(\w+|[\u4e00-\u9fa5]+)\]/g, (match, emojiKey) => {
      return emojiMap[emojiKey]
        ? `<img src="/static/emojis/${emojiMap[emojiKey]}" alt="${emojiKey}" class="discuz-emoji" />`
        : match;
    })
    // 2. 编辑标记（DiscuzX 编辑标签实际为 [i=s]...[/i=s]，原代码闭包错误）
    .replace(/\[i=s\]/g, '<span class="discuz-edited">(已编辑) ')
    .replace(/\[\/i=s\]/g, "</span>") // 修复：精准匹配编辑标签闭包
    // 3. 分页标记
    .replace(/\[page\]([\s\S]*?)\[\/page\]/g, '<div class="discuz-page-break">$1</div>')
    // 4. 隐藏内容（添加基础点击交互，需配合前端 JS 触发）
    .replace(/\[hide\]([\s\S]*?)\[\/hide\]/g, `
      <div class="discuz-hidden">
        <button class="show-hidden" onclick="this.nextElementSibling.style.display='block';this.style.display='none'">
          显示隐藏内容
        </button>
        <div class="hidden-content" style="display: none;">$1</div>
      </div>
    `);
};

// -------------------------- 核心转换函数（对外暴露） --------------------------
/**
 * 完整内容转换（含媒体标签：图片、视频、音频）
 * @param content 原始 BBCode 内容
 * @returns 安全的 HTML 字符串
 */
export const parsedContent = (content: string): string => {
  if (!content.trim()) return "";

  // 1. 基础转换（文本格式、链接、列表）
  let html = convertTextFormat(content);
  html = convertLinksAndQuotes(html);
  html = convertLists(html);

  // 2. 媒体标签转换（适配 DiscuzX 附件路径，可结合图片 ID 映射调整 src）
  html = html
    // 图片 [img] / [img=宽,高]
    .replace(/\[img=(\d+),(\d+)\]([\s\S]*?)\[\/img\]/g, (match, width, height, src) => {
      // 若需对接 DiscuzX 本地附件，可替换 src（示例：拼接附件根路径）
      // const discuzImgSrc = `http://你的论坛域名/data/attachment/${src}`;
      return `<img src="${src}" width="${width}" height="${height}" alt="罗小黑妖灵论坛 图片" width="100%" loading="lazy" />`;
    })
    .replace(/\[img\]([\s\S]*?)\[\/img\]/g, (match, src) => {
      return `<img src="${src}" alt="罗小黑妖灵论坛 图片" width="100%" loading="lazy" />`;
    })
    // B站视频 [bili]
    .replace(/\[bili\](\d+)\[\/bili\]/g, `
      <div class="discuz-video">
        <iframe 
          src="https://player.bilibili.com/player.html?aid=$1&high_quality=1" 
          scrolling="no" 
          border="0" 
          frameborder="no" 
          framespacing="0" 
          allowfullscreen="true"
          width="100%"
          height="400"
        ></iframe>
      </div>
    `)
    // 本地视频 [video]
    .replace(/\[video\]([\s\S]*?)\[\/video\]/g, '<video src="$1" controls class="discuz-video" width="100%"></video>')
    // 本地音频 [audio]
    .replace(/\[audio\]([\s\S]*?)\[\/audio\]/g, '<audio src="$1" controls class="discuz-audio"></audio>');

  // 3. 特殊标签转换（表情映射需根据实际文件调整）
  const emojiMap: EmojiMap = {
    smile: "smile.png",
    laugh: "laugh.png",
    cry: "cry.png",
    angry: "angry.png",
    惊讶: "surprise.png",
    疑问: "question.png",
    // 补充你的实际表情 key -> 文件名映射
  };
  html = convertSpecialTags(html, emojiMap);



  // 4. 安全过滤（核心：清除恶意 HTML 标签，防止 XSS，允许iframe标签及B站视频所需属性）
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe'], // 允许iframe标签
    ADD_ATTR: [
      'allowfullscreen',
      'scrolling',
      'frameborder',
      'border',
      'framespacing',
      'src' // 确保src属性不被过滤
    ],
    ALLOW_UNKNOWN_PROTOCOLS: true // 允许https等协议
  });
};

/**
 * 首页内容转换（不含媒体标签，轻量排版）
 * @param content 原始 BBCode 内容
 * @returns 安全的 HTML 字符串
 */
export const parsedIndexContent = (content: string): string => {
  if (!content.trim()) return "";

  // 1. 基础转换（复用公共函数，跳过媒体标签）
  let html = convertTextFormat(content);
  html = convertLinksAndQuotes(html);
  html = convertLists(html);

  // 2. 特殊标签转换（同完整转换，无媒体）
  const emojiMap: EmojiMap = {
    smile: "smile.png",
    laugh: "laugh.png",
    cry: "cry.png",
    angry: "angry.png",
    惊讶: "surprise.png",
    // 同 parsedContent 的表情映射，建议抽为全局变量
  };
  html = convertSpecialTags(html, emojiMap);

  // 3. 安全过滤
  return DOMPurify.sanitize(html);
};

// 对外暴露（保持原导出格式）
export default { parsedContent, parsedIndexContent };