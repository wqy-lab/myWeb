// AssignmentItem component

import { formatDueDate, formatFileSize } from '../utils.js';

export const AssignmentItem = {
  render(assignment, courseId) {
    const due = assignment.dueDate ? formatDueDate(assignment.dueDate) : null;
    const isSubmitted = !!assignment.submittedAt;

    return `
      <div class="assignment-item ${isSubmitted ? 'submitted' : ''}"
           data-assignment-id="${assignment.id}">
        <div class="assignment-checkbox ${isSubmitted ? 'checked' : ''}"
             data-toggle-submit="${assignment.id}">
        </div>
        <div class="assignment-content">
          <div class="assignment-title">${assignment.title}</div>
          ${due ? `
            <div class="assignment-due ${due.isOverdue ? 'overdue' : ''}">
              截止：${new Date(assignment.dueDate).toLocaleDateString('zh-CN')} ${due.text}
            </div>
          ` : ''}
          ${assignment.files?.length ? `
            <div class="assignment-files">
              ${assignment.files.map(f => `
                <span class="assignment-file">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                  </svg>
                  ${f.name}
                </span>
              `).join('')}
            </div>
          ` : ''}
        </div>
        <div class="assignment-actions">
          <button class="btn btn-icon" data-upload-assignment="${assignment.id}" title="上传文件">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
          </button>
          <button class="btn btn-icon" data-edit-assignment="${assignment.id}" title="编辑">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="btn btn-icon" data-delete-assignment="${assignment.id}" title="删除">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  },

  renderForm(assignment = null) {
    const isEdit = !!assignment;
    return `
      <form id="assignment-form">
        <div class="form-group">
          <label class="form-label">作业标题</label>
          <input type="text" class="form-input" name="title" required
                 value="${assignment?.title || ''}" placeholder="例如：第三章作业">
        </div>
        <div class="form-group">
          <label class="form-label">作业描述</label>
          <textarea class="form-input form-textarea" name="description"
                    placeholder="作业要求...">${assignment?.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">截止日期</label>
          <input type="datetime-local" class="form-input" name="dueDate"
                 value="${assignment?.dueDate || ''}">
        </div>
      </form>
    `;
  }
};
