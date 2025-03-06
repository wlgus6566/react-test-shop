import { http, delay, HttpResponse } from "msw";

// 서버의 travel.json 데이터를 모사
const mockTravelData = {
    countries: [
        {
            name: "America",
            imagePath: "/images/america.jpeg",
        },
        {
            name: "England",
            imagePath: "/images/england.jpeg",
        },
    ],
    options: [
        {
            name: "Insurance",
        },
        {
            name: "Dinner",
        },
    ],
};

// 주문 내역을 저장할 배열
let orderHistory = [];

// MSW에서 http://localhost:5003/products 요청을 가로채기
export const handlers = [
  // GET /products 요청 핸들링
  http.get("http://localhost:5003/products", () => {
    return HttpResponse.json(mockTravelData.countries);
  }),

  // OPTIONS /products 요청 핸들링 (CORS 확인 요청)
  http.options("http://localhost:5003/products", () => {
    return HttpResponse.text("", { status: 204 });
  }),

  // GET /options 요청 핸들링
  http.get("http://localhost:5003/options", () => {
    return HttpResponse.json(mockTravelData.options);
  }),

  // POST /order 요청 핸들링
  http.post("http://localhost:5003/order", async ({ request }) => {
    const body = await request.json();
    const orderNumber = Math.floor(Math.random() * 1000000);
    const order = { 
      price: body.totals.total, 
      orderNumber 
    };
    orderHistory.push(order);
    await delay(500); // 실제 서버 응답 지연 시뮬레이션
    return HttpResponse.json({ orderNumber }, { status: 201 });
  }),

  // GET /order-history 요청 핸들링
  http.get("http://localhost:5003/order-history", async () => {
    await delay(500); // 실제 서버 응답 지연 시뮬레이션
      return HttpResponse.json(orderHistory, { status: 200 });
    }),

  // DELETE /order-history 요청 핸들링
  http.delete("http://localhost:5003/order-history", () => {
    orderHistory = [];
    return HttpResponse.json(
      { message: "Order history cleared" }, 
      { status: 200 }
    );
  }),
];
