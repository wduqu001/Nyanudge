# NyaNudge animations

`src/shared/animations/LottiePlayer.tsx` decides how each animation key is drawn:

| Key | Rendered by |
|---|---|
| `cat_idle` | Lottie: `cat_idle.json` |
| `cat_celebrate` | Lottie: `cat_celebrate.json` |
| `cat_water` | SVG component `AnimatedWater.tsx` |
| `cat_meal` | SVG component `AnimatedMeal.tsx` |
| `cat_exercise` | SVG component `AnimatedExercise.tsx` |
| `cat_bathroom` | SVG component `AnimatedBathroom.tsx` |
| `cat_medicine` | SVG component `AnimatedMedicine.tsx` |
| `cat_sleep` | SVG component `AnimatedSleep.tsx` |

No app screen renders LottiePlayer yet; it appears only in Storybook. The other JSON files in this folder are still imported by `registry.ts`, but LottiePlayer never plays them. The home-screen cats (Mochi, Kuro, Sora) are separate SVG components in `src/shared/components/`.
