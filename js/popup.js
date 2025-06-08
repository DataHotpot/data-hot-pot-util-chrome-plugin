document.addEventListener('DOMContentLoaded', function() {
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
        const checkboxes = document.querySelectorAll('input[name="lombok"]');
        const selectedAnnotations = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        saveToStorage('lombokAnnotations', JSON.stringify(selectedAnnotations));
    }

    // 恢复Lombok注解选择状态
    function restoreLombokAnnotations() {
        try {
            const savedAnnotations = loadFromStorage('lombokAnnotations');
            if (savedAnnotations) {
                const annotations = JSON.parse(savedAnnotations);
                const checkboxes = document.querySelectorAll('input[name="lombok"]');
                
                checkboxes.forEach(checkbox => {
                    checkbox.checked = annotations.includes(checkbox.value);
                });
            }
        } catch (e) {
            console.warn('恢复Lombok注解状态失败:', e);
        }
    }

    // 初始化数据持久化
    function initPersistence() {
        // 恢复所有状态
        restoreAllStates();
        restoreActivePanel();
        restoreLombokAnnotations();
        
        // 设置监听器
        setupPersistentListeners();
        
        // 为Lombok注解添加特殊监听器
        const lombokCheckboxes = document.querySelectorAll('input[name="lombok"]');
        lombokCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', saveLombokAnnotations);
        });
        
        // 首次使用提示
        showFirstTimeHelp();
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

    // ==================== 原有代码继续 ====================
    
    // 工具组展开/折叠功能
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

    // 工具切换
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
            saveActivePanel(tool);
        });
    });

    // JSON处理功能
    const jsonInput = document.getElementById('jsonInput');
    const jsonTree = document.getElementById('jsonTree');
    const lineNumbers = document.getElementById('lineNumbers');

    // 更新行号
    function updateLineNumbers() {
        const lines = jsonInput.value.split('\n');
        const lineCount = lines.length;
        const numbers = Array.from({ length: lineCount }, (_, i) => 
            `<div class="line-number" data-line="${i + 1}">${i + 1}</div>`
        ).join('');
        lineNumbers.innerHTML = numbers;

        // 同步行号区域的高度
        const contentHeight = jsonInput.scrollHeight;
        lineNumbers.style.height = `${contentHeight}px`;
    }

    // 监听输入更新行号
    jsonInput.addEventListener('input', () => {
        updateLineNumbers();
        try {
            const json = JSON.parse(jsonInput.value);
            updateJsonTree(json);
        } catch (e) {
            // 输入过程中的解析错误不提示
        }
    });

    // 同步滚动
    jsonInput.addEventListener('scroll', () => {
        lineNumbers.scrollTop = jsonInput.scrollTop;
    });

    // 更新树形视图
    function updateJsonTree(json) {
        jsonTree.innerHTML = '';
        const fragment = document.createDocumentFragment();
        buildTreeView(json, fragment);
        jsonTree.appendChild(fragment);
    }

    // 构建树形视图
    function buildTreeView(data, parent) {
        if (typeof data === 'object' && data !== null) {
            Object.entries(data).forEach(([key, value]) => {
                const item = document.createElement('div');
                item.className = 'tree-item';

                const keySpan = document.createElement('span');
                keySpan.className = 'tree-key';
                keySpan.textContent = Array.isArray(data) ? `[${key}]` : key;
                item.appendChild(keySpan);

                if (typeof value === 'object' && value !== null) {
                    item.appendChild(document.createTextNode(': {'));
                    buildTreeView(value, item);
                    item.appendChild(document.createTextNode('}'));
                } else {
                    const valueSpan = document.createElement('span');
                    valueSpan.className = `tree-${typeof value}`;
                    valueSpan.textContent = `: ${JSON.stringify(value)}`;
                    item.appendChild(valueSpan);
                }

                parent.appendChild(item);
            });
        }
    }

    // 格式化JSON
    document.getElementById('formatJson').addEventListener('click', () => {
        try {
            const json = JSON.parse(jsonInput.value);
            jsonInput.value = JSON.stringify(json, null, 2);
            updateLineNumbers();
            clearErrorHighlight();
            showNotification('JSON格式化成功', 'success');
        } catch (e) {
            highlightJsonError(e);
        }
    });

    // 高亮显示JSON错误位置
    function highlightJsonError(error) {
        const match = error.message.match(/position (\d+)/);
        if (match) {
            const position = parseInt(match[1]);
            const value = jsonInput.value;
            
            // 计算行号和列号
            let line = 1;
            let column = 0;
            let currentPos = 0;
            let lineStartPos = 0;
            
            for (let i = 0; i < value.length && currentPos < position; i++) {
                currentPos++;
                if (value[i] === '\n') {
                    line++;
                    column = 0;
                    lineStartPos = currentPos;
                } else {
                    column++;
                }
            }

            // 获取错误行的内容
            const lines = value.split('\n');
            const errorLine = lines[line - 1];
            
            // 创建错误标记
            const errorMark = document.createElement('div');
            errorMark.className = 'error-mark';
            errorMark.style.position = 'absolute';
            errorMark.style.left = `${column * 8 + 10}px`; // 8px是字符宽度，10px是左padding
            errorMark.style.top = `${((line - 1) * 21) + 10}px`; // 21px是行高，10px是顶部padding
            errorMark.style.width = '8px';
            errorMark.style.height = '21px';
            errorMark.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
            errorMark.style.pointerEvents = 'none';
            errorMark.style.zIndex = '1';
            
            // 清除之前的错误标记
            clearErrorHighlight();
            
            // 添加新的错误标记
            const editorContent = jsonInput.parentElement;
            editorContent.appendChild(errorMark);

            // 将错误位置滚动到视图中
            const lineHeight = 21; // 使用固定行高
            const scrollPosition = (line - 1) * lineHeight;
            jsonInput.scrollTop = Math.max(0, scrollPosition - jsonInput.clientHeight / 2);

            // 设置选择范围
            jsonInput.focus();
            jsonInput.setSelectionRange(position, position + 1);

            showNotification(`JSON格式错误（第${line}行，第${column}列）：${error.message}\n\n错误行内容：\n${errorLine}\n${' '.repeat(column)}^`, 'error');
        } else {
            showNotification('JSON格式错误：' + error.message, 'error');
        }
    }

    // 监听JSON编辑器的滚动事件，同步错误高亮位置
    jsonInput.addEventListener('scroll', () => {
        const errorMark = jsonInput.parentElement.querySelector('.error-mark');
        if (errorMark) {
            errorMark.style.transform = `translateY(-${jsonInput.scrollTop}px)`;
        }
    });

    // 清除错误高亮
    function clearErrorHighlight() {
        // 清除选择
        jsonInput.setSelectionRange(jsonInput.value.length, jsonInput.value.length);
        
        // 移除错误标记
        const errorMarks = document.querySelectorAll('.error-mark');
        errorMarks.forEach(mark => mark.remove());
    }

    // 压缩JSON
    document.getElementById('compressJson').addEventListener('click', () => {
        try {
            const json = JSON.parse(jsonInput.value);
            jsonInput.value = JSON.stringify(json);
            updateLineNumbers();
            showNotification('JSON压缩成功', 'success');
        } catch (e) {
            showNotification('JSON格式错误：' + e.message, 'error');
        }
    });

    // 验证JSON
    document.getElementById('validateJson').addEventListener('click', () => {
        try {
            JSON.parse(jsonInput.value);
            showNotification('JSON格式有效', 'success');
        } catch (e) {
            showNotification('JSON格式错误：' + e.message, 'error');
        }
    });

    // JSON对比功能
    const originalJson = document.getElementById('originalJson');
    const targetJson = document.getElementById('targetJson');
    const originalLineNumbers = document.getElementById('originalLineNumbers');
    const targetLineNumbers = document.getElementById('targetLineNumbers');

    // 更新对比编辑器的行号
    function updateCompareLineNumbers(editor, lineNumbersContainer) {
        const lines = editor.value.split('\n');
        const lineCount = lines.length;
        const numbers = Array.from({ length: lineCount }, (_, i) => 
            `<div class="line-number" data-line="${i + 1}">${i + 1}</div>`
        ).join('');
        lineNumbersContainer.innerHTML = numbers;

        // 同步行号区域的高度
        const contentHeight = editor.scrollHeight;
        lineNumbersContainer.style.height = `${contentHeight}px`;
    }

    // 监听输入更新行号
    originalJson.addEventListener('input', () => {
        updateCompareLineNumbers(originalJson, originalLineNumbers);
    });

    targetJson.addEventListener('input', () => {
        updateCompareLineNumbers(targetJson, targetLineNumbers);
    });

    // 同步滚动
    originalJson.addEventListener('scroll', () => {
        originalLineNumbers.scrollTop = originalJson.scrollTop;
    });

    targetJson.addEventListener('scroll', () => {
        targetLineNumbers.scrollTop = targetJson.scrollTop;
    });

    // 格式化两个JSON编辑器
    document.getElementById('formatBothJson').addEventListener('click', () => {
        try {
            // 格式化原始JSON
            const original = JSON.parse(originalJson.value);
            originalJson.value = JSON.stringify(original, null, 2);
            updateCompareLineNumbers(originalJson, originalLineNumbers);

            // 格式化目标JSON
            const target = JSON.parse(targetJson.value);
            targetJson.value = JSON.stringify(target, null, 2);
            updateCompareLineNumbers(targetJson, targetLineNumbers);

            showNotification('JSON格式化成功', 'success');
        } catch (e) {
            showNotification('JSON格式错误：' + e.message, 'error');
        }
    });

    // JSON对比
    document.getElementById('compareJson').addEventListener('click', () => {
        try {
            const original = JSON.parse(originalJson.value);
            const target = JSON.parse(targetJson.value);
            
            // 格式化显示
            originalJson.value = JSON.stringify(original, null, 2);
            targetJson.value = JSON.stringify(target, null, 2);
            
            // 更新行号
            updateCompareLineNumbers(originalJson, originalLineNumbers);
            updateCompareLineNumbers(targetJson, targetLineNumbers);

            // 执行对比
            const diff = compareJson(original, target);
            
            // 显示对比结果
            displayDiff(diff);
            
            // 高亮差异
            highlightDifferences(diff);

        } catch (e) {
            showNotification('JSON格式错误：' + e.message, 'error');
        }
    });

    // JSON对比函数
    function compareJson(original, target) {
        const diff = {
            added: [],
            removed: [],
            changed: []
        };

        function compareObjects(path, obj1, obj2) {
            const keys1 = Object.keys(obj1);
            const keys2 = Object.keys(obj2);

            // 检查删除的键
            keys1.forEach(key => {
                const currentPath = path ? `${path}.${key}` : key;
                if (!keys2.includes(key)) {
                    diff.removed.push({
                        path: currentPath,
                        value: obj1[key]
                    });
                } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
                    if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
                        compareObjects(currentPath, obj1[key], obj2[key]);
                    } else {
                        diff.changed.push({
                            path: currentPath,
                            oldValue: obj1[key],
                            newValue: obj2[key]
                        });
                    }
                }
            });

            // 检查新增的键
            keys2.forEach(key => {
                const currentPath = path ? `${path}.${key}` : key;
                if (!keys1.includes(key)) {
                    diff.added.push({
                        path: currentPath,
                        value: obj2[key]
                    });
                }
            });
        }

        compareObjects('', original, target);
        return diff;
    }

    // 显示对比结果
    function displayDiff(diff) {
        const diffResult = document.getElementById('diffResult');
        let html = '';

        if (diff.removed.length > 0) {
            html += '<div class="diff-section"><h4>删除的内容：</h4>';
            diff.removed.forEach(item => {
                html += `<div class="diff-removed">${item.path}: ${JSON.stringify(item.value)}</div>`;
            });
            html += '</div>';
        }

        if (diff.added.length > 0) {
            html += '<div class="diff-section"><h4>新增的内容：</h4>';
            diff.added.forEach(item => {
                html += `<div class="diff-added">${item.path}: ${JSON.stringify(item.value)}</div>`;
            });
            html += '</div>';
        }

        if (diff.changed.length > 0) {
            html += '<div class="diff-section"><h4>修改的内容：</h4>';
            diff.changed.forEach(item => {
                html += `<div class="diff-changed">
                    ${item.path}:<br>
                    <span class="diff-removed">- ${JSON.stringify(item.oldValue)}</span><br>
                    <span class="diff-added">+ ${JSON.stringify(item.newValue)}</span>
                </div>`;
            });
            html += '</div>';
        }

        if (html === '') {
            html = '<div class="diff-unchanged">两个JSON内容完全相同</div>';
        }

        diffResult.innerHTML = html;
    }

    // Base64功能
    document.getElementById('encodeBase64').addEventListener('click', () => {
        const input = document.getElementById('base64Input').value;
        try {
            const encoded = btoa(unescape(encodeURIComponent(input)));
            document.getElementById('base64Output').value = encoded;
            showNotification('Base64编码成功', 'success');
        } catch (e) {
            showNotification('Base64编码失败：' + e.message, 'error');
        }
    });

    document.getElementById('decodeBase64').addEventListener('click', () => {
        const input = document.getElementById('base64Input').value;
        try {
            const decoded = decodeURIComponent(escape(atob(input)));
            document.getElementById('base64Output').value = decoded;
            showNotification('Base64解码成功', 'success');
        } catch (e) {
            showNotification('Base64解码失败：' + e.message, 'error');
        }
    });

    // 时区映射表
    const timezoneNames = {
        'UTC': '世界标准-格林威治(UTC)',
        // 东亚
        'Asia/Shanghai': '中国-北京(CN-BJS)',
        'Asia/Hong_Kong': '中国香港(HK-HKG)',
        'Asia/Macau': '中国澳门(MO-MFM)',
        'Asia/Taipei': '中国台湾-台北(TW-TPE)',
        'Asia/Tokyo': '日本-东京(JP-TYO)',
        'Asia/Seoul': '韩国-首尔(KR-SEL)',
        // 东南亚
        'Asia/Singapore': '新加坡-新加坡(SG-SGP)',
        'Asia/Bangkok': '泰国-曼谷(TH-BKK)',
        'Asia/Jakarta': '印度尼西亚-雅加达(ID-JKT)',
        'Asia/Kuala_Lumpur': '马来西亚-吉隆坡(MY-KUL)',
        'Asia/Manila': '菲律宾-马尼拉(PH-MNL)',
        'Asia/Ho_Chi_Minh': '越南-胡志明市(VN-SGN)',
        'Asia/Yangon': '缅甸-仰光(MM-RGN)',
        'Asia/Phnom_Penh': '柬埔寨-金边(KH-PNH)',
        // 南亚
        'Asia/Kolkata': '印度-新德里(IN-DEL)',
        'Asia/Colombo': '斯里兰卡-科伦坡(LK-CMB)',
        'Asia/Dhaka': '孟加拉-达卡(BD-DAC)',
        'Asia/Kathmandu': '尼泊尔-加德满都(NP-KTM)',
        // 中亚
        'Asia/Almaty': '哈萨克斯坦-阿拉木图(KZ-ALA)',
        'Asia/Tashkent': '乌兹别克斯坦-塔什干(UZ-TAS)',
        // 西亚
        'Asia/Dubai': '阿联酋-迪拜(AE-DXB)',
        'Asia/Qatar': '卡塔尔-多哈(QA-DOH)',
        'Asia/Jerusalem': '以色列-耶路撒冷(IL-JRS)',
        // 欧洲
        'Europe/Moscow': '俄罗斯-莫斯科(RU-MOW)',
        'Europe/London': '英国-伦敦(GB-LON)',
        'Europe/Paris': '法国-巴黎(FR-PAR)',
        'Europe/Berlin': '德国-柏林(DE-BER)',
        'Europe/Rome': '意大利-罗马(IT-ROM)',
        'Europe/Madrid': '西班牙-马德里(ES-MAD)',
        'Europe/Amsterdam': '荷兰-阿姆斯特丹(NL-AMS)',
        'Europe/Brussels': '比利时-布鲁塞尔(BE-BRU)',
        'Europe/Vienna': '奥地利-维也纳(AT-VIE)',
        // 美洲
        'America/New_York': '美国-纽约(US-NYC)',
        // 大洋洲
        'Australia/Sydney': '澳大利亚-悉尼(AU-SYD)'
    };

    // 时区偏移量映射
    const timezoneOffsets = {
        'UTC': '+00:00',
        // 东亚
        'Asia/Shanghai': '+08:00',
        'Asia/Hong_Kong': '+08:00',
        'Asia/Macau': '+08:00',
        'Asia/Taipei': '+08:00',
        'Asia/Tokyo': '+09:00',
        'Asia/Seoul': '+09:00',
        // 东南亚
        'Asia/Singapore': '+08:00',
        'Asia/Bangkok': '+07:00',
        'Asia/Jakarta': '+07:00',
        'Asia/Kuala_Lumpur': '+08:00',
        'Asia/Manila': '+08:00',
        'Asia/Ho_Chi_Minh': '+07:00',
        'Asia/Yangon': '+06:30',
        'Asia/Phnom_Penh': '+07:00',
        // 南亚
        'Asia/Kolkata': '+05:30',
        'Asia/Colombo': '+05:30',
        'Asia/Dhaka': '+06:00',
        'Asia/Kathmandu': '+05:45',
        // 中亚
        'Asia/Almaty': '+06:00',
        'Asia/Tashkent': '+05:00',
        // 西亚
        'Asia/Dubai': '+04:00',
        'Asia/Qatar': '+03:00',
        'Asia/Jerusalem': '+02:00',
        // 欧洲
        'Europe/Moscow': '+03:00',
        'Europe/London': '+00:00',
        'Europe/Paris': '+01:00',
        'Europe/Berlin': '+01:00',
        'Europe/Rome': '+01:00',
        'Europe/Madrid': '+01:00',
        'Europe/Amsterdam': '+01:00',
        'Europe/Brussels': '+01:00',
        'Europe/Vienna': '+01:00',
        // 美洲
        'America/New_York': '-05:00',
        // 大洋洲
        'Australia/Sydney': '+10:00'
    };

    // 时间转换功能
    const timestamp = document.getElementById('timestamp');
    const datetime = document.getElementById('datetime');
    const formattedTime = document.getElementById('formattedTime');
    const timezone = document.getElementById('timezone');
    const timestampFormat = document.getElementById('timestampFormat');
    const timestampFormatLabel = document.getElementById('timestampFormatLabel');
    const timestampUnit = document.getElementById('timestampUnit');

    // 时间戳格式切换
    let isMilliseconds = true; // 默认为毫秒级时间戳

    // 更新时间戳单位显示
    function updateTimestampUnit(isMilliseconds) {
        const unit = isMilliseconds ? '毫秒' : '秒';
        timestampFormatLabel.textContent = unit;
        timestampUnit.textContent = unit;
    }

    timestampFormat.addEventListener('change', () => {
        isMilliseconds = timestampFormat.checked;
        updateTimestampUnit(isMilliseconds);
        
        // 如果当前有时间戳，则进行转换
        if (timestamp.value) {
            const currentValue = parseInt(timestamp.value);
            if (!isNaN(currentValue)) {
                if (isMilliseconds) {
                    // 秒转毫秒
                    timestamp.value = currentValue * 1000;
                } else {
                    // 毫秒转秒
                    timestamp.value = Math.floor(currentValue / 1000);
                }
            }
        }
    });

    function updateAllTimes(source) {
        const tz = timezone.value;
        let date;

        try {
            switch (source) {
                case 'timestamp':
                    const tsValue = parseInt(timestamp.value);
                    if (isNaN(tsValue)) {
                        throw new Error('无效的时间戳');
                    }
                    // 根据当前模式转换时间戳
                    date = new Date(isMilliseconds ? tsValue : tsValue * 1000);
                    break;
                case 'datetime':
                    date = new Date(datetime.value);
                    break;
                default:
                    date = new Date();
            }

            if (isNaN(date.getTime())) {
                throw new Error('无效的日期时间');
            }

            // 更新时间戳
            timestamp.value = isMilliseconds ? date.getTime() : Math.floor(date.getTime() / 1000);

            // 更新日期时间
            const tzDate = new Date(date.toLocaleString('en-US', { timeZone: tz }));
            datetime.value = tzDate.toISOString().slice(0, 16);

            // 更新格式化时间
            const timezoneName = timezoneNames[tz] || tz;
            const timezoneOffset = timezoneOffsets[tz] || '';
            formattedTime.value = `${date.toLocaleString('zh-CN', {
                timeZone: tz,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            })} [${timezoneName} UTC${timezoneOffset}]`;
        } catch (e) {
            showNotification('时间转换失败：' + e.message, 'error');
        }
    }

    timestamp.addEventListener('input', () => updateAllTimes('timestamp'));
    datetime.addEventListener('input', () => updateAllTimes('datetime'));
    timezone.addEventListener('change', () => updateAllTimes());

    // 初始化当前时间
    updateAllTimes();

    // 初始化时间戳单位显示
    updateTimestampUnit(isMilliseconds);

    // 通知功能
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // 初始化行号
    updateLineNumbers();

    // 高亮差异
    function highlightDifferences(diff) {
        // 清除之前的高亮
        clearHighlights();

        // 获取格式化后的行
        const originalLines = originalJson.value.split('\n');
        const targetLines = targetJson.value.split('\n');

        // 处理删除的内容
        diff.removed.forEach(item => {
            const lineIndex = findLineIndex(originalLines, item.path);
            if (lineIndex !== -1) {
                createHighlightOverlay(originalJson, lineIndex, 'highlight-removed');
            }
        });

        // 处理新增的内容
        diff.added.forEach(item => {
            const lineIndex = findLineIndex(targetLines, item.path);
            if (lineIndex !== -1) {
                createHighlightOverlay(targetJson, lineIndex, 'highlight-added');
            }
        });

        // 处理修改的内容
        diff.changed.forEach(item => {
            const originalLineIndex = findLineIndex(originalLines, item.path);
            const targetLineIndex = findLineIndex(targetLines, item.path);
            
            if (originalLineIndex !== -1) {
                createHighlightOverlay(originalJson, originalLineIndex, 'highlight-changed');
            }
            if (targetLineIndex !== -1) {
                createHighlightOverlay(targetJson, targetLineIndex, 'highlight-changed');
            }
        });
    }

    // 创建高亮覆盖层
    function createHighlightOverlay(editor, lineIndex, className) {
        const line = document.createElement('div');
        line.className = `diff-line ${className}`;
        
        // 计算精确的位置：考虑编辑器的padding-top
        const paddingTop = 10; // 编辑器的padding-top值
        line.style.top = `${paddingTop + (lineIndex * 21)}px`; // 21px是行高
        
        // 将覆盖层添加到编辑器容器中
        editor.parentElement.appendChild(line);
    }

    // 监听编辑器滚动事件，同步高亮层位置
    originalJson.addEventListener('scroll', () => {
        const highlights = originalJson.parentElement.querySelectorAll('.diff-line');
        highlights.forEach(highlight => {
            const top = parseInt(highlight.style.top);
            highlight.style.transform = `translateY(-${originalJson.scrollTop}px)`;
        });
    });

    targetJson.addEventListener('scroll', () => {
        const highlights = targetJson.parentElement.querySelectorAll('.diff-line');
        highlights.forEach(highlight => {
            const top = parseInt(highlight.style.top);
            highlight.style.transform = `translateY(-${targetJson.scrollTop}px)`;
        });
    });

    // 清除所有高亮
    function clearHighlights() {
        // 移除所有高亮覆盖层
        const highlights = document.querySelectorAll('.diff-line');
        highlights.forEach(highlight => highlight.remove());
    }

    // 查找JSON路径对应的行号
    function findLineIndex(lines, path) {
        const pathParts = path.split('.');
        const searchStr = pathParts[pathParts.length - 1];
        
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(`"${searchStr}":`)) {
                return i;
            }
        }
        return -1;
    }

    // Cron表达式功能
    const cronInput = document.getElementById('cronInput');
    const cronDescription = document.getElementById('cronDescription');
    const nextExecutions = document.getElementById('nextExecutions');

    // Cron表达式解析映射
    const cronPartDescriptions = {
        minute: {
            '*': '每分钟',
            '*/n': '每n分钟',
            'a': '在第a分钟',
            'a,b,c': '在第a,b,c分钟',
            'a-b': '在第a到b分钟之间的每分钟',
            'a-b/n': '在第a到b分钟之间每隔n分钟'
        },
        hour: {
            '*': '每小时',
            '*/n': '每n小时',
            'a': '在第a小时',
            'a,b,c': '在第a,b,c小时',
            'a-b': '在第a到b小时之间的每小时',
            'a-b/n': '在第a到b小时之间每隔n小时'
        },
        day: {
            '*': '每天',
            '*/n': '每n天',
            'a': '在每月的第a天',
            'a,b,c': '在每月的第a,b,c天',
            'a-b': '在每月的第a到b天',
            'a-b/n': '在每月的第a到b天之间每隔n天'
        },
        month: {
            '*': '每月',
            '*/n': '每n个月',
            'a': '在第a月',
            'a,b,c': '在第a,b,c月',
            'a-b': '在第a到b月之间的每月',
            'a-b/n': '在第a到b月之间每隔n个月'
        },
        week: {
            '*': '每周的每一天',
            'a': '每周的周a',
            'a,b,c': '每周的周a,b,c',
            'a-b': '每周的周a到周b',
            '1-5': '每周一到周五',
            '6-7': '周末'
        }
    };

    // 解析Cron表达式
    function parseCronExpression(cronExp) {
        const parts = cronExp.trim().split(/\s+/);
        if (parts.length !== 5) {
            throw new Error('无效的Cron表达式格式，应为：分 时 日 月 周');
        }

        const [minute, hour, day, month, week] = parts;
        let description = '';

        // 解析每个部分
        function getPartDescription(value, type) {
            if (value === '*') return cronPartDescriptions[type]['*'];
            if (value.includes('/')) {
                const [range, step] = value.split('/');
                if (range === '*') return cronPartDescriptions[type]['*/n'].replace('n', step);
                return cronPartDescriptions[type]['a-b/n'].replace('a-b', range).replace('n', step);
            }
            if (value.includes('-')) {
                if (type === 'week' && value === '1-5') return cronPartDescriptions.week['1-5'];
                if (type === 'week' && value === '6-7') return cronPartDescriptions.week['6-7'];
                return cronPartDescriptions[type]['a-b'].replace('a-b', value);
            }
            if (value.includes(',')) return cronPartDescriptions[type]['a,b,c'].replace('a,b,c', value);
            return cronPartDescriptions[type]['a'].replace('a', value);
        }

        try {
            const minuteDesc = getPartDescription(minute, 'minute');
            const hourDesc = getPartDescription(hour, 'hour');
            const dayDesc = getPartDescription(day, 'day');
            const monthDesc = getPartDescription(month, 'month');
            const weekDesc = getPartDescription(week, 'week');

            description = `执行时间：${minuteDesc}，${hourDesc}，${monthDesc}${dayDesc}，${weekDesc}`;
        } catch (e) {
            throw new Error('Cron表达式解析失败：' + e.message);
        }

        return description;
    }

    // 计算下次执行时间
    function getNextExecutionTimes(cronExp, count = 5) {
        const parts = cronExp.trim().split(/\s+/);
        if (parts.length !== 5) {
            throw new Error('无效的Cron表达式格式');
        }

        const [minute, hour, day, month, week] = parts;
        const now = new Date();
        const nextDates = [];
        let currentDate = new Date(now);

        // 简单的时间递增逻辑
        while (nextDates.length < count) {
            if (isMatchingCron(currentDate, minute, hour, day, month, week)) {
                nextDates.push(new Date(currentDate));
            }
            currentDate.setMinutes(currentDate.getMinutes() + 1);
        }

        return nextDates;
    }

    // 检查日期是否匹配Cron表达式
    function isMatchingCron(date, minute, hour, day, month, week) {
        function matchPart(value, current, max) {
            if (value === '*') return true;
            if (value.includes('/')) {
                const [range, step] = value.split('/');
                const start = range === '*' ? 0 : parseInt(range);
                return (current - start) % parseInt(step) === 0;
            }
            if (value.includes('-')) {
                const [start, end] = value.split('-').map(Number);
                return current >= start && current <= end;
            }
            if (value.includes(',')) {
                return value.split(',').map(Number).includes(current);
            }
            return parseInt(value) === current;
        }

        const m = date.getMinutes();
        const h = date.getHours();
        const d = date.getDate();
        const mon = date.getMonth() + 1;
        const w = date.getDay() || 7;

        return matchPart(minute, m, 59) &&
               matchPart(hour, h, 23) &&
               matchPart(day, d, 31) &&
               matchPart(month, mon, 12) &&
               matchPart(week, w, 7);
    }

    // 解析Cron表达式按钮事件
    document.getElementById('parseCron').addEventListener('click', () => {
        try {
            const cronExp = cronInput.value.trim();
            const description = parseCronExpression(cronExp);
            cronDescription.textContent = description;
            showNotification('Cron表达式解析成功', 'success');
        } catch (e) {
            cronDescription.textContent = '解析错误：' + e.message;
            showNotification('Cron表达式解析失败：' + e.message, 'error');
        }
    });

    // 获取最近执行时间按钮事件
    document.getElementById('getNextTimes').addEventListener('click', () => {
        try {
            const cronExp = cronInput.value.trim();
            const nextTimes = getNextExecutionTimes(cronExp);
            nextExecutions.innerHTML = nextTimes
                .map(date => date.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }))
                .join('\n');
            showNotification('已计算最近5次执行时间', 'success');
        } catch (e) {
            nextExecutions.textContent = '计算错误：' + e.message;
            showNotification('执行时间计算失败：' + e.message, 'error');
        }
    });

    // 点击示例填充输入框
    document.querySelectorAll('.example-item').forEach(item => {
        item.addEventListener('click', () => {
            cronInput.value = item.dataset.cron;
            // 自动触发解析
            document.getElementById('parseCron').click();
        });
    });

    // Go工具集功能
    // JSON转Struct功能
    const goJsonInput = document.getElementById('goJsonInput');
    const goStructOutput = document.getElementById('goStructOutput');
    const goStructTags = document.getElementById('goStructTags');
    const usePointer = document.getElementById('usePointer');

    function convertJsonToStruct(json, structName = 'Response') {
        try {
            const data = JSON.parse(json);
            const usePointerVal = usePointer.checked;
            const tags = goStructTags.value;
            let structs = new Map(); // 存储所有需要生成的结构体

            function capitalizeFirstLetter(string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }

            function formatFieldName(name) {
                // 处理特殊字符和保留字
                const goKeywords = ['break', 'default', 'func', 'interface', 'select',
                    'case', 'defer', 'go', 'map', 'struct',
                    'chan', 'else', 'goto', 'package', 'switch',
                    'const', 'fallthrough', 'if', 'range', 'type',
                    'continue', 'for', 'import', 'return', 'var'];

                let fieldName = name
                    .replace(/[^a-zA-Z0-9_]/g, '_')
                    .split('_')
                    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                    .join('');

                // 确保字段名不以数字开头
                if (/^[0-9]/.test(fieldName)) {
                    fieldName = '_' + fieldName;
                }

                // 处理Go关键字
                if (goKeywords.includes(fieldName.toLowerCase())) {
                    fieldName = '_' + fieldName;
                }

                return fieldName;
            }

            function getGoType(value, fieldName) {
                if (value === null) return 'interface{}';
                switch (typeof value) {
                    case 'string': return 'string';
                    case 'number':
                        if (Number.isInteger(value)) {
                            if (value > 2147483647 || value < -2147483648) {
                                return 'int64';
                            }
                            return 'int';
                        }
                        return 'float64';
                    case 'boolean': return 'bool';
                    case 'object':
                        if (Array.isArray(value)) {
                            const itemType = value.length > 0 
                                ? getGoType(value[0], capitalizeFirstLetter(fieldName)) 
                                : 'interface{}';
                            return `[]${itemType}`;
                        }
                        // 对象类型，创建新的结构体
                        const structType = capitalizeFirstLetter(fieldName);
                        createStruct(value, structType);
                        return structType;
                    default: return 'interface{}';
                }
            }

            function createStruct(obj, structName) {
                let structCode = `type ${structName} struct {\n`;

                for (const [key, value] of Object.entries(obj)) {
                    const fieldName = formatFieldName(key);
                    let fieldType = getGoType(value, fieldName);

                    // 添加指针类型
                    if (usePointerVal && !fieldType.startsWith('[]') && fieldType !== 'interface{}') {
                        fieldType = '*' + fieldType;
                    }

                    // 添加字段注释
                    if (typeof value === 'object' && value !== null) {
                        structCode += `\t// ${fieldName} ${Array.isArray(value) ? 'slice' : 'object'}\n`;
                    }

                    // 添加字段定义和tag
                    structCode += `\t${fieldName} ${fieldType} \`${tags}:"${key}"\`\n`;
                }

                structCode += '}\n\n';
                structs.set(structName, structCode);
            }

            // 生成主结构体
            createStruct(data, structName);

            // 组合所有结构体的代码
            let result = '';
            for (const structCode of structs.values()) {
                result += structCode;
            }

            return result;
        } catch (e) {
            throw new Error('JSON解析失败：' + e.message);
        }
    }

    document.getElementById('convertToStruct').addEventListener('click', () => {
        try {
            const json = goJsonInput.value.trim();
            const struct = convertJsonToStruct(json);
            goStructOutput.value = struct;
            showNotification('转换成功', 'success');
        } catch (e) {
            showNotification(e.message, 'error');
        }
    });

    // Go时间格式化功能
    const goTimeFormat = document.getElementById('goTimeFormat');
    const goTimeString = document.getElementById('goTimeString');
    const goTimeExample = document.getElementById('goTimeExample');

    function updateGoTimeFormat() {
        const format = goTimeFormat.value;
        goTimeString.value = format;
        const now = new Date();
        
        // 将当前时间格式化为Go时间布局示例
        const example = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).replace(/[年月日]/g, '-').replace(/[时分秒]/g, ':').slice(0, -1);
        
        goTimeExample.value = example;
    }

    goTimeFormat.addEventListener('change', updateGoTimeFormat);

    // Go error处理功能
    const goErrorInput = document.getElementById('goErrorInput');
    const goErrorOutput = document.getElementById('goErrorOutput');
    const errorHandleType = document.getElementById('errorHandleType');

    function generateErrorHandler() {
        const code = goErrorInput.value.trim();
        const handleType = errorHandleType.value;
        let result = '';

        switch (handleType) {
            case 'wrap':
                result = `if err != nil {
    return fmt.Errorf("failed to execute operation: %w", err)
}`;
                break;
            case 'custom':
                result = `type CustomError struct {
    Err error
    Message string
}

func (e *CustomError) Error() string {
    return fmt.Sprintf("%s: %v", e.Message, e.Err)
}

if err != nil {
    return &CustomError{
        Err: err,
        Message: "operation failed",
    }
}`;
                break;
            case 'sentinel':
                result = `var (
    ErrNotFound = errors.New("resource not found")
    ErrInvalidInput = errors.New("invalid input")
    ErrUnauthorized = errors.New("unauthorized access")
)

if err != nil {
    switch {
    case errors.Is(err, ErrNotFound):
        return fmt.Errorf("resource lookup failed: %w", err)
    case errors.Is(err, ErrInvalidInput):
        return fmt.Errorf("validation failed: %w", err)
    default:
        return fmt.Errorf("unexpected error: %w", err)
    }
}`;
                break;
        }

        goErrorOutput.value = result;
    }

    document.getElementById('generateErrorHandler').addEventListener('click', generateErrorHandler);

    // Go接口生成功能
    const goStructInput = document.getElementById('goStructInput');
    const goInterfaceOutput = document.getElementById('goInterfaceOutput');
    const includeComments = document.getElementById('includeComments');

    function generateInterface() {
        const structCode = goStructInput.value.trim();
        try {
            // 简单的方法提取正则表达式
            const methodRegex = /func\s*\(([\w\*]+)\s+(\w+)\)\s*(\w+)\((.*?)\)\s*(\(.*?\)|[\w\*\[\]]+)?/g;
            const matches = [...structCode.matchAll(methodRegex)];
            
            if (matches.length === 0) {
                throw new Error('未找到任何方法定义');
            }

            const receiverType = matches[0][2];
            let interfaceName = `I${receiverType}`;
            let result = `// ${interfaceName} 定义了 ${receiverType} 的接口\n`;
            result += `type ${interfaceName} interface {\n`;

            for (const match of matches) {
                const methodName = match[3];
                const params = match[4].trim();
                const returns = match[5] ? match[5].trim() : '';

                if (includeComments.checked) {
                    result += `\t// ${methodName} `;
                    if (params) result += `接收 ${params} 参数`;
                    if (returns) result += ` 并返回 ${returns}`;
                    result += '\n';
                }

                result += `\t${methodName}(${params})`;
                if (returns) result += ` ${returns}`;
                result += '\n';
            }

            result += '}';
            goInterfaceOutput.value = result;
            showNotification('接口生成成功', 'success');
        } catch (e) {
            showNotification('接口生成失败：' + e.message, 'error');
        }
    }

    document.getElementById('generateInterface').addEventListener('click', generateInterface);

    // 初始化Go时间格式化示例
    updateGoTimeFormat();

    // Java工具集功能
    // JSON转JavaBean功能
    const javaJsonInput = document.getElementById('javaJsonInput');
    const javaBeanOutput = document.getElementById('javaBeanOutput');
    const javaBeanOptions = document.getElementById('javaBeanOptions');
    const generateComments = document.getElementById('generateComments');

    function convertJsonToJavaBean(json, className = 'Response') {
        try {
            const data = JSON.parse(json);
            const options = javaBeanOptions.value;
            let result = '';
            let imports = new Set();
            let classes = new Map(); // 存储所有需要生成的类

            // 添加必要的导入
            if (options === 'lombok') {
                imports.add('import lombok.Data;');
            } else if (options === 'jackson') {
                imports.add('import com.fasterxml.jackson.annotation.JsonProperty;');
            } else if (options === 'swagger') {
                imports.add('import io.swagger.annotations.ApiModel;');
                imports.add('import io.swagger.annotations.ApiModelProperty;');
            }

            function capitalizeFirstLetter(string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }

            function getJavaType(value, fieldName) {
                if (value === null) return 'Object';
                switch (typeof value) {
                    case 'string': return 'String';
                    case 'number': 
                        return Number.isInteger(value) ? 'Long' : 'Double';
                    case 'boolean': return 'Boolean';
                    case 'object':
                        if (Array.isArray(value)) {
                            imports.add('import java.util.List;');
                            const itemType = value.length > 0 
                                ? getJavaType(value[0], capitalizeFirstLetter(fieldName)) 
                                : 'Object';
                            return `List<${itemType}>`;
                        }
                        // 对象类型，创建新的类
                        const innerClassName = capitalizeFirstLetter(fieldName);
                        createClass(value, innerClassName);
                        return innerClassName;
                    default: return 'Object';
                }
            }

            function formatFieldName(name) {
                // 处理特殊字符和保留字
                const javaKeywords = ['abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const',
                    'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float',
                    'for', 'if', 'goto', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native',
                    'new', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp', 'super',
                    'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try', 'void', 'volatile', 'while'];

                let fieldName = name.toLowerCase()
                    .replace(/[^a-zA-Z0-9_]/g, '_')
                    .replace(/_([a-z])/g, (_, c) => c.toUpperCase());

                // 确保字段名不以数字开头
                if (/^[0-9]/.test(fieldName)) {
                    fieldName = '_' + fieldName;
                }

                // 处理Java关键字
                if (javaKeywords.includes(fieldName)) {
                    fieldName = '_' + fieldName;
                }

                return fieldName;
            }

            function createClass(obj, className) {
                let classCode = '';
                
                if (options === 'lombok') {
                    classCode += '@Data\n';
                }
                if (options === 'swagger') {
                    classCode += `@ApiModel(description = "${className}")\n`;
                }

                classCode += `public class ${className} {\n`;

                for (const [key, value] of Object.entries(obj)) {
                    const fieldName = formatFieldName(key);
                    const fieldType = getJavaType(value, fieldName);

                    if (generateComments.checked) {
                        classCode += `    /** ${key} */\n`;
                    }

                    if (options === 'jackson') {
                        classCode += `    @JsonProperty("${key}")\n`;
                    } else if (options === 'swagger') {
                        classCode += `    @ApiModelProperty(value = "${key}")\n`;
                    }

                    classCode += `    private ${fieldType} ${fieldName};\n\n`;

                    if (options === 'basic') {
                        const capitalizedField = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
                        classCode += `    public ${fieldType} get${capitalizedField}() {\n`;
                        classCode += `        return ${fieldName};\n`;
                        classCode += `    }\n\n`;
                        classCode += `    public void set${capitalizedField}(${fieldType} ${fieldName}) {\n`;
                        classCode += `        this.${fieldName} = ${fieldName};\n`;
                        classCode += `    }\n\n`;
                    }
                }

                classCode += '}\n\n';
                classes.set(className, classCode);
            }

            // 生成主类
            createClass(data, className);

            // 组合所有类的代码
            // 首先添加导入语句
            if (imports.size > 0) {
                result = Array.from(imports).join('\n') + '\n\n';
            }

            // 然后添加所有生成的类
            for (const classCode of classes.values()) {
                result += classCode;
            }

            return result;
        } catch (e) {
            throw new Error('JSON解析失败：' + e.message);
        }
    }

    document.getElementById('convertToJavaBean').addEventListener('click', () => {
        try {
            const json = javaJsonInput.value.trim();
            const javaBean = convertJsonToJavaBean(json);
            javaBeanOutput.value = javaBean;
            showNotification('转换成功', 'success');
        } catch (e) {
            showNotification(e.message, 'error');
        }
    });

    // Builder生成功能
    const javaClassInput = document.getElementById('javaClassInput');
    const javaBuilderOutput = document.getElementById('javaBuilderOutput');
    const builderInnerClass = document.getElementById('builderInnerClass');
    const builderFluentStyle = document.getElementById('builderFluentStyle');

    function generateBuilderCode() {
        try {
            const classCode = javaClassInput.value.trim();
            const className = classCode.match(/class\s+(\w+)/)[1];
            const fieldRegex = /private\s+(\w+(?:<[^>]+>)?)\s+(\w+);/g;
            const fields = [...classCode.matchAll(fieldRegex)];
            
            let result = '';
            
            if (builderInnerClass.checked) {
                result = classCode.replace(/}$/, '\n');
                result += '    public static class Builder {\n';
                
                // 添加字段
                fields.forEach(([_, type, name]) => {
                    result += `        private ${type} ${name};\n`;
                });
                
                result += '\n';
                
                // 添加build方法
                result += `        public ${className} build() {\n`;
                result += `            ${className} ${className.toLowerCase()} = new ${className}();\n`;
                fields.forEach(([_, __, name]) => {
                    result += `            ${className.toLowerCase()}.${name} = this.${name};\n`;
                });
                result += '            return ' + className.toLowerCase() + ';\n';
                result += '        }\n\n';
                
                // 添加setter方法
                fields.forEach(([_, type, name]) => {
                    result += `        public Builder ${name}(${type} ${name}) {\n`;
                    result += `            this.${name} = ${name};\n`;
                    if (builderFluentStyle.checked) {
                        result += '            return this;\n';
                    }
                    result += '        }\n';
                });
                
                result += '    }\n}';
            } else {
                result = `public class ${className}Builder {\n`;
                fields.forEach(([_, type, name]) => {
                    result += `    private ${type} ${name};\n`;
                });
                
                result += '\n';
                
                fields.forEach(([_, type, name]) => {
                    result += `    public ${className}Builder ${name}(${type} ${name}) {\n`;
                    result += `        this.${name} = ${name};\n`;
                    if (builderFluentStyle.checked) {
                        result += '        return this;\n';
                    }
                    result += '    }\n';
                });
                
                result += `\n    public ${className} build() {\n`;
                result += `        ${className} ${className.toLowerCase()} = new ${className}();\n`;
                fields.forEach(([_, __, name]) => {
                    result += `        ${className.toLowerCase()}.set${name.charAt(0).toUpperCase() + name.slice(1)}(this.${name});\n`;
                });
                result += `        return ${className.toLowerCase()};\n`;
                result += '    }\n}';
            }
            
            return result;
        } catch (e) {
            throw new Error('生成Builder失败：' + e.message);
        }
    }

    document.getElementById('generateBuilder').addEventListener('click', () => {
        try {
            const builderCode = generateBuilderCode();
            javaBuilderOutput.value = builderCode;
            showNotification('Builder生成成功', 'success');
        } catch (e) {
            showNotification(e.message, 'error');
        }
    });

    // Lombok注解功能
    const javaLombokInput = document.getElementById('javaLombokInput');
    const javaLombokOutput = document.getElementById('javaLombokOutput');
    const lombokCheckboxes = document.querySelectorAll('input[name="lombok"]');

    function addLombokAnnotations() {
        try {
            const classCode = javaLombokInput.value.trim();
            let result = '';
            
            // 添加Lombok导入
            result += 'import lombok.*;\n\n';
            
            // 添加选中的注解
            lombokCheckboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    result += checkbox.value + '\n';
                }
            });
            
            // 添加类定义和其余代码
            result += classCode.replace(/^package.*?;\n|^import.*?;\n/gm, '').trim();
            
            return result;
        } catch (e) {
            throw new Error('添加Lombok注解失败：' + e.message);
        }
    }

    document.getElementById('addLombokAnnotations').addEventListener('click', () => {
        try {
            const lombokCode = addLombokAnnotations();
            javaLombokOutput.value = lombokCode;
            showNotification('Lombok注解添加成功', 'success');
        } catch (e) {
            showNotification(e.message, 'error');
        }
    });

    // Stream示例功能
    const streamExampleType = document.getElementById('streamExampleType');
    const exampleDescription = document.querySelector('.example-description');
    const exampleCode = document.querySelector('.example-code');
    const exampleResult = document.querySelector('.example-result');

    const streamExamples = {
        filter: {
            description: '使用filter过滤集合中的元素，只保留满足条件的元素。',
            code: `List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6);
numbers.stream()
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toList());`,
            result: '结果: [2, 4, 6]'
        },
        map: {
            description: '使用map将集合中的每个元素转换为新的形式。',
            code: `List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
names.stream()
    .map(String::toUpperCase)
    .collect(Collectors.toList());`,
            result: '结果: [ALICE, BOB, CHARLIE]'
        },
        collect: {
            description: '使用collect将Stream转换为不同的集合类型。',
            code: `List<String> items = Arrays.asList("A", "B", "C", "A");
items.stream()
    .collect(Collectors.toSet());`,
            result: '结果: [A, B, C]'
        },
        reduce: {
            description: '使用reduce将Stream中的元素组合起来。',
            code: `List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
Optional<Integer> sum = numbers.stream()
    .reduce((a, b) -> a + b);`,
            result: '结果: 15'
        },
        grouping: {
            description: '使用groupingBy将元素按照某个属性分组。',
            code: `class Person { String name; int age; }
List<Person> people = getPeople();
Map<Integer, List<Person>> byAge = people.stream()
    .collect(Collectors.groupingBy(Person::getAge));`,
            result: '结果: {25: [Person1, Person2], 30: [Person3]}'
        },
        flatMap: {
            description: '使用flatMap将嵌套的集合扁平化。',
            code: `List<List<Integer>> nested = Arrays.asList(
    Arrays.asList(1, 2),
    Arrays.asList(3, 4)
);
List<Integer> flat = nested.stream()
    .flatMap(Collection::stream)
    .collect(Collectors.toList());`,
            result: '结果: [1, 2, 3, 4]'
        }
    };

    function updateStreamExample() {
        const type = streamExampleType.value;
        const example = streamExamples[type];
        exampleDescription.textContent = example.description;
        exampleCode.textContent = example.code;
        exampleResult.textContent = example.result;
    }

    streamExampleType.addEventListener('change', updateStreamExample);
    
    // 初始化Stream示例
    updateStreamExample();
    
    // ==================== 初始化数据持久化 ====================
    // 在所有元素和事件监听器设置完成后，初始化数据持久化功能
    initPersistence();
    
    // 为特殊元素添加额外的恢复逻辑
    setTimeout(() => {
        // 恢复JSON树形视图
        const jsonInput = document.getElementById('jsonInput');
        if (jsonInput && jsonInput.value) {
            try {
                const json = JSON.parse(jsonInput.value);
                updateJsonTree(json);
                updateLineNumbers();
            } catch (e) {
                // 忽略解析错误
            }
        }
        
        // 恢复时间工具的显示
        const timestampInput = document.getElementById('timestamp');
        const datetimeInput = document.getElementById('datetime');
        if (timestampInput && timestampInput.value) {
            updateAllTimes('timestamp');
        } else if (datetimeInput && datetimeInput.value) {
            updateAllTimes('datetime');
        }
        
        // 恢复Go时间格式
        updateGoTimeFormat();
        
        // 恢复Stream示例
        updateStreamExample();
        
        // 更新所有行号显示
        const textareas = document.querySelectorAll('textarea.code-editor');
        textareas.forEach(textarea => {
            const lineNumbersId = textarea.id.replace(/Input|Output/, '') + 'LineNumbers';
            const lineNumbers = document.getElementById(lineNumbersId);
            if (lineNumbers && textarea.value) {
                updateCompareLineNumbers(textarea, lineNumbers);
            }
        });
    }, 100);
    
    // 添加全局快捷键支持
    document.addEventListener('keydown', function(e) {
        // Ctrl+S 保存当前状态（虽然已经自动保存，但给用户反馈）
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            showNotification('数据已自动保存', 'success');
        }
    });
}); 