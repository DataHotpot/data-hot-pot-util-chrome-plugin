// ==================== Cron工具模块 ====================

// Cron表达式相关元素
let cronInput, cronDescription, nextExecutions;

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

// 初始化Cron工具
function initCronTools() {
    // 获取DOM元素
    cronInput = document.getElementById('cronInput');
    cronDescription = document.getElementById('cronDescription');
    nextExecutions = document.getElementById('nextExecutions');

    if (!cronInput) return;

    // 解析Cron表达式按钮
    const parseBtn = document.getElementById('parseCron');
    if (parseBtn) {
        parseBtn.addEventListener('click', () => {
            try {
                const cronExp = cronInput.value.trim();
                const description = parseCronExpression(cronExp);
                if (cronDescription) {
                    cronDescription.textContent = description;
                }
                if (typeof showNotification === 'function') {
                    showNotification('Cron表达式解析成功', 'success');
                }
            } catch (e) {
                if (cronDescription) {
                    cronDescription.textContent = '解析错误：' + e.message;
                }
                if (typeof showNotification === 'function') {
                    showNotification('Cron表达式解析失败：' + e.message, 'error');
                }
            }
        });
    }

    // 获取最近执行时间按钮
    const nextTimesBtn = document.getElementById('getNextTimes');
    if (nextTimesBtn) {
        nextTimesBtn.addEventListener('click', () => {
            try {
                const cronExp = cronInput.value.trim();
                const nextTimes = getNextExecutionTimes(cronExp);
                if (nextExecutions) {
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
                }
                if (typeof showNotification === 'function') {
                    showNotification('已计算最近5次执行时间', 'success');
                }
            } catch (e) {
                if (nextExecutions) {
                    nextExecutions.textContent = '计算错误：' + e.message;
                }
                if (typeof showNotification === 'function') {
                    showNotification('执行时间计算失败：' + e.message, 'error');
                }
            }
        });
    }

    // 点击示例填充输入框
    document.querySelectorAll('.example-item').forEach(item => {
        item.addEventListener('click', () => {
            cronInput.value = item.dataset.cron;
            // 自动触发解析
            if (parseBtn) {
                parseBtn.click();
            }
        });
    });
}

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
        
        // 防止无限循环，最多查找1000天
        if (currentDate.getTime() - now.getTime() > 1000 * 24 * 60 * 60 * 1000) {
            break;
        }
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
    const w = date.getDay() || 7; // 将周日(0)转换为7

    return matchPart(minute, m, 59) &&
           matchPart(hour, h, 23) &&
           matchPart(day, d, 31) &&
           matchPart(month, mon, 12) &&
           matchPart(week, w, 7);
} 