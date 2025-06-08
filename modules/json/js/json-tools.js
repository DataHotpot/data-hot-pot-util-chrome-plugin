// ==================== JSON工具模块 ====================

// JSON处理工具相关元素
let jsonInput, jsonTree, lineNumbers;
let originalJson, targetJson, originalLineNumbers, targetLineNumbers;

// 初始化JSON工具
function initJsonTools() {
    // 获取DOM元素
    jsonInput = document.getElementById('jsonInput');
    jsonTree = document.getElementById('jsonTree');
    lineNumbers = document.getElementById('lineNumbers');
    originalJson = document.getElementById('originalJson');
    targetJson = document.getElementById('targetJson');
    originalLineNumbers = document.getElementById('originalLineNumbers');
    targetLineNumbers = document.getElementById('targetLineNumbers');

    if (!jsonInput) return;

    // 初始化JSON处理功能
    initJsonProcessor();
    
    // 初始化JSON对比功能
    initJsonCompare();
}

// 初始化JSON处理功能
function initJsonProcessor() {
    // 监听输入更新行号和树形视图
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

    // 监听滚动事件，同步错误高亮位置
    jsonInput.addEventListener('scroll', () => {
        const errorMark = jsonInput.parentElement.querySelector('.error-mark');
        if (errorMark) {
            errorMark.style.transform = `translateY(-${jsonInput.scrollTop}px)`;
        }
    });

    // 格式化JSON按钮
    const formatBtn = document.getElementById('formatJson');
    if (formatBtn) {
        formatBtn.addEventListener('click', () => {
            try {
                const json = JSON.parse(jsonInput.value);
                jsonInput.value = JSON.stringify(json, null, 2);
                updateLineNumbers();
                updateJsonTree(json);
                clearErrorHighlight();
                if (typeof showNotification === 'function') {
                    showNotification('JSON格式化成功', 'success');
                }
            } catch (e) {
                highlightJsonError(e);
            }
        });
    }

    // 压缩JSON按钮
    const compressBtn = document.getElementById('compressJson');
    if (compressBtn) {
        compressBtn.addEventListener('click', () => {
            try {
                const json = JSON.parse(jsonInput.value);
                jsonInput.value = JSON.stringify(json);
                updateLineNumbers();
                updateJsonTree(json);
                if (typeof showNotification === 'function') {
                    showNotification('JSON压缩成功', 'success');
                }
            } catch (e) {
                if (typeof showNotification === 'function') {
                    showNotification('JSON格式错误：' + e.message, 'error');
                }
            }
        });
    }

    // 验证JSON按钮
    const validateBtn = document.getElementById('validateJson');
    if (validateBtn) {
        validateBtn.addEventListener('click', () => {
            try {
                JSON.parse(jsonInput.value);
                if (typeof showNotification === 'function') {
                    showNotification('JSON格式有效', 'success');
                }
            } catch (e) {
                if (typeof showNotification === 'function') {
                    showNotification('JSON格式错误：' + e.message, 'error');
                }
            }
        });
    }
}

// 更新行号
function updateLineNumbers() {
    if (!jsonInput || !lineNumbers) return;
    
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

// 更新树形视图
function updateJsonTree(json) {
    if (!jsonTree) return;
    
    jsonTree.innerHTML = '';
    const fragment = document.createDocumentFragment();
    buildTreeView(json, fragment);
    jsonTree.appendChild(fragment);
}

// 构建树形视图
function buildTreeView(data, parent, depth = 0) {
    if (typeof data === 'object' && data !== null) {
        Object.entries(data).forEach(([key, value]) => {
            const item = document.createElement('div');
            item.className = 'tree-item';
            item.style.paddingLeft = `${depth * 20}px`;

            const keySpan = document.createElement('span');
            keySpan.className = 'tree-key';
            keySpan.textContent = Array.isArray(data) ? `[${key}]` : `"${key}"`;
            item.appendChild(keySpan);

            if (typeof value === 'object' && value !== null) {
                const typeIndicator = Array.isArray(value) ? '[...]' : '{...}';
                const typeSpan = document.createElement('span');
                typeSpan.className = 'tree-type';
                typeSpan.textContent = `: ${typeIndicator}`;
                item.appendChild(typeSpan);
                
                parent.appendChild(item);
                buildTreeView(value, parent, depth + 1);
            } else {
                const valueSpan = document.createElement('span');
                valueSpan.className = `tree-value tree-${typeof value}`;
                valueSpan.textContent = `: ${JSON.stringify(value)}`;
                item.appendChild(valueSpan);
                parent.appendChild(item);
            }
        });
    } else {
        // 处理原始值
        const item = document.createElement('div');
        item.className = 'tree-item';
        item.style.paddingLeft = `${depth * 20}px`;
        
        const valueSpan = document.createElement('span');
        valueSpan.className = `tree-value tree-${typeof data}`;
        valueSpan.textContent = JSON.stringify(data);
        item.appendChild(valueSpan);
        parent.appendChild(item);
    }
}

// 高亮显示JSON错误位置
function highlightJsonError(error) {
    if (!jsonInput) return;
    
    const match = error.message.match(/position (\d+)/);
    if (match) {
        const position = parseInt(match[1]);
        const value = jsonInput.value;
        
        // 计算行号和列号
        let line = 1;
        let column = 0;
        let currentPos = 0;
        
        for (let i = 0; i < value.length && currentPos < position; i++) {
            currentPos++;
            if (value[i] === '\n') {
                line++;
                column = 0;
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
        errorMark.style.left = `${column * 8 + 10}px`;
        errorMark.style.top = `${((line - 1) * 21) + 10}px`;
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
        const lineHeight = 21;
        const scrollPosition = (line - 1) * lineHeight;
        jsonInput.scrollTop = Math.max(0, scrollPosition - jsonInput.clientHeight / 2);

        // 设置选择范围
        jsonInput.focus();
        jsonInput.setSelectionRange(position, position + 1);

        if (typeof showNotification === 'function') {
            showNotification(`JSON格式错误（第${line}行，第${column}列）：${error.message}\n\n错误行内容：\n${errorLine}\n${' '.repeat(column)}^`, 'error');
        }
    } else {
        if (typeof showNotification === 'function') {
            showNotification('JSON格式错误：' + error.message, 'error');
        }
    }
}

// 清除错误高亮
function clearErrorHighlight() {
    if (!jsonInput) return;
    
    // 清除选择
    jsonInput.setSelectionRange(jsonInput.value.length, jsonInput.value.length);
    
    // 移除错误标记
    const errorMarks = document.querySelectorAll('.error-mark');
    errorMarks.forEach(mark => mark.remove());
}

// 初始化JSON对比功能
function initJsonCompare() {
    if (!originalJson || !targetJson) return;

    // 监听输入更新行号
    originalJson.addEventListener('input', () => {
        updateCompareLineNumbers(originalJson, originalLineNumbers);
    });

    targetJson.addEventListener('input', () => {
        updateCompareLineNumbers(targetJson, targetLineNumbers);
    });

    // 同步滚动
    originalJson.addEventListener('scroll', () => {
        if (originalLineNumbers) {
            originalLineNumbers.scrollTop = originalJson.scrollTop;
        }
    });

    targetJson.addEventListener('scroll', () => {
        if (targetLineNumbers) {
            targetLineNumbers.scrollTop = targetJson.scrollTop;
        }
    });

    // 格式化两个JSON编辑器
    const formatBothBtn = document.getElementById('formatBothJson');
    if (formatBothBtn) {
        formatBothBtn.addEventListener('click', () => {
            try {
                // 格式化原始JSON
                const original = JSON.parse(originalJson.value);
                originalJson.value = JSON.stringify(original, null, 2);
                updateCompareLineNumbers(originalJson, originalLineNumbers);

                // 格式化目标JSON
                const target = JSON.parse(targetJson.value);
                targetJson.value = JSON.stringify(target, null, 2);
                updateCompareLineNumbers(targetJson, targetLineNumbers);

                if (typeof showNotification === 'function') {
                    showNotification('JSON格式化成功', 'success');
                }
            } catch (e) {
                if (typeof showNotification === 'function') {
                    showNotification('JSON格式错误：' + e.message, 'error');
                }
            }
        });
    }

    // JSON对比按钮
    const compareBtn = document.getElementById('compareJson');
    if (compareBtn) {
        compareBtn.addEventListener('click', () => {
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
                if (typeof showNotification === 'function') {
                    showNotification('JSON格式错误：' + e.message, 'error');
                }
            }
        });
    }
}

// 更新对比编辑器的行号
function updateCompareLineNumbers(editor, lineNumbersContainer) {
    if (!editor || !lineNumbersContainer) return;
    
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

// JSON对比函数
function compareJson(original, target) {
    const diff = {
        added: [],
        removed: [],
        changed: []
    };

    function compareObjects(path, obj1, obj2) {
        if (obj1 === null || obj2 === null || typeof obj1 !== 'object' || typeof obj2 !== 'object') {
            return;
        }

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
                if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object' && 
                    obj1[key] !== null && obj2[key] !== null) {
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
    if (!diffResult) return;

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

// 高亮差异
function highlightDifferences(diff) {
    // 清除之前的高亮
    clearHighlights();

    // 高亮删除的内容（在原始编辑器中）
    diff.removed.forEach(item => {
        const lineIndex = findLineIndex(originalJson.value.split('\n'), item.path);
        if (lineIndex !== -1) {
            createHighlightOverlay(originalJson, lineIndex, 'highlight-removed');
        }
    });

    // 高亮新增的内容（在目标编辑器中）
    diff.added.forEach(item => {
        const lineIndex = findLineIndex(targetJson.value.split('\n'), item.path);
        if (lineIndex !== -1) {
            createHighlightOverlay(targetJson, lineIndex, 'highlight-added');
        }
    });

    // 高亮修改的内容（在两个编辑器中都高亮）
    diff.changed.forEach(item => {
        const originalLineIndex = findLineIndex(originalJson.value.split('\n'), item.path);
        const targetLineIndex = findLineIndex(targetJson.value.split('\n'), item.path);
        
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
    const editorContent = editor.parentElement;
    const overlay = document.createElement('div');
    overlay.className = `diff-line ${className}`;
    overlay.style.position = 'absolute';
    overlay.style.left = '10px';
    overlay.style.right = '10px';
    overlay.style.top = `${lineIndex * 21 + 10}px`;
    overlay.style.height = '21px';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '1';
    
    editorContent.appendChild(overlay);
}

// 清除高亮
function clearHighlights() {
    const highlights = document.querySelectorAll('.diff-line');
    highlights.forEach(highlight => highlight.remove());
}

// 查找包含指定路径的行索引
function findLineIndex(lines, path) {
    // 简化版本：查找包含路径键名的行
    const pathParts = path.split('.');
    const lastKey = pathParts[pathParts.length - 1];
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(`"${lastKey}"`)) {
            return i;
        }
    }
    return -1;
} 