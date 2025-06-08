// ==================== 核心功能模块 ====================

// 通知系统
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// 工具组展开/折叠功能
function initToolGroups() {
    const toolTitles = document.querySelectorAll('.tool-title[data-toggle="collapse"]');
    
    toolTitles.forEach(title => {
        title.addEventListener('click', () => {
            const content = title.nextElementSibling;
            const isCollapsed = title.classList.contains('collapsed');
            
            // 切换当前工具组的状态
            title.classList.toggle('collapsed');
            content.classList.toggle('collapsed');
            
            // 保存状态到本地存储
            const groupName = title.textContent.trim();
            localStorage.setItem(`toolGroup_${groupName}`, isCollapsed ? 'expanded' : 'collapsed');
        });
        
        // 恢复保存的状态
        const groupName = title.textContent.trim();
        const savedState = localStorage.getItem(`toolGroup_${groupName}`);
        if (savedState === 'collapsed') {
            title.classList.add('collapsed');
            title.nextElementSibling.classList.add('collapsed');
        }
    });
}

// 工具切换功能
function initToolSwitcher() {
    const toolBtns = document.querySelectorAll('.tool-btn');
    const toolPanels = document.querySelectorAll('.tool-panel');

    toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tool = btn.dataset.tool;
            
            // 更新按钮状态
            toolBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 更新面板显示
            toolPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === tool + 'Panel') {
                    panel.classList.add('active');
                }
            });
            
            // 保存当前活动面板
            if (typeof saveActivePanel === 'function') {
                saveActivePanel(tool);
            }
        });
    });
}

// 初始化核心功能
function initCore() {
    initToolGroups();
    initToolSwitcher();
} 