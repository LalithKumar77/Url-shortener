import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import https from "https";
import { pipeline } from "stream/promises";
import maxmind from "maxmind";

let readerPromise = null;

async function downloadFile(url, destPath, timeout = 20000, redirectCount = 5) {
  return new Promise((resolve, reject) => {
    if (redirectCount <= 0) {
      return reject(new Error("Too many redirects"));
    }

    const req = https.get(url, (res) => {
      // Handle redirect (301, 302, 303, 307, 308)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const newUrl = res.headers.location;
        res.resume(); // discard data
        return resolve(downloadFile(newUrl, destPath, timeout, redirectCount - 1));
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`Download failed with status ${res.statusCode}`));
      }

      const fileStream = fs.createWriteStream(destPath);
      pipeline(res, fileStream)
        .then(() => resolve(destPath))
        .catch(reject);
    });

    req.setTimeout(timeout, () => {
      req.destroy(new Error("Download timed out"));
    });

    req.on("error", reject);
  });
}

async function ensureReader() {
  if (readerPromise) return readerPromise;

  const envPath = process.env.GEOLITE_DB_PATH && path.resolve(process.env.GEOLITE_DB_PATH);
  // Use /tmp for Vercel, local temp for dev
  const isVercel = !!process.env.VERCEL || process.env.NOW_REGION;
  const localDir = isVercel ? "/tmp" : path.join(process.cwd(), "temp");
  const localPath = path.join(localDir, "GeoLite2-City.mmdb");

  await fsPromises.mkdir(localDir, { recursive: true });

  // Case 1: Explicit GEOLITE_DB_PATH
  if (envPath) {
    try {
      await fsPromises.access(envPath, fs.constants.R_OK);
      readerPromise = maxmind.open(envPath);
      return readerPromise;
    } catch (e) {
      console.warn("GEOLITE_DB_PATH set but file not readable:", envPath, e.message);
    }
  }

  // Case 2: Local cached copy
  try {
    await fsPromises.access(localPath, fs.constants.R_OK);
    readerPromise = maxmind.open(localPath);
    return readerPromise;
  } catch (e) {
    // ignore
  }

  // Case 3: Download fresh copy
  const downloadUrl = process.env.GEOLITE_DOWNLOAD_URL;
  if (downloadUrl) {
    try {
      await downloadFile(downloadUrl, localPath);
      readerPromise = maxmind.open(localPath);
      return readerPromise;
    } catch (err) {
      console.warn("Failed to download GeoLite DB from GEOLITE_DOWNLOAD_URL:", err.message);
    }
  }

  return null;
}
async function getCityFromLatLng(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'YourAppName' } });
  const data = await res.json();
  return data.address?.city || data.address?.town || data.address?.village || null;
}

async function getGeoInfo(req) {
  try {
    let ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || req.ip;
    if (Array.isArray(ip)) ip = ip[0];
    if (typeof ip === "string" && ip.includes(",")) ip = ip.split(",")[0].trim();

    const localIps = new Set(["::1", "127.0.0.1"]);
    const isLocal = !ip || localIps.has(ip) || ip.startsWith("::ffff:127.0.0.1");

    const reader = await ensureReader();
    if (!reader) {
      return { error: "GeoLite2-City.mmdb not available" };
    }

    const queryIp = isLocal ? "8.8.8.8" : ip.replace(/^::ffff:/, "");
    let geo;
    try {
      geo = await reader.get(queryIp);
    } catch (e) {
      console.warn("maxmind lookup failed:", e.message);
      return { error: "Geo lookup failed" };
    }

    if (!geo) {
      return { error: "Geo lookup failed" };
    }
    console.log("User geo details:", geo);
    const details = {
      ip,
      country: geo?.country?.names?.en || null,
      countryCode: geo?.country?.iso_code || null,
      region: geo?.subdivisions?.[0]?.names?.en || null,
      city: geo?.city?.names?.en || null,
      latitude: geo?.location?.latitude || null,
      longitude: geo?.location?.longitude || null,
      timezone: geo?.location?.time_zone || null,
      postal: geo?.postal?.code || null,
      continent: geo?.continent?.names?.en || null,
    };
    if(!details.city){
      details.city = await getCityFromLatLng(details.latitude, details.longitude);
    }
    return details;
  } catch (err) {
    console.error("Error during geo lookup:", err);
    return { error: "Internal Server Error" };
  }
}

export default getGeoInfo;
