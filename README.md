# SUGAR: Study Utility for Goal-oriented Academic Results


## What is SUGAR?

**SUGAR** is more than just a name - it's our guiding philosophy for effective studying:

- 🔠 **S – Study**: The core of the platform: focused learning sessions with distraction-free environments.
- 🔠 **U – Uninterrupted**: No switching tabs, no distractions — pure focus through our unique face detection technology.
- 🔠 **G – Goal-Oriented**: Set study goals and achieve them with customizable timers & comprehensive tracking.
- 🔠 **A – Attention-Lock**: Intelligent monitoring to help maintain focus and prevent mind-wandering.
- 🔠 **R – Rewarding**: Daily streaks, beautiful visualizations, and progress tracking — making studying feel sweet and rewarding.

## Overview

SUGAR is a comprehensive study productivity platform designed to enhance focus, track progress, and improve academic outcomes. Built with Next.js and React, SUGAR combines proven study methodologies with modern technology to create an engaging and effective learning environment.

Developed as part of a hackathon project, SUGAR aims to tackle one of the biggest challenges students face today: maintaining focus in a world full of digital distractions.

## Features

### 📚 Core Functionality

- **Study Room**: Distraction-free environment with PDF support and automatic face detection for focus tracking
- **Focus Timer**: Customizable Pomodoro-style timer with break reminders and session tracking
- **Task Board**: Kanban-style organization for academic tasks with priority management
- **Analytics Dashboard**: Beautiful sugar-themed visualizations of study habits and progress

### 🔍 Key Benefits

- **Focus Monitoring**: AI-powered face detection ensures you maintain attention during study sessions
- **Progress Tracking**: Comprehensive analytics to visualize your study patterns and improvements
- **Goal Setting**: Define clear academic objectives and track completion
- **Distraction Management**: Tools to minimize interruptions and maximize productive time

## Technologies

- **Frontend**: Next.js, React, TailwindCSS
- **Authentication**: Clerk Auth
- **AI Integration**: TensorFlow.js, face-api.js for focus detection
- **Data Visualization**: Custom SVG-based charts

## Installation

```bash
# Clone the repository
git clone https://github.com/Naradasi-Tejaswi-3011/SUGAR.git

# Navigate to the project directory
cd SUGAR

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

1. **Create an Account**: Sign up using the registration form or continue with Google
2. **Dashboard**: Navigate to various tools from the central dashboard
3. **Study Room**: Upload PDFs and enable face detection for focused study
4. **Task Management**: Organize tasks using the drag-and-drop kanban board
5. **Analytics**: Monitor your progress with visual representations of your study habits

## Project Structure

```
SUGAR/
├── app/                  # Next.js application routes
│   ├── analytics/        # Study analytics visualization
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Main dashboard
│   ├── focus-timer/      # Pomodoro timer implementation
│   ├── study-room/       # PDF viewer with face detection
│   └── task-board/       # Kanban task organization
├── components/           # Reusable React components
├── lib/                  # Utility functions and shared logic
├── public/               # Static assets
└── ...
```

## The Inspiration

In today's digital world, students face constant distractions. Our team noticed how difficult it had become to maintain focus during study sessions, with notifications, social media, and other digital temptations constantly pulling attention away.

SUGAR was born from the idea that studying should be:
- **Focused**: Creating environments that minimize distractions
- **Motivating**: Making progress visible and rewarding
- **Intelligent**: Using technology to enhance rather than hinder learning
- **Enjoyable**: Adding elements that make the studying experience more pleasant

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.




