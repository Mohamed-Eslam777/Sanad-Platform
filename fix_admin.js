const fs = require('fs');
const path = 'c:\\Users\\RepairCom\\OneDrive\\Desktop\\Sanad\\frontend\\src\\pages\\AdminDashboard.jsx';

let content = fs.readFileSync(path, 'utf8');
let lines = content.split('\r\n');

// Step 1: Remove consecutive blank lines (keep at most one)
let cleaned = [];
let lastBlank = false;
for (let line of lines) {
    let isBlank = line.trim() === '';
    if (isBlank && lastBlank) continue;
    cleaned.push(line);
    lastBlank = isBlank;
}

let result = cleaned.join('\r\n');

// Step 2: Ensure loadingStats starts as true
result = result.replace(
    /const \[loadingStats, setLoadingStats\] = useState\(false\)/,
    'const [loadingStats, setLoadingStats] = useState(true)'
);

// Step 3: Replace the effects block
const oldEffects = /    \/\/ ────────── EFFECTS ──────────[\s\S]*?    \}, \[search, roleFilter, statusFilter, page(?:, fetchUsers)?\]\);/;

const newEffects = `    // ────────── EFFECTS ──────────
    useEffect(() => {
        fetchStats();
        fetchUsers();
        fetchAlerts(false);
        const interval = setInterval(() => fetchAlerts(true), POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchStats, fetchUsers, fetchAlerts]);

    useEffect(() => {
        if (activeTab === 'overview') {
            fetchStats();
        }
    }, [activeTab, fetchStats]);

    useEffect(() => {
        const timer = setTimeout(() => fetchUsers(), 400);
        return () => clearTimeout(timer);
    }, [search, roleFilter, statusFilter, page]);`;

result = result.replace(oldEffects, newEffects);

fs.writeFileSync(path, result, 'utf8');

const finalLines = result.split('\r\n').length;
console.log('Done! Lines:', lines.length, '->', finalLines);

// Verify
const checks = [
    [result.includes('useState(true)'), 'loadingStats = true'],
    [result.includes('fetchStats, fetchUsers, fetchAlerts'), 'mount effect deps'],
    [/if \(activeTab === 'overview'\) \{[\s\r\n]+fetchStats\(\);/.test(result), 'overview effect unconditional'],
    [!result.includes('!stats && !loadingStats'), 'old conditional removed'],
];
checks.forEach(([ok, label]) => console.log(ok ? 'OK:' : 'WARN:', label));
