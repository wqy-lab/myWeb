// Utils - Helper functions

export const $ = (selector, parent = document) => parent.querySelector(selector);
export const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

export const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
export const daysShort = ['日', '一', '二', '三', '四', '五', '六'];

export const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

export const formatTime = (time) => {
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
};

export const formatDateTime = (isoString) => {
  const d = new Date(isoString);
  return `${formatDate(d)} ${formatTime(d.toTimeString().slice(0, 5))}`;
};

export const formatDueDate = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: `已逾期 ${Math.abs(diffDays)} 天`, isOverdue: true };
  if (diffDays === 0) return { text: '今日截止', isOverdue: false };
  if (diffDays === 1) return { text: '明日截止', isOverdue: false };
  return { text: `${diffDays} 天后截止`, isOverdue: false };
};

export const getDateString = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const isToday = (date) => {
  const today = new Date();
  const d = new Date(date);
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
};

export const isSameMonth = (date, monthDate) => {
  const d = new Date(date);
  const m = new Date(monthDate);
  return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
};

export const getMonthDays = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();

  const days = [];

  // Previous month days
  const prevMonth = new Date(year, month, 0);
  for (let i = startingDay - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonth.getDate() - i),
      isOtherMonth: true
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      isOtherMonth: false
    });
  }

  // Next month days
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isOtherMonth: true
    });
  }

  return days;
};

export const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export const throttle = (fn, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const validateFile = (file) => {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `文件大小不能超过 ${formatFileSize(MAX_FILE_SIZE)}` };
  }
  return { valid: true };
};
