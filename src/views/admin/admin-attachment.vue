<template>
  <div class="admin-attachment">
    <div class="page-header">
      <h2>附件管理</h2>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:13px;color:#728567">压缩:</span>
        <el-select v-model="compressLevel" size="small" style="width:100px">
          <el-option label="512x512" :value="512"/><el-option label="256x256" :value="256"/>
          <el-option label="128x128" :value="128"/><el-option label="64x64" :value="64"/>
          <el-option label="不压缩" :value="0"/>
        </el-select>
        <el-upload :action="uploadUrl" :headers="uploadHeaders" :data="uploadData" :show-file-list="false"
          :on-success="onUploadSuccess" :on-error="onUploadError" accept="image/*,.pdf,.zip,.rar,.7z,.doc,.docx,.xls,.xlsx,.mp3,.mp4,.wav">
          <el-button type="primary">上传系统附件</el-button>
        </el-upload>
      </div>
    </div>

    <div class="filter-bar">
      <el-radio-group v-model="filterType" size="small">
        <el-radio-button value="all">全部</el-radio-button>
        <el-radio-button value="system">系统附件</el-radio-button>
        <el-radio-button value="user">用户附件</el-radio-button>
      </el-radio-group>
      <el-select v-model="filterCategory" size="small" style="width:100px;margin-left:10px" clearable placeholder="分类">
        <el-option label="全部" value="all"/><el-option label="图片" value="image"/><el-option label="文档" value="document"/>
        <el-option label="压缩包" value="archive"/><el-option label="音频" value="audio"/><el-option label="视频" value="video"/><el-option label="其他" value="other"/>
      </el-select>
      <span class="filter-info">共 {{ list.total || 0 }} 个文件</span>
    </div>

    <el-table v-loading="loading" :data="list.records" border stripe size="small" style="width:100%;margin-top:10px">
      <el-table-column label="ID" prop="aid" width="60" align="center"/>
      <el-table-column label="缩略图" width="80" align="center">
        <template #default="s">
          <el-image v-if="s.row.isimage===1" :src="baseUrl+s.row.attachment" fit="cover" style="width:50px;height:50px;border-radius:4px" :preview-src-list="[baseUrl+s.row.attachment]"/>
          <span v-else style="font-size:28px">{{ getFileIcon(s.row.category) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="文件名" prop="filename" min-width="180" show-overflow-tooltip/>
      <el-table-column label="大小" width="80" align="center"><template #default="s">{{ formatSize(s.row.filesize) }}</template></el-table-column>
      <el-table-column label="分类" width="70" align="center"><template #default="s">{{ s.row.category }}</template></el-table-column>
      <el-table-column label="类型" width="70" align="center">
        <template #default="s"><el-tag size="small" :type="s.row.attachmentType==='system'?'success':''">{{ s.row.attachmentType==='system'?'系统':'用户' }}</el-tag></template>
      </el-table-column>
      <el-table-column label="子分类" width="80" align="center"><template #default="s">{{ s.row.systemCategory||'-' }}</template></el-table-column>
      <el-table-column label="上传时间" width="160" align="center"><template #default="s">{{ s.row.formattedDateline }}</template></el-table-column>
      <el-table-column label="操作" width="120" align="center">
        <template #default="s">
          <el-button size="small" @click="copyUrl(s.row)">复制URL</el-button>
          <el-button size="small" type="danger" @click="handleDelete(s.row.aid)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination v-if="list.total>0" class="pagination" layout="total,prev,pager,next"
      :total="list.total" :page-size="pageSize" :current-page="currentPage" @current-change="handlePageChange"/>
  </div>
</template>

<script lang="ts">
import { ref, watch, defineComponent, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import config from "@/config/index";
import { GetAdminAttachmentListAPI, DeleteAdminAttachmentAPI } from "@/api/index";

interface AttachItem { aid:number;filename:string;filesize:number;attachment:string;category:string;attachmentType:string;systemCategory:string;isimage:number;formattedDateline:string; }
interface PageResult<T> { records:T[]; total?:number; }

export default defineComponent({
  name:"admin-attachment",
  setup(){
    const baseUrl=config.baseApi;
    const loading=ref(false),list=ref<PageResult<AttachItem>>({records:[]}),currentPage=ref(1),pageSize=ref(30);
    const filterType=ref("all"),filterCategory=ref("all");
    const uploadUrl=config.baseApi+"/admin/attachment/upload";
    const uploadHeaders={Authorization:localStorage.getItem("heibbs.token")||""};
    const compressLevel=ref(512);
    const uploadData=computed(()=>({systemCategory:"systemUi",compress:compressLevel.value}));

    const fetchData=async()=>{
      loading.value=true;
      const params:any={pageNum:currentPage.value,pageSize:pageSize.value};
      if(filterCategory.value&&filterCategory.value!=='all')params.category=filterCategory.value;
      if(filterType.value!=='all')params.attachmentType=filterType.value;
      const r=await GetAdminAttachmentListAPI(params);
      if(r.status===200)list.value=r.data;
      loading.value=false;
    };
    const onUploadSuccess=(resp:any)=>{if(resp.status===200){ElMessage.success("上传成功");fetchData()}else ElMessage.error("上传失败")};
    const onUploadError=()=>ElMessage.error("上传失败");
    const getFileIcon=(cat:string)=>({image:'🖼️',document:'📄',archive:'📦',audio:'🎵',video:'🎬'} as any)[cat]||'📎';
    const formatSize=(s:number)=>s<1024?s+'B':s<1048576?(s/1024).toFixed(1)+'KB':(s/1048576).toFixed(1)+'MB';
    const copyUrl=(item:AttachItem)=>{navigator.clipboard.writeText(baseUrl+item.attachment).then(()=>ElMessage.success("已复制"))};
    const handleDelete=(aid:number)=>{ElMessageBox.confirm("确定删除?","提示",{type:"warning"}).then(async()=>{await DeleteAdminAttachmentAPI(aid);fetchData()})};
    const handlePageChange=(p:number)=>{currentPage.value=p;fetchData()};
    watch([filterType, filterCategory], ()=>{ currentPage.value=1; fetchData(); });
    fetchData();
    return{baseUrl,loading,list,currentPage,pageSize,filterType,filterCategory,compressLevel,uploadUrl,uploadHeaders,uploadData,onUploadSuccess,onUploadError,getFileIcon,formatSize,copyUrl,handleDelete,handlePageChange};
  }
});
</script>

<style scoped>
.admin-attachment{padding:20px}
.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.page-header h2{margin:0;font-size:18px}
.filter-bar{display:flex;align-items:center;gap:8px;margin-bottom:4px}
.filter-info{font-size:13px;color:#909399;margin-left:auto}
.pagination{margin-top:20px;text-align:right}
</style>
