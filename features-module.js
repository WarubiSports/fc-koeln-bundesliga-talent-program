/**
 * FEATURES MODULE
 * Contains all feature-specific functions and UI components
 * Safe to modify without affecting authentication
 */

(function() {
    'use strict';
    
    // Feature module namespace
    const Features = {
        // Player management features
        player: {
            // Populate individual player dropdown for chore assignment
            populateIndividualDropdown: function() {
                const dropdown = document.getElementById('individualPlayer');
                if (!dropdown) {
                    console.warn('FEATURES: Individual player dropdown not found');
                    return;
                }
                
                // Clear existing options
                dropdown.innerHTML = '<option value="">Choose specific player</option>';
                
                // Sample player data (replace with actual data source)
                const players = [
                    {id: 1, firstName: 'Max', lastName: 'Bisinger', position: 'Midfielder', house: 'Widdersdorf 1', room: '12A'},
                    {id: 2, firstName: 'Luis', lastName: 'García', position: 'Forward', house: 'Widdersdorf 1', room: '12B'},
                    {id: 3, firstName: 'Ahmed', lastName: 'Hassan', position: 'Defender', house: 'Widdersdorf 1', room: '13A'},
                    {id: 4, firstName: 'Jonas', lastName: 'Mueller', position: 'Goalkeeper', house: 'Widdersdorf 1', room: '13B'},
                    {id: 5, firstName: 'Mike', lastName: 'Brown', position: 'Midfielder', house: 'Widdersdorf 2', room: '14A'},
                    {id: 6, firstName: 'David', lastName: 'Kim', position: 'Defender', house: 'Widdersdorf 2', room: '14B'},
                    {id: 7, firstName: 'Carlos', lastName: 'Ruiz', position: 'Forward', house: 'Widdersdorf 2', room: '15A'},
                    {id: 8, firstName: 'Tom', lastName: 'Wilson', position: 'Midfielder', house: 'Widdersdorf 3', room: '16A'},
                    {id: 9, firstName: 'Alex', lastName: 'Chen', position: 'Defender', house: 'Widdersdorf 3', room: '16B'}
                ];
                
                players.forEach(player => {
                    const option = document.createElement('option');
                    option.value = player.id;
                    option.textContent = `${player.firstName} ${player.lastName} - ${player.position} (${player.house}, Room ${player.room})`;
                    dropdown.appendChild(option);
                });
                
                console.log('FEATURES: Individual player dropdown populated with', players.length, 'players');
            },
            
            // Populate multiple players checkboxes
            populateMultipleCheckboxes: function() {
                const container = document.getElementById('playersCheckboxGrid');
                if (!container) {
                    console.warn('FEATURES: Multiple players container not found');
                    return;
                }
                
                // Clear existing content
                container.innerHTML = '';
                
                // Sample player data
                const players = [
                    {id: 1, firstName: 'Max', lastName: 'Bisinger', position: 'Midfielder', house: 'Widdersdorf 1', room: '12A'},
                    {id: 2, firstName: 'Luis', lastName: 'García', position: 'Forward', house: 'Widdersdorf 1', room: '12B'},
                    {id: 3, firstName: 'Ahmed', lastName: 'Hassan', position: 'Defender', house: 'Widdersdorf 1', room: '13A'},
                    {id: 4, firstName: 'Jonas', lastName: 'Mueller', position: 'Goalkeeper', house: 'Widdersdorf 1', room: '13B'},
                    {id: 5, firstName: 'Mike', lastName: 'Brown', position: 'Midfielder', house: 'Widdersdorf 2', room: '14A'},
                    {id: 6, firstName: 'David', lastName: 'Kim', position: 'Defender', house: 'Widdersdorf 2', room: '14B'},
                    {id: 7, firstName: 'Carlos', lastName: 'Ruiz', position: 'Forward', house: 'Widdersdorf 2', room: '15A'},
                    {id: 8, firstName: 'Tom', lastName: 'Wilson', position: 'Midfielder', house: 'Widdersdorf 3', room: '16A'},
                    {id: 9, firstName: 'Alex', lastName: 'Chen', position: 'Defender', house: 'Widdersdorf 3', room: '16B'}
                ];
                
                players.forEach(player => {
                    const label = document.createElement('label');
                    label.className = 'player-checkbox-label';
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.name = 'selectedPlayers';
                    checkbox.value = player.id;
                    checkbox.addEventListener('change', Features.ui.updateSelectedCount);
                    
                    const span = document.createElement('span');
                    span.textContent = `${player.firstName} ${player.lastName} - ${player.position} (${player.house})`;
                    
                    label.appendChild(checkbox);
                    label.appendChild(span);
                    container.appendChild(label);
                });
                
                console.log('FEATURES: Multiple players checkboxes populated with', players.length, 'players');
            },
            
            // Select all players
            selectAll: function() {
                const checkboxes = document.querySelectorAll('input[name="selectedPlayers"]');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = true;
                });
                Features.ui.updateSelectedCount();
                console.log('FEATURES: All players selected');
            },
            
            // Clear all player selections
            clearAll: function() {
                const checkboxes = document.querySelectorAll('input[name="selectedPlayers"]');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
                Features.ui.updateSelectedCount();
                console.log('FEATURES: All player selections cleared');
            }
        },
        
        // UI management features
        ui: {
            // Toggle player selection based on assignment type
            togglePlayerSelection: function() {
                console.log('FEATURES: togglePlayerSelection called');
                
                // Handle event creation player selection
                const eventAttendance = document.getElementById('eventAttendance');
                if (eventAttendance) {
                    const attendanceType = eventAttendance.value;
                    const playerSection = document.getElementById('playerSelectionSection');
                    
                    if (playerSection) {
                        playerSection.style.display = attendanceType === 'selected' ? 'block' : 'none';
                    }
                    return;
                }
                
                // Handle chore assignment player selection
                const choreAssignmentType = document.getElementById('choreAssignmentType');
                if (choreAssignmentType) {
                    const assignmentType = choreAssignmentType.value;
                    const individualPlayerRow = document.getElementById('individualPlayerRow');
                    const multiplePlayersRow = document.getElementById('multiplePlayersRow');
                    
                    console.log('FEATURES: Assignment type changed to:', assignmentType);
                    
                    // Hide all selection rows first
                    if (individualPlayerRow) individualPlayerRow.style.display = 'none';
                    if (multiplePlayersRow) multiplePlayersRow.style.display = 'none';
                    
                    // Show appropriate selection based on type
                    if (assignmentType === 'individual') {
                        Features.player.populateIndividualDropdown();
                        if (individualPlayerRow) {
                            individualPlayerRow.style.display = 'flex';
                            console.log('FEATURES: Individual player row displayed');
                        }
                    } else if (assignmentType === 'multiple') {
                        Features.player.populateMultipleCheckboxes();
                        if (multiplePlayersRow) {
                            multiplePlayersRow.style.display = 'block';
                            console.log('FEATURES: Multiple players row displayed');
                        }
                        Features.ui.updateSelectedCount();
                    }
                }
            },
            
            // Update selected count display
            updateSelectedCount: function() {
                const checkboxes = document.querySelectorAll('input[name="selectedPlayers"]:checked');
                const count = checkboxes.length;
                const countDisplay = document.getElementById('selectedCount');
                
                if (countDisplay) {
                    countDisplay.textContent = count + ' player' + (count === 1 ? '' : 's') + ' selected';
                }
            }
        },
        
        // Calendar and event features
        calendar: {
            // Toggle recurrence options
            toggleRecurrenceOptions: function() {
                const recurrenceType = document.getElementById('eventRecurrence')?.value;
                const optionsSection = document.getElementById('recurrenceOptionsSection');
                const weeklyOptions = document.getElementById('weeklyOptions');
                const specificDayOptions = document.getElementById('specificDayOptions');
                const recurrenceUnit = document.getElementById('recurrenceUnit');
                
                if (!optionsSection) return;
                
                // Hide all options first
                if (weeklyOptions) weeklyOptions.style.display = 'none';
                if (specificDayOptions) specificDayOptions.style.display = 'none';
                
                if (recurrenceType === 'none' || !recurrenceType) {
                    optionsSection.style.display = 'none';
                } else {
                    optionsSection.style.display = 'block';
                    
                    // Update unit text and show relevant options
                    if (recurrenceUnit) {
                        if (recurrenceType === 'daily') {
                            recurrenceUnit.textContent = 'day(s)';
                        } else if (['weekly', 'weekdays', 'weekends'].includes(recurrenceType)) {
                            recurrenceUnit.textContent = 'week(s)';
                            if (weeklyOptions) weeklyOptions.style.display = 'block';
                            
                            // Auto-select days based on type
                            setTimeout(() => {
                                const dayCheckboxes = document.querySelectorAll('#weeklyOptions input[type="checkbox"]');
                                dayCheckboxes.forEach(cb => cb.checked = false);
                                
                                if (recurrenceType === 'weekdays') {
                                    [1,2,3,4,5].forEach(day => {
                                        const checkbox = document.querySelector(`#weeklyOptions input[value="${day}"]`);
                                        if (checkbox) checkbox.checked = true;
                                    });
                                } else if (recurrenceType === 'weekends') {
                                    [6,0].forEach(day => {
                                        const checkbox = document.querySelector(`#weeklyOptions input[value="${day}"]`);
                                        if (checkbox) checkbox.checked = true;
                                    });
                                }
                            }, 100);
                        } else if (recurrenceType === 'specific-day') {
                            recurrenceUnit.textContent = 'week(s)';
                            if (specificDayOptions) specificDayOptions.style.display = 'block';
                        } else if (recurrenceType === 'monthly') {
                            recurrenceUnit.textContent = 'month(s)';
                        }
                    }
                }
            }
        }
    };
    
    // Make feature functions globally available (safely)
    window.togglePlayerSelection = Features.ui.togglePlayerSelection;
    window.populateIndividualPlayerDropdown = Features.player.populateIndividualDropdown;
    window.populateMultiplePlayersCheckboxes = Features.player.populateMultipleCheckboxes;
    window.selectAllPlayers = Features.player.selectAll;
    window.clearAllPlayers = Features.player.clearAll;
    window.updateSelectedCount = Features.ui.updateSelectedCount;
    window.toggleRecurrenceOptions = Features.calendar.toggleRecurrenceOptions;
    
    // Make registration functions available - ensure they exist globally
    if (typeof window.submitPlayerApplication !== 'function') {
        console.warn('FEATURES: submitPlayerApplication not found, registration may not work');
    }
    if (typeof window.submitStaffApplication !== 'function') {
        console.warn('FEATURES: submitStaffApplication not found, registration may not work');
    }
    if (typeof window.showPublicRegistrationType !== 'function') {
        console.warn('FEATURES: showPublicRegistrationType not found, registration may not work');
    }
    
    // Expose Features module for debugging
    window.Features = Object.freeze(Features);
    
    console.log('FEATURES: Feature module loaded successfully');
    
})();