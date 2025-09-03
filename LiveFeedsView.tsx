import React, { useMemo } from 'react';
import type { LiveStream, User } from '../types';
import { useTranslation } from '../App';
import { CameraIcon, EyeIcon } from './Icons';

interface LiveFeedsViewProps {
  liveStreams: LiveStream[];
  allUsers: User[];
  currentUser: User | null;
  onJoinStream: (stream: LiveStream) => void;
  onGoLive: () => void;
  onStartScheduledStream: (stream: LiveStream) => void;
}

const LiveStreamCard: React.FC<{ stream: LiveStream; host?: User; onJoin: () => void }> = ({ stream, host, onJoin }) => {
    const { t } = useTranslation();
    return (
        <button onClick={onJoin} className="w-full text-left rounded-2xl overflow-hidden shadow-lg transform transition-transform hover:scale-105 group aspect-[3/4]">
            <div className="relative w-full h-full bg-gray-900">
                <img src={stream.thumbnailUrl} alt={stream.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider animate-pulse">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    <span>{t('liveTag')}</span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <p className="text-xs font-semibold flex items-center gap-1.5"><EyeIcon className="w-4 h-4"/> {stream.viewerCount.toLocaleString()} {t('viewers')}</p>
                    <h3 className="font-bold drop-shadow-lg mt-1 truncate">{stream.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                        <img src={host?.avatarUrl} alt={host?.username} className="w-6 h-6 rounded-full"/>
                        <p className="text-xs font-semibold truncate">{host?.username}</p>
                    </div>
                </div>
            </div>
        </button>
    )
}

const UpcomingStreamCard: React.FC<{ stream: LiveStream; host?: User; isHost: boolean; onStartStream: () => void; }> = ({ stream, host, isHost, onStartStream }) => {
    const { t } = useTranslation();
    const formattedDate = useMemo(() => {
        if (!stream.scheduledAt) return '';
        const date = new Date(stream.scheduledAt);
        const now = new Date();
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        
        if (date >= startOfToday && date < startOfTomorrow) {
            return t('todayAt', { time: timeStr });
        }

        const startOfDayAfterTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
        if (date >= startOfTomorrow && date < startOfDayAfterTomorrow) {
            return t('tomorrowAt', { time: timeStr });
        }
        
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + `, ${timeStr}`;
    }, [stream.scheduledAt, t]);


    return (
        <div className="w-full text-left rounded-2xl overflow-hidden shadow-lg group aspect-[3/4] relative">
            <div className="relative w-full h-full bg-gray-900">
                <img src={stream.thumbnailUrl} alt={stream.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                    <span>{t('upcomingTag')}</span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <p className="text-xs font-semibold">{formattedDate}</p>
                    <h3 className="font-bold drop-shadow-lg mt-1 truncate">{stream.title}</h3>
                    {!isHost && host && (
                        <div className="flex items-center gap-2 mt-2">
                            <img src={host.avatarUrl} alt={host.username} className="w-6 h-6 rounded-full"/>
                            <p className="text-xs font-semibold truncate">{host.username}</p>
                        </div>
                    )}
                </div>
                {isHost && (
                     <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4">
                         <button onClick={onStartStream} className="bg-red-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transform transition-transform hover:scale-105">
                            <CameraIcon className="w-5 h-5"/>
                            <span>{t('startStream')}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export const LiveFeedsView: React.FC<LiveFeedsViewProps> = ({ liveStreams, allUsers, currentUser, onJoinStream, onGoLive, onStartScheduledStream }) => {
  const { t } = useTranslation();
  const isSeller = currentUser?.role === 'brand_owner' || currentUser?.role === 'sales_rep';

  const liveNow = liveStreams.filter(s => s.status === 'live');
  const upcoming = liveStreams.filter(s => s.status === 'upcoming');

  const getHost = (hostId: string) => allUsers.find(u => u.id === hostId);

  return (
    <div className="bg-black text-white h-screen overflow-y-auto pb-20">
      <header className="p-4 flex justify-between items-center bg-black border-b border-gray-800 sticky top-0 z-20">
        <h1 className="text-3xl font-bold font-serif">{t('liveShopping')}</h1>
        {isSeller && (
            <button onClick={onGoLive} className="flex items-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-red-700 transition-colors">
                <CameraIcon className="w-5 h-5"/>
                <span>{t('goLive')}</span>
            </button>
        )}
      </header>
      <div className="p-4 space-y-8">
        <div>
            <h2 className="text-2xl font-bold mb-4">{t('liveNow')}</h2>
            {liveNow.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                    {liveNow.map(stream => (
                        <LiveStreamCard key={stream.id} stream={stream} host={getHost(stream.hostId)} onJoin={() => onJoinStream(stream)} />
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">{t('noLiveStreams')}</p>
            )}
        </div>
         <div>
            <h2 className="text-2xl font-bold mb-4">{t('upcomingStreams')}</h2>
            {upcoming.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                    {upcoming.map(stream => (
                        <UpcomingStreamCard
                          key={stream.id}
                          stream={stream}
                          host={getHost(stream.hostId)}
                          isHost={currentUser?.id === stream.hostId}
                          onStartStream={() => onStartScheduledStream(stream)}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">{t('noUpcomingStreams')}</p>
            )}
        </div>
      </div>
    </div>
  );
};