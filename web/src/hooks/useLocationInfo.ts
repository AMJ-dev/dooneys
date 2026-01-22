import { useState, useEffect } from 'react';

export interface LocationInfo {
    ip: string;
    country: string;
    region: string;
    city: string;
    timezone: string;
    isp: string;
}

export const useLocationInfo = () => {
    const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLocationInfo = async () => {
            try {
                const ipResponse = await fetch('https://ipapi.co/json/');
                const ipData = await ipResponse.json();
                
                setLocationInfo({
                    ip: ipData.ip,
                    country: ipData.country_name,
                    region: ipData.region,
                    city: ipData.city,
                    timezone: ipData.timezone,
                    isp: ipData.org
                });
            } catch (err) {
                console.error('Failed to fetch location info:', err);
                setError('Unable to retrieve location information');
                
                try {
                    const fallbackResponse = await fetch('https://api.ipify.org?format=json');
                    const fallbackData = await fallbackResponse.json();
                    
                    setLocationInfo({
                        ip: fallbackData.ip,
                        country: 'Unknown',
                        region: 'Unknown',
                        city: 'Unknown',
                        timezone: 'Unknown',
                        isp: 'Unknown'
                    });
                } catch (fallbackErr) {
                    setLocationInfo({
                        ip: 'Unknown',
                        country: 'Unknown',
                        region: 'Unknown',
                        city: 'Unknown',
                        timezone: 'Unknown',
                        isp: 'Unknown'
                    });
                }
            } finally {
                setLoading(false);
            }
        };
        fetchLocationInfo();
    }, []);

    return { locationInfo, loading, error };
};