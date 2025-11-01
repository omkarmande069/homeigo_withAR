// Currency Selector Component
class CurrencySelectorComponent {
    constructor(currencyManager) {
        this.currencyManager = currencyManager;
    }

    /**
     * Render currency selector dropdown
     */
    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Currency selector container not found:', containerId);
            return;
        }

        const currencies = this.currencyManager.getAvailableCurrencies();
        const currentCurrency = this.currencyManager.getCurrency();

        container.innerHTML = `
            <div class="relative inline-block">
                <button id="currency-button" class="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <span class="text-lg">${this.currencyManager.getSymbol()}</span>
                    <span class="text-sm font-medium">${currentCurrency}</span>
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                
                <div id="currency-dropdown" class="hidden absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div class="py-2">
                        ${currencies.map(curr => `
                            <button 
                                data-currency="${curr.code}"
                                class="currency-option w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${curr.code === currentCurrency ? 'bg-amber-50' : ''}"
                            >
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center space-x-2">
                                        <span class="text-lg">${curr.symbol}</span>
                                        <span class="text-sm font-medium">${curr.code}</span>
                                    </div>
                                    <div class="text-sm text-gray-600">
                                        1 USD = ${curr.rate.toFixed(2)} ${curr.code}
                                    </div>
                                    ${curr.code === currentCurrency ? '<svg class="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>' : ''}
                                </div>
                                <div class="text-xs text-gray-500 ml-6">${curr.name}</div>
                            </button>
                        `).join('')}
                        <div class="mt-2 pt-2 border-t border-gray-200 px-4 py-2">
                            <div class="text-xs text-gray-500">
                                ${(() => {
                                    const lastUpdate = this.currencyManager.getLastUpdateTime();
                                    if (lastUpdate) {
                                        const timeAgo = Math.round((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60));
                                        return `Last updated ${timeAgo} hours ago`;
                                    }
                                    return 'Using static rates';
                                })()}
                            </div>
                            ${this.currencyManager.needsUpdate() ? `
                                <button id="update-rates-btn" class="mt-1 text-xs text-amber-600 hover:text-amber-700">
                                    Update rates
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const button = document.getElementById('currency-button');
        const dropdown = document.getElementById('currency-dropdown');
        const options = document.querySelectorAll('.currency-option');

        if (!button || !dropdown) return;

        // Toggle dropdown
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = dropdown.classList.contains('hidden');
            dropdown.classList.toggle('hidden');
            
            // Add animation after removing hidden
            if (isHidden) {
                requestAnimationFrame(() => {
                    dropdown.classList.add('dropdown-animate');
                });
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!button.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('dropdown-animate');
                // Wait for animation to finish before hiding
                setTimeout(() => {
                    dropdown.classList.add('hidden');
                }, 200);
            }
        });

        // Handle currency selection
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                const currency = option.getAttribute('data-currency');
                this.currencyManager.setCurrency(currency);
                dropdown.classList.add('hidden');
                
                // Re-render to update UI
                const containerId = button.closest('[id]')?.id || 'currency-selector';
                this.render(containerId.replace('-button', '').replace('-dropdown', ''));
                
                console.log(`💱 Currency changed to ${currency}`);
            });
        });

        // Handle update rates button
        const updateRatesBtn = document.getElementById('update-rates-btn');
        if (updateRatesBtn) {
            updateRatesBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                updateRatesBtn.textContent = 'Updating...';
                updateRatesBtn.disabled = true;
                
                try {
                    await this.currencyManager.updateRates();
                    
                    // Re-render to update UI with new rates
                    const containerId = button.closest('[id]')?.id || 'currency-selector';
                    this.render(containerId.replace('-button', '').replace('-dropdown', ''));
                    
                    console.log('💱 Exchange rates updated');
                } catch (error) {
                    console.error('Failed to update rates:', error);
                    updateRatesBtn.textContent = 'Update failed';
                    setTimeout(() => {
                        updateRatesBtn.textContent = 'Update rates';
                        updateRatesBtn.disabled = false;
                    }, 3000);
                }
            });
        }
    }

    /**
     * Render inline currency selector (compact version)
     */
    renderInline(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const currencies = this.currencyManager.getAvailableCurrencies();
        const currentCurrency = this.currencyManager.getCurrency();

        container.innerHTML = `
            <select id="currency-select-inline" class="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                ${currencies.map(curr => `
                    <option value="${curr.code}" ${curr.code === currentCurrency ? 'selected' : ''}>
                        ${curr.symbol} ${curr.code}
                    </option>
                `).join('')}
            </select>
        `;

        const select = document.getElementById('currency-select-inline');
        select.addEventListener('change', (e) => {
            this.currencyManager.setCurrency(e.target.value);
            console.log(`💱 Currency changed to ${e.target.value}`);
        });
    }
}

// Export for use in other modules
window.CurrencySelectorComponent = CurrencySelectorComponent;
