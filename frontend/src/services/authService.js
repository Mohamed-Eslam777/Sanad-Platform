import api from './api';

// ==========================================
// خدمة المصادقة (Auth Service)
// ==========================================

export const authService = {
    // تسجيل الدخول
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    // إنشاء حساب جديد
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    // جلب بيانات المستخدم الحالي
    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    // طلب رابط استعادة كلمة المرور
    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    // إعادة تعيين كلمة المرور باستخدام التوكن
    resetPassword: async (token, password) => {
        const response = await api.post('/auth/reset-password', { token, password });
        return response.data;
    },
};
