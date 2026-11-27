'use client';

import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Truck,
  MessageCircle,
  MapPin,
  User,
  Phone,
  CheckCircle2,
  FileText,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { CartItem, Store } from '@/types';
import { TEMPLATES } from '@/lib/templates';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  store: Store;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
}

const KERALA_DISTRICTS = [
  'Kozhikode',
  'Ernakulam',
  'Thiruvananthapuram',
  'Malappuram',
  'Thrissur',
  'Kannur',
  'Kollam',
  'Alappuzha',
  'Kottayam',
  'Palakkad',
  'Kasaragod',
  'Pathanamthitta',
  'Idukki',
  'Wayanad',
  'Outside Kerala'
];

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  store,
  onUpdateQuantity,
  onClearCart,
}: CartDrawerProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [district, setDistrict] = useState('Kozhikode');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod'>('upi');
  const [notes, setNotes] = useState('');
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');

  const template = TEMPLATES[store.templateId] || TEMPLATES['kerala-heritage'];
  const currency = store.currency ? `${store.currency} ` : '₹';

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const isFreeDelivery = subtotal >= store.deliverySettings.freeAboveThreshold;
  const deliveryFee = subtotal === 0 ? 0 : isFreeDelivery ? 0 : store.deliverySettings.flatFee;
  const grandTotal = subtotal + deliveryFee;
  const amountNeededForFreeDelivery = Math.max(0, store.deliverySettings.freeAboveThreshold - subtotal);

  // Clean merchant WhatsApp phone number
  const cleanMerchantNumber = (store.whatsappNumber || '918281096614').replace(/[^0-9]/g, '');

  const buildWhatsappMessage = (): string => {
    const itemsText = cart
      .map(
        (item, idx) =>
          `${idx + 1}. *${item.product.name}* (${item.product.unit || 'unit'}) x ${item.quantity} = ${currency}${
            item.product.price * item.quantity
          }`
      )
      .join('\n');

    const paymentText =
      paymentMethod === 'upi'
        ? (store.currency === 'AED' ? 'Card / Bank Transfer' : 'UPI / GPay / PhonePe')
        : 'Cash on Delivery (COD)';

    const deliveryText = isFreeDelivery
      ? 'FREE Delivery (Offer 🎉)'
      : `${currency}${deliveryFee}`;

    return [
      `🛍️ *NEW ORDER - ${store.name.toUpperCase()}*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `👤 *Customer:* ${customerName.trim()}`,
      `📞 *Phone:* ${customerPhone.trim()}`,
      `📍 *Delivery Address:*`,
      `${address.trim()}`,
      `${district} - ${pincode.trim() || ''}`,
      ``,
      `📦 *Order Items:*`,
      itemsText,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `💵 *Items Subtotal:* ${currency}${subtotal}`,
      `🚚 *Delivery Fee:* ${deliveryText}`,
      `💰 *Grand Total:* *${currency}${grandTotal}*`,
      `💳 *Payment Method:* ${paymentText}`,
      notes.trim() ? `\n📝 *Notes:* ${notes.trim()}` : '',
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `⚡ *Order placed via KadaLink*`
    ]
      .filter(Boolean)
      .join('\n');
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!customerName.trim()) {
      setValidationError('Please enter your full name');
      return;
    }

    if (!customerPhone.trim() || customerPhone.replace(/[^0-9]/g, '').length < 10) {
      setValidationError('Please enter a valid 10-digit WhatsApp phone number');
      return;
    }

    if (!address.trim()) {
      setValidationError('Please enter your delivery street address');
      return;
    }

    const message = buildWhatsappMessage();
    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanMerchantNumber}?text=${encoded}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    setOrderSubmitted(true);
  };

  const handleFinishAndClear = () => {
    onClearCart();
    setOrderSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">Your Cart</h2>
                <p className="text-[11px] text-slate-500">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)} items from {store.name}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* SUCCESS SCREEN */}
          {orderSubmitted ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">Order Sent to WhatsApp!</h3>
                <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                  Thank you, <strong>{customerName}</strong>! Your order summary was prepared and opened in WhatsApp chat with <strong>{store.name}</strong>.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-left w-full space-y-1 text-slate-700">
                <div className="font-bold text-emerald-800 flex justify-between">
                  <span>Order Total:</span>
                  <span>{currency}{grandTotal}</span>
                </div>
                <div>• Items: {cart.length} item(s)</div>
                <div>• Payment: {paymentMethod === 'upi' ? 'UPI / GPay' : 'Cash on Delivery'}</div>
                <div>• WhatsApp: +{cleanMerchantNumber}</div>
              </div>

              <div className="w-full space-y-2.5 pt-4">
                <button
                  onClick={() => {
                    const message = buildWhatsappMessage();
                    window.open(`https://wa.me/${cleanMerchantNumber}?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Re-open WhatsApp Chat</span>
                </button>

                <button
                  onClick={handleFinishAndClear}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Done & Continue Shopping
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            /* EMPTY CART */
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Your Cart is Empty</h3>
                <p className="text-xs text-slate-500 mt-1">Browse items from the store and add them to your cart.</p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-slate-800 transition-all cursor-pointer"
              >
                Browse Store Products
              </button>
            </div>
          ) : (
            /* CART WITH ITEMS & CHECKOUT */
            <div className="flex-1 overflow-y-auto flex flex-col justify-between">
              <div className="p-4 sm:p-5 space-y-5">
                {/* Free delivery progress banner */}
                <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900">
                  <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    {isFreeDelivery ? (
                      <span className="font-bold">🎉 You qualify for FREE Delivery!</span>
                    ) : (
                      <span>
                        Add <strong>{currency}{amountNeededForFreeDelivery}</strong> more for <strong>FREE Delivery</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Order Items</span>
                    <button
                      onClick={onClearCart}
                      className="text-[11px] text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear all</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl flex items-center gap-3"
                      >
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h4>
                          <p className="text-[11px] text-slate-500">
                            {currency}{item.product.price} / {item.product.unit || 'unit'}
                          </p>
                          <div className="font-bold text-xs text-emerald-700 mt-0.5">
                            {currency}{item.product.price * item.quantity}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-1.5 text-slate-800">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Form */}
                <form id="checkoutForm" onSubmit={handlePlaceOrder} className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Delivery Details</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                      Direct WhatsApp Order
                    </span>
                  </div>

                  {validationError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                      {validationError}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        WhatsApp Mobile Number *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                          +91
                        </span>
                        <input
                          type="tel"
                          placeholder="9876543210"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full pl-11 pr-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Street Address / House Name *
                      </label>
                      <textarea
                        rows={2}
                        placeholder="House / Flat name, Street, Landmark"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">District</label>
                        <select
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                        >
                          {KERALA_DISTRICTS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Pincode</label>
                        <input
                          type="text"
                          placeholder="673001"
                          maxLength={6}
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    {/* Payment Method Choice */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Payment Method</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('upi')}
                          className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                            paymentMethod === 'upi'
                              ? 'border-emerald-600 bg-emerald-50/70 font-bold text-emerald-900 ring-1 ring-emerald-500'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                            <span>UPI / GPay</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Pay on WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cod')}
                          className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                            paymentMethod === 'cod'
                              ? 'border-emerald-600 bg-emerald-50/70 font-bold text-emerald-900 ring-1 ring-emerald-500'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Cash on Delivery</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Pay upon receipt</span>
                        </button>
                      </div>
                    </div>

                    {/* Optional Notes */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Order Notes (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Deliver between 4-6 PM, extra spicy"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </form>
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="p-4 sm:p-5 bg-white border-t border-slate-200 shadow-lg space-y-3">
                {/* Price Breakdown */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Items Subtotal:</span>
                    <span>{currency}{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Delivery Fee:</span>
                    <span className={isFreeDelivery ? 'text-emerald-600 font-bold' : ''}>
                      {isFreeDelivery ? 'FREE 🎉' : `${currency}${deliveryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-100">
                    <span>Total Amount:</span>
                    <span className="text-emerald-700 text-base">{currency}{grandTotal}</span>
                  </div>
                </div>

                {/* Primary Button */}
                <button
                  type="submit"
                  form="checkoutForm"
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Place Order on WhatsApp ({currency}{grandTotal})</span>
                </button>
                <p className="text-[10px] text-center text-slate-400">
                  Sends complete order details directly to {store.name}'s WhatsApp.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
