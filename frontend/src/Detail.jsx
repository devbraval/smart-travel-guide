import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Comments from "./Comments";
import NavBar from "./NavBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faStar, faHeart } from "@fortawesome/free-solid-svg-icons";

export default function Detail() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingData, setBookingData] = useState({ from: "", to: "", days: 1, people: 1 });

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
  };

  const submitBooking = () => {
    setShowBookingModal(false);
    setShowPaymentModal(true);
  };

  const handlePayment = async (e) => {
    e?.preventDefault();
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          providerId: place.provider || place.owner, 
          listingId: place._id,
          from: bookingData.from,
          to: bookingData.to,
          guests: bookingData.people,
          amount: (place.pricing?.price * bookingData.days) || 0
        })
      });
      const data = await res.json();
      if(data.success) {
        alert("Payment Successful! Booking Confirmed.");
        setShowPaymentModal(false);
      } else {
        alert("Booking failed: " + data.message);
      }
    } catch(err) {
      alert("Error processing payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (bookingData.from && bookingData.to) {
      const fromDate = new Date(bookingData.from);
      const toDate = new Date(bookingData.to);
      const diffTime = toDate - fromDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0) {
        const days = diffDays > 0 ? diffDays : 1;
        setBookingData(prev => ({ ...prev, days }));
      }
    }
  }, [bookingData.from, bookingData.to]);

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8080/place/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (!data.success) {
          setMessage(data.message || "Something went wrong");
        } else {
          setPlace(data.result);
        }
      } catch (err) {
        setMessage("Server Error");
      } finally {
        setLoading(false);
      }
    };
    fetchPlace();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-20 items-center animate-fade-in">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (message) return <div className="min-h-screen bg-gray-50 pt-20 text-center"><h2 className="text-xl text-red-500 font-semibold">{message}</h2></div>;
  if (!place) return <div className="min-h-screen bg-gray-50 pt-20 text-center"><h2 className="text-xl text-gray-500 font-semibold">No data found</h2></div>;

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-16 animate-fade-in flex flex-col">
      <NavBar />
      
      {/* HERO IMAGE */}
      <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden group">
        {(() => {
          const galleryImgs = place.images?.gallery || [];
          const coverImg = place.images?.cover || place.img;
          const displayImages = [coverImg, ...galleryImgs].filter(Boolean);

          return displayImages.length > 1 ? (
            <div className="w-full h-full max-w-[1200px] mx-auto mt-4 px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[80%] rounded-2xl overflow-hidden shadow-md relative group z-0">
                <div className="col-span-2 row-span-2">
                  <img src={displayImages[0]} alt={place.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                </div>
                <div className="col-span-1 row-span-1">
                  <img src={displayImages[1] || displayImages[0]} alt={place.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                </div>
                <div className="col-span-1 row-span-1">
                  <img src={displayImages[2] || displayImages[0]} alt={place.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                </div>
                <div className="col-span-1 row-span-1">
                  <img src={displayImages[3] || displayImages[0]} alt={place.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                </div>
                <div className="col-span-1 row-span-1 relative">
                  <img src={displayImages[4] || displayImages[0]} alt={place.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                  {displayImages.length > 5 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl cursor-pointer hover:bg-black/40 transition-colors">
                      +{displayImages.length - 5}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <img 
              src={coverImg} 
              alt={place.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
          );
        })()}
        
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-80 z-10 pointer-events-none"></div>
        
        {/* Floating Favorite Button */}
        <button className="absolute top-6 right-6 md:top-8 md:right-10 z-20 p-3 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-red-500 hover:scale-110 transition-all duration-300 shadow-lg">
          <FontAwesomeIcon icon={faHeart} className="text-lg" />
        </button>

        {/* Content on Image */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-20 flex flex-col text-white max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight drop-shadow-lg mb-3">
                {place.name}
              </h1>
              <div className="flex items-center gap-2 text-gray-200 text-sm md:text-base font-medium">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-300" />
                <span>{place.district}, {place.state}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
              <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-lg" />
              <span className="text-base font-bold text-white">{place.rating || "4.5"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT CARDS */}
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-30 space-y-8 flex-1 flex flex-col lg:flex-row gap-8">
        
        <div className="flex-1 space-y-8">
          {/* ABOUT SECTION */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10 transition-shadow hover:shadow-md duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              About this place
              <span className="ml-4 h-px flex-1 bg-gray-100"></span>
            </h2>
            <p className="text-gray-600 leading-relaxed max-w-4xl text-base md:text-lg whitespace-pre-wrap">
              {place.description}
            </p>
          </div>

          {/* MAP SECTION */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10 transition-shadow hover:shadow-md duration-300">
             <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              Location
              <span className="ml-4 h-px flex-1 bg-gray-100"></span>
            </h2>
            <div className="rounded-2xl overflow-hidden shadow-inner border border-gray-100">
              <iframe
                width="100%"
                height="400"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps?q=${place.lat},${place.lng}&z=14&output=embed`}
              ></iframe>
            </div>
          </div>

          {/* COMMENTS SECTION */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              Reviews
              <span className="ml-4 h-px flex-1 bg-gray-100"></span>
            </h2>
            <Comments />
          </div>
        </div>

        {/* PRICING BOOKING CARD */}
        {place.pricing && place.pricing.price && (
          <div className="w-full lg:w-[350px] lg:mt-0 relative">
            <div className="sticky top-24 bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-end gap-1 mb-4">
                <span className="text-3xl font-extrabold text-gray-900">₹{place.pricing.price}</span>
                <span className="text-gray-500 font-medium mb-1">
                  / {place.category === 'Hotel' || place.category === 'PG' || place.category === 'Resort' ? 'night' : place.category === 'Cab Service' ? 'km' : 'package'}
                </span>
              </div>
              {place.pricing.discountPrice > 0 && place.pricing.discountPrice < place.pricing.price && (
                <div className="text-sm text-gray-500 line-through mb-4">₹{place.pricing.discountPrice}</div>
              )}
              {place.isBooked ? (
                <div className="w-full mt-2 py-3.5 px-4 bg-orange-100 border border-orange-200 text-orange-800 font-bold text-center rounded-2xl shadow-sm">
                  Currently Booked
                </div>
              ) : (
                <button 
                  onClick={() => setShowBookingModal(true)} 
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-2xl shadow-md transition-all active:scale-95"
                >
                  Book Now
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* BOOKING MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">Book <span className="text-blue-600">{place.name}</span></h3>
              <button onClick={() => setShowBookingModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">From Date</label>
                  <input type="date" name="from" value={bookingData.from} onChange={handleBookingChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">To Date</label>
                  <input type="date" name="to" value={bookingData.to} onChange={handleBookingChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Days / Duration</label>
                  <input type="number" min="1" name="days" value={bookingData.days} onChange={handleBookingChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Number of People</label>
                  <input type="number" min="1" name="people" value={bookingData.people} onChange={handleBookingChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                </div>
              </div>
              
              <div className="pt-4 space-y-3">
                <div className="flex justify-between items-center px-2 pb-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Total Price <span className="text-xs font-normal text-gray-400">({bookingData.days} days)</span>:</span>
                  <span className="text-2xl font-bold text-gray-900">₹{(place.pricing?.price * bookingData.days) || 0}</span>
                </div>
                <button 
                  onClick={submitBooking}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
                >
                  Confirm Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">Secure Payment</h3>
              <button disabled={isProcessing} onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handlePayment} className="p-6 space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl mb-4 text-center border border-blue-100">
                <p className="text-sm text-blue-600 font-medium">Total Amount Payable</p>
                <p className="text-3xl font-extrabold text-blue-900">₹{(place.pricing?.price * bookingData.days) || 0}</p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Cardholder Name</label>
                <input required type="text" placeholder="John Doe" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Card Number</label>
                <input required type="text" placeholder="4111 2222 3333 4444" maxLength="19" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all tracking-widest font-mono" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Expiry Date</label>
                  <input required type="text" placeholder="MM/YY" maxLength="5" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">CVV</label>
                  <input required type="password" placeholder="•••" maxLength="3" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-center tracking-widest" />
                </div>
              </div>
              
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-3.5 px-4 font-bold rounded-xl shadow-md transition-all ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white active:scale-95'}`}
                >
                  {isProcessing ? "Processing..." : `Pay ₹${(place.pricing?.price * bookingData.days) || 0}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}