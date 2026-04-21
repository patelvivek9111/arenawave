import React, { createContext, useContext, useReducer } from 'react';
import { PRODUCT_DISPLAY_NAME } from '../config/product';
import { usePricing } from './PricingContext';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      return {
        ...state,
        items: [
          {
            id: 'arenawav-earwing',
            name: PRODUCT_DISPLAY_NAME,
            price: action.payload.unitPrice,
            currency: action.payload.currency,
            pricingRegion: action.payload.pricingRegion,
            quantity: action.payload.quantity,
            image: '/Earwing.png',
          },
        ],
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
      };
    default:
      return state;
  }
};

function CartProviderInner({ children }) {
  const pricing = usePricing();
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
  });

  const addToCart = (quantity) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        quantity,
        unitPrice: pricing.unitPrice,
        currency: pricing.currency,
        pricingRegion: pricing.pricingRegion,
      },
    });
  };

  const updateQuantity = (id, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addToCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const CartProvider = ({ children }) => {
  return <CartProviderInner>{children}</CartProviderInner>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
