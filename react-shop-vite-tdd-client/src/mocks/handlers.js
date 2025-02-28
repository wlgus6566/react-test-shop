import { http, delay, HttpResponse } from "msw";

export const handlers = [
  http.get("http://localhost:5003/products", () => {
    console.log("되고있니");
    return HttpResponse.json([
      {
        name: "America",
        imagePath: "/images/america.jpeg",
      },
      {
        name: "England",
        imagePath: "/images/england.jpeg",
      },
    ])
  })
  ,
  http.get("http://localhost:5003/options", () => {
    return HttpResponse.json([
      {
        name: "Insurance",
      },
      {
        name: "Dinner",
      },
    ])
  }),
  http.post("http://localhost:5003/order", async () => {
    let dummyData = [{ orderNumber: 2131234324, price: 2000 }];
    await delay(100);
    return HttpResponse.json(dummyData);
  }),
];
