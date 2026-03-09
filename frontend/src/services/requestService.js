import api from './api';

// ==========================================
// خدمة الطلبات (Request Service)
// ==========================================

export const requestService = {
    // إنشاء طلب (خاص بالمستفيد)
    createRequest: async (requestData) => {
        const response = await api.post('/requests', requestData);
        return response.data;
    },

    // جلب الطلبات القريبة (خاص بالمتطوع)
    getNearbyRequests: async (lat, lng, radius) => {
        const params = {};
        if (lat != null && lng != null) { params.lat = lat; params.lng = lng; }
        if (radius != null) params.radius = radius;
        const response = await api.get('/requests/nearby', { params });
        return response.data;
    },

    // جلب طلباتي (خاص بالمستفيد)
    getMyRequests: async () => {
        const response = await api.get('/requests/mine');
        return response.data;
    },

    // جلب الطلبات المقبولة للمتطوع (accepted + in_progress)
    getMyAcceptedRequests: async () => {
        const response = await api.get('/requests/my-accepted');
        return response.data;
    },

    // جلب جميع الطلبات المعلقة
    getAllRequests: async () => {
        const response = await api.get('/requests');
        return response.data;
    },

    // جلب تفاصيل طلب معين
    getRequestById: async (id) => {
        const response = await api.get(`/requests/${id}`);
        return response.data;
    },

    // قبول طلب (خاص بالمتطوع)
    acceptRequest: async (id) => {
        const response = await api.patch(`/requests/${id}/accept`);
        return response.data;
    },

    // إكمال الطلب
    completeRequest: async (id) => {
        const response = await api.patch(`/requests/${id}/complete`);
        return response.data;
    },

    // إلغاء طلب (خاص بالمستفيد ولا يعمل إلا في حالة pending)
    cancelRequest: async (id) => {
        const response = await api.patch(`/requests/${id}/cancel`);
        return response.data;
    },
};
