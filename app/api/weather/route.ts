import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { todayInParis } from "@/lib/date";
import {
  CRECHE_LOCATION,
  clothingAdvice,
  describeWeather,
  type WeatherPayload,
} from "@/lib/weather";

/**
 * Météo du jour + conseil d'habillement (US-28 / US-29).
 * Cache journalier en base (`weather_cache`) pour ne pas rappeler l'API externe
 * à chaque visite. En cas d'API indisponible → 503, l'interface affiche
 * « Météo indisponible pour le moment ».
 */
export async function GET() {
  const profile = await getProfile();
  if (!profile) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const day = todayInParis();

  let admin: ReturnType<typeof createAdminClient> | null = null;
  try {
    admin = createAdminClient();
  } catch {
    admin = null; // pas de cache possible, on tentera un appel direct
  }

  if (admin) {
    const { data: cached } = await admin
      .from("weather_cache")
      .select("temperature, weather_code, summary, advice")
      .eq("day", day)
      .maybeSingle();

    if (cached) {
      return Response.json({
        day,
        temperature: cached.temperature,
        weather_code: cached.weather_code,
        summary: cached.summary,
        advice: cached.advice,
      } satisfies WeatherPayload);
    }
  }

  try {
    // Interrupteur de test (recette SC26) : simule une API météo indisponible.
    if (process.env.WEATHER_FORCE_ERROR === "1") {
      throw new Error("WEATHER_FORCE_ERROR (simulation panne API)");
    }

    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${CRECHE_LOCATION.latitude}&longitude=${CRECHE_LOCATION.longitude}` +
      `&current=temperature_2m,weather_code&timezone=Europe%2FParis`;

    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`open-meteo ${res.status}`);

    const json = (await res.json()) as {
      current?: { temperature_2m?: number; weather_code?: number };
    };
    const temperature = Math.round(json.current?.temperature_2m ?? NaN);
    const weather_code = json.current?.weather_code ?? NaN;
    if (Number.isNaN(temperature) || Number.isNaN(weather_code)) {
      throw new Error("open-meteo payload invalide");
    }

    const payload: WeatherPayload = {
      day,
      temperature,
      weather_code,
      summary: describeWeather(weather_code),
      advice: clothingAdvice(temperature, weather_code),
    };

    if (admin) {
      await admin.from("weather_cache").upsert({
        day,
        temperature: payload.temperature,
        weather_code: payload.weather_code,
        summary: payload.summary,
        advice: payload.advice,
      });
    }

    return Response.json(payload);
  } catch (err) {
    console.error("weather unavailable", err);
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
