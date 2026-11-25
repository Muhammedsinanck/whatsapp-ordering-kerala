'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ShieldCheck,
  QrCode,
  Truck,
  MessageCircle,
  MapPin,
  User,
  Phone,
  CheckCircle2,
  FileText
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
  const [generatedWhatsappUrl, setGeneratedWhatsappUrl] = useState('');

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

  // Generate live WhatsApp message text
  const cleanMerchantNumber = store.whatsappNumber.replace(/[^0-9]/g, '');

  const orderItemsText = cart
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.product.name}* (${item.product.unit || 'unit'}) x ${item.quantity} = ₹${
          item.product.price * item.quantity
        }`
    )
    .join('\n');

  const paymentText =
    paymentMethod === 'upi'
      ? `UPI Payment (To ${store.upiId})`
      : 'Pay on WhatsApp Confirmation';

  const deliveryText = isFreeDelivery
    ? 'FREE Delivery (Special Offer 🎉)'
    : `₹${deliveryFee}`;

  const whatsappMessage = `🛍️ *NEW ORDER - ${store.name.toUpperCase()}*
----------------------------------------
*ITEMS & QUANTITIES:*
${orderItemsText}

----------------------------------------
*BILL BREAKDOWN:*
Subtotal: ₹${subtotal}
Delivery Charge: ${deliveryText}
*Grand Total Amount: ₹${grandTotal}*
*Payment Mode:* ${paymentText}

----------------------------------------
*DELIVERY ADDRESS:*
👤 *Name:* ${customerName || '(Name not provided)'}
📞 *Phone:* ${customerPhone || '(Phone not provided)'}
📍 *Address:* ${address || '(Address not provided)'}
📮 *District / Pincode:* ${district} - ${pincode || '(Pincode)'}
${notes ? `📝 *Notes:* ${notes}` : ''}
----------------------------------------
_Please confirm my order & dispatch details. Thank you!_`;

  if (!isOpen) return null;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!customerName.trim() || !customerPhone.trim() || !address.trim()) {
      alert('Please fill in your name, WhatsApp phone number, and delivery address.');
      return;
    }

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const finalUrl = `https://wa.me/${cleanMerchantNumber}?text=${encodedMessage}`;
    setGeneratedWhatsappUrl(finalUrl);
    setOrderSubmitted(true);

    // Direct navigation is most reliable across all mobile browsers (iOS & Android)
    try {
      window.location.href = finalUrl;
    } catch {
      window.open(finalUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <h2 className="font-extrabold text-slate-800 text-base">
                Your Cart ({cart.reduce((s, i) => s + i.quantity, 0)} items)
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">Your cart is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Add items from {store.name} to your cart to order via WhatsApp.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl"
                >
                  Start Adding Items
                </button>
              </div>
            ) : orderSubmitted ? (
              /* Success / Completed Screen */
              <div className="py-10 text-center space-y-5">
                <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Order Message Ready!</h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto leading-relaxed">
                    Opening WhatsApp to send your order items, quantities, and address to <strong>{store.name}</strong>.
                  </p>
                </div>

                {/* Direct Tap Button in case popup was blocked */}
                <a
                  href={generatedWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Tap to Send on WhatsApp Now</span>
                </a>

                {/* What happens next */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2 text-slate-700">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" /> What the merchant receives:
                  </div>
                  <pre className="text-[10px] font-mono bg-white p-3 rounded-xl border border-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed text-slate-800">
                    {whatsappMessage}
                  </pre>
                </div>

                <button
                  onClick={() => {
                    setOrderSubmitted(false);
                    onClearCart();
                    onClose();
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Close & Clear Cart
                </button>
              </div>
            ) : (
              <>
                {/* Free Delivery Bar */}
                {store.deliverySettings.freeAboveThreshold > 0 && (
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="flex items-center gap-1.5 text-emerald-900">
                        <Truck className="w-4 h-4 text-emerald-600" />
                        {isFreeDelivery ? 'Free Delivery Applied! 🎉' : `Free delivery on orders above ₹${store.deliverySettings.freeAboveThreshold}`}
                      </span>
                      {!isFreeDelivery && (
                        <span className="text-emerald-700 font-bold">
                          Add ₹{amountNeededForFreeDelivery} more
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full transition-all duration-300"
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

                {/* SECTION 1: ITEMS IN CART */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      1. Items & Quantities
                    </h3>
                    <button
                      onClick={onClearCart}
                      className="text-[11px] font-semibold text-rose-600 hover:text-rose-700"
                    >
                      Clear All
                    </button>
                  </div>

                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100"
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.product.name}
                        </h4>
                        <div className="text-[11px] text-slate-500">{item.product.unit}</div>
                        <div className="text-xs font-extrabold text-slate-900 mt-0.5">
                          ₹{item.product.price} × {item.quantity} = ₹{item.product.price * item.quantity}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 hover:bg-slate-100 rounded-lg text-slate-600"
                        >
                          {item.quantity === 1 ? (
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          ) : (
                            <Minus className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span className="text-xs font-bold px-1.5 min-w-[1.2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 hover:bg-slate-100 rounded-lg text-slate-600"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* SECTION 2: CUSTOMER DELIVERY ADDRESS */}
                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-3.5 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      2. Delivery Address (Sent to WhatsApp)
                    </h3>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                      No Login Needed
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Menon"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9847012345"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Full House / Street Address *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="House / Apartment Name, Road, Landmark, Town"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Kerala District *
                      </label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
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
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 682030"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                      Payment Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          paymentMethod === 'upi'
                            ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
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
                            ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                          <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                          Pay on WhatsApp
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Pay after chat confirmation</div>
                      </button>
                    </div>
                  </div>

                  {/* UPI QR Display */}
                  {paymentMethod === 'upi' && store.upiId && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-center">
                      <div className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5">
                        <QrCode className="w-4 h-4 text-emerald-600" />
                        Scan to Pay ₹{grandTotal}
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-200 inline-block shadow-sm">
                        {upiQrUrl ? (
                          <img src={upiQrUrl} alt="UPI QR Code" className="w-32 h-32 mx-auto" />
                        ) : (
                          <div className="w-32 h-32 bg-slate-100 animate-pulse rounded-lg" />
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-700">
                        UPI ID: <span className="font-bold text-slate-900">{store.upiId}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Scan with GPay or PhonePe, then click the green button below to submit your order!
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Special Request / Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Extra spicy / Please deliver before 5 PM"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Footer Bill & WhatsApp Action */}
          {cart.length > 0 && !orderSubmitted && (
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-slate-800">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Kerala Delivery ({district})</span>
                  <span>{isFreeDelivery ? <strong className="text-emerald-600 font-bold">FREE</strong> : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>Grand Total</span>
                  <span className="text-emerald-700">₹{grandTotal}</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                className="w-full py-4 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-green-600/25 transition-all flex items-center justify-center gap-2 group"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Send Order & Address on WhatsApp</span>
              </button>

              <div className="text-center text-[10px] text-slate-500">
                🔒 Direct WhatsApp chat to <strong>+91 {store.whatsappNumber.replace(/^91/, '')}</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
