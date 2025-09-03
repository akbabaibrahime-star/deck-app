export interface AudioTrack {
    id: string;
    title: string;
    genre: string;
    url: string;
}
  
export const audioTracks: AudioTrack[] = [
    { id: 'audio1', title: 'Upbeat Funk', genre: 'Energetic and Lively', url: 'https://cdn.pixabay.com/audio/2022/08/03/audio_34b08f519c.mp3' },
    { id: 'audio2', title: 'Cinematic Atmosphere', genre: 'Elegant and Cinematic', url: 'https://cdn.pixabay.com/audio/2024/05/20/audio_27b8783424.mp3' },
    { id: 'audio3', title: 'Lofi Chill', genre: 'Minimalist and Chic', url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_18b7fb4f23.mp3' },
    { id: 'audio4', title: 'Powerful Rock', genre: 'Energetic and Lively', url: 'https://cdn.pixabay.com/audio/2023/04/05/audio_29e52a9010.mp3'},
    { id: 'audio5', title: 'Inspiring Piano', genre: 'Elegant and Cinematic', url: 'https://cdn.pixabay.com/audio/2022/11/17/audio_8e29a59483.mp3'},
    { id: 'audio6', title: 'Ambient Abstract', genre: 'Minimalist and Chic', url: 'https://cdn.pixabay.com/audio/2024/02/10/audio_51c613583a.mp3'},
];
