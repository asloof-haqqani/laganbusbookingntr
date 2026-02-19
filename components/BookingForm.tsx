import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Calendar, MapPin, User, Phone, Bus, CreditCard, ChevronDown, Plus, Minus } from 'lucide-react';
import { BUS_SERVICES, CITIES, BANK_DETAILS } from '../constants';
import { BookingFormData } from '../types';

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    phone: '',
    from: '',
    to: '',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '',
    bus: '',
    maleSeats: 0,
    femaleSeats: 0
  });

  const handleBusChange = (busName: string) => {
    const service = BUS_SERVICES[busName];
    setFormData(prev => ({
      ...prev,
      bus: busName,
      time: service ? service.time : ''
    }));
  };

  const calculateTotal = () => {
    const service = BUS_SERVICES[formData.bus];
    if (!service) return 0;
    return service.price * (formData.maleSeats + formData.femaleSeats);
  };

  const updateSeats = (type: 'male' | 'female', delta: number) => {
    setFormData(prev => {
      const current = type === 'male' ? prev.maleSeats : prev.femaleSeats;
      const newVal = Math.max(0, Math.min(10, current + delta)); // Limit 0-10
      return {
        ...prev,
        [type === 'male' ? 'maleSeats' : 'femaleSeats']: newVal
      };
    });
  };

  const showBankDetails = () => {
    const total = calculateTotal();
    Swal.fire({
      title: 'Payment Details',
      html: `
        <div class="text-left space-y-4">
          <p class="text-center font-bold text-primary dark:text-primary-light text-lg mb-4">
            Transfer LKR ${total.toLocaleString()} to:
          </p>
          <div class="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
            <p class="text-sm text-slate-500 uppercase tracking-wider mb-2">Bank Details</p>
            <p><strong>Bank:</strong> ${BANK_DETAILS.bankName}</p>
            <p><strong>Account:</strong> ${BANK_DETAILS.accountNumber}</p>
            <p><strong>Name:</strong> ${BANK_DETAILS.accountName}</p>
            <p><strong>Branch:</strong> ${BANK_DETAILS.branch}</p>
          </div>
          <div class="text-sm text-slate-500 text-center">
            Use <strong>${formData.name || 'Your Name'}</strong> as reference
          </div>
        </div>
      `,
      confirmButtonText: 'Got it',
      confirmButtonColor: '#0066FF',
      customClass: {
        popup: 'rounded-3xl'
      }
    });
  };

  const openWhatsApp = () => {
    const total = calculateTotal();
    const seats = formData.maleSeats + formData.femaleSeats;
    
    // Format the booking message
    const message = `Hi, I would like to confirm my bus booking:

Name: ${formData.name}
Phone: ${formData.phone}
From: ${formData.from}
To: ${formData.to}
Date: ${formData.date}
Bus: ${formData.bus}
Male Seats: ${formData.maleSeats}
Female Seats: ${formData.femaleSeats}
Total Seats: ${seats}
Total Cost: LKR ${total.toLocaleString()}

Please confirm my booking.`;

    // Format phone number: Replace 0 with 94 for Sri Lanka
    const phoneNumber = formData.phone.startsWith('0') 
      ? '94' + formData.phone.slice(1)
      : formData.phone;

    // Detect device and use appropriate WhatsApp link
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const encodedMessage = encodeURIComponent(message);
    
    if (isMobile) {
      // Use WhatsApp app on mobile
      window.location.href = `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`;
    } else {
      // Use WhatsApp Web on desktop
      window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`, '_blank');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic Validation
    if (formData.maleSeats === 0 && formData.femaleSeats === 0) {
      Swal.fire({ 
          title: 'Seat Selection Required', 
          text: 'Please select at least one male or female seat.', 
          icon: 'warning', 
          confirmButtonColor: '#0066FF',
          customClass: { popup: 'rounded-3xl' }
      });
      return;
    }

    if (formData.phone.length < 9) {
      Swal.fire({ 
          title: 'Invalid Phone Number', 
          text: 'Please enter a valid phone number (e.g., 0771234567).', 
          icon: 'warning', 
          confirmButtonColor: '#0066FF',
          customClass: { popup: 'rounded-3xl' }
      });
      return;
    }

    // Show confirmation dialog with WhatsApp option
    Swal.fire({
      title: 'Confirm Booking',
      html: `<div class="text-left">
        <p class="mb-4">Your booking details are ready to be sent to our admin via WhatsApp.</p>
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 text-sm">
          <p><strong>From:</strong> ${formData.from}</p>
          <p><strong>To:</strong> ${formData.to}</p>
          <p><strong>Date:</strong> ${formData.date}</p>
          <p><strong>Bus:</strong> ${formData.bus}</p>
          <p><strong>Seats:</strong> ${formData.maleSeats + formData.femaleSeats}</p>
          <p><strong>Total:</strong> LKR ${calculateTotal().toLocaleString()}</p>
        </div>
      </div>`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: '✓ Send via WhatsApp',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#25D366',
      customClass: { popup: 'rounded-3xl' }
    }).then((result) => {
      if (result.isConfirmed) {
        openWhatsApp();
        onSubmit(formData);
      }
    });
  };

  return (
    <div className="glass-card rounded-[2rem] md:rounded-[2.5rem] shadow-glass overflow-hidden animate-fade-in-up relative z-10">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-50"></div>
      
      <div className="p-5 md:p-12">
        <div className="flex items-center justify-between mb-6 md:mb-12">
          <div className="flex items-center gap-4 md:gap-5">
             <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center shadow-lg shadow-primary/25 transform -rotate-3">
                <Calendar className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2} />
             </div>
             <div>
                <h2 className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white">New Booking</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-base">Secure your seat in seconds</p>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          
          {/* Section 1: Journey */}
          <div className="space-y-4">
             <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Journey Details</h3>
             <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    <MapPin size={20} />
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <ChevronDown size={16} />
                  </div>
                  <select
                    value={formData.from}
                    onChange={e => setFormData({...formData, from: e.target.value})}
                    className="w-full pl-12 pr-10 py-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-primary/50 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all appearance-none font-medium text-base text-slate-700 dark:text-slate-200"
                    required
                  >
                    <option value="" disabled>Pickup Location</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    <MapPin size={20} />
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <ChevronDown size={16} />
                  </div>
                  <select
                    value={formData.to}
                    onChange={e => setFormData({...formData, to: e.target.value})}
                    className="w-full pl-12 pr-10 py-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-primary/50 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all appearance-none font-medium text-base text-slate-700 dark:text-slate-200"
                    required
                  >
                    <option value="" disabled>Destination</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
             </div>

             <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                 <div className="relative group">
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                        <Calendar size={20} />
                     </div>
                     <input
                        type="date"
                        value={formData.date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-primary/50 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all font-medium text-base text-slate-700 dark:text-slate-200"
                        required
                      />
                 </div>
                 
                 <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                        <Bus size={20} />
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <ChevronDown size={16} />
                    </div>
                    <select
                        value={formData.bus}
                        onChange={e => handleBusChange(e.target.value)}
                        className="w-full pl-12 pr-10 py-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-primary/50 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all appearance-none font-medium text-base text-slate-700 dark:text-slate-200"
                        required
                    >
                        <option value="" disabled>Select Bus Service</option>
                        {Object.keys(BUS_SERVICES).map(bus => (
                        <option key={bus} value={bus}>
                            {bus} ({BUS_SERVICES[bus].time}) - LKR {BUS_SERVICES[bus].price}
                        </option>
                        ))}
                    </select>
                 </div>
             </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>

          {/* Section 2: Passengers & Contact */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Personal Info</h3>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                        <User size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-primary/50 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all font-medium text-base text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                        required
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                        <Phone size={20} />
                    </div>
                    <input
                        type="tel"
                        placeholder="Mobile Number (07...)"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-primary/50 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all font-medium text-base text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                        required
                    />
                  </div>
              </div>

              <div className="space-y-4">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Seat Selection</h3>
                 
                 {/* Male Seats Stepper */}
                 <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                     <span className="text-sm font-bold text-blue-900 dark:text-blue-200">Male Seats</span>
                     <div className="flex items-center gap-4 bg-white dark:bg-slate-900 rounded-xl p-1 shadow-sm">
                         <button 
                           type="button" 
                           onClick={() => updateSeats('male', -1)}
                           className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                         >
                            <Minus size={16} />
                         </button>
                         <span className="w-4 text-center font-bold text-lg text-slate-900 dark:text-white">{formData.maleSeats}</span>
                         <button 
                           type="button" 
                           onClick={() => updateSeats('male', 1)}
                           className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-600 text-blue-700 dark:text-white hover:bg-blue-200 dark:hover:bg-blue-500 transition-colors"
                         >
                            <Plus size={16} />
                         </button>
                     </div>
                 </div>

                 {/* Female Seats Stepper */}
                 <div className="flex items-center justify-between p-4 rounded-2xl bg-pink-50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-900/30">
                     <span className="text-sm font-bold text-pink-900 dark:text-pink-200">Female Seats</span>
                     <div className="flex items-center gap-4 bg-white dark:bg-slate-900 rounded-xl p-1 shadow-sm">
                         <button 
                           type="button" 
                           onClick={() => updateSeats('female', -1)}
                           className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                         >
                            <Minus size={16} />
                         </button>
                         <span className="w-4 text-center font-bold text-lg text-slate-900 dark:text-white">{formData.femaleSeats}</span>
                         <button 
                           type="button" 
                           onClick={() => updateSeats('female', 1)}
                           className="w-8 h-8 flex items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-600 text-pink-700 dark:text-white hover:bg-pink-200 dark:hover:bg-pink-500 transition-colors"
                         >
                            <Plus size={16} />
                         </button>
                     </div>
                 </div>
              </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>

          {/* Section 3: Summary & Submit */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-5 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Estimated Cost</p>
                  <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                      LKR {calculateTotal().toLocaleString()}
                  </p>
              </div>
              <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                  <button
                    type="button"
                    onClick={showBankDetails}
                    className="flex-1 sm:flex-none px-6 py-4 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                     <CreditCard size={18} />
                     <span>Bank Details</span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-10 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all active:scale-[0.98] w-full md:w-auto flex items-center justify-center gap-2"
                  >
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371 0-.57 0-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.044-5.03 5.597-5.03 9.562 0 1.634.346 3.229 1.031 4.714l-.556 2.032 2.083-.541c1.386.754 2.943 1.15 4.555 1.15 5.502 0 9.987-4.486 9.987-9.989 0-2.668-1.032-5.18-2.906-7.054-1.873-1.874-4.366-2.906-7.007-2.906 0 0 0 0 0 0zm5.783 14.385c-.4 1.125-2.346 2.112-3.577 2.25-.933.1-1.9.048-3.154-.48-.652-.283-1.434-.69-2.207-1.212-3.314-2.18-5.475-5.529-5.475-9.202 0-6.009 4.882-10.891 10.891-10.891 2.896 0 5.612 1.127 7.656 3.171 2.043 2.044 3.17 4.76 3.17 7.656 0 6.009-4.882 10.892-10.891 10.892"/>
                     </svg>
                     <span>Confirm Booking</span>
                  </button>
              </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default BookingForm;