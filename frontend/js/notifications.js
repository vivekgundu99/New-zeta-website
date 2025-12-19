// frontend/js/notifications.js

class NotificationManager {
    constructor() {
        this.permission = Notification.permission;
    }

    async requestPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return false;
        }

        if (this.permission === 'granted') {
            return true;
        }

        if (this.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            return permission === 'granted';
        }

        return false;
    }

    async showNotification(title, options = {}) {
        const hasPermission = await this.requestPermission();
        
        if (!hasPermission) {
            return null;
        }

        const defaultOptions = {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            vibrate: [200, 100, 200],
            ...options
        };

        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            return navigator.serviceWorker.ready.then((registration) => {
                return registration.showNotification(title, defaultOptions);
            });
        } else {
            return new Notification(title, defaultOptions);
        }
    }

    async scheduleDailyReminder(time = '09:00') {
        const [hours, minutes] = time.split(':').map(Number);
        const now = new Date();
        let scheduledTime = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            hours,
            minutes,
            0
        );

        if (scheduledTime <= now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const delay = scheduledTime.getTime() - now.getTime();

        setTimeout(() => {
            this.showNotification('Daily Quiz Reminder', {
                body: 'Your daily quiz is ready! Complete it to maintain your streak.',
                tag: 'daily-reminder',
                requireInteraction: true,
                actions: [
                    {
                        action: 'take-quiz',
                        title: 'Take Quiz'
                    },
                    {
                        action: 'dismiss',
                        title: 'Later'
                    }
                ]
            });

            // Schedule next reminder
            this.scheduleDailyReminder(time);
        }, delay);
    }

    async sendStreakNotification(streak) {
        const messages = {
            3: 'Great! 3-day streak! Keep it going!',
            7: 'Amazing! 7-day streak! You\'re on fire! 🔥',
            14: 'Incredible! 2-week streak! You\'re a learning machine!',
            30: 'Outstanding! 30-day streak! You\'re a champion! 🏆'
        };

        if (messages[streak]) {
            await this.showNotification('Streak Milestone!', {
                body: messages[streak],
                tag: 'streak-milestone'
            });
        }
    }

    async sendAchievementNotification(achievement) {
        await this.showNotification('Achievement Unlocked! 🏆', {
            body: `${achievement.name}: ${achievement.description}`,
            tag: 'achievement',
            icon: achievement.icon
        });
    }
}

const notificationManager = new NotificationManager();
window.notificationManager = notificationManager;