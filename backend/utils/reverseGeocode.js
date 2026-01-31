
async function reverseGeocode(lat,lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
    const response = await fetch(url,{
        headers:{
            "User-Agent": "smart-ai-travel-guide/1.0",
        },
    });
    if(!response.ok){
        return new Error("Reverse geocoding failed");
    }
    const data = await response.json();
    const address = data.address||{};

    const city = address.city || address.town|| address.municipality || address.country || address.state_district ;

    return{
        city:city || "Nearby City",
        lat:parseFloat(data.lat),
        lng:parseFloat(data.lon),
    };
}
module.exports = {reverseGeocode};