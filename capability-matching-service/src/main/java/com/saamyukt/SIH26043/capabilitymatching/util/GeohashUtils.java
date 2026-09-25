package com.saamyukt.SIH26043.capabilitymatching.util;

public class GeohashUtils {
    private static final char[] BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz".toCharArray();
    
    // A very simple Geohash implementation for anonymizing exact coordinates
    public static String encode(double lat, double lon, int precision) {
        boolean isEven = true;
        double minLat = -90.0, maxLat = 90.0;
        double minLon = -180.0, maxLon = 180.0;
        int bit = 0;
        int ch = 0;
        StringBuilder geohash = new StringBuilder();

        while (geohash.length() < precision) {
            if (isEven) {
                double mid = (minLon + maxLon) / 2;
                if (lon >= mid) {
                    ch |= (1 << (4 - bit));
                    minLon = mid;
                } else {
                    maxLon = mid;
                }
            } else {
                double mid = (minLat + maxLat) / 2;
                if (lat >= mid) {
                    ch |= (1 << (4 - bit));
                    minLat = mid;
                } else {
                    maxLat = mid;
                }
            }

            isEven = !isEven;
            if (bit < 4) {
                bit++;
            } else {
                geohash.append(BASE32[ch]);
                bit = 0;
                ch = 0;
            }
        }
        return geohash.toString();
    }
}
