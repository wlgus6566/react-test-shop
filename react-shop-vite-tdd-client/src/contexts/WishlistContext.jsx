import { createContext, useState, useContext } from 'react';

export const WishlistContext = createContext();

export function WishlistProvider({ children }) {
    const [wishlist, setWishlist] = useState([]);

    const addToWishlist = (product) => {
        setWishlist(prev => {
            if (!prev.some(item => item.name === product.name)) {
                return [...prev, product];
            }
            return prev;
        });
    };

    const removeFromWishlist = (productName) => {
        setWishlist(prev => prev.filter(item => item.name !== productName));
    };

    const isInWishlist = (productName) => {
        return wishlist.some(item => item.name === productName);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
}

export const useWishlist = () => useContext(WishlistContext); 