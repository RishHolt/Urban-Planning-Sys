import { useEffect, useState } from 'react';

export default function Time() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <div className="flex flex-col items-end text-sm">
            <div className="font-semibold text-primary text-xl">{formatTime(currentTime)}</div>
            <div className="text-secondary dark:text-gray-400 text-xs">{formatDate(currentTime)}</div>
        </div>
    );
}
