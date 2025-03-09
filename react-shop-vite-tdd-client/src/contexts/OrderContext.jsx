import { createContext, useState, useMemo, useEffect } from "react";

// OrderContext 생성
export const OrderContext = createContext();

// 주어진 타입의 소계를 계산하는 함수
function calculateSubtotal(orderType, orderCounts, prices) {
  let total = 0;
  for (const [itemName, count] of orderCounts[orderType].entries()) {
    const price = prices[orderType].find(item => item.name === itemName)?.price || 0;
    total += count * price;
  }
  return total;
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

  // 서버에서 받아온 가격 정보 저장
  const [prices, setPrices] = useState({
    products: [],
    options: []
  });

  // 서버에서 상품과 옵션 데이터 가져오기
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const [productsResponse, optionsResponse] = await Promise.all([
          fetch('http://localhost:5003/products'),
          fetch('http://localhost:5003/options')
        ]);
        
        const products = await productsResponse.json();
        const options = await optionsResponse.json();
        
        setPrices({
          products,
          options
        });
      } catch (error) {
        console.error('Failed to fetch prices:', error);
      }
    };
    
    fetchPrices();
  }, []);

  // 사용자 포인트는 로그인 시 서버에서 받아온 값으로 설정됨
  const [userPoints, setUserPoints] = useState(0);

  // ✅ 주문 수량이 변경될 때 총 금액을 다시 계산하는 useEffect
  useEffect(() => {
    if (orderCounts.products.size === 0 && orderCounts.options.size === 0) {
      setTotals({ products: 0, options: 0, total: 0 }); // 🛠 주문 초기화 시 즉시 0으로 설정
    } else {
      const productsTotal = calculateSubtotal("products", orderCounts, prices);
      const optionsTotal = calculateSubtotal("options", orderCounts, prices);
      setTotals({
        products: productsTotal,
        options: optionsTotal,
        total: productsTotal + optionsTotal,
      });
    }
  }, [orderCounts, prices]); // ⬅ orderCounts 변경될 때마다 실행

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
      setUserPoints(0);

      // ✅ 상태 업데이트 후 강제 리렌더링 트리거
      setTimeout(() => {
        console.log("🔄 주문 데이터 완전 초기화 완료");
      }, 50);
    }
    function deductPoints(amount) {
      setUserPoints((prev) => {
        const currentPoints = Number(prev) || 0;
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
      setUserPoints,
    ];
  }, [orderCounts, totals, userPoints]);

  return <OrderContext.Provider value={value} {...props} />;
}
