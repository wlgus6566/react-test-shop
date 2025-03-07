import { http, delay, HttpResponse } from "msw";

// MSW에서 http://localhost:5003/products 요청을 가로채기
export const handlers = [
  // GET /products 요청 핸들링
  http.get("http://localhost:5003/products", () => {
    return HttpResponse.json([
      {
        name: "America",
        imagePath: "/images/america.jpeg",
      },
      {
        name: "England",
        imagePath: "/images/england.jpeg",
      },
    ]);
  }),

  // OPTIONS /products 요청 핸들링 (CORS 확인 요청)
  http.options("http://localhost:5003/products", () => {
    return HttpResponse.text("", { status: 204 });
  }),

  // GET /options 요청 핸들링
  http.get("http://localhost:5003/options", () => {
    return HttpResponse.json([
      {
        name: "Insurance",
      },
      {
        name: "Dinner",
      },
    ]);
  }),

  // POST /order 요청 핸들링
  http.post("http://localhost:5003/order", async ({ request }) => {
    console.log("MSW: Intercepted /order request", request);
    await delay(100);
    return HttpResponse.json({ orderNumber: 2131234324 });
  }),

  // GET /order-history 요청 핸들링
  http.get("http://localhost:5003/order-history", () => {
    return HttpResponse.json([
      { orderNumber: 2131234324, price: 2000 },
      { orderNumber: 2131234325, price: 3000 }
    ]);
  }),

  // DELETE /order-history 요청 핸들링 추가
  http.delete("http://localhost:5003/order-history", () => {
    return HttpResponse.json({ success: true });
  }),
];
