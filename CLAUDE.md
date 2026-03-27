# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Type

Single-page web application for personal course learning management. Uses pure HTML/CSS/JavaScript with localStorage for data persistence.

## Common Commands

- **Open in browser**: Use a local server (required for ES modules):
  ```bash
  npx serve .
  # or
  python -m http.server 8000
  ```
- **File upload limit**: 5MB per file (localStorage constraint)

## Architecture

```
js/
├── app.js              # Main entry, router initialization
├── store.js            # localStorage data management
├── router.js           # Hash-based routing (#home, #course/id, #calendar)
├── utils.js            # Utility functions
├── components/         # Reusable UI components
│   ├── sidebar.js
│   ├── modal.js
│   ├── courseCard.js
│   └── assignmentItem.js
└── pages/             # Page views
    ├── home.js        # Current/past courses with drag-drop reordering
    ├── course.js      # Course detail + assignment management
    └── calendar.js    # Monthly calendar view

css/
├── style.css          # Base styles, CSS variables, layout
├── components.css     # Cards, buttons, forms, modal styles
└── calendar.css       # Calendar grid and event styles
```

## Data Model

- **Courses**: id, name, teacher, description, status (current/past), color, schedule[], assignments[]
- **Schedule**: day (0-6), startTime, endTime, location
- **Assignments**: id, title, description, dueDate, files[], submittedAt
- **Files**: stored as base64 dataUrls in localStorage

## Routes

- `#home` — Homepage with current and past courses
- `#course/{id}` — Course detail page with assignments
- `#calendar` — Monthly calendar showing classes and deadlines
