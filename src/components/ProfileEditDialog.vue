<template>
    <teleport to="body">
      <div
        v-if="visible"
        class="profile-edit-mask"
        @click.self="visible = false"
      >
        <div class="profile-edit-panel">
          <!-- Header -->
          <div class="header">
            <h2>个人资料</h2>
            <button class="close" @click="visible = false">✕</button>
          </div>
  
          <!-- Body -->
          <div class="body">
            <!-- 头像 -->
            <div class="avatar-section">
              <label class="avatar-uploader">
                <img
                  :src="form.avatar || 'https://wonderful1.oss-cn-hangzhou.aliyuncs.com/leaf.jpg'"
                  class="avatar"
                />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  @change="e => handleAvatarSelect((e.target as HTMLInputElement).files?.[0] as File)"
                />
                <span class="overlay">更换头像</span>
              </label>
            </div>
  
            <!-- 表单 -->
            <div class="form">
              <div class="row">
                <label>用户名</label>
                <input v-model="form.username" />
              </div>

              <div class="row">
                <label>手机号</label>
                <input v-model="form.telephone" />
              </div>

              <div class="row">
                <label>新密码</label>
                <input
                  v-model="form.password"
                  type="password"
                  placeholder="留空则不修改"
                />
              </div>
            </div>
          </div>
  
          <!-- Footer -->
          <div class="footer">
            <button class="cancel" @click="handleCancel">
              取消
            </button>
            <button
              class="save"
              :disabled="uploading"
              @click="handleSave"
            >
              保存
            </button>
          </div>
        </div>
        </div>
    </teleport>
  </template>
<script setup lang="ts">
    import { ref, reactive } from 'vue'
    import { ElMessage } from 'element-plus'
    import {
      getCurrentUser,
      updateUserInfo,
      uploadImage
    } from '@/api'
    import type { UserDetail } from '@/api/types'
    
    const visible = ref(false)
    const uploading = ref(false)
    
    /**
     * 表单数据
     */
    const form = reactive({
      username: '',
      telephone: '',
      password: '',
      avatar: ''
    })
    
    /**
     * 原始数据（用于取消时恢复）
     */
    const originalData = reactive({
      telephone: '',
      avatar: ''
    })
    
    /**
     * 打开弹窗并初始化数据
     */
    const open = async () => {
      visible.value = true
    
      const res = await getCurrentUser()
      const user = res.data as UserDetail
      console.log("user", user)
    
      // 填充表单数据
      form.username = user.username
      form.telephone = user.telephone || ''
      form.avatar = user.avatar || ''
      form.password = ''
    
      // 保存原始数据
      originalData.telephone = form.telephone
      originalData.avatar = form.avatar
    }
    
    defineExpose({ open })
    
    const emit = defineEmits<{
      saved: []
    }>()
    
    /**
     * 头像上传
     */
    const handleAvatarSelect = async (file: File) => {
      uploading.value = true
      try {
        const res = await uploadImage(file)
        form.avatar = res.data
      } catch {
        ElMessage.error('头像上传失败')
      } finally {
        uploading.value = false
      }
    }
    
    /**
     * 取消（不保存并关闭弹窗）
     */
    const handleCancel = () => {
      visible.value = false
    }
    
    /**
     * 保存
     */
    const handleSave = async () => {
      const payload: any = { username: form.username }
    
      if (form.password) payload.password = form.password
      payload.telephone = form.telephone
      payload.avatar = form.avatar
    
      await updateUserInfo(payload)
    
      ElMessage.success('个人信息已更新')
    
      // 更新原始数据
      originalData.telephone = form.telephone
      originalData.avatar = form.avatar
    
      visible.value = false
      emit('saved')
    }
    </script>
<style scoped>
    .profile-edit-mask {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 5000;
    }
    
    .profile-edit-panel {
      width: 880px;
      background: #fff;
      border-radius: 20px;
      overflow: hidden;
    }
    
    /* Header */
    .header {
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #eee;
    }
    
    .close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
    }
    
    /* Body */
    .body {
      display: flex;
      padding: 32px;
      gap: 36px;
    }
    
    /* Avatar */
    .avatar-section {
      width: 160px;
      height: 160px;
      border: 1px solid #2d583f;
      border-radius: 16px;
      padding: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .avatar-uploader {
      position: relative;
      cursor: pointer;
    }
    
    .avatar {
      width: 160px;
      height: 160px;
      border-radius: 16px;
      object-fit: cover;
    }
    
    .overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      border-radius: 16px;
    }
    
    .avatar-uploader:hover .overlay {
      opacity: 1;
    }
    
    /* Form */
    .form {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .row {
      display: flex;
      flex-direction: column;
    }
    
    .row label {
      font-weight: 500;
      margin-bottom: 6px;
      color: #333;
    }
    
    /* ===== 核心：查看态 vs 编辑态 ===== */
    
    .row input {
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid #ddd;
      transition: all 0.2s ease;
    }
    
    /* 查看态（灰底信息态） */
    .row input:disabled {
      background-color: #f5f5f5;
      color: #666;
      border-color: #e0e0e0;
      cursor: default;
    }
    
    /* 编辑态（可编辑） */
    .row input:not(:disabled) {
      background-color: #fff;
      color: #333;
      border-color: #2d583f;
    }
    
    .row input:not(:disabled):focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(45, 88, 63, 0.15);
    }
    
    /* Footer */
    .footer {
      padding: 16px 24px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    
    .cancel {
      background: #fff;
      border: 1px solid #ddd;
      padding: 8px 20px;
      border-radius: 10px;
      cursor: pointer;
    }
    
    .save {
      background: #2d583f;
      color: #fff;
      padding: 8px 24px;
      border-radius: 10px;
      border: none;
      cursor: pointer;
    }
    
    .save:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    </style>
          