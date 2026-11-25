'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Trash2, Plus, Minus, ShoppingBag, ShieldCheck, QrCode, Truck, MessageCircle } from 'lucide-react';
import { CartItem, Store, CustomerOrderDetails } from '@/types';
import { TEMPLATES } from '@/lib/templates';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  store: Store;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
}

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
  const [upiQrUrl, setUpiQrUrl] = useState('');
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  const template = TEMPLATES[store.templateId] || TEMPLATES['kerala-heritage'];

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const isFreeDelivery = subtotal >= store.deliverySettings.freeAboveThreshold;
  const deliveryFee = subtotal === 0 ? 0 : isFreeDelivery ? 0 : store.deliverySettings.flatFee;
  const grandTotal = subtotal + deliveryFee;
  const amountNeededForFreeDelivery = Math.max(0, store.deliverySettings.freeAboveThreshold - subtotal);

  // Generate dynamic UPI payment URL & QR code
  useEffect(() => {
    if (grandTotal > 0 && store.upiId) {
      const upiUrl = `upi://pay?pa=${encodeURIComponent(store.upiId)}&pn=${encodeURIComponent(
        store.upiName || store.name
      )}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent(`Order from ${store.name}`)}`;

      QRCode.toDataURL(upiUrl, {
        width: 240,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setUpiQrUrl(url))
        .catch((err) => console.error('Failed to generate UPI QR:', err));
    }
  }, [grandTotal, store]);

  if (!isOpen) return null;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Clean merchant whatsapp number
    const cleanMerchantNumber = store.whatsappNumber.replace(/[^0-9]/g, '');

    // Format WhatsApp message
    const orderItemsText = cart
      .map(
        (item, idx) =>
          `${idx + 1}. *${item.product.name}* (${item.product.unit}) x ${item.quantity} = ₹${
            item.product.price * item.quantity
          }`
      )
      .join('\n');

    const paymentText =
      paymentMethod === 'upi'
        ? `UPI (Paid / QR Generated to ${store.upiId})`
        : 'Pay on Delivery / WhatsApp Confirmation';

    const deliveryText = isFreeDelivery
      ? 'FREE (Offer Applied 🎉)'
      : `₹${deliveryFee}`;

    const message = `🛍️ *NEW ORDER - ${store.name.toUpperCase()}*
----------------------------------------
*Ordered Items:*
${orderItemsText}

----------------------------------------
*Subtotal:* ₹${subtotal}
*Delivery Fee:* ${deliveryText}
*Grand Total Amount:* *₹${grandTotal}*
*Payment Mode:* ${paymentText}

----------------------------------------
*Customer Delivery Details:*
👤 *Name:* ${customerName}
📞 *Phone:* ${customerPhone}
📍 *Address:* ${address}
📮 *District / Pincode:* ${district} - ${pincode}
${notes ? `📝 *Special Notes:* ${notes}` : ''}
----------------------------------------
_Please confirm my order & share dispatch tracking details. Thank you!_`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanMerchantNumber}?text=${encodedMessage}`;

    setOrderSubmitted(true);

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <h2 className="font-semibold text-slate-800 text-lg">Your Order ({cart.length})</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-medium text-slate-700">Your cart is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Browse products from {store.name} and add them to your cart to order via WhatsApp.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Start Shopping
                </button>
              </div>
            ) : orderSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Order Sent to WhatsApp!</h3>
                <p className="text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
                  Your order has been forwarded to <strong>{store.name}</strong> on WhatsApp. The merchant will review and confirm your delivery.
                </p>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-900 space-y-1">
                  <div className="font-semibold">💡 What to do next:</div>
                  <div>1. If you chose UPI, send the payment screenshot in the chat.</div>
                  <div>2. Merchant will reply with expected delivery date.</div>
                </div>
                <button
                  onClick={() => {
                    setOrderSubmitted(false);
                    onClearCart();
                    onClose();
                  }}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                {/* Free Delivery Bar */}
                {store.deliverySettings.freeAboveThreshold > 0 && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-medium">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <Truck className="w-4 h-4 text-emerald-600" />
                        {isFreeDelivery ? 'Free Delivery Unlocked! 🎉' : `Free delivery on orders above ₹${store.deliverySettings.freeAboveThreshold}`}
                      </span>
                      {!isFreeDelivery && (
                        <span className="text-emerald-700 font-semibold">
                          Add ₹{amountNeededForFreeDelivery} more
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            (subtotal / store.deliverySettings.freeAboveThreshold) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Cart Items List */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-800 truncate">
                          {item.product.name}
                        </h4>
                        <div className="text-xs text-slate-500">{item.product.unit}</div>
                        <div className="text-sm font-bold text-slate-900 mt-0.5">
                          ₹{item.product.price * item.quantity}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600"
                        >
                          {item.quantity === 1 ? (
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          ) : (
                            <Minus className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span className="text-xs font-semibold px-1 min-w-[1.2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer Checkout Form */}
                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4 pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Delivery Address (No Login Required)
                  </h3>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Menon"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">WhatsApp Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="9847012345"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Delivery Address *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="House / Flat name, Street, Landmark"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">District (Kerala) *</label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                      >
                        {[
                          'Alappuzha',
                          'Ernakulam',
                          'Idukki',
                          'Kannur',
                          'Kasaragod',
                          'Kollam',
                          'Kottayam',
                          'Kozhikode',
                          'Malappuram',
                          'Palakkad',
                          'Pathanamthitta',
                          'Thiruvananthapuram',
                          'Thrissur',
                          'Wayanad',
                          'Outside Kerala'
                        ].map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Pincode *</label>
                      <input
                        type="text"
                        required
                        placeholder="682030"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Payment Selection */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Payment Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          paymentMethod === 'upi'
                            ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-800">
                          <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                          Instant UPI QR
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Google Pay, PhonePe, Paytm</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          paymentMethod === 'cod'
                            ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-800">
                          <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                          Pay on WhatsApp
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Pay after chat confirmation</div>
                      </button>
                    </div>
                  </div>

                  {/* UPI QR Display */}
                  {paymentMethod === 'upi' && store.upiId && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-center">
                      <div className="text-xs font-semibold text-slate-800 flex items-center justify-center gap-1.5">
                        <QrCode className="w-4 h-4 text-emerald-600" />
                        Scan to Pay ₹{grandTotal}
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200 inline-block shadow-sm">
                        {upiQrUrl ? (
                          <img src={upiQrUrl} alt="UPI QR Code" className="w-32 h-32 mx-auto" />
                        ) : (
                          <div className="w-32 h-32 bg-slate-100 animate-pulse rounded" />
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-600">
                        UPI ID: <span className="font-semibold text-slate-800">{store.upiId}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        After paying, click the green button below to send your order on WhatsApp!
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Notes for Seller (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Extra spicy / Birthday note / Call before delivery"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Footer Bill & WhatsApp Action */}
          {cart.length > 0 && !orderSubmitted && (
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery ({district})</span>
                  <span>{isFreeDelivery ? <strong className="text-emerald-600">FREE</strong> : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                Place Order via WhatsApp
              </button>

              <div className="text-center text-[10px] text-slate-500">
                🔒 Direct WhatsApp chat with {store.name}. No hidden charges.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
