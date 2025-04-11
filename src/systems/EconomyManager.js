export default class EconomyManager {
    constructor(scene) {
        this.scene = scene;
        
        // Player resources
        this.lives = window.GAME_SETTINGS.PLAYER.lives;
        this.money = window.GAME_SETTINGS.PLAYER.money;
        this.score = 0;
        
        // Track stats for scoring
        this.enemiesKilled = 0;
        this.towersBuilt = 0;
        this.wavesCompleted = 0;
    }

    /**
     * Get the player's current lives
     * @returns {number} Current lives
     */
    getLives() {
        return this.lives;
    }

    /**
     * Get the player's current money
     * @returns {number} Current money
     */
    getMoney() {
        return this.money;
    }

    /**
     * Get the player's current score
     * @returns {number} Current score
     */
    getScore() {
        return this.score;
    }

    /**
     * Add money to the player's balance
     * @param {number} amount - Amount to add
     */
    addMoney(amount) {
        this.money += amount;
        this.updateScore();
    }

    /**
     * Spend money from the player's balance
     * @param {number} amount - Amount to spend
     * @returns {boolean} True if the player had enough money
     */
    spendMoney(amount) {
        if (this.money >= amount) {
            this.money -= amount;
            this.towersBuilt++;
            this.updateScore();
            return true;
        }
        return false;
    }

    /**
     * Take damage (reduce lives)
     * @param {number} amount - Amount of damage to take
     */
    takeDamage(amount) {
        this.lives -= amount;
        if (this.lives < 0) {
            this.lives = 0;
        }
        this.updateScore();
    }

    /**
     * Add to the enemy kill count
     * @param {number} count - Number of enemies killed
     */
    addEnemyKill(count = 1) {
        this.enemiesKilled += count;
        this.updateScore();
    }

    /**
     * Add to the waves completed count
     */
    addWaveCompleted() {
        this.wavesCompleted++;
        
        // Award bonus money for completing a wave
        const waveBonus = 50 + (this.wavesCompleted * 10);
        this.addMoney(waveBonus);
        
        this.updateScore();
    }

    /**
     * Update the player's score based on various factors
     */
    updateScore() {
        // Calculate score based on various factors
        this.score = (
            this.enemiesKilled * 10 +    // Points per enemy killed
            this.towersBuilt * 5 +       // Points per tower built
            this.wavesCompleted * 100 +  // Points per wave completed
            this.money / 10 +            // Small bonus for unspent money
            this.lives * 20              // Bonus for remaining lives
        );
        
        // Round to integer
        this.score = Math.floor(this.score);
    }

    /**
     * Award bonus money to the player
     * @param {number} amount - Amount of bonus money
     * @param {string} reason - Reason for the bonus (for display)
     */
    awardBonus(amount, reason) {
        this.addMoney(amount);
        
        // Emit event for UI to show bonus message
        this.scene.events.emit('showMessage', `Bonus: +${amount} gold\n${reason}`);
    }

    /**
     * Get the player's stats for display or saving
     * @returns {Object} Player stats
     */
    getStats() {
        return {
            lives: this.lives,
            money: this.money,
            score: this.score,
            enemiesKilled: this.enemiesKilled,
            towersBuilt: this.towersBuilt,
            wavesCompleted: this.wavesCompleted
        };
    }

    /**
     * Reset the economy to starting values
     * Used when restarting the game
     */
    reset() {
        this.lives = window.GAME_SETTINGS.PLAYER.lives;
        this.money = window.GAME_SETTINGS.PLAYER.money;
        this.score = 0;
        this.enemiesKilled = 0;
        this.towersBuilt = 0;
        this.wavesCompleted = 0;
    }
}
