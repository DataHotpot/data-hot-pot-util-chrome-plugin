// ==================== 数据持久化功能 ====================

// 需要保存的输入框和配置项
const persistentElements = {
    // JSON工具
    'jsonInput': 'textarea',
    
    // JSON对比
    'originalJson': 'textarea',
    'targetJson': 'textarea',
    
    // Base64
    'base64Input': 'textarea',
    'base64Output': 'textarea',
    
    // 时间工具
    'timezone': 'select',
    'timestamp': 'input',
    'datetime': 'input',
    'timestampFormat': 'checkbox',
    
    // Cron表达式
    'cronInput': 'input',
    
    // Go工具
    'goJsonInput': 'textarea',
    'goStructOutput': 'textarea',
    'goStructTags': 'select',
    'usePointer': 'checkbox',
    'goTimeFormat': 'select',
    'goErrorInput': 'textarea',
    'goErrorOutput': 'textarea',
    'errorHandleType': 'select',
    'goStructInput': 'textarea',
    'goInterfaceOutput': 'textarea',
    'includeComments': 'checkbox',
    
    // Java工具
    'javaJsonInput': 'textarea',
    'javaBeanOutput': 'textarea',
    'javaBeanOptions': 'select',
    'generateComments': 'checkbox',
    'javaClassInput': 'textarea',
    'javaBuilderOutput': 'textarea',
    'builderInnerClass': 'checkbox',
    'builderFluentStyle': 'checkbox',
    'javaLombokInput': 'textarea',
    'javaLombokOutput': 'textarea',
    'streamExampleType': 'select'
};

// 保存数据到本地存储
function saveToStorage(key, value) {
    try {
        localStorage.setItem(`dataHotPot_${key}`, value);
    } catch (e) {
        console.warn('保存数据失败:', e);
    }
}

// 从本地存储读取数据
function loadFromStorage(key, defaultValue = '') {
    try {
        return localStorage.getItem(`dataHotPot_${key}`) || defaultValue;
    } catch (e) {
        console.warn('读取数据失败:', e);
        return defaultValue;
    }
}

// 保存元素状态
function saveElementState(elementId, element) {
    if (!element) return;
    
    const elementType = persistentElements[elementId];
    let value;
    
    switch (elementType) {
        case 'textarea':
        case 'input':
            value = element.value;
            break;
        case 'select':
            value = element.value;
            break;
        case 'checkbox':
            value = element.checked.toString();
            break;
        default:
            return;
    }
    
    saveToStorage(elementId, value);
    
    // 显示保存状态指示器
    showSaveIndicator();
}

// 显示保存状态指示器
function showSaveIndicator() {
    const dataStatus = document.querySelector('.data-status');
    if (dataStatus) {
        dataStatus.classList.add('saving');
        setTimeout(() => {
            dataStatus.classList.remove('saving');
        }, 1000);
    }
}

// 恢复元素状态
function restoreElementState(elementId, element) {
    if (!element) return;
    
    const elementType = persistentElements[elementId];
    const savedValue = loadFromStorage(elementId);
    
    if (!savedValue) return;
    
    switch (elementType) {
        case 'textarea':
        case 'input':
            element.value = savedValue;
            break;
        case 'select':
            // 确保选项存在
            const option = Array.from(element.options).find(opt => opt.value === savedValue);
            if (option) {
                element.value = savedValue;
            }
            break;
        case 'checkbox':
            element.checked = savedValue === 'true';
            break;
    }
}

// 为所有持久化元素添加事件监听器
function setupPersistentListeners() {
    Object.keys(persistentElements).forEach(elementId => {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const elementType = persistentElements[elementId];
        
        // 根据元素类型添加相应的事件监听器
        switch (elementType) {
            case 'textarea':
            case 'input':
                // 输入事件 - 实时保存
                element.addEventListener('input', () => {
                    saveElementState(elementId, element);
                });
                // 失焦事件 - 确保保存
                element.addEventListener('blur', () => {
                    saveElementState(elementId, element);
                });
                break;
            case 'select':
                element.addEventListener('change', () => {
                    saveElementState(elementId, element);
                });
                break;
            case 'checkbox':
                element.addEventListener('change', () => {
                    saveElementState(elementId, element);
                });
                break;
        }
    });
}

// 恢复所有元素状态
function restoreAllStates() {
    Object.keys(persistentElements).forEach(elementId => {
        const element = document.getElementById(elementId);
        restoreElementState(elementId, element);
    });
}

// 保存当前活动的工具面板
function saveActivePanel(panelName) {
    saveToStorage('activePanel', panelName);
}

// 恢复活动的工具面板
function restoreActivePanel() {
    const savedPanel = loadFromStorage('activePanel', 'json');
    
    // 找到对应的按钮和面板
    const targetBtn = document.querySelector(`[data-tool="${savedPanel}"]`);
    const targetPanel = document.getElementById(`${savedPanel}Panel`);
    
    if (targetBtn && targetPanel) {
        // 清除所有活动状态
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tool-panel').forEach(panel => panel.classList.remove('active'));
        
        // 设置目标为活动状态
        targetBtn.classList.add('active');
        targetPanel.classList.add('active');
    }
}

// 保存Lombok注解选择状态
function saveLombokAnnotations() {
    const annotations = [];
    document.querySelectorAll('.lombok-options input[type="checkbox"]:checked').forEach(checkbox => {
        annotations.push(checkbox.value);
    });
    saveToStorage('lombokAnnotations', JSON.stringify(annotations));
}

// 恢复Lombok注解选择状态
function restoreLombokAnnotations() {
    try {
        const savedAnnotations = loadFromStorage('lombokAnnotations');
        if (savedAnnotations) {
            const annotations = JSON.parse(savedAnnotations);
            document.querySelectorAll('.lombok-options input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = annotations.includes(checkbox.value);
            });
        }
    } catch (e) {
        console.warn('恢复Lombok注解状态失败:', e);
    }
}

// 初始化持久化功能
function initPersistence() {
    // 恢复所有状态
    restoreAllStates();
    restoreActivePanel();
    restoreLombokAnnotations();
    
    // 设置事件监听器
    setupPersistentListeners();
    
    // 保存Lombok注解选择
    document.querySelectorAll('.lombok-options input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', saveLombokAnnotations);
    });
}

// 首次使用帮助提示
function showFirstTimeHelp() {
    const hasShownHelp = loadFromStorage('hasShownHelp');
    if (!hasShownHelp) {
        setTimeout(() => {
            const helpTooltip = document.getElementById('helpTooltip');
            if (helpTooltip) {
                helpTooltip.style.display = 'block';
                saveToStorage('hasShownHelp', 'true');
                
                // 5秒后自动隐藏
                setTimeout(() => {
                    helpTooltip.style.display = 'none';
                }, 8000);
            }
        }, 2000);
    }
} 