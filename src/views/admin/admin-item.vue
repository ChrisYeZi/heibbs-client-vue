<template>
  <div class="admin-item">
    <div class="page-header"><h2>物品管理</h2><el-button type="primary" @click="showAdd">添加物品</el-button></div>
    <el-table v-loading="loading" :data="list.records" border stripe>
      <el-table-column label="ID" prop="id" width="50"/>
      <el-table-column label="图片" width="60"><template #default="s"><el-image v-if="s.row.icon" :src="s.row.icon" style="width:36px;height:36px;border-radius:4px" fit="cover"/></template></el-table-column>
      <el-table-column label="名称" prop="name" min-width="100"/>
      <el-table-column label="类型" prop="type" width="80"/><el-table-column label="稀有度" width="70"><template #default="s">{{ ['普通','稀有','史诗','传说'][s.row.rarity||0] }}</template></el-table-column>
      <el-table-column label="价格" prop="price" width="70"/><el-table-column label="操作" width="200">
        <template #default="s">
          <el-button size="small" @click="showEdit(s.row)">编辑</el-button>
          <el-button size="small" @click="showGrant(s.row)">发放</el-button>
          <el-button size="small" type="danger" @click="handleDelete(s.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dlg" :title="isEdit?'编辑物品':'添加物品'" width="560px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="名称"><el-input v-model="form.name"/></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea"/></el-form-item>
        <el-form-item label="图标URL"><el-input v-model="form.icon"/></el-form-item>
        <el-form-item label="类型"><el-select v-model="form.type"><el-option v-for="t in ['consumable','cosmetic','currency']" :key="t" :label="t" :value="t"/></el-select></el-form-item>
        <el-form-item label="稀有度"><el-input-number v-model="form.rarity" :min="0" :max="3"/></el-form-item>
        <el-form-item label="价格"><el-input-number v-model="form.price" :min="0"/></el-form-item>
        <el-divider>系统售卖</el-divider>
        <el-form-item label="开启系统售卖"><el-switch v-model="form.sysSellBool" :active-value="1" :inactive-value="0"/></el-form-item>
        <el-form-item label="售卖价格" v-if="form.sysSellBool"><el-input-number v-model="form.sysSellPrice" :min="0"/></el-form-item>
        <el-form-item label="售卖限制" v-if="form.sysSellBool">
          <el-select v-model="form.sysSellLimitType" style="width:120px">
            <el-option label="无限制" value="unlimited"/>
            <el-option label="每人每日" value="daily"/><el-option label="每人每周" value="weekly"/><el-option label="每人每月" value="monthly"/>
            <el-option label="全员每日" value="daily_all"/><el-option label="全员每周" value="weekly_all"/><el-option label="全员每月" value="monthly_all"/>
          </el-select>
          <el-input-number v-if="form.sysSellLimitType&&form.sysSellLimitType!=='unlimited'" v-model="form.sysSellLimitQty" :min="1" style="margin-left:8px;width:100px" placeholder="数量"/>
        </el-form-item>
        <el-divider>系统收购</el-divider>
        <el-form-item label="开启系统收购"><el-switch v-model="form.sysBuyBool" :active-value="1" :inactive-value="0"/></el-form-item>
        <el-form-item label="收购价格" v-if="form.sysBuyBool"><el-input-number v-model="form.sysBuyPrice" :min="0"/></el-form-item>
        <el-form-item label="收购限制" v-if="form.sysBuyBool">
          <el-select v-model="form.sysBuyLimitType" style="width:120px">
            <el-option label="无限制" value="unlimited"/>
            <el-option label="每人每日" value="daily"/><el-option label="每人每周" value="weekly"/><el-option label="每人每月" value="monthly"/>
            <el-option label="全员每日" value="daily_all"/><el-option label="全员每周" value="weekly_all"/><el-option label="全员每月" value="monthly_all"/>
          </el-select>
          <el-input-number v-if="form.sysBuyLimitType&&form.sysBuyLimitType!=='unlimited'" v-model="form.sysBuyLimitQty" :min="1" style="margin-left:8px;width:100px" placeholder="数量"/>
        </el-form-item>
      </el-form>
      <template #footer><el-button @click="dlg=false">取消</el-button><el-button type="primary" @click="submit">{{isEdit?'更新':'添加'}}</el-button></template>
    </el-dialog>
    <el-dialog v-model="grantDlg" title="发放物品" width="400px">
      <el-form label-width="80px"><el-form-item label="数量"><el-input-number v-model="grantForm.quantity" :min="1"/></el-form-item><el-form-item label="用户UIDs"><el-input v-model="grantForm.uids" placeholder="多个用逗号分隔，如: 1,2,3"/></el-form-item></el-form>
      <template #footer><el-button @click="grantDlg=false">取消</el-button><el-button type="primary" @click="submitGrant">发放</el-button></template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { ref, reactive, defineComponent } from "vue";
import { GetAdminItemListAPI, InsertItemAPI, UpdateItemAPI, DeleteItemAPI, GrantItemAPI } from "@/api/index";
import { ElMessage, ElMessageBox } from "element-plus";
export default defineComponent({
  name:"admin-item",setup(){
    const loading=ref(true),list=ref<any>({records:[]}),dlg=ref(false),isEdit=ref(false),grantDlg=ref(false);
    const form=reactive<any>({name:"",description:"",icon:"",type:"consumable",rarity:0,price:0,
      sysSellBool:0,sysSellPrice:0,sysSellLimitType:"unlimited",sysSellLimitQty:0,
      sysBuyBool:0,sysBuyPrice:0,sysBuyLimitType:"unlimited",sysBuyLimitQty:0});
    const grantForm=reactive({itemId:0,quantity:1,uids:""});
    const fetch=async()=>{loading.value=true;const r=await GetAdminItemListAPI();if(r.status===200)list.value=r.data;loading.value=false};
    const showAdd=()=>{isEdit.value=false;Object.assign(form,{id:undefined,name:"",description:"",icon:"",type:"consumable",rarity:0,price:0,
      sysSellBool:0,sysSellPrice:0,sysSellLimitType:"unlimited",sysSellLimitQty:0,
      sysBuyBool:0,sysBuyPrice:0,sysBuyLimitType:"unlimited",sysBuyLimitQty:0});dlg.value=true};
    const showEdit=(row:any)=>{isEdit.value=true;Object.assign(form,{
      ...row,
      sysSellBool:row.sysSell||0, sysBuyBool:row.sysBuy||0,
      sysSellPrice:row.sysSellPrice||0, sysSellLimitType:row.sysSellLimitType||'unlimited', sysSellLimitQty:row.sysSellLimitQty||0,
      sysBuyPrice:row.sysBuyPrice||0, sysBuyLimitType:row.sysBuyLimitType||'unlimited', sysBuyLimitQty:row.sysBuyLimitQty||0
    });dlg.value=true};
    const showGrant=(row:any)=>{grantForm.itemId=row.id;grantForm.quantity=1;grantForm.uids="";grantDlg.value=true};
    const submit=async()=>{const d={...form,sysSell:form.sysSellBool||0,sysBuy:form.sysBuyBool||0};const r=isEdit.value?await UpdateItemAPI(d):await InsertItemAPI(d);if(r.status===200){ElMessage.success(String(r.data||"成功"));dlg.value=false;fetch()}else ElMessage.error(String(r.data||"失败"))};
    const submitGrant=async()=>{const r=await GrantItemAPI(grantForm);if(r.status===200){ElMessage.success(String(r.data||"成功"));grantDlg.value=false}else ElMessage.error(String(r.data||"失败"))};
    const handleDelete=(id:number)=>{ElMessageBox.confirm("确定删除?","提示",{type:"warning"}).then(async()=>{await DeleteItemAPI(id);fetch()})};
    fetch();return{loading,list,dlg,isEdit,form,grantDlg,grantForm,showAdd,showEdit,showGrant,submit,submitGrant,handleDelete};
  }
});
</script>
<style scoped>.admin-item{padding:20px}.page-header{display:flex;justify-content:space-between;margin-bottom:16px}h2{margin:0;font-size:18px}</style>
