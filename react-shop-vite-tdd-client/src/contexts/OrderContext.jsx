import { createContext, useState, useMemo, useEffect } from "react";

// OrderContext 생성
export const OrderContext = createContext();

// 각 아이템의 단위 가격을 정의
const pricePerItem = {
  products: 1000,
  options: 500,
};

// 주어진 타입의 소계를 계산하는 함수
function calculateSubtotal(orderType, orderCounts) {
  let optionCount = 0;
  for (const count of orderCounts[orderType].values()) {
    optionCount += count;
  }
  return optionCount * pricePerItem[orderType];
}

// 컨텍스트 Provider 컴포넌트
export function OrderContextProvider(props) {
  // 주문 수량을 관리하는 상태
  const [orderCounts, setOrderCounts] = useState({
    products: new Map(),
    options: new Map(),
  });

  // 총 금액을 관리하는 상태
  const [totals, setTotals] = useState({
    products: 0,
    options: 0,
    total: 0,
  });

  // ✅ 사용자 포인트 초기값 설정
  const [userPoints, setUserPoints] = useState(5000);

  // ✅ 주문 수량이 변경될 때 총 금액을 다시 계산하는 useEffect
  useEffect(() => {
    if (orderCounts.products.size === 0 && orderCounts.options.size === 0) {
      setTotals({ products: 0, options: 0, total: 0 }); // 🛠 주문 초기화 시 즉시 0으로 설정
    } else {
      const productsTotal = calculateSubtotal("products", orderCounts);
      const optionsTotal = calculateSubtotal("options", orderCounts);
      setTotals({
        products: productsTotal,
        options: optionsTotal,
        total: productsTotal + optionsTotal,
      });
    }
  }, [orderCounts]); // ⬅ orderCounts 변경될 때마다 실행

  // Context에서 공유할 값
  const value = useMemo(() => {
    function updateItemCount(itemName, newItemCount, orderType) {
      const newOrderCounts = new Map(orderCounts[orderType]);
      newOrderCounts.set(itemName, parseInt(newItemCount, 10));

      setOrderCounts((prev) => ({
        ...prev,
        [orderType]: newOrderCounts,
      }));
    }

    function getOrderData() {
      return {
        products: Object.fromEntries(orderCounts.products),
        options: Object.fromEntries(orderCounts.options),
        totals,
      };
    }

    function resetOrderDatas() {
      console.log("🛠 주문 데이터 초기화 시작");

      // ✅ 주문 수량을 먼저 초기화
      setOrderCounts({
        products: new Map(),
        options: new Map(),
      });

      // ✅ 총 가격도 즉시 0으로 설정
      setTotals({ products: 0, options: 0, total: 0 });

      // ✅ 포인트 초기화
      setUserPoints(5000);

      // ✅ 상태 업데이트 후 강제 리렌더링 트리거
      setTimeout(() => {
        console.log("🔄 주문 데이터 완전 초기화 완료");
      }, 50);
    }
    function deductPoints(amount) {
      setUserPoints((prev) => {
        const currentPoints = Number(prev) || 5000;
        const validAmount = Number(amount) || 0;
        return Math.max(0, currentPoints - validAmount);
      });
    }

    return [
      {
        products: orderCounts.products,
        options: orderCounts.options,
        totals,
        userPoints,
      },
      updateItemCount,
      resetOrderDatas,
      deductPoints,
      getOrderData,
    ];
  }, [orderCounts, totals, userPoints]);

  return <OrderContext.Provider value={value} {...props} />;
}
