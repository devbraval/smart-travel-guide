// async function wikipediaService(place) {
//     if(!place || typeof place!== "string"){
//         return null;
//     }   
//     const formetedplace = place.trim().replace("/\s+/g","_");
//     const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${formetedplace}`;

//     const response = await fetch(url,{
//         "User-Agent": "SmartTravelGuide/1.0";
//     });
//     if(!response.ok){
//         return null;
//     }
//     const data = await response.json();
    
// }