// SAFE BACKUP SYSTEM
// Creates verified backups before any authentication changes

const fs = require('fs');
const { verifyFeatures } = require('./feature-verification-checklist.js');

function createSafeBackup(sourceFile = 'fc-koln-7300-working.js') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupFile = `fc-koln-verified-backup-${timestamp}.js`;
    
    console.log('🔒 SAFE BACKUP SYSTEM STARTING...');
    console.log('=================================');
    
    // Step 1: Verify source file has all features
    console.log('Step 1: Verifying source file features...');
    const isComplete = verifyFeatures(sourceFile);
    
    if (!isComplete) {
        console.log('❌ ERROR: Source file is missing critical features');
        console.log('❌ BACKUP ABORTED - Cannot backup incomplete application');
        return false;
    }
    
    // Step 2: Create backup
    console.log('\nStep 2: Creating verified backup...');
    try {
        fs.copyFileSync(sourceFile, backupFile);
        console.log(`✅ Backup created: ${backupFile}`);
    } catch (error) {
        console.log('❌ ERROR: Failed to create backup:', error.message);
        return false;
    }
    
    // Step 3: Verify backup integrity
    console.log('\nStep 3: Verifying backup integrity...');
    const backupValid = verifyFeatures(backupFile);
    
    if (!backupValid) {
        console.log('❌ ERROR: Backup verification failed');
        fs.unlinkSync(backupFile); // Delete invalid backup
        return false;
    }
    
    // Step 4: Update backup registry
    console.log('\nStep 4: Updating backup registry...');
    const registryEntry = {
        timestamp: new Date().toISOString(),
        filename: backupFile,
        verified: true,
        features: 'complete',
        purpose: 'pre-authentication-change'
    };
    
    let registry = [];
    if (fs.existsSync('backup-registry.json')) {
        registry = JSON.parse(fs.readFileSync('backup-registry.json', 'utf8'));
    }
    registry.push(registryEntry);
    fs.writeFileSync('backup-registry.json', JSON.stringify(registry, null, 2));
    
    console.log('\n✅ SAFE BACKUP COMPLETED SUCCESSFULLY');
    console.log(`✅ Verified backup: ${backupFile}`);
    console.log('✅ Registry updated');
    console.log('\n🛡️  AUTHENTICATION CHANGES NOW AUTHORIZED');
    
    return backupFile;
}

function emergencyRestore() {
    console.log('🚨 EMERGENCY RESTORATION STARTING...');
    console.log('====================================');
    
    // Find most recent verified backup
    if (!fs.existsSync('backup-registry.json')) {
        console.log('❌ ERROR: No backup registry found');
        return false;
    }
    
    const registry = JSON.parse(fs.readFileSync('backup-registry.json', 'utf8'));
    const verifiedBackups = registry.filter(entry => entry.verified && entry.features === 'complete');
    
    if (verifiedBackups.length === 0) {
        console.log('❌ ERROR: No verified complete backups found');
        return false;
    }
    
    // Get most recent backup
    const latestBackup = verifiedBackups[verifiedBackups.length - 1];
    
    console.log(`🔄 Restoring from: ${latestBackup.filename}`);
    console.log(`📅 Backup date: ${latestBackup.timestamp}`);
    
    // Restore backup
    try {
        fs.copyFileSync(latestBackup.filename, 'fc-koln-7300-working.js');
        console.log('✅ Emergency restoration completed');
        
        // Verify restoration
        const restored = verifyFeatures('fc-koln-7300-working.js');
        if (restored) {
            console.log('✅ Restoration verified - All features present');
            return true;
        } else {
            console.log('❌ ERROR: Restoration verification failed');
            return false;
        }
    } catch (error) {
        console.log('❌ ERROR: Restoration failed:', error.message);
        return false;
    }
}

// Command line interface
if (require.main === module) {
    const command = process.argv[2];
    
    if (command === 'backup') {
        createSafeBackup();
    } else if (command === 'restore') {
        emergencyRestore();
    } else {
        console.log('Usage:');
        console.log('  node safe-backup-system.js backup  - Create verified backup');
        console.log('  node safe-backup-system.js restore - Emergency restore from latest backup');
    }
}

module.exports = { createSafeBackup, emergencyRestore };