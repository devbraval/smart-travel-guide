import { useState } from "react";

// Input
function Input({ label, type = "text", value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

// Textarea
function Textarea({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        rows={4}
        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

// Select
function Select({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

const steps = [
  "Basic",
  "Location",
  "Pricing",
  "Details",
  "Images",
  "Facilities",
  "Policies",
  "Contact",
  "Review",
];

export default function MultiStepForm({ onCancel, initialData }) {
  const [step, setStep] = useState(0);

  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        name: initialData.name || "",
        category: initialData.category || "",
        desc: initialData.description || "",
        state: initialData.location?.state || "",
        city: initialData.location?.city || "",
        address: initialData.location?.address || "",
        lat: initialData.location?.lat || "",
        lng: initialData.location?.lng || "",
        price: initialData.pricing?.price || "",
        discountPrice: initialData.pricing?.discountPrice || "",
        taxesIncluded: initialData.pricing?.taxesIncluded ? "Yes" : "No",
        rooms: initialData.details?.rooms || "",
        roomTypes: initialData.details?.roomTypes?.join(",") || "",
        maxGuests: initialData.details?.maxGuests || "",
        vehicle: initialData.details?.vehicleType || "",
        priceKm: initialData.details?.pricePerKm || "",
        driver: initialData.details?.driverIncluded ? "Yes" : "No",
        duration: initialData.details?.durationDays || "",
        includes: initialData.details?.includes?.join(",") || "",
        facilities: initialData.facilities || [],
        cancellation: initialData.policies?.cancellation || "",
        rules: initialData.policies?.houseRules || "",
        contact: initialData.contact?.phone || "",
        whatsapp: initialData.contact?.whatsapp || "",
        coverImage: initialData.images?.cover || "",
        gallery1: initialData.images?.gallery?.[0] || "",
        gallery2: initialData.images?.gallery?.[1] || "",
        gallery3: initialData.images?.gallery?.[2] || "",
        gallery4: initialData.images?.gallery?.[3] || "",
      };
    }
    return { facilities: [] };
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleFacility = (f) => {
    const updated = form.facilities.includes(f)
      ? form.facilities.filter((i) => i !== f)
      : [...form.facilities, f];

    handleChange("facilities", updated);
  };

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  // ✅ SUBMIT
  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    console.log(`${token}`); // Debugging line to check token value
    try {
      const formattedData = {
        name: form.name,
        category: form.category,
        description: form.desc,

        location: {
          state: form.state,
          city: form.city,
          address: form.address,
          lat: Number(form.lat),
          lng: Number(form.lng),
        },

        pricing: {
          price: Number(form.price),
          discountPrice: Number(form.discountPrice),
          taxesIncluded: form.taxesIncluded === "Yes",
        },

        details: {
          rooms: Number(form.rooms),
          roomTypes: form.roomTypes?.split(","),
          maxGuests: Number(form.maxGuests),

          vehicleType: form.vehicle,
          pricePerKm: Number(form.priceKm),
          driverIncluded: form.driver === "Yes",

          durationDays: Number(form.duration),
          includes: form.includes?.split(","),
        },

        facilities: form.facilities,

        // availability field removed

        policies: {
          cancellation: form.cancellation,
          houseRules: form.rules,
        },

        contact: {
          phone: form.contact,
          whatsapp: form.whatsapp,
        },

        images: {
          cover: form.coverImage || "",
          gallery: [form.gallery1, form.gallery2, form.gallery3, form.gallery4].filter(Boolean),
        },
      };

      const url = initialData 
        ? `http://localhost:8080/provider/service/${initialData._id}` 
        : "http://localhost:8080/provider/add/place";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedData),
      });

      const data = await res.json();

      if (data.success) {
        alert(`Service ${initialData ? 'updated' : 'added'} successfully 🚀`);
        if (onCancel) onCancel(true); // pass true to indicate success
      } else {
        alert("Failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting form");
    }
  };

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-2xl p-6 md:p-8">

        {/* Stepper */}
        <div className="flex justify-between mb-8 text-xs md:text-sm">
          {steps.map((s, i) => (
            <div key={i} className="flex-1 text-center">
              <div className={`mx-auto w-6 h-6 rounded-full mb-1 ${i <= step ? "bg-blue-600" : "bg-gray-300"}`} />
              <span className={i === step ? "font-semibold" : "text-gray-400"}>{s}</span>
            </div>
          ))}
        </div>

        <div className="space-y-5">

          {/* Step 1 */}
          {step === 0 && (
            <>
              <Input label="Name" value={form.name || ""} onChange={(e) => handleChange("name", e.target.value)} />
              <Select label="Category" value={form.category || ""} onChange={(e) => handleChange("category", e.target.value)} options={["Hotel", "PG", "Resort", "Tour Package", "Cab Service"]} />
              <Textarea label="Description" value={form.desc || ""} onChange={(e) => handleChange("desc", e.target.value)} />
            </>
          )}

          {/* Step 2 */}
          {step === 1 && (
            <>
              <Input label="State" value={form.state || ""} onChange={(e) => handleChange("state", e.target.value)} />
              <Input label="City" value={form.city || ""} onChange={(e) => handleChange("city", e.target.value)} />
              <Textarea label="Address" value={form.address || ""} onChange={(e) => handleChange("address", e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Latitude" value={form.lat || ""} onChange={(e) => handleChange("lat", e.target.value)} />
                <Input label="Longitude" value={form.lng || ""} onChange={(e) => handleChange("lng", e.target.value)} />
              </div>
            </>
          )}

          {/* Step 3 */}
          {step === 2 && (
            <>
              <Input label="Price" type="number" value={form.price || ""} onChange={(e) => handleChange("price", e.target.value)} />
              <Input label="Discount Price" type="number" value={form.discountPrice || ""} onChange={(e) => handleChange("discountPrice", e.target.value)} />
              <Select label="Taxes Included" value={form.taxesIncluded || ""} onChange={(e) => handleChange("taxesIncluded", e.target.value)} options={["Yes", "No"]} />
            </>
          )}

          {/* Step 4 */}
          {step === 3 && (
            <>
              {!form.category && <p className="text-gray-500">Select category first</p>}

              {form.category === "Hotel" && (
                <>
                  <Input label="Rooms" value={form.rooms || ""} onChange={(e) => handleChange("rooms", e.target.value)} />
                  <Input label="Room Types" value={form.roomTypes || ""} onChange={(e) => handleChange("roomTypes", e.target.value)} />
                  <Input label="Max Guests" value={form.maxGuests || ""} onChange={(e) => handleChange("maxGuests", e.target.value)} />
                </>
              )}

              {form.category === "Cab Service" && (
                <>
                  <Input label="Vehicle Type" value={form.vehicle || ""} onChange={(e) => handleChange("vehicle", e.target.value)} />
                  <Input label="Price per KM" value={form.priceKm || ""} onChange={(e) => handleChange("priceKm", e.target.value)} />
                  <Select label="Driver Included" value={form.driver || ""} onChange={(e) => handleChange("driver", e.target.value)} options={["Yes", "No"]} />
                </>
              )}

              {form.category === "Tour Package" && (
                <>
                  <Input label="Duration" value={form.duration || ""} onChange={(e) => handleChange("duration", e.target.value)} />
                  <Input label="Includes" value={form.includes || ""} onChange={(e) => handleChange("includes", e.target.value)} />
                </>
              )}
            </>
          )}

          {/* Step 5 */}
          {step === 4 && (() => {
            const galleryImages = [form.gallery1, form.gallery2, form.gallery3, form.gallery4].filter(Boolean);
            const displayImages = [
              form.coverImage,
              ...galleryImages
            ].filter(Boolean);

            return (
              <>
                <div className="space-y-4 mb-6">
                  <Input label="Cover Image URL (Main Image)" value={form.coverImage || ""} onChange={(e) => handleChange("coverImage", e.target.value)} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Gallery Image 1" value={form.gallery1 || ""} onChange={(e) => handleChange("gallery1", e.target.value)} />
                    <Input label="Gallery Image 2" value={form.gallery2 || ""} onChange={(e) => handleChange("gallery2", e.target.value)} />
                    <Input label="Gallery Image 3" value={form.gallery3 || ""} onChange={(e) => handleChange("gallery3", e.target.value)} />
                    <Input label="Gallery Image 4" value={form.gallery4 || ""} onChange={(e) => handleChange("gallery4", e.target.value)} />
                  </div>
                </div>

                {displayImages.length > 0 && (
                  <div className="mt-8">
                    <p className="text-sm font-medium text-gray-700 mb-3 block">Image Preview (5-Image Grid)</p>
                    <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-sm">
                      {/* Big Cover Image */}
                      <div className="col-span-2 row-span-2 bg-gray-100">
                        {displayImages[0] ? (
                          <img src={displayImages[0]} className="w-full h-full object-cover" alt="Cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">Cover</div>
                        )}
                      </div>

                      {/* Top Right */}
                      <div className="col-span-1 row-span-1 bg-gray-100">
                        {displayImages[1] ? (
                          <img src={displayImages[1]} className="w-full h-full object-cover" alt="Gallery 1" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Img 2</div>
                        )}
                      </div>
                      <div className="col-span-1 row-span-1 bg-gray-100">
                        {displayImages[2] ? (
                          <img src={displayImages[2]} className="w-full h-full object-cover" alt="Gallery 2" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Img 3</div>
                        )}
                      </div>

                      {/* Bottom Right */}
                      <div className="col-span-1 row-span-1 bg-gray-100">
                        {displayImages[3] ? (
                          <img src={displayImages[3]} className="w-full h-full object-cover" alt="Gallery 3" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Img 4</div>
                        )}
                      </div>
                      <div className="col-span-1 row-span-1 bg-gray-100 relative">
                        {displayImages[4] ? (
                          <img src={displayImages[4]} className="w-full h-full object-cover" alt="Gallery 4" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Img 5</div>
                        )}
                        {displayImages.length > 5 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg">
                            +{displayImages.length - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          {/* Step 6 */}
          {step === 5 && (
            <div className="grid grid-cols-2 gap-3">
              {["WiFi", "Parking", "AC", "Food", "Swimming Pool", "TV"].map((f) => (
                <label key={f} className="flex items-center gap-2">
                  <input type="checkbox" checked={form.facilities.includes(f)} onChange={() => toggleFacility(f)} />
                  {f}
                </label>
              ))}
            </div>
          )}

          {/* Step 7 */}
          {step === 6 && (
            <>
              <Textarea label="Cancellation Policy" value={form.cancellation || ""} onChange={(e) => handleChange("cancellation", e.target.value)} />
              <Textarea label="House Rules" value={form.rules || ""} onChange={(e) => handleChange("rules", e.target.value)} />
            </>
          )}

          {/* Step 8 */}
          {step === 7 && (
            <>
              <Input label="Contact" value={form.contact || ""} onChange={(e) => handleChange("contact", e.target.value)} />
              <Input label="WhatsApp" value={form.whatsapp || ""} onChange={(e) => handleChange("whatsapp", e.target.value)} />
            </>
          )}

          {/* Review */}
          {step === 8 && (
            <div className="space-y-2 text-sm">
              {Object.entries(form).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b py-1">
                  <span>{k}</span>
                  <span>{Array.isArray(v) ? v.join(", ") : v}</span>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-8">
          <button onClick={prev} className="px-4 py-2 border rounded-xl">Back</button>

          {step < steps.length - 1 ? (
            <button onClick={next} className="px-6 py-2 bg-blue-600 text-white rounded-xl">Next</button>
          ) : (
            <button onClick={handleSubmit} className="px-6 py-2 bg-green-600 text-white rounded-xl">Submit</button>
          )}
        </div>

      </div>
    </div>
  );
}