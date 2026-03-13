require('dotenv').config();
const { Request, User } = require('./src/models');
const sequelize = require('./src/config/db');

(async () => {
    try {
        await sequelize.authenticate();
        console.log("DB connected");
        
        const reqs = await Request.findAll({
            where: { status: 'completed' },
            raw: true
        });
        
        console.log("All Completed Requests:", reqs.length);
        console.log("Completed Request details:", reqs.map(r => ({ id: r.id, volunteer_id: r.volunteer_id })));

        const users = await User.findAll({ where: { role: 'volunteer' }, raw: true });
        console.log("All Volunteers:", users.map(u => ({ id: u.id, name: u.full_name })));

        for (const user of users) {
            const count = await Request.count({ where: { volunteer_id: user.id, status: 'completed' } });
            console.log(`Volunteer ${user.full_name} ID ${user.id} has ${count} completed requests`);
        }
        
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
})();
