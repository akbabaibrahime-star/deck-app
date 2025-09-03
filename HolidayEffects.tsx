import React from 'react';

const Snowflakes = () => {
  const snowflakeCount = 100;
  return (
    <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
      {Array.from({ length: snowflakeCount }).map((_, i) => {
        const style = {
          left: `${Math.random() * 100}%`,
          width: `${Math.random() * 3 + 1}px`,
          height: `${Math.random() * 3 + 1}px`,
          opacity: Math.random() * 0.5 + 0.3,
          animationDuration: `${Math.random() * 10 + 5}s`,
          animationDelay: `${Math.random() * 5}s`,
        };
        return <div key={i} className="snowflake" style={style}></div>;
      })}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) translateX(0); }
          100% { transform: translateY(110vh) translateX(20px); }
        }
        .snowflake {
          position: absolute;
          top: -10vh;
          background-color: white;
          border-radius: 50%;
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
};

const Confetti = () => {
    const confettiCount = 150;
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    return (
        <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
            {Array.from({ length: confettiCount }).map((_, i) => {
                const style = {
                    left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 8 + 5}px`,
                    height: `${Math.random() * 5 + 5}px`,
                    backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                    opacity: 1,
                    transform: `rotate(${Math.random() * 360}deg)`,
                    animation: `fall-confetti ${Math.random() * 4 + 3}s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                };
                return <div key={i} className="confetti" style={style}></div>
            })}
             <style>{`
                @keyframes fall-confetti {
                    0% { transform: translateY(-10vh) rotate(0deg); }
                    100% { transform: translateY(110vh) rotate(720deg); }
                }
             `}</style>
        </div>
    )
}

const Hearts = () => {
    const heartCount = 30;
    return (
        <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
            {Array.from({ length: heartCount }).map((_, i) => {
                const size = Math.random() * 20 + 10;
                // FIX: Use a type assertion for the style object to allow for custom CSS properties.
                const style = {
                    left: `${Math.random() * 100}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    animation: `float-heart ${Math.random() * 8 + 6}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 10}s`,
                    '--mid-rotation': `${Math.random() * 90 - 45}deg`,
                    '--end-rotation': `${Math.random() * 180 - 90}deg`,
                } as React.CSSProperties;
                return (
                    <div key={i} className="heart-container" style={style}>
                        <div className="heart"></div>
                    </div>
                )
            })}
             <style>{`
                @keyframes float-heart {
                    0% { transform: translateY(110vh) rotate(0deg) scale(1); opacity: 1; }
                    50% { transform: translateY(50vh) rotate(var(--mid-rotation)) scale(1.2); opacity: 0.8; }
                    100% { transform: translateY(-10vh) rotate(var(--end-rotation)) scale(0.8); opacity: 0; }
                }
                .heart-container { 
                    position: absolute; 
                    top: -10vh; /* Changed from 'bottom' to 'top' to fix visibility */
                }
                .heart {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    transform: rotate(-45deg);
                    background-color: rgba(255, 20, 20, 0.6);
                }
                .heart::before,
                .heart::after {
                    content: "";
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background-color: rgba(255, 20, 20, 0.6);
                }
                .heart::before { top: -50%; left: 0; }
                .heart::after { top: 0; left: 50%; }
             `}</style>
        </div>
    )
}

export const HolidayEffects = ({ effect }: { effect?: 'none' | 'snow' | 'confetti' | 'hearts' }) => {
    switch (effect) {
        case 'snow':
            return <Snowflakes />;
        case 'confetti':
            return <Confetti />;
        case 'hearts':
            return <Hearts />;
        default:
            return null;
    }
};
