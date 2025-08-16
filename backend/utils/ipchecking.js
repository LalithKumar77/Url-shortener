import maxmind from "maxmind";

async function testGeoLite2() {
  try {
    // Load the GeoLite2 City database (make sure path is correct)
    const lookup = await maxmind.open("../db/GeoLite2-City.mmdb");

    // Some example IPs (India)
    const testIPs = [
      "49.205.64.0",    // Hyderabad (Jio)
      "49.206.0.1",     // Bengaluru (Airtel)
      "106.51.0.1",     // Chennai (Airtel)
      "49.248.0.1",     // Mumbai (Tata)
      "103.224.182.241" // Delhi
    ];

    for (const ip of testIPs) {
      const geo = lookup.get(ip);
      console.log(geo);
    //   console.log(`\n====================`);
    //   console.log(`📌 IP: ${ip}`);
    //   console.log(`🌍 Country: ${geo?.country?.names?.en || "Unknown"}`);
    //   console.log(`🏙️ City: ${geo?.city?.names?.en || "Unknown"}`);
    //   console.log(`📍 Region: ${geo?.subdivisions?.[0]?.names?.en || "Unknown"}`);
    //   console.log(`📐 Latitude: ${geo?.location?.latitude || "Unknown"}`);
    //   console.log(`📐 Longitude: ${geo?.location?.longitude || "Unknown"}`);
    }

    console.log("\n✅ GeoLite2 lookup test finished.");
  } catch (err) {
    console.error("❌ Error loading GeoLite2:", err);
  }
}

testGeoLite2();
