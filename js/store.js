// Store - localStorage data management

const STORAGE_KEY = 'vibe_courses';

const defaultData = {
  courses: [],
  settings: {
    theme: 'light'
  }
};

export const Store = {
  data: null,

  init() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        this.data = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored data:', e);
        this.data = { ...defaultData };
      }
    } else {
      this.data = { ...defaultData };
    }
  },

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save data:', e);
      alert('存储空间不足，请清理一些已上传的文件');
    }
  },

  // Course operations
  getCourses() {
    return this.data.courses;
  },

  getCourse(id) {
    return this.data.courses.find(c => c.id === id);
  },

  addCourse(course) {
    this.data.courses.push(course);
    this.save();
  },

  updateCourse(id, updates) {
    const index = this.data.courses.findIndex(c => c.id === id);
    if (index !== -1) {
      this.data.courses[index] = { ...this.data.courses[index], ...updates };
      this.save();
    }
  },

  deleteCourse(id) {
    this.data.courses = this.data.courses.filter(c => c.id !== id);
    this.save();
  },

  reorderCourses(currentIds) {
    const courses = this.data.courses;
    const reordered = currentIds.map(id => courses.find(c => c.id === id)).filter(Boolean);
    const remaining = courses.filter(c => !currentIds.includes(c.id));
    this.data.courses = [...reordered, ...remaining];
    this.save();
  },

  // Assignment operations
  addAssignment(courseId, assignment) {
    const course = this.getCourse(courseId);
    if (course) {
      if (!course.assignments) course.assignments = [];
      course.assignments.push(assignment);
      this.save();
    }
  },

  updateAssignment(courseId, assignmentId, updates) {
    const course = this.getCourse(courseId);
    if (course) {
      const index = course.assignments.findIndex(a => a.id === assignmentId);
      if (index !== -1) {
        course.assignments[index] = { ...course.assignments[index], ...updates };
        this.save();
      }
    }
  },

  deleteAssignment(courseId, assignmentId) {
    const course = this.getCourse(courseId);
    if (course) {
      course.assignments = course.assignments.filter(a => a.id !== assignmentId);
      this.save();
    }
  },

  // Get all calendar events
  getCalendarEvents(year, month) {
    const events = [];
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    this.data.courses.forEach(course => {
      // Class schedule events
      course.schedule?.forEach(sched => {
        const classDate = this.getNextClassDate(sched.day, startDate);
        while (classDate <= endDate) {
          events.push({
            id: `${course.id}-${sched.day}-${classDate.getTime()}`,
            type: 'class',
            courseId: course.id,
            courseName: course.name,
            courseColor: course.color,
            title: course.name,
            date: classDate,
            time: sched.startTime,
            endTime: sched.endTime,
            location: sched.location
          });
          classDate.setDate(classDate.getDate() + 7);
        }
      });

      // Assignment deadline events
      course.assignments?.forEach(assignment => {
        if (assignment.dueDate) {
          const dueDate = new Date(assignment.dueDate);
          if (dueDate >= startDate && dueDate <= endDate) {
            events.push({
              id: `deadline-${assignment.id}`,
              type: 'deadline',
              courseId: course.id,
              courseName: course.name,
              courseColor: course.color,
              title: `[截止] ${assignment.title}`,
              date: dueDate,
              time: dueDate.toTimeString().slice(0, 5),
              assignmentId: assignment.id
            });
          }
        }
      });
    });

    return events.sort((a, b) => a.date - b.date);
  },

  getNextClassDate(dayOfWeek, fromDate) {
    const date = new Date(fromDate);
    const currentDay = date.getDay();
    const diff = (dayOfWeek - currentDay + 7) % 7;
    if (diff === 0 && date.getHours() >= 23) {
      date.setDate(date.getDate() + 7);
    } else {
      date.setDate(date.getDate() + diff);
    }
    return date;
  },

  // Get events for a specific date
  getEventsForDate(date) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const events = [];

    this.data.courses.forEach(course => {
      course.schedule?.forEach(sched => {
        if (sched.day === targetDate.getDay()) {
          events.push({
            id: `${course.id}-${sched.day}`,
            type: 'class',
            courseId: course.id,
            courseName: course.name,
            courseColor: course.color,
            title: course.name,
            time: sched.startTime,
            endTime: sched.endTime,
            location: sched.location
          });
        }
      });

      course.assignments?.forEach(assignment => {
        if (assignment.dueDate) {
          const dueDate = new Date(assignment.dueDate);
          if (dueDate >= targetDate && dueDate < nextDate) {
            events.push({
              id: `deadline-${assignment.id}`,
              type: 'deadline',
              courseId: course.id,
              courseName: course.name,
              courseColor: course.color,
              title: `[截止] ${assignment.title}`,
              time: dueDate.toTimeString().slice(0, 5),
              assignmentId: assignment.id
            });
          }
        }
      });
    });

    return events.sort((a, b) => a.time?.localeCompare(b.time || '') || 0);
  }
};
