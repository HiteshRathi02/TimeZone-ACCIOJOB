const apiKey = "d2cc8e5640b1471081add28bab945b60";

function fillTimezoneData(prefix, timezone, location, lat, lon) {
  document.getElementById(`${prefix}-name`).textContent = timezone.name || '';
  document.getElementById(`${prefix}-lat`).textContent = lat.toFixed(4);
  document.getElementById(`${prefix}-lon`).textContent = lon.toFixed(4);
  document.getElementById(`${prefix}-offset-std`).textContent = timezone.offset_STD || '';
  document.getElementById(`${prefix}-offset-std-sec`).textContent = timezone.offset_STD_seconds || '';
  document.getElementById(`${prefix}-offset-dst`).textContent = timezone.offset_DST || '';
  document.getElementById(`${prefix}-offset-dst-sec`).textContent = timezone.offset_DST_seconds || '';
  document.getElementById(`${prefix}-country`).textContent = location.country || '';
  document.getElementById(`${prefix}-postcode`).textContent = location.postcode || '';
  document.getElementById(`${prefix}-city`).textContent = location.city || '';
}

async function getCurrentLocationTimezone() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const timezone = await fetchTimezone(lat, lon);
      const location = await fetchLocationDetails(lat, lon);
      fillTimezoneData("current", timezone, location?.properties || {}, lat, lon);
    }, () => {
      document.getElementById("current-timezone").textContent = "Failed to retrieve location.";
    });
  } else {
    document.getElementById("current-timezone").textContent = "Geolocation is not supported.";
  }
}

async function getTimezoneFromAddress() {

  const addressContainer = document.getElementById("address-timezone-container");
  const address = document.getElementById("address").value.trim();
  if (!address) {
    addressContainer.innerHTML = `<p style="color: red;">Please enter an address.</p>`;
    alert("Please enter an address.");
    return;
  }
  addressContainer.innerHTML = "Processing..."
  
  try {
    const geoRes = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${apiKey}`);
    const geoData = await geoRes.json();
    if (geoData.features.length === 0) {
      addressContainer.innerHTML = `<p style="color: red;">Address not found.</p>`;
      alert("Address not found.");
      return;
    }

    const { lat, lon } = geoData.features[0].properties;
    const timezone = await fetchTimezone(lat, lon);
    const location = await fetchLocationDetails(lat, lon);
    addressContainer.innerHTML = `
          <h3>Your result</h3>
          <div class="box" id="address-timezone">
          <p>Name Of Time Zone : <span id="addr-name"></span></p>
          <div class="label">
            <div>Lat: <span id="addr-lat"></span></div>
            <div>Long: <span id="addr-lon"></span></div>
          </div>
          <p>Offset STD: <span id="addr-offset-std"></span></p>
          <p>Offset STD Seconds : <span id="addr-offset-std-sec"></span></p>
          <p>Offset DST : <span id="addr-offset-dst"></span></p>
          <p>Offset DST Seconds: <span id="addr-offset-dst-sec"></span></p>
          <p>Country: <span id="addr-country"></span></p>
          <p>Postcode: <span id="addr-postcode"></span></p>
          <p>City: <span id="addr-city"></span></p>
        </div>`;
    fillTimezoneData("addr", timezone, location.properties, lat, lon);
  } catch (err) {
    alert("Error fetching data.");
  }
}

async function fetchTimezone(lat, lon) {
  const res = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${apiKey}`, { method: 'GET' });
  const data = await res.json();
  return data.features[0].properties.timezone || "Timezone not found.";
}

async function fetchLocationDetails(lat, lon) {
  const res = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${apiKey}`,{method: 'GET'});
  const data = await res.json();
  return data.features[0];
}

getCurrentLocationTimezone();
