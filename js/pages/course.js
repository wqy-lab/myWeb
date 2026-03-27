// Course detail page

import { Store } from '../store.js';
import { AssignmentItem } from '../components/assignmentItem.js';
import { Modal } from '../components/modal.js';
import { generateId, $, $$, fileToBase64, validateFile, formatFileSize } from '../utils.js';
import { daysShort, formatDate } from '../utils.js';

export const CoursePage = {
  container: null,
  courseId: null,

  init(container) {
    this.container = container;
  },

  render(courseId) {
    this.courseId = courseId;
    const course = Store.getCourse(courseId);

    if (!course) {
      this.container.innerHTML = `
        <div class="page">
          <div class="empty-state">
            <p>课程不存在</p>
            <a href="#home" class="btn btn-primary mt-2">返回首页</a>
          </div>
        </div>
      `;
      return;
    }

    const scheduleText = course.schedule
      ?.map(s => `${daysShort[s.day]} ${s.startTime}-${s.endTime}${s.location ? ' @' + s.location : ''}`)
      .join('<br>') || '暂无课程时间';

    this.container.innerHTML = `
      <div class="page" id="course-page">
        <a href="#home" class="btn btn-secondary mb-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          返回
        </a>

        <div class="card mb-3">
          <div class="course-card-color" style="height:8px;background:${course.color}"></div>
          <div class="card-body">
            <div class="course-card-header">
              <div>
                <h1 class="course-card-title" style="font-size:1.5rem">${course.name}</h1>
                <p class="course-card-teacher">${course.teacher || '未知教师'}</p>
              </div>
              <span class="course-card-status ${course.status}">
                ${course.status === 'current' ? '进行中' : '已结束'}
              </span>
            </div>
            <p class="course-card-description mt-2">${course.description || '暂无课程描述'}</p>
          </div>
        </div>

        <div class="card mb-3">
          <div class="card-header">
            <h3>上课时间</h3>
          </div>
          <div class="card-body">
            <p>${scheduleText}</p>
          </div>
        </div>

        <div class="card">
          <div class="card-header" style="display:flex;justify-content:space-between;align-items:center">
            <h3>作业列表</h3>
            <button class="btn btn-primary" data-action="add-assignment">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              添加作业
            </button>
          </div>
          <div class="card-body">
            <div class="assignment-list" id="assignment-list">
              ${course.assignments?.length > 0
                ? course.assignments.map(a => AssignmentItem.render(a, courseId)).join('')
                : `<div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <path d="M14 2v6h6M16 13H8M16 17H8"/>
                    </svg>
                    <p>暂无作业</p>
                  </div>`
              }
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  },

  attachEventListeners() {
    // Add assignment
    const addBtn = $('[data-action="add-assignment"]');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showAddAssignmentModal());
    }

    // Delegated events
    this.container.addEventListener('click', (e) => {
      const uploadBtn = e.target.closest('[data-upload-assignment]');
      const editBtn = e.target.closest('[data-edit-assignment]');
      const deleteBtn = e.target.closest('[data-delete-assignment]');
      const toggleBtn = e.target.closest('[data-toggle-submit]');

      if (uploadBtn) {
        this.showUploadModal(uploadBtn.dataset.uploadAssignment);
      } else if (editBtn) {
        this.showEditAssignmentModal(editBtn.dataset.editAssignment);
      } else if (deleteBtn) {
        this.confirmDeleteAssignment(deleteBtn.dataset.deleteAssignment);
      } else if (toggleBtn) {
        this.toggleSubmitted(toggleBtn.dataset.toggleSubmit);
      }
    });
  },

  showAddAssignmentModal() {
    const content = AssignmentItem.renderForm();
    const footer = `
      <button type="button" class="btn btn-secondary" data-close>取消</button>
      <button type="button" class="btn btn-primary" data-save>保存</button>
    `;

    const modal = Modal.open('添加作业', content, footer);
    this.setupAssignmentFormEvents(modal);
  },

  showEditAssignmentModal(assignmentId) {
    const course = Store.getCourse(this.courseId);
    const assignment = course?.assignments?.find(a => a.id === assignmentId);
    if (!assignment) return;

    const content = AssignmentItem.renderForm(assignment);
    const footer = `
      <button type="button" class="btn btn-secondary" data-close>取消</button>
      <button type="button" class="btn btn-primary" data-save>保存</button>
    `;

    const modal = Modal.open('编辑作业', content, footer);
    this.setupAssignmentFormEvents(modal, assignmentId);
  },

  setupAssignmentFormEvents(modal, assignmentId = null) {
    const form = $('form', modal);
    const saveBtn = $('[data-save]', modal);

    saveBtn.addEventListener('click', () => {
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const formData = new FormData(form);
      const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        dueDate: formData.get('dueDate') || null
      };

      if (assignmentId) {
        Store.updateAssignment(this.courseId, assignmentId, data);
      } else {
        Store.addAssignment(this.courseId, {
          id: generateId(),
          ...data,
          files: [],
          submittedAt: null
        });
      }

      Modal.close();
      this.render(this.courseId);
    });
  },

  confirmDeleteAssignment(assignmentId) {
    const course = Store.getCourse(this.courseId);
    const assignment = course?.assignments?.find(a => a.id === assignmentId);
    if (!assignment) return;

    const content = `<p>确定要删除作业「${assignment.title}」吗？</p>`;
    const footer = `
      <button type="button" class="btn btn-secondary" data-close>取消</button>
      <button type="button" class="btn btn-danger" data-delete>删除</button>
    `;

    const modal = Modal.open('删除作业', content, footer);
    $('[data-delete]', modal).addEventListener('click', () => {
      Store.deleteAssignment(this.courseId, assignmentId);
      Modal.close();
      this.render(this.courseId);
    });
  },

  showUploadModal(assignmentId) {
    const course = Store.getCourse(this.courseId);
    const assignment = course?.assignments?.find(a => a.id === assignmentId);
    if (!assignment) return;

    const existingFiles = assignment.files || [];
    const fileList = existingFiles.length
      ? existingFiles.map(f => `<span class="assignment-file">${f.name}</span>`).join('')
      : '暂无已上传文件';

    const content = `
      <div id="upload-area">
        <div class="file-upload" id="file-drop-zone">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
          </svg>
          <p class="file-upload-text">点击或拖拽文件到此处上传</p>
          <p class="file-upload-hint">文件大小不能超过 5MB</p>
          <input type="file" id="file-input" multiple style="display:none">
        </div>
        <div class="mt-2">
          <p class="mb-1"><strong>已上传文件：</strong></p>
          <div class="assignment-files" id="existing-files">${fileList}</div>
        </div>
      </div>
    `;

    const footer = `
      <button type="button" class="btn btn-secondary" data-close>关闭</button>
    `;

    const modal = Modal.open('上传作业', content, footer);

    // File upload handling
    const dropZone = $('#file-drop-zone', modal);
    const fileInput = $('#file-input', modal);

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--color-primary)';
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.style.borderColor = '';
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = '';
      this.handleFiles(e.dataTransfer.files, assignmentId, modal);
    });

    fileInput.addEventListener('change', () => {
      this.handleFiles(fileInput.files, assignmentId, modal);
    });
  },

  async handleFiles(files, assignmentId, modal) {
    const course = Store.getCourse(this.courseId);
    const assignment = course?.assignments?.find(a => a.id === assignmentId);
    if (!assignment) return;

    const newFiles = [];

    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        alert(validation.error);
        continue;
      }

      try {
        const dataUrl = await fileToBase64(file);
        newFiles.push({
          name: file.name,
          size: file.size,
          dataUrl
        });
      } catch (e) {
        console.error('File read error:', e);
        alert(`读取文件失败: ${file.name}`);
      }
    }

    if (newFiles.length > 0) {
      const updatedFiles = [...(assignment.files || []), ...newFiles];
      Store.updateAssignment(this.courseId, assignmentId, {
        files: updatedFiles,
        submittedAt: new Date().toISOString()
      });
      this.render(this.courseId);
      Modal.close();
    }
  },

  toggleSubmitted(assignmentId) {
    const course = Store.getCourse(this.courseId);
    const assignment = course?.assignments?.find(a => a.id === assignmentId);
    if (!assignment) return;

    const submittedAt = assignment.submittedAt ? null : new Date().toISOString();
    Store.updateAssignment(this.courseId, assignmentId, { submittedAt });
    this.render(this.courseId);
  }
};
