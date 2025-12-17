<script setup lang="ts">
    import { computed } from 'vue'
    import { regionData, codeToText } from 'element-china-area-data'
    
    const props = defineProps<{
      modelValue?: string[]
    }>()
    
    const emit = defineEmits(['update:modelValue', 'change'])
    
    const value = computed({
      get: () => props.modelValue || [],
      set: (val: string[]) => {
        emit('update:modelValue', val)
    
        const [p, c, d] = val
        emit('change', {
          province: codeToText[p || ''],
          city: codeToText[c || ''],
          district: codeToText[d || '']
        })
      }
    })
    </script>
    
    <template>
      <el-cascader
        v-model="value"
        :options="regionData"
        clearable
        filterable
        placeholder="请选择省 / 市 / 区"
        popper-class="china-area-popper"
      />
    </template>
    
    <style>
    .china-area-popper {
      z-index: 3000 !important;
    }
    </style>
    