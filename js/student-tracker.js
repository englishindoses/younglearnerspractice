/**
 * ESL Games Hub - Simple Student Tracker
 * Handles student name, game scores, and basic achievements
 * Uses localStorage - no external services needed
 */

class StudentTracker {
    
    constructor() {
        this.storageKeys = {
            student: 'esl-student-name',
            scores: 'esl-game-scores', 
            achievements: 'esl-achievements',
            stats: 'esl-stats'
        };
        this.initializeStudent();
    }

    // Initialize student on first visit
    initializeStudent() {
        if (!this.getStudentName()) {
            this.showWelcomeModal();
        } else {
            this.updateDisplays();
        }
    }

    // Show welcome modal for new students
    showWelcomeModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2 style="color: #667eea; margin-bottom: 1rem;">🌟 Welcome to ESL Games Hub! 🌟</h2>
                <p style="margin-bottom: 1rem;">What's your name?</p>
                <input type="text" id="student-name-input" placeholder="Enter your name..." maxlength="20">
                <br>
                <button class="cta-button" onclick="StudentTracker.saveStudentName()">
                    🚀 Start Learning!
                </button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Focus on input
        setTimeout(() => {
            document.getElementById('student-name-input').focus();
        }, 100);

        // Allow Enter key to submit
        document.getElementById('student-name-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveStudentName();
            }
        });
    }

    // Save student name and close modal
    saveStudentName() {
        const nameInput = document.getElementById('student-name-input');
        const name = nameInput.value.trim();
        
        if (name.length < 2) {
            alert('Please enter your name (at least 2 letters)');
            return;
        }

        // Save name
        localStorage.setItem(this.storageKeys.student, name);
        
        // Award welcome achievement
        this.addAchievement('welcome', 'Welcome! 🎉', 'Started your English learning journey');
        
        // Initialize stats
        this.initializeStats();
        
        // Close modal
        document.querySelector('.modal').remove();
        
        // Update displays
        this.updateDisplays();
    }

    // Get student name
    getStudentName() {
        return localStorage.getItem(this.storageKeys.student);
    }

    // Initialize stats for new student
    initializeStats() {
        const stats = {
            gamesPlayed: 0,
            totalScore: 0,
            perfectScores: 0,
            firstPlayDate: new Date().toISOString(),
            lastPlayDate: new Date().toISOString(),
            playDays: [new Date().toDateString()]
        };
        localStorage.setItem(this.storageKeys.stats, JSON.stringify(stats));
    }

    // Save game score
    saveGameScore(gameId, score, timeSpent = 0) {
        const scores = this.getGameScores();
        const currentDate = new Date().toDateString();
        
        // Initialize game data if first time
        if (!scores[gameId]) {
            scores[gameId] = {
                attempts: 0,
                bestScore: 0,
                totalScore: 0,
                firstPlay: currentDate,
                lastPlay: currentDate
            };
        }

        // Update game scores
        scores[gameId].attempts++;
        scores[gameId].totalScore += score;
        scores[gameId].lastPlay = currentDate;
        
        // Update best score if better
        if (score > scores[gameId].bestScore) {
            scores[gameId].bestScore = score;
        }

        // Save updated scores
        localStorage.setItem(this.storageKeys.scores, JSON.stringify(scores));

        // Update general stats
        this.updateStats(score, currentDate);

        // Check for achievements
        this.checkAchievements(gameId, score);

        // Update displays
        this.updateDisplays();

        console.log(`Score saved: ${gameId} = ${score}%`);
    }

    // Get all game scores
    getGameScores() {
        const scores = localStorage.getItem(this.storageKeys.scores);
        return scores ? JSON.parse(scores) : {};
    }

    // Get best score for specific game
    getBestScore(gameId) {
        const scores = this.getGameScores();
        return scores[gameId] ? scores[gameId].bestScore : 0;
    }

    // Update general statistics
    updateStats(score, currentDate) {
        let stats = JSON.parse(localStorage.getItem(this.storageKeys.stats) || '{}');
        
        // Initialize if missing
        if (!stats.gamesPlayed) {
            stats = {
                gamesPlayed: 0,
                totalScore: 0,
                perfectScores: 0,
                firstPlayDate: new Date().toISOString(),
                lastPlayDate: new Date().toISOString(),
                playDays: []
            };
        }

        // Update stats
        stats.gamesPlayed++;
        stats.totalScore += score;
        stats.lastPlayDate = new Date().toISOString();
        
        if (score >= 100) {
            stats.perfectScores++;
        }

        // Track unique play days
        if (!stats.playDays.includes(currentDate)) {
            stats.playDays.push(currentDate);
        }

        localStorage.setItem(this.storageKeys.stats, JSON.stringify(stats));
    }

    // Get general statistics
    getStats() {
        const stats = localStorage.getItem(this.storageKeys.stats);
        return stats ? JSON.parse(stats) : {
            gamesPlayed: 0,
            totalScore: 0,
            perfectScores: 0,
            playDays: []
        };
    }

    // Add achievement
    addAchievement(id, title, description) {
        const achievements = this.getAchievements();
        
        if (!achievements[id]) {
            achievements[id] = {
                title: title,
                description: description,
                earned: true,
                date: new Date().toISOString()
            };
            
            localStorage.setItem(this.storageKeys.achievements, JSON.stringify(achievements));
            
            // Show achievement notification
            this.showAchievementNotification(title, description);
            
            console.log(`Achievement unlocked: ${title}`);
        }
    }

    // Get all achievements
    getAchievements() {
        const achievements = localStorage.getItem(this.storageKeys.achievements);
        return achievements ? JSON.parse(achievements) : {};
    }

    // Check for new achievements after game
    checkAchievements(gameId, score) {
        const stats = this.getStats();
        const scores = this.getGameScores();
        
        // First game achievement
        if (stats.gamesPlayed === 1) {
            this.addAchievement('first-game', 'First Game! 🎮', 'Played your first English game');
        }
        
        // Good score achievement
        if (score >= 70 && !this.getAchievements()['good-score']) {
            this.addAchievement('good-score', 'Good Score! ⭐', 'Scored 70% or higher on a game');
        }
        
        // Perfect score achievement
        if (score >= 100) {
            this.addAchievement('perfect-score', 'Perfect Score! 🏆', 'Got 100% on a game');
        }
        
        // Multiple days achievement
        if (stats.playDays.length >= 3) {
            this.addAchievement('learning-streak', 'Learning Streak! 📚', 'Played games on 3 different days');
        }
        
        // 5 games achievement
        if (stats.gamesPlayed >= 5) {
            this.addAchievement('game-master', 'Game Master! 🌟', 'Completed 5 games');
        }
    }

    // Show achievement notification popup
    showAchievementNotification(title, description) {
        const notification = document.createElement('div');
        notification.className = 'modal';
        notification.innerHTML = `
            <div class="modal-content" style="background: linear-gradient(135deg, #ffd700, #ffed4e); color: #744210;">
                <h2 style="color: #744210;">🎉 Achievement Unlocked! 🎉</h2>
                <h3>${title}</h3>
                <p>${description}</p>
                <button class="cta-button" onclick="this.closest('.modal').remove()">
                    Awesome! 🚀
                </button>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Update all displays on page
    updateDisplays() {
        this.updateWelcomeMessage();
        this.updateHomepageStats();
        this.updateAchievementsList();
        this.updateGameCards();
    }

    // Update welcome message with student name
    updateWelcomeMessage() {
        const name = this.getStudentName();
        if (name) {
            // Update hero section
            const heroH1 = document.querySelector('.hero h1');
            if (heroH1) {
                heroH1.textContent = `🌟 Hello, ${name}! Ready to learn English? 🌟`;
            }
            
            // Update hero subtitle
            const heroP = document.querySelector('.hero p');
            if (heroP) {
                heroP.textContent = `Let's practice English with fun games, ${name}!`;
            }
        }
    }

    // Update homepage statistics
    updateHomepageStats() {
        const stats = this.getStats();
        const achievements = Object.keys(this.getAchievements()).length;
        
        // Update stat numbers
        const statElements = {
            'games-completed': stats.gamesPlayed,
            'perfect-scores': stats.perfectScores,
            'achievements-earned': achievements,
            'learning-days': stats.playDays.length
        };
        
        Object.entries(statElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    // Update achievements list on homepage
    updateAchievementsList() {
        const achievementsContainer = document.querySelector('#progress .achievement');
        if (achievementsContainer) {
            const achievements = this.getAchievements();
            const achievementsList = Object.values(achievements);
            
            // Clear existing achievements
            const parent = achievementsContainer.parentElement;
            parent.querySelectorAll('.achievement').forEach(el => el.remove());
            
            // Add earned achievements
            achievementsList.forEach(achievement => {
                const badge = document.createElement('div');
                badge.className = 'achievement';
                badge.textContent = achievement.title;
                parent.appendChild(badge);
            });
            
            // Add some locked achievements if student is new
            if (achievementsList.length < 3) {
                const lockedAchievements = ['🔒 Expert Player', '🔒 Week Warrior', '🔒 English Master'];
                lockedAchievements.forEach(locked => {
                    const badge = document.createElement('div');
                    badge.className = 'achievement locked';
                    badge.textContent = locked;
                    parent.appendChild(badge);
                });
            }
        }
    }

    // Update game cards with best scores
    updateGameCards() {
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            const playButton = card.querySelector('.play-button');
            if (playButton && !playButton.disabled) {
                // Extract game ID from button onclick or data attribute
                const buttonText = playButton.textContent || '';
                
                if (buttonText.includes('Hello Numbers') || card.querySelector('h3')?.textContent.includes('Hello Numbers')) {
                    const bestScore = this.getBestScore('hello-numbers');
                    if (bestScore > 0) {
                        // Add best score display
                        let scoreDisplay = card.querySelector('.best-score');
                        if (!scoreDisplay) {
                            scoreDisplay = document.createElement('div');
                            scoreDisplay.className = 'best-score';
                            card.insertBefore(scoreDisplay, playButton);
                        }
                        scoreDisplay.textContent = `Your best: ${bestScore}%`;
                    }
                }
            }
        });
    }

    // Download progress report (for teacher)
    downloadProgress() {
        const name = this.getStudentName();
        const scores = this.getGameScores();
        const achievements = this.getAchievements();
        const stats = this.getStats();
        
        const report = {
            studentName: name,
            generatedDate: new Date().toISOString(),
            summary: {
                totalGamesPlayed: stats.gamesPlayed,
                perfectScores: stats.perfectScores,
                averageScore: stats.gamesPlayed > 0 ? Math.round(stats.totalScore / stats.gamesPlayed) : 0,
                learningDays: stats.playDays.length,
                achievementsEarned: Object.keys(achievements).length
            },
            gameScores: scores,
            achievements: achievements,
            detailedStats: stats
        };
        
        // Create downloadable file
        const dataStr = JSON.stringify(report, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${name}-ESL-Progress-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    // Reset all data (for testing)
    resetAllData() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
            Object.values(this.storageKeys).forEach(key => {
                localStorage.removeItem(key);
            });
            location.reload();
        }
    }
}

// Static method for modal callback
StudentTracker.saveStudentName = function() {
    window.studentTracker.saveStudentName();
};

// Global function for games to report scores
function reportGameScore(gameId, score, timeSpent = 0) {
    if (window.studentTracker) {
        window.studentTracker.saveGameScore(gameId, score, timeSpent);
    }
}

// Global function to get best score (for game displays)
function getBestScore(gameId) {
    if (window.studentTracker) {
        return window.studentTracker.getBestScore(gameId);
    }
    return 0;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.studentTracker = new StudentTracker();
});

// Initialize floating shapes animation (from original homepage)
function createFloatingShape() {
    const shape = document.createElement('div');
    shape.className = 'floating-shape';
    shape.style.width = Math.random() * 60 + 20 + 'px';
    shape.style.height = shape.style.width;
    shape.style.left = Math.random() * 100 + '%';
    shape.style.animationDuration = Math.random() * 20 + 15 + 's';
    shape.style.animationDelay = Math.random() * 5 + 's';
    
    const shapesContainer = document.querySelector('.floating-shapes');
    if (shapesContainer) {
        shapesContainer.appendChild(shape);
        
        setTimeout(() => {
            if (shape.parentElement) {
                shape.remove();
            }
        }, 25000);
    }
}

// Create floating shapes periodically
setInterval(createFloatingShape, 3000);
