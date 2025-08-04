import React, { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, Signal, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';

const testEndpoints = [
  '/api/ping',
  'https://www.google.com/favicon.ico',
  'https://jsonplaceholder.typicode.com/posts/1'
];

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionSpeed, setConnectionSpeed] = useState('checking');
  const [pingTime, setPingTime] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastStatus, setLastStatus] = useState('');

  const verifyActualConnectivity = useCallback(async () => {
    for (const url of testEndpoints) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        await fetch(url, { method: 'HEAD', cache: 'no-store', mode: 'no-cors', signal: controller.signal });
        clearTimeout(timeout);
        return true;
      } catch {
        continue;
      }
    }
    return false;
  }, []);

  const checkConnectionSpeed = useCallback(async () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      setConnectionSpeed('offline');
      setPingTime(null);
      return;
    }

    setIsChecking(true);
    let pingDurations = [];

    for (const endpoint of testEndpoints) {
      try {
        const start = performance.now();
        await fetch(endpoint, {
          method: 'HEAD',
          cache: 'no-cache',
          mode: 'no-cors',
          signal: AbortSignal.timeout(10000)
        });
        const end = performance.now();
        const duration = end - start;
        pingDurations.push(duration);
        break;
      } catch (e) {
        continue;
      }
    }

    if (pingDurations.length === 0) {
      // fallback test using image
      const imageDuration = await checkViaImage();
      if (imageDuration) pingDurations.push(imageDuration);
    }

    if (pingDurations.length === 0) {
      setConnectionSpeed('poor');
      setIsChecking(false);
      return;
    }

    const avgPing = pingDurations.reduce((a, b) => a + b, 0) / pingDurations.length;
    setPingTime(Math.round(avgPing));

    if (avgPing < 100) {
      setConnectionSpeed('excellent');
    } else if (avgPing < 300) {
      setConnectionSpeed('good');
    } else if (avgPing < 800) {
      setConnectionSpeed('fair');
    } else if (avgPing < 1500) {
      setConnectionSpeed('slow');
    } else {
      setConnectionSpeed('very-slow');
    }

    setIsOnline(true);
    setIsChecking(false);
  }, []);

  const checkViaImage = () => {
    return new Promise<number | null>((resolve) => {
      const img = new Image();
      const start = performance.now();
      img.onload = () => resolve(performance.now() - start);
      img.onerror = () => resolve(null);
      img.src = `https://via.placeholder.com/50?cacheBust=${Date.now()}`;
    });
  };

  // Toast alerts
  useEffect(() => {
    if (lastStatus !== '') {
      if (!isOnline && lastStatus !== 'offline') {
        toast.error("⚠️ You're offline!");
      } else if (connectionSpeed === 'very-slow' && lastStatus !== 'very-slow') {
        toast("🐌 Your internet is very slow");
      } else if (connectionSpeed === 'excellent' && lastStatus !== 'excellent') {
        toast.success("✅ Excellent connection");
      }
    }

    if (isOnline) {
      setLastStatus(connectionSpeed);
    } else {
      setLastStatus('offline');
    }
  }, [isOnline, connectionSpeed]);

  // Event setup
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkConnectionSpeed();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionSpeed('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    let timeoutId

    const loop = async () => {
      const result = await verifyActualConnectivity();
      setIsOnline(result);
      await checkConnectionSpeed();
      timeoutId = setTimeout(loop, 4000); // every 15s
    };

    loop();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnectionSpeed, verifyActualConnectivity]);

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        text: 'Offline',
        pulse: false,
        showPing: false
      };
    }

    if (isChecking) {
      return {
        icon: Activity,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        text: 'Checking...',
        pulse: true,
        showPing: false
      };
    }

    switch (connectionSpeed) {
      case 'excellent':
        return {
          icon: Wifi,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          text: 'Excellent',
          pulse: true,
          showPing: true
        };
      case 'good':
        return {
          icon: Wifi,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          text: 'Good',
          pulse: true,
          showPing: true
        };
      case 'fair':
        return {
          icon: Signal,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          text: 'Fair',
          pulse: false,
          showPing: true
        };
      case 'slow':
        return {
          icon: Signal,
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/20',
          text: 'Slow',
          pulse: false,
          showPing: true
        };
      case 'very-slow':
        return {
          icon: Signal,
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          text: 'Very Slow',
          pulse: false,
          showPing: true
        };
      case 'poor':
        return {
          icon: WifiOff,
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          text: 'Poor',
          pulse: false,
          showPing: false
        };
      default:
        return {
          icon: Wifi,
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          text: 'Unknown',
          pulse: false,
          showPing: false
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="flex items-center space-x-2">
      <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-md ${config.bgColor}`}>
        <div className="relative">
          <Icon size={12} className={`${config.color} ${config.pulse ? 'animate-pulse' : ''}`} />
          {config.pulse && (
            <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 ${config.color.replace('text-', 'bg-')} rounded-full animate-ping opacity-75`} />
          )}
        </div>
        <span className={`text-xs font-medium ${config.color} hidden sm:inline-block`}>
          {config.text}
          {config.showPing && pingTime && (
            <span className="ml-1 opacity-75">
              ({pingTime}ms)
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

export default NetworkStatus;
