// Home page - Current and past courses

import { Store } from '../store.js';
import { CourseCard } from '../components/courseCard.js';
import { Modal } from '../components/modal.js';
import { generateId, $ } from '../utils.js';

export const HomePage = {
  container: null,

  init(container) {
    this.container = container;
  },

  render() {
    const courses = Store.getCourses();
    const currentCourses = courses.filter(c => c.status === 'current');
    const pastCourses = courses.filter(c => c.status === 'past');

    this.container.innerHTML = `
      <div class="page" id="home-page">
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">当前课程</h2>
            <button class="btn btn-primary" data-action="add-course">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              添加课程
            </button>
          </div>
          <div class="course-grid" id="current-courses" data-status="current">
            ${currentCourses.length > 0
              ? currentCourses.map(c => CourseCard.render(c)).join('')
              : `<div class="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                  </svg>
                  <p>暂无当前课程，点击上方按钮添加</p>
                </div>`
            }
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <h2 class="section-title">历史课程</h2>
          </div>
          <div class="course-grid" id="past-courses" data-status="past">
            ${pastCourses.length > 0
              ? pastCourses.map(c => CourseCard.render(c)).join('')
              : `<div class="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  <p>暂无历史课程</p>
                </div>`
            }
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
    this.initDragAndDrop();
  },

  attachEventListeners() {
    // Add course button
    const addBtn = $('[data-action="add-course"]');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showAddCourseModal());
    }

    // Delegated event listeners for course cards
    this.container.addEventListener('click', (e) => {
      const viewBtn = e.target.closest('[data-view-course]');
      const editBtn = e.target.closest('[data-edit-course]');
      const deleteBtn = e.target.closest('[data-delete-course]');

      if (viewBtn) {
        const courseId = viewBtn.dataset.viewCourse;
        window.location.hash = `course/${courseId}`;
      } else if (editBtn) {
        const courseId = editBtn.dataset.editCourse;
        this.showEditCourseModal(courseId);
      } else if (deleteBtn) {
        const courseId = deleteBtn.dataset.deleteCourse;
        this.confirmDeleteCourse(courseId);
      }
    });
  },

  initDragAndDrop() {
    const grids = this.container.querySelectorAll('.course-grid');

    grids.forEach(grid => {
      let draggedCard = null;

      grid.addEventListener('dragstart', (e) => {
        const card = e.target.closest('.course-card');
        if (card) {
          draggedCard = card;
          card.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
        }
      });

      grid.addEventListener('dragend', (e) => {
        const card = e.target.closest('.course-card');
        if (card) {
          card.classList.remove('dragging');
        }
        grid.querySelectorAll('.course-card').forEach(c => c.classList.remove('drag-over'));
      });

      grid.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = this.getDragAfterElement(grid, e.clientY);
        const card = e.target.closest('.course-card');

        if (card && card !== draggedCard) {
          card.classList.add('drag-over');
        }
      });

      grid.addEventListener('dragleave', (e) => {
        const card = e.target.closest('.course-card');
        if (card) {
          card.classList.remove('drag-over');
        }
      });

      grid.addEventListener('drop', (e) => {
        e.preventDefault();
        const card = e.target.closest('.course-card');
        if (card && card !== draggedCard) {
          const afterElement = this.getDragAfterElement(grid, e.clientY);
          if (afterElement) {
            grid.insertBefore(draggedCard, afterElement);
          } else {
            grid.appendChild(draggedCard);
          }
          this.saveOrder(grid);
        }
        grid.querySelectorAll('.course-card').forEach(c => c.classList.remove('drag-over'));
      });
    });
  },

  getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.course-card:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      }
      return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  },

  saveOrder(grid) {
    const courseIds = [...grid.querySelectorAll('.course-card')]
      .map(card => card.dataset.courseId);
    Store.reorderCourses(courseIds);
  },

  showAddCourseModal() {
    const content = CourseCard.renderForm();
    const footer = `
      <button type="button" class="btn btn-secondary" data-close>取消</button>
      <button type="button" class="btn btn-primary" data-save>保存</button>
    `;

    const modal = Modal.open('添加课程', content, footer);
    this.setupFormEvents(modal);
  },

  showEditCourseModal(courseId) {
    const course = Store.getCourse(courseId);
    if (!course) return;

    const content = CourseCard.renderForm(course);
    const footer = `
      <button type="button" class="btn btn-secondary" data-close>取消</button>
      <button type="button" class="btn btn-primary" data-save>保存</button>
    `;

    const modal = Modal.open('编辑课程', content, footer);
    this.setupFormEvents(modal, courseId);
  },

  setupFormEvents(modal, courseId = null) {
    const form = $('form', modal);
    const saveBtn = modal.querySelector('[data-save]');
    const cancelBtn = modal.querySelector('[data-close]');
    const addScheduleBtn = modal.querySelector('#add-schedule');
    const colorOptions = modal.querySelectorAll('.color-option');
    let scheduleCount = form.querySelectorAll('.schedule-row').length;

    // Save button
    saveBtn.addEventListener('click', () => {
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const data = CourseCard.getFormData(form);
      if (courseId) {
        Store.updateCourse(courseId, data);
      } else {
        Store.addCourse({ id: generateId(), ...data, assignments: [] });
      }
      Modal.close();
      this.render();
    });

    // Cancel button - just close modal (Modal component handles this)
    cancelBtn.addEventListener('click', () => Modal.close());

    // Add schedule
    addScheduleBtn.addEventListener('click', () => {
      const scheduleInputs = $('#schedule-inputs', modal);
      scheduleInputs.insertAdjacentHTML('beforeend',
        CourseCard.renderScheduleRow({}, scheduleCount++));
    });

    // Remove schedule
    modal.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('[data-remove-schedule]');
      if (removeBtn) {
        removeBtn.closest('.schedule-row').remove();
      }
    });

    // Color picker
    colorOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        colorOptions.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
      });
    });
  },

  confirmDeleteCourse(courseId) {
    const course = Store.getCourse(courseId);
    if (!course) return;

    // Remove any existing modal first
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
      existingModal.remove();
    }

    const content = `<p>确定要删除课程「${course.name}」吗？此操作不可撤销。</p>`;
    const footer = `
      <button type="button" class="btn btn-secondary" data-close>取消</button>
      <button type="button" class="btn btn-danger" data-delete>删除</button>
    `;

    const modal = Modal.open('删除课程', content, footer);
    const deleteBtn = modal.querySelector('[data-delete]');
    const cancelBtn = modal.querySelector('[data-close]');

    // Use { once: true } to prevent duplicate handlers
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      Store.deleteCourse(courseId);
      Modal.close();
      this.render();
    }, { once: true });

    cancelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      Modal.close();
    }, { once: true });
  }
};
