// Calendar page

import { Store } from '../store.js';
import { Modal } from '../components/modal.js';
import { $, getMonthDays, isToday, days, getDateString } from '../utils.js';

export const CalendarPage = {
  container: null,
  currentDate: new Date(),

  init(container) {
    this.container = container;
  },

  render() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const events = Store.getCalendarEvents(year, month);

    this.container.innerHTML = `
      <div class="page" id="calendar-page">
        <div class="calendar-container">
          <div class="calendar-header">
            <h2 class="calendar-title">${year}年${month + 1}月</h2>
            <div class="calendar-nav">
              <button class="calendar-nav-btn" data-prev-month>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              <button class="calendar-nav-btn" data-today>今天</button>
              <button class="calendar-nav-btn" data-next-month>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="calendar-grid">
            ${days.map(d => `<div class="calendar-weekday">${d}</div>`).join('')}
            ${this.renderDays(year, month, events)}
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  },

  renderDays(year, month, events) {
    const daysData = getMonthDays(year, month);

    return daysData.map(({ date, isOtherMonth }) => {
      const dateStr = getDateString(date);
      const dayEvents = events.filter(e => getDateString(e.date) === dateStr);
      const isTodayDate = isToday(date);

      return `
        <div class="calendar-day ${isOtherMonth ? 'other-month' : ''} ${isTodayDate ? 'today' : ''}"
             data-date="${dateStr}">
          <div class="calendar-day-number">${date.getDate()}</div>
          <div class="calendar-events">
            ${dayEvents.slice(0, 3).map(e => `
              <div class="calendar-event ${e.type}"
                   style="--event-color: ${e.courseColor || '#4f46e5'}"
                   data-course-id="${e.courseId}"
                   data-event-type="${e.type}">
                ${e.title}
              </div>
            `).join('')}
            ${dayEvents.length > 3 ? `
              <div class="calendar-more">+${dayEvents.length - 3} 更多</div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  showDayModal(dateStr) {
    const events = Store.getEventsForDate(dateStr);
    const date = new Date(dateStr);
    const dateDisplay = `${date.getMonth() + 1}月${date.getDate()}日`;

    const content = `
      <div class="event-panel-list">
        ${events.length > 0
          ? events.map(e => `
              <div class="event-panel-item" ${e.type === 'class' ? `data-go-course="${e.courseId}" style="cursor:pointer"` : ''}>
                <div class="event-panel-item-color" style="background: ${e.courseColor || '#4f46e5'}"></div>
                <div class="event-panel-item-content">
                  <div class="event-panel-item-title">${e.title}</div>
                  <div class="event-panel-item-time">${e.time || ''} ${e.endTime ? '- ' + e.endTime : ''}</div>
                  ${e.location ? `<div class="event-panel-item-course">📍 ${e.location}</div>` : ''}
                  ${e.courseName && e.type === 'deadline' ? `<div class="event-panel-item-course">📚 ${e.courseName}</div>` : ''}
                </div>
              </div>
            `).join('')
          : '<p class="text-secondary">当天没有事件</p>'
        }
      </div>
    `;

    const footer = `
      <button type="button" class="btn btn-secondary" data-close>关闭</button>
    `;

    const modal = Modal.open(`${dateDisplay}日程`, content, footer);

    // Click on course item to go to course
    modal.querySelectorAll('[data-go-course]').forEach(item => {
      item.addEventListener('click', () => {
        const courseId = item.dataset.goCourse;
        Modal.close();
        window.location.hash = `course/${courseId}`;
      });
    });
  },

  attachEventListeners() {
    // Navigation
    $('[data-prev-month]', this.container)?.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.render();
    });

    $('[data-next-month]', this.container)?.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.render();
    });

    $('[data-today]', this.container)?.addEventListener('click', () => {
      this.currentDate = new Date();
      this.render();
    });

    // Day selection - show modal
    this.container.querySelectorAll('.calendar-day').forEach(day => {
      day.addEventListener('click', (e) => {
        // Don't show modal if clicking on an event
        if (!e.target.closest('.calendar-event')) {
          this.showDayModal(day.dataset.date);
        }
      });
    });

    // Event click - go to course
    this.container.querySelectorAll('.calendar-event').forEach(event => {
      event.addEventListener('click', (e) => {
        e.stopPropagation();
        const courseId = event.dataset.courseId;
        if (courseId) {
          window.location.hash = `course/${courseId}`;
        }
      });
    });
  }
};
