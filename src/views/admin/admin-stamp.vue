<template>
  <div class="admin-stamp">
    <div class="page-header"><h2>图章管理</h2><el-button type="primary" @click="showAdd">添加图章</el-button></div>
    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="ID" prop="id" width="50"/>
      <el-table-column label="名称" prop="name" min-width="100"/>
      <el-table-column label="图片" width="100"><template #default="s"><el-image v-if="s.row.imageUrl" :src="s.row.imageUrl" style="width:40px;height:40px" fit="contain"/></template></el-table-column>
      <el-table-column label="排序" prop="displayOrder" width="60"/>
      <el-table-column label="状态" width="70"><template #default="s"><el-tag :type="s.row.status===1?'success':'info'" size="small">{{ s.row.status===1?'启用':'禁用' }}</el-tag></template></el-table-column>
      <el-table-column label="操作" width="140">
        <template #default="s"><el-button size="small" @click="showEdit(s.row)">编辑</el-button><el-button size="small" type="danger" @click="handleDelete(s.row.id)">删除</el-button></template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dlg" :title="isEdit?'编辑图章':'添加图章'" width="450px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称"><el-input v-model="form.name"/></el-form-item>
        <el-form-item label="图片URL"><el-input v-model="form.imageUrl"/></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.displayOrder" :min="0"/></el-form-item>
        <el-form-item label="状态"><el-switch v-model="form.statusBool"/></el-form-item>
      </el-form>
      <template #footer><el-button @click="dlg=false">取消</el-button><el-button type="primary" @click="submit">{{isEdit?'更新':'添加'}}</el-button></template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { ref, reactive, defineComponent } from "vue";
import { GetStampListAPI, InsertStampAPI, UpdateStampAPI, DeleteStampAPI } from "@/api/index";
import { ElMessage, ElMessageBox } from "element-plus";
export default defineComponent({
  name:"admin-stamp",setup(){
    const loading=ref(true),list=ref<any[]>([]),dlg=ref(false),isEdit=ref(false);
    const form=reactive<any>({name:"",imageUrl:"",displayOrder:0,statusBool:true});
    const fetch=async()=>{loading.value=true;const r=await GetStampListAPI();if(r.status===200)list.value=r.data;loading.value=false};
    const showAdd=()=>{isEdit.value=false;Object.assign(form,{id:undefined,name:"",imageUrl:"",displayOrder:0,statusBool:true});dlg.value=true};
    const showEdit=(row:any)=>{isEdit.value=true;Object.assign(form,{...row,statusBool:row.status===1});dlg.value=true};
    const submit=async()=>{const d={...form,status:form.statusBool?1:0};const r=isEdit.value?await UpdateStampAPI(d):await InsertStampAPI(d);if(r.status===200){ElMessage.success(String(r.msg||"成功"));dlg.value=false;fetch()}else ElMessage.error(String(r.msg||"失败"))};
    const handleDelete=(id:number)=>{ElMessageBox.confirm("确定删除?","提示",{type:"warning"}).then(async()=>{await DeleteStampAPI(id);fetch()})};
    fetch();return{loading,list,dlg,isEdit,form,showAdd,showEdit,submit,handleDelete};
  }
});
</script>
<style scoped>.admin-stamp{padding:20px}.page-header{display:flex;justify-content:space-between;margin-bottom:16px}h2{margin:0;font-size:18px}</style>
