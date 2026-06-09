<template>
  <div class="admin-medal">
    <div class="page-header"><h2>勋章管理</h2><el-button type="primary" @click="showAdd">添加勋章</el-button></div>
    <el-table v-loading="loading" :data="list.records" border stripe>
      <el-table-column label="ID" prop="id" width="50"/><el-table-column label="名称" prop="name" min-width="100"/>
      <el-table-column label="分类" width="80"><template #default="s">{{ s.row.categoryId===1?'传奇':'普通' }}</template></el-table-column>
      <el-table-column label="图片" prop="imageUrl" width="100"/><el-table-column label="状态" width="70"><template #default="s"><el-tag :type="s.row.status===1?'success':'info'" size="small">{{ s.row.status===1?'启用':'禁用' }}</el-tag></template></el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="s">
          <el-button size="small" @click="showEdit(s.row)">编辑</el-button>
          <el-button size="small" @click="showGrant(s.row)">发放</el-button>
          <el-button size="small" type="danger" @click="handleDelete(s.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dlg" :title="isEdit?'编辑勋章':'添加勋章'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称"><el-input v-model="form.name"/></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea"/></el-form-item>
        <el-form-item label="图片URL"><el-input v-model="form.imageUrl"/></el-form-item>
        <el-form-item label="分类"><el-radio-group v-model="form.categoryId"><el-radio :label="1">传奇勋章</el-radio><el-radio :label="2">普通勋章</el-radio></el-radio-group></el-form-item>
        <el-form-item label="获取条件"><el-input v-model="form.conditionDesc"/></el-form-item>
        <el-form-item label="注册时间条件">
          <el-date-picker v-model="form.regdateBefore" type="datetime" placeholder="在此日期之前注册才可获得" value-format="X" style="width:100%"/>
          <span style="font-size:11px;color:#909399">留空=无限制</span>
        </el-form-item>
        <el-form-item label="获取方式">
          <el-radio-group v-model="form.acquireType">
            <el-radio value="manual">人工发放</el-radio>
            <el-radio value="credit">积分购买</el-radio>
          </el-radio-group>
        </el-form-item>
        <template v-if="form.acquireType==='credit'">
          <el-form-item label="积分类型">
            <el-select v-model="form.creditType">
              <el-option label="灵气" value="extcredits1"/>
              <el-option label="妖灵币" value="extcredits2"/>
              <el-option label="值钱玉佩" value="extcredits3"/>
              <el-option label="天明珠" value="extcredits4"/>
            </el-select>
          </el-form-item>
          <el-form-item label="购买价格"><el-input-number v-model="form.creditPrice" :min="1"/></el-form-item>
        </template>
        <el-form-item label="状态"><el-switch v-model="form.statusBool"/></el-form-item>
      </el-form>
      <template #footer><el-button @click="dlg=false">取消</el-button><el-button type="primary" @click="submit">{{isEdit?'更新':'添加'}}</el-button></template>
    </el-dialog>
    <el-dialog v-model="grantDlg" title="发放勋章" width="400px">
      <el-form label-width="80px"><el-form-item label="用户UIDs"><el-input v-model="grantForm.uids" placeholder="多个用逗号分隔"/></el-form-item></el-form>
      <template #footer><el-button @click="grantDlg=false">取消</el-button><el-button type="primary" @click="submitGrant">发放</el-button></template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { ref, reactive, defineComponent } from "vue";
import { GetAdminMedalListAPI, InsertMedalAPI, UpdateMedalAPI, DeleteMedalAPI, GrantMedalAPI } from "@/api/index";
import { ElMessage, ElMessageBox } from "element-plus";
export default defineComponent({
  name:"admin-medal",setup(){
    const loading=ref(true),list=ref<any>({records:[]}),dlg=ref(false),isEdit=ref(false),grantDlg=ref(false);
    const form=reactive<any>({name:"",description:"",imageUrl:"",categoryId:1,conditionDesc:"",regdateBefore:null,acquireType:"manual",creditType:"extcredits2",creditPrice:10,statusBool:true});
    const grantForm=reactive({medalId:0,uids:""});
    const fetch=async()=>{loading.value=true;const r=await GetAdminMedalListAPI();if(r.status===200)list.value=r.data;loading.value=false};
    const showAdd=()=>{isEdit.value=false;Object.assign(form,{id:undefined,name:"",description:"",imageUrl:"",categoryId:1,conditionDesc:"",regdateBefore:null,acquireType:"manual",creditType:"extcredits2",creditPrice:10,statusBool:true});dlg.value=true};
    const showEdit=(row:any)=>{isEdit.value=true;Object.assign(form,{...row,statusBool:row.status===1,acquireType:row.acquireType||'manual',creditType:row.creditType||'extcredits2',creditPrice:row.creditPrice||0,regdateBefore:row.regdateBefore||null});dlg.value=true};
    const showGrant=(row:any)=>{grantForm.medalId=row.id;grantForm.uids="";grantDlg.value=true};
    const submit=async()=>{const d={...form,status:form.statusBool?1:0};const r=isEdit.value?await UpdateMedalAPI(d):await InsertMedalAPI(d);if(r.status===200){ElMessage.success(String(r.msg||"成功"));dlg.value=false;fetch()}else ElMessage.error(String(r.msg||"失败"))};
    const submitGrant=async()=>{const r=await GrantMedalAPI(grantForm);if(r.status===200){ElMessage.success(String(r.msg||"成功"));grantDlg.value=false}else ElMessage.error(String(r.msg||"失败"))};
    const handleDelete=(id:number)=>{ElMessageBox.confirm("确定删除?","提示",{type:"warning"}).then(async()=>{await DeleteMedalAPI(id);fetch()})};
    fetch();return{loading,list,dlg,isEdit,form,grantDlg,grantForm,showAdd,showEdit,showGrant,submit,submitGrant,handleDelete};
  }
});
</script>
<style scoped>.admin-medal{padding:20px}.page-header{display:flex;justify-content:space-between;margin-bottom:16px}h2{margin:0;font-size:18px}</style>
