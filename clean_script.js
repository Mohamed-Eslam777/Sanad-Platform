const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\RepairCom\\OneDrive\\Desktop\\Sanad';

// Delete specific root scripts
const filesToDel = ['test_count.js', 'gen_tree.js', 'fix_admin.js'];
filesToDel.forEach(f => {
    try { fs.unlinkSync(path.join(rootDir, f)); console.log('Deleted', f); } 
    catch(e) { console.error('Error deleting', f, e.message); }
});

// Clear uploads folder
const uploadsDir = path.join(rootDir, 'backend', 'public', 'uploads');
try {
    const items = fs.readdirSync(uploadsDir);
    items.forEach(item => {
        if (item !== 'identities' && item !== '.gitkeep') {
            const p = path.join(uploadsDir, item);
            if (fs.statSync(p).isFile()) {
                fs.unlinkSync(p);
                console.log('Deleted', p);
            }
        }
    });
    console.log('Cleared uploads');
} catch(e) { console.error('Uploads err', e.message); }

// Clear identities folder
const identitiesDir = path.join(uploadsDir, 'identities');
try {
    const items2 = fs.readdirSync(identitiesDir);
    items2.forEach(item => {
        if (item !== '.gitkeep') {
            const p = path.join(identitiesDir, item);
            if (fs.statSync(p).isFile()) {
                fs.unlinkSync(p);
                console.log('Deleted', p);
            }
        }
    });
    console.log('Cleared identities');
} catch(e) { console.error('Identities err', e.message); }
