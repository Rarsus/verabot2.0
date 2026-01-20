// VeraBot Dashboard - Main JS

/**
 * Dashboard Application Controller
 * Handles initialization and main application logic
 */
class DashboardApp {
  constructor() {
    this.apiUrl = '/api';
    this.refreshInterval = 30000; // 30 seconds
    this.initializeEventListeners();
    this.loadDashboardData();
    this.startAutoRefresh();
  }

  /**
   * Initialize event listeners
   */
  initializeEventListeners() {
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadDashboardData());
    }

    // Add any other event listeners here
  }

  /**
   * Load dashboard data from API
   */
  async loadDashboardData() {
    try {
      // Show loading state
      this.setLoadingState(true);

      // Fetch bot status
      await this.loadBotStatus();

      // Fetch guild information
      await this.loadGuildInfo();

      // Clear any error messages
      this.clearErrorMessages();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.showError('Failed to load dashboard data. Please try again.');
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Load bot status
   */
  async loadBotStatus() {
    try {
      const response = await fetch(`${this.apiUrl}/status`);
      if (!response.ok) throw new Error('Failed to fetch status');

      const data = await response.json();
      this.updateBotStatus(data);
    } catch (error) {
      console.error('Error loading bot status:', error);
      throw error;
    }
  }

  /**
   * Update bot status display
   */
  updateBotStatus(data) {
    const statusContainer = document.getElementById('bot-status');
    if (!statusContainer) return;

    const statusBadge = data.online ? 'online' : 'offline';
    const statusText = data.online ? 'Online' : 'Offline';

    statusContainer.innerHTML = `
      <span class="status-badge ${statusBadge}">${statusText}</span>
      <div class="info-item">
        <span class="info-label">Uptime:</span>
        <span class="info-value">${this.formatUptime(data.uptime)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Version:</span>
        <span class="info-value">${data.version || 'Unknown'}</span>
      </div>
    `;
  }

  /**
   * Load guild information
   */
  async loadGuildInfo() {
    try {
      const response = await fetch(`${this.apiUrl}/guilds`);
      if (!response.ok) throw new Error('Failed to fetch guilds');

      const data = await response.json();
      this.updateGuildInfo(data);
    } catch (error) {
      console.error('Error loading guild info:', error);
      // Don't throw - guilds are optional
    }
  }

  /**
   * Update guild information display
   */
  updateGuildInfo(data) {
    const guildContainer = document.getElementById('guild-list');
    if (!guildContainer) return;

    if (!data.guilds || data.guilds.length === 0) {
      guildContainer.innerHTML = '<p>No guilds connected.</p>';
      return;
    }

    const guildsHTML = data.guilds
      .map(
        (guild) => `
      <div class="guild-item">
        <div class="guild-icon" style="background-color: ${this.getGuildColor(guild.id)}">${guild.icon || guild.name.charAt(0)}</div>
        <div class="guild-info">
          <div class="guild-name">${guild.name}</div>
          <div class="guild-members">${guild.members || 0} members</div>
        </div>
      </div>
    `
      )
      .join('');

    guildContainer.innerHTML = guildsHTML;
  }

  /**
   * Format uptime for display
   */
  formatUptime(ms) {
    if (!ms) return 'N/A';

    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }

  /**
   * Get guild color for avatar
   */
  getGuildColor(id) {
    const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
    const index = id.charCodeAt(0) % colors.length;
    return colors[index];
  }

  /**
   * Set loading state
   */
  setLoadingState(isLoading) {
    const loadingEl = document.getElementById('loading-spinner');
    if (!loadingEl) return;

    if (isLoading) {
      loadingEl.classList.remove('hidden');
    } else {
      loadingEl.classList.add('hidden');
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorContainer = document.getElementById('error-messages');
    if (!errorContainer) return;

    const errorHTML = `
      <div class="alert alert-error">
        <p>${message}</p>
      </div>
    `;

    errorContainer.insertAdjacentHTML('beforeend', errorHTML);
  }

  /**
   * Clear error messages
   */
  clearErrorMessages() {
    const errorContainer = document.getElementById('error-messages');
    if (!errorContainer) return;
    errorContainer.innerHTML = '';
  }

  /**
   * Start auto-refresh of dashboard data
   */
  startAutoRefresh() {
    setInterval(() => {
      this.loadDashboardData();
    }, this.refreshInterval);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new DashboardApp();
});
