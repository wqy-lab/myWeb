// Calendar page

import { Store } from '../store.js';
import { $, getMonthDays, isToday, isSameMonth, days, getDateString } from '../utils.js';

export const CalendarPage = {
  container: null,
  currentDate: new Date(),
  selectedDate: null,

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

        ${this.selectedDate ? this.renderEventPanel() : ''}
      </div>
    `;

    this.attachEventListeners();
  },

  renderDays(year, month, events) {
    const daysData = getMonthDays(year, month);
    const today = new Date();

    return daysData.map(({ date, isOtherMonth }) => {
      const dateStr = getDateString(date);
      const dayEvents = events.filter(e => getDateString(e.date) === dateStr);
      const isSelected = this.selectedDate && getDateString(date) === getDateString(this.selectedDate);
      const isTodayDate = isToday(date);

      return `
        <div class="calendar-day ${isOtherMonth ? 'other-month' : ''} ${isTodayDate ? 'today' : ''} ${isSelected ? 'selected' : ''}"
             data-date="${dateStr}">
          <div class="calendar-day-number">${date.getDate()}</div>
          <div class="calendar-events">
            ${dayEvents.slice(0, 3).map(e => `
              <div class="calendar-event ${e.type}"
                   style="--event-color: ${e.courseColor || '#4f46e5'}"
                   data-event-id="${e.id}"
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

  renderEventPanel() {
    const events = Store.getEventsForDate(this.selectedDate);
    const date = new Date(this.selectedDate);

    return `
      <div class="event-panel">
        <div class="event-panel-header">
          <div class="event-panel-title">${date.getMonth() + 1}月${date.getDate()}日</div>
          <div class="event-panel-date">${events.length} 个事件</div>
        </div>
        <div class="event-panel-list">
          ${events.length > 0
            ? events.map(e => `
                <div class="event-panel-item">
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
      </div>
    `;
  },

  attachEventListeners() {
    // Navigation
    $('[data-prev-month]', this.container)?.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.selectedDate = null;
      this.render();
    });

    $('[data-next-month]', this.container)?.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.selectedDate = null;
      this.render();
    });

    $('[data-today]', this.container)?.addEventListener('click', () => {
      this.currentDate = new Date();
      this.selectedDate = null;
      this.render();
    });

    // Day selection
    this.container.querySelectorAll('.calendar-day').forEach(day => {
      day.addEventListener('click', () => {
        this.selectedDate = day.dataset.date;
        this.render();
      });
    });

    // Event click
    this.container.querySelectorAll('.calendar-event').forEach(event => {
      event.addEventListener('click', (e) => {
        e.stopPropagation();
        const eventType = event.dataset.eventType;
        if (eventType === 'class') {
          // Navigate to course - extract courseId from event id
          const eventId = event.dataset.eventId;
          const courseId = eventId.split('-').slice(0, -1).join('-');
          window.location.hash = `course/${courseId}`;
        }
      });
    });
  }
};
