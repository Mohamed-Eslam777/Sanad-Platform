const sequelize = require('../config/db');
const User = require('./User');
const BeneficiaryProfile = require('./BeneficiaryProfile');
const VolunteerProfile = require('./VolunteerProfile');
const Request = require('./Request');
const Message = require('./Message');
const Review = require('./Review');
const SOSAlert = require('./SOSAlert');

// ─── Associations ──────────────────────────────────────────────────────────────

// User ↔ Profiles (one-to-one)
User.hasOne(BeneficiaryProfile, { foreignKey: 'user_id', as: 'beneficiaryProfile' });
BeneficiaryProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(VolunteerProfile, { foreignKey: 'user_id', as: 'volunteerProfile' });
VolunteerProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User ↔ Requests (beneficiary posts many requests)
User.hasMany(Request, { foreignKey: 'beneficiary_id', as: 'postedRequests' });
Request.belongsTo(User, { foreignKey: 'beneficiary_id', as: 'beneficiary' });

// User ↔ Requests (volunteer accepts requests)
User.hasMany(Request, { foreignKey: 'volunteer_id', as: 'acceptedRequests' });
Request.belongsTo(User, { foreignKey: 'volunteer_id', as: 'volunteer' });

// Request ↔ Messages (many messages per request)
Request.hasMany(Message, { foreignKey: 'request_id', as: 'messages' });
Message.belongsTo(Request, { foreignKey: 'request_id', as: 'request' });

// User ↔ Messages (sender)
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// Request ↔ Reviews (one review per completed request)
Request.hasOne(Review, { foreignKey: 'request_id', as: 'review' });
Review.belongsTo(Request, { foreignKey: 'request_id', as: 'request' });

// User ↔ Reviews (reviewer = beneficiary, reviewed = volunteer)
User.hasMany(Review, { foreignKey: 'reviewer_id', as: 'givenReviews' });
Review.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' });
User.hasMany(Review, { foreignKey: 'reviewed_id', as: 'receivedReviews' });
Review.belongsTo(User, { foreignKey: 'reviewed_id', as: 'reviewed' });

// User ↔ SOSAlerts
User.hasMany(SOSAlert, { foreignKey: 'user_id', as: 'sosAlerts' });
SOSAlert.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = { sequelize, User, BeneficiaryProfile, VolunteerProfile, Request, Message, Review, SOSAlert };
