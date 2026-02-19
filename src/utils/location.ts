import {
  checkPermissions,
  getCurrentPosition,
  requestPermissions,
  watchPosition,
  clearWatch,
} from '@tauri-apps/plugin-geolocation';
import { Coords } from '@/screens/Outpost/types.ts';

export default async function getCurrentLocation(): Promise<Coords> {
  let permissions = await checkPermissions();

  if (permissions.location === 'prompt' || permissions.location === 'prompt-with-rationale') {
    permissions = await requestPermissions(['location']);
  }

  if (permissions.location !== 'granted') {
    throw new Error('Location permission denied');
  }

  const isValid = (pos: any) =>
    pos && pos.coords && (pos.coords.latitude !== 0 || pos.coords.longitude !== 0);

  try {
    const position = await getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
    if (isValid(position)) {
      return { lat: position.coords.latitude, lng: position.coords.longitude };
    }
  } catch (e) {
    console.warn('High accuracy failed', e);
  }

  try {
    const position = await new Promise<any>(async (resolve, reject) => {
      let watchId: number | null = null;

      const timer = setTimeout(() => {
        if (watchId !== null) clearWatch(watchId);
        reject(new Error('WatchPosition timed out'));
      }, 10000);

      try {
        watchId = await watchPosition(
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 0,
          },
          (pos, err) => {
            if (err) return;
            if (isValid(pos)) {
              clearTimeout(timer);
              if (watchId !== null) clearWatch(watchId);
              resolve(pos);
            }
          }
        );
      } catch (e) {
        reject(e);
      }
    });

    return { lat: position.coords.latitude, lng: position.coords.longitude };
  } catch (e: any) {
    const msg = e?.message || e?.toString() || '';
    if (msg.includes('Location services are disabled')) {
      throw new Error('Location services are disabled');
    }
    throw new Error('Precise location failed');
  }
}

export async function getIpLocation(): Promise<Coords> {
  const response = await fetch('https://ipapi.co/json/');
  const data = await response.json();
  if (data.latitude && data.longitude) {
    return { lat: data.latitude, lng: data.longitude };
  }
  throw new Error('IP Location failed');
}
