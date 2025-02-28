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
  // 주문 수량을 관리하는 상태 (Map → Object 변환)
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

  // ✅ 사용자 포인트 초기값을 5000으로 강제 설정 (NaN 방지)
  const [userPoints, setUserPoints] = useState(5000);

  // 주문 수량이 변경될 때 총 금액을 다시 계산
  useEffect(() => {
    const productsTotal = calculateSubtotal("products", orderCounts);
    const optionsTotal = calculateSubtotal("options", orderCounts);
    const total = productsTotal + optionsTotal;

    setTotals({
      products: productsTotal,
      options: optionsTotal,
      total,
    });
  }, [orderCounts]);

  // Context에서 공유할 값을 `useMemo`로 최적화
  const value = useMemo(() => {
    function updateItemCount(itemName, newItemCount, orderType) {
      const newOrderCounts = new Map(orderCounts[orderType]);
      newOrderCounts.set(itemName, parseInt(newItemCount, 10));

      setOrderCounts((prev) => ({
        ...prev,
        [orderType]: newOrderCounts,
      }));
    }

    // 주문 데이터를 JSON 변환하여 반환하는 함수
    function getOrderData() {
      return {
        products: Object.fromEntries(orderCounts.products), // JSON 변환
        options: Object.fromEntries(orderCounts.options),   // JSON 변환
        totals,
      };
    }

    // ✅ 주문 초기화 시 `userPoints`를 5000으로 설정하고, 총합도 초기화
    function resetOrderDatas() {
      setOrderCounts({
        products: new Map(),
        options: new Map(),
      });

      // ✅ 총 금액을 초기화하여 두 번째 주문에서도 0에서 시작하도록 설정
      setTotals({ products: 0, options: 0, total: 0 });

      setUserPoints(5000); // ✅ 포인트도 초기화
      console.log("🔄 주문 초기화: 총 금액 0으로 리셋됨");
    }
    // ✅ `userPoints`가 `NaN`이 되지 않도록 방어 코드 추가
    function deductPoints(amount) {
      setUserPoints((prev) => {
        console.log("🛠️ 현재 포인트 값 (차감 전):", prev);
        console.log("💰 차감할 금액:", amount);

        // ✅ prev가 NaN이거나 undefined이면 5000으로 설정
        const currentPoints = Number(prev) || 5000;

        // ✅ amount가 NaN이거나 undefined이면 0으로 설정
        const validAmount = Number(amount) || 0;

        const newPoints = Math.max(0, currentPoints - validAmount); // ✅ 최소 0 이상 보장
        console.log("📌 포인트 차감 후:", newPoints); // 🔍 디버깅 로그 추가

        return newPoints;
      });
    }


    return [
      {
        products: orderCounts.products,
        options: orderCounts.options,
        totals,
        userPoints: userPoints ?? 5000, // ✅ NaN 방지: `undefined`일 경우 5000으로 설정
      },
      updateItemCount,
      resetOrderDatas,
      deductPoints,
      getOrderData,
    ];
  }, [orderCounts, totals, userPoints]);

  return <OrderContext.Provider value={value} {...props} />;
}
