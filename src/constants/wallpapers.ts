export interface Wallpaper {
  filename: string; // must match the file in public/wallpapers/
  label: string;
}

export const WALLPAPERS: Wallpaper[] = [
  { filename: "wallpaper-1.jpg", label: "Default" },
  { filename: "wallpaper-2.jpg", label: "Grand Theft Auto VI" },
  { filename: "wallpaper-3.jpg", label: "Black Myth: Wukong" },
  { filename: "wallpaper-4.jpg", label: "Cyberpunk 2077" },
];
