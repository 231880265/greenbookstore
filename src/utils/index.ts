// 类别映射表
const categoryMap: Record<string, string> = {
    DILI: '地理',
    FALV: '法律',
    JINGJI: '经济',
    LISHI: '历史',
    SHEKE: '社科',
    SHENGHUO: '生活',
    WENXUE: '文学',
    YISHU: '艺术',
    ZHENGZHI: '政治',
    ZHEXUEXINLIXUE: '哲学心理学',
    OTHER: '其他'
};

/**
 * 将类别值转换为对应的中文名称
 * @param category 类别英文值
 * @returns 类别中文名称，如果未找到则返回"未知类别"
 */
export function getCategoryName(category: string): string {
    return categoryMap[category] || '未知类别';
}




