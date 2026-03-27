// Main app entry point

import { Store } from './store.js';
import { Router } from './router.js';
import { Sidebar } from './components/sidebar.js';
import { Header } from './components/header.js';
import { HomePage } from './pages/home.js';
import { CoursePage } from './pages/course.js';
import { CalendarPage } from './pages/calendar.js';
import { $ } from './utils.js';

class App {
  constructor() {
    this.mainContent = null;
  }

  init() {
    // Initialize store
    Store.init();

    // Create layout
    this.createLayout();

    // Register routes
    this.registerRoutes();

    // Initialize router
    Router.init();
  }

  createLayout() {
    const app = $('#app');
    app.innerHTML = `
      ${Sidebar.render('home')}
      <div class="main-content">
        <div id="page-content"></div>
      </div>
    `;

    this.mainContent = $('#page-content');
  }

  registerRoutes() {
    // Home page
    HomePage.init(this.mainContent);
    Router.register('home', () => {
      this.updateSidebar('home');
      HomePage.render();
    });

    // Course detail page
    CoursePage.init(this.mainContent);
    Router.register('course', (courseId) => {
      this.updateSidebar('home');
      CoursePage.render(courseId);
    });

    // Calendar page
    CalendarPage.init(this.mainContent);
    Router.register('calendar', () => {
      this.updateSidebar('calendar');
      CalendarPage.render();
    });
  }

  updateSidebar(activePath) {
    const sidebar = $('.sidebar');
    if (sidebar) {
      sidebar.innerHTML = Sidebar.render(activePath).trim();
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
