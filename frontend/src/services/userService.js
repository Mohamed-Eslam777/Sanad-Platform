import api from './api';

// ==========================================
// خدمة المستخدم (User Service)
// ==========================================

export const userService = {
    // جلب الملف الشخصي التفصيلي للمستخدم الحالي
    getProfile: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },

    // تحديث بيانات الملف الشخصي (الأساسية والخاصة بالدور)
    updateProfile: async (profileData) => {
        // profileData: { name, phone, disability_type, medical_notes, skills, bio, ... }
        const response = await api.put('/users/me', profileData);
        return response.data;
    },

    // جلب ملف شخصي لمستخدم عام (بدون أرقام هواتف أو إيميلات إذا لم تكن مصرحة)
    getUserById: async (id) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    }
};
