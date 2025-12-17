<script setup lang="ts">
    import { ref, computed } from 'vue'
    import { ElMessage, ElMessageBox } from 'element-plus'
    import {
      getAddressList,
      createAddress,
      updateAddress,
      deleteAddress
    } from '@/api'
    import type { AddressItem } from '@/api/types'
    import ChinaAreaCascader from '@/components/ChinaAreaCascader.vue'
    
    const visible = ref(false)
    const mode = ref<'list' | 'form'>('list')
    const list = ref<AddressItem[]>([])
    const editingId = ref<number | null>(null)
    const defaultAddressId = ref<number | null>(null)
    
    /* 表单 */
    const form = ref({
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: ''
    })
    
    /* cascader */
    const areaCodes = ref<string[]>([])
    
    const onAreaChange = (area: {
      province: string
      city: string
      district: string
    }) => {
      form.value.province = area.province
      form.value.city = area.city
      form.value.district = area.district
    }
    
    /* 默认地址排在最前 */
    const sortedList = computed(() => {
      return [...list.value].sort(
        (a, b) => {
          if (a.id === defaultAddressId.value) return -1
          if (b.id === defaultAddressId.value) return 1
          return 0
        }
      )
    })
    
    /* 打开 */
    const open = async () => {
      visible.value = true
      mode.value = 'list'
      const res = await getAddressList()
      list.value = res.data || []
      // 初始化：如果列表不为空且没有默认地址，设置第一项为默认
      if (list.value.length > 0 && !defaultAddressId.value) {
        defaultAddressId.value = list.value[0]!.id
      }
    }
    defineExpose({ open })
    
    /* 关闭（叉叉 / 取消） */
    const closeDialog = () => {
      visible.value = false
      mode.value = 'list'
    }
    
    /* 新增 */
    const handleAdd = () => {
      editingId.value = null
      form.value = {
        name: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detail: ''
      }
      areaCodes.value = []
      mode.value = 'form'
    }
    
    /* 编辑 */
    const handleEdit = (item: AddressItem) => {
      editingId.value = item.id
      form.value = {
        name: item.name,
        phone: item.phone,
        province: item.province,
        city: item.city || '',
        district: item.district || '',
        detail: item.detail || ''
      }
      areaCodes.value = []
      mode.value = 'form'
    }
    
    /* 删除（确认） */
    const handleDelete = async (id: number) => {
      await ElMessageBox.confirm(
        '确定删除该地址吗？',
        '提示',
        { type: 'warning' }
      )
      await deleteAddress(id)
      ElMessage.success('删除成功')
      const res = await getAddressList()
      list.value = res.data
    }
    
    /* 设置默认地址 */
    const setDefault = (id: number | null) => {
      if (id) {
        ElMessage.success('已设为默认地址')
      }
    }
    
    /* 保存 */
    const handleSave = async () => {
      if (!form.value.name || !form.value.phone) {
        ElMessage.warning('请填写完整信息')
        return
      }
    
      if (editingId.value) {
        await updateAddress(editingId.value, form.value)
        ElMessage.success('更新成功')
      } else {
        await createAddress(form.value)
        ElMessage.success('新增成功')
      }
    
      mode.value = 'list'
      const res = await getAddressList()
      list.value = res.data || []
      // 如果是新增，且之前没有默认地址，设置新地址为默认
      if (!editingId.value && list.value.length > 0 && !defaultAddressId.value) {
        defaultAddressId.value = list.value[list.value.length - 1]!.id
      }
      // 如果编辑后默认地址不存在了，重新设置
      if (list.value.length > 0 && defaultAddressId.value && !list.value.find(item => item.id === defaultAddressId.value)) {
        defaultAddressId.value = list.value[0]!.id
      }
    }
    </script>
    
    <template>
      <el-dialog
        v-model="visible"
        title="地址管理"
        width="520px"
        @close="closeDialog"
      >
        <!-- 地址列表 -->
        <div v-if="mode === 'list'">
          <el-card
            v-for="item in sortedList"
            :key="item.id"
            class="address-card"
            shadow="never"
          >
            <div class="top">
              <div>
                <span class="name">{{ item.name }}</span>
                <span class="phone">{{ item.phone }}</span>
              </div>
              <el-radio-group v-model="defaultAddressId" @change="() => setDefault(defaultAddressId)">
                <el-radio :label="item.id">
                  默认地址
                </el-radio>
              </el-radio-group>
            </div>
    
            <div class="addr">
              {{ item.province }} {{ item.city }} {{ item.district }}
              {{ item.detail }}
            </div>
    
            <div class="actions">
              <el-button text size="small" @click="handleEdit(item)" class="action-btn">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                编辑
              </el-button>
              <el-button
                text
                size="small"
                type="danger"
                @click="handleDelete(item.id)"
                class="action-btn"
              >
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                删除
              </el-button>
            </div>
          </el-card>
    
          <el-button type="primary" plain class="add-btn" @click="handleAdd">
            + 新增地址
          </el-button>
        </div>
    
        <!-- 表单 -->
        <div v-else>
          <el-form :model="form" label-width="80px">
            <el-form-item label="姓名">
              <el-input v-model="form.name" />
            </el-form-item>
            <el-form-item label="手机">
              <el-input v-model="form.phone" />
            </el-form-item>
            <el-form-item label="省市区">
              <ChinaAreaCascader
                v-model="areaCodes"
                @change="onAreaChange"
              />
            </el-form-item>
            <el-form-item label="详情">
              <el-input v-model="form.detail" />
            </el-form-item>
          </el-form>
        </div>
    
        <template #footer>
          <!-- 列表模式：只有确定按钮 -->
          <div v-if="mode === 'list'" style="text-align: right;">
            <el-button type="primary" @click="closeDialog">确定</el-button>
          </div>
          <!-- 表单模式：只有保存按钮 -->
          <div v-else style="text-align: right;">
            <el-button type="primary" @click="handleSave">保存</el-button>
          </div>
        </template>
      </el-dialog>
    </template>
    
    <style scoped>
    .address-card {
      margin-bottom: 12px;
    }
    .top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .name {
      font-weight: 500;
    }
    .phone {
      margin-left: 8px;
      color: #666;
    }
    .addr {
      margin: 6px 0;
      color: #666;
    }
    .actions {
      text-align: right;
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
    .action-btn {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .action-btn .icon {
      width: 14px;
      height: 14px;
      color: #999;
      margin-right: 4px;
    }
    .action-btn:hover .icon {
      color: #666;
    }
    .el-button--danger.action-btn .icon {
      color: #f56c6c;
    }
    .el-button--danger.action-btn:hover .icon {
      color: #f56c6c;
    }
    .add-btn {
      width: 100%;
      margin-top: 12px;
    }
    </style>
    