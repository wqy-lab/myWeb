// CourseCard component

import { daysShort } from '../utils.js';

export const CourseCard = {
  render(course, isDragging = false) {
    const scheduleText = course.schedule
      ?.map(s => `${daysShort[s.day]} ${s.startTime}-${s.endTime}`)
      .join(', ') || '暂无课程时间';

    return `
      <div class="course-card ${isDragging ? 'dragging' : ''}"
           data-course-id="${course.id}"
           draggable="true">
        <div class="course-card-color" style="background: ${course.color}"></div>
        <div class="course-card-content">
          <div class="course-card-header">
            <div>
              <div class="course-card-title">${course.name}</div>
              <div class="course-card-teacher">${course.teacher || '未知教师'}</div>
            </div>
            <span class="course-card-status ${course.status}">
              ${course.status === 'current' ? '进行中' : '已结束'}
            </span>
          </div>
          <p class="course-card-description">${course.description || '暂无课程描述'}</p>
          <div class="course-card-schedule">
            <span class="schedule-tag">${scheduleText}</span>
          </div>
          <div class="course-card-actions">
            <button class="btn btn-icon" data-view-course="${course.id}" title="查看详情">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </button>
            <button class="btn btn-icon" data-edit-course="${course.id}" title="编辑">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="btn btn-icon" data-delete-course="${course.id}" title="删除">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  renderForm(course = null) {
    const isEdit = !!course;
    return `
      <form id="course-form">
        <div class="form-group">
          <label class="form-label">课程名称</label>
          <input type="text" class="form-input" name="name" required
                 value="${course?.name || ''}" placeholder="例如：高等数学">
        </div>
        <div class="form-group">
          <label class="form-label">授课教师</label>
          <input type="text" class="form-input" name="teacher"
                 value="${course?.teacher || ''}" placeholder="例如：张老师">
        </div>
        <div class="form-group">
          <label class="form-label">课程描述</label>
          <textarea class="form-input form-textarea" name="description"
                    placeholder="课程简介...">${course?.description || ''}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">课程状态</label>
            <select class="form-input form-select" name="status">
              <option value="current" ${course?.status === 'current' ? 'selected' : ''}>进行中</option>
              <option value="past" ${course?.status === 'past' ? 'selected' : ''}>已结束</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">课程颜色</label>
            <div class="color-picker">
              ${['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']
                .map(color => `
                  <div class="color-option ${course?.color === color ? 'selected' : ''}"
                       data-color="${color}"
                       style="background: ${color}">
                  </div>
                `).join('')}
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">上课时间</label>
          <div class="schedule-inputs" id="schedule-inputs">
            ${(course?.schedule || [{ day: 1, startTime: '09:00', endTime: '10:30', location: '' }])
              .map((s, i) => this.renderScheduleRow(s, i)).join('')}
          </div>
          <button type="button" class="btn btn-secondary mt-2" id="add-schedule">
            + 添加时间段
          </button>
        </div>
      </form>
    `;
  },

  renderScheduleRow(schedule = { day: 1, startTime: '09:00', endTime: '10:30', location: '' }, index = 0) {
    return `
      <div class="schedule-row" data-schedule-index="${index}">
        <select class="form-input form-select" name="schedule[${index}][day]">
          ${[0,1,2,3,4,5,6].map(d => `
            <option value="${d}" ${schedule.day === d ? 'selected' : ''}>${['周日','周一','周二','周三','周四','周五','周六'][d]}</option>
          `).join('')}
        </select>
        <input type="time" class="form-input" name="schedule[${index}][startTime]"
               value="${schedule.startTime}" required>
        <input type="time" class="form-input" name="schedule[${index}][endTime]"
               value="${schedule.endTime}" required>
        <input type="text" class="form-input" name="schedule[${index}][location]"
               value="${schedule.location || ''}" placeholder="教室">
        <button type="button" class="btn btn-icon btn-remove-schedule" data-remove-schedule="${index}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `;
  },

  getFormData(form) {
    const formData = new FormData(form);
    const selectedColor = form.closest('.modal-overlay')?.querySelector('.color-option.selected');
    const data = {
      name: formData.get('name'),
      teacher: formData.get('teacher'),
      description: formData.get('description'),
      status: formData.get('status'),
      color: selectedColor?.dataset.color || '#4f46e5',
      schedule: []
    };

    // Collect schedule data
    const scheduleRows = form.querySelectorAll('.schedule-row');
    scheduleRows.forEach(row => {
      const day = parseInt(row.querySelector('[name*="[day]"]')?.value || 0);
      const startTime = row.querySelector('[name*="[startTime]"]')?.value;
      const endTime = row.querySelector('[name*="[endTime]"]')?.value;
      const location = row.querySelector('[name*="[location]"]')?.value;
      if (startTime && endTime) {
        data.schedule.push({ day, startTime, endTime, location });
      }
    });

    return data;
  }
};
