import api from './axiosConfig';

export const orderApi = {
    // 주문 생성
    createOrder: async (orderData) => {
        const response = await api.post('/order', orderData);
        return response.data;
    },

    // 주문 내역 조회 
    getOrderHistory: async () => {
        const response = await api.get('/order-history');
        return response.data;
    },

    // 주문 내역 초기화
    clearOrderHistory: async () => {
        const response = await api.delete('/order-history');
        return response.data;
    }
}; 