// ==================== 主入口文件 ====================

// 当DOM加载完成后初始化所有模块
document.addEventListener('DOMContentLoaded', function() {
    try {
        // 1. 初始化核心功能
        if (typeof initCore === 'function') {
            initCore();
        }
        
        // 2. 初始化数据持久化
        if (typeof initPersistence === 'function') {
            initPersistence();
        }
        
        // 3. 初始化JSON工具
        if (typeof initJsonTools === 'function') {
            initJsonTools();
        }
        
        // 4. 初始化Base64工具
        if (typeof initBase64Tools === 'function') {
            initBase64Tools();
        }
        
        // 5. 初始化时间工具
        if (typeof initTimeTools === 'function') {
            initTimeTools();
        }
        
        // 6. 初始化Cron工具
        if (typeof initCronTools === 'function') {
            initCronTools();
        }
        
        // 7. 初始化Go工具
        if (typeof initGoTools === 'function') {
            initGoTools();
        }
        
        // 8. 初始化Java工具
        if (typeof initJavaTools === 'function') {
            initJavaTools();
        }
        
        // 9. 显示首次使用帮助
        if (typeof showFirstTimeHelp === 'function') {
            showFirstTimeHelp();
        }
        
        console.log('所有模块初始化完成');
        
    } catch (error) {
        console.error('模块初始化失败:', error);
    }
}); 



