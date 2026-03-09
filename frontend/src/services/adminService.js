import api from './api';

// ==========================================
// خدمة الإدارة (Admin Service)
// ==========================================

export const adminService = {
    /**
     * جلب إحصائيات المنصة (admin overview analytics)
     */
    getStats: async () => {
        const response = await api.get('/users/stats');
        return response.data; // { status, message, data: { users, requests, sos, recentUsers, recentRequests } }
    },

    /**
     * جلب قائمة المستخدمين مع دعم البحث والفلترة
     * @param {Object} params - { search, role, status, page, limit }
     */
    getAllUsers: async (params = {}) => {
        const response = await api.get('/users', { params });
        return response.data; // { status, message, data: { total, page, totalPages, users } }
    },

    /**
     * تحديث حالة مستخدم (active / flagged / suspended)
     * @param {number} id - معرّف المستخدم
     * @param {string} status - الحالة الجديدة
     */
    updateUserStatus: async (id, status) => {
        const response = await api.patch(`/users/${id}/status`, { status });
        return response.data;
    },
};
