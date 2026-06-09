<template>
  <div class="admin-credit">
    <h2 class="page-title">积分管理</h2>
    <el-tabs v-model="activeTab">
      <!-- Tab1: 积分定义 -->
      <el-tab-pane label="积分定义" name="defs">
        <el-table :data="defs" border stripe size="small">
          <el-table-column label="ID" prop="id" width="50"/>
          <el-table-column label="变量名" prop="extcredits" width="100"/>
          <el-table-column label="名称">
            <template #default="s"><el-input v-model="s.row.extcreditsName" size="small"/></template>
          </el-table-column>
          <el-table-column label="描述">
            <template #default="s"><el-input v-model="s.row.extcreditsDescription" size="small"/></template>
          </el-table-column>
          <el-table-column label="启用" width="70">
            <template #default="s"><el-switch v-model="s.row.extcreditsEnable" size="small"/></template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="s"><el-button size="small" type="primary" @click="saveDef(s.row)">保存</el-button></template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- Tab2: 评分规则 -->
      <el-tab-pane label="评分规则" name="rules">
        <el-button type="primary" size="small" @click="addRule" style="margin-bottom:10px">新增规则</el-button>
        <el-table :data="rules" border stripe size="small" style="width:100%">
          <el-table-column label="ID" prop="id" width="50"/>
          <el-table-column label="用户组" width="90">
            <template #default="s"><el-input v-model="s.row.group" size="small"/></template>
          </el-table-column>
          <el-table-column label="类型" width="100">
            <template #default="s">
              <el-select v-model="s.row.type" size="small"><el-option :value="1" label="上限"/><el-option :value="2" label="下限"/><el-option :value="3" label="单次最大额"/></el-select>
            </template>
          </el-table-column>
          <el-table-column label="灵气" width="80"><template #default="s"><el-input-number v-model="s.row.extcredits1" size="small" :min="0"/></template></el-table-column>
          <el-table-column label="妖灵币" width="80"><template #default="s"><el-input-number v-model="s.row.extcredits2" size="small" :min="0"/></template></el-table-column>
          <el-table-column label="值钱玉佩" width="80"><template #default="s"><el-input-number v-model="s.row.extcredits3" size="small" :min="0"/></template></el-table-column>
          <el-table-column label="天明珠" width="80"><template #default="s"><el-input-number v-model="s.row.extcredits4" size="small" :min="0"/></template></el-table-column>
          <el-table-column label="操作" width="140">
            <template #default="s">
              <el-button size="small" type="primary" @click="saveRule(s.row)">保存</el-button>
              <el-button size="small" type="danger" @click="delRule(s.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- Tab3: 发放积分 -->
      <el-tab-pane label="发放积分" name="grant">
        <el-form label-width="80px" style="max-width:500px">
          <el-form-item label="用户UIDs"><el-input v-model="grant.uids" placeholder="多个用逗号分隔，如: 1,2,3"/></el-form-item>
          <el-form-item label="灵气"><el-input-number v-model="grant.extcredits1" :min="0"/></el-form-item>
          <el-form-item label="妖灵币"><el-input-number v-model="grant.extcredits2" :min="0"/></el-form-item>
          <el-form-item label="值钱玉佩"><el-input-number v-model="grant.extcredits3" :min="0"/></el-form-item>
          <el-form-item label="天明珠"><el-input-number v-model="grant.extcredits4" :min="0"/></el-form-item>
          <el-form-item><el-button type="primary" @click="doGrant">发放</el-button></el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { ref, reactive, defineComponent, onMounted } from "vue";
import { GetCreditDefsAPI, UpdateCreditDefAPI, GetCreditRulesAPI, UpdateCreditRuleAPI, InsertCreditRuleAPI, DeleteCreditRuleAPI, GrantCreditsAPI } from "@/api/index";
import { ElMessage, ElMessageBox } from "element-plus";

export default defineComponent({
  name:"admin-credit",
  setup(){
    const activeTab=ref("defs"), defs=ref<any[]>([]), rules=ref<any[]>([]);
    const grant=reactive({uids:"",extcredits1:0,extcredits2:0,extcredits3:0,extcredits4:0});

    const fetchDefs=async()=>{const r=await GetCreditDefsAPI();if(r.status===200)defs.value=r.data};
    const fetchRules=async()=>{const r=await GetCreditRulesAPI();if(r.status===200)rules.value=r.data};
    const saveDef=async(row:any)=>{const r=await UpdateCreditDefAPI(row);ElMessage[r.status===200?'success':'error'](String(r.data||''))};
    const saveRule=async(row:any)=>{const r=await UpdateCreditRuleAPI(row);ElMessage[r.status===200?'success':'error'](String(r.data||''))};
    const addRule=async()=>{const r=await InsertCreditRuleAPI({group:"新用户组",type:1,extcredits1:0,extcredits2:0,extcredits3:0,extcredits4:0,extcredits5:0,extcredits6:0,extcredits7:0,extcredits8:0});if(r.status===200)fetchRules()};
    const delRule=async(id:number)=>{try{await ElMessageBox.confirm("确定删除?")}catch{return};await DeleteCreditRuleAPI(id);fetchRules()};
    const doGrant=async()=>{const r=await GrantCreditsAPI(grant);ElMessage[r.status===200?'success':'error'](String(r.data||''))};

    onMounted(()=>{fetchDefs();fetchRules()});
    return {activeTab,defs,rules,grant,saveDef,saveRule,addRule,delRule,doGrant};
  }
});
</script>
<style scoped>
.admin-credit{padding:20px}
.page-title{font-size:18px;margin-bottom:16px}
</style>
