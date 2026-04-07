import catIdle from '../../assets/lottie/cat_idle.json';
import loadingWater from '../../assets/lottie/Loading_water.json';
import catMeal from '../../assets/lottie/cat_meal.json';
import catExercise from '../../assets/lottie/cat_exercise.json';
import catBathroom from '../../assets/lottie/cat_bathroom.json';
import catMedicine from '../../assets/lottie/cat_medicine.json';
import catCelebrate from '../../assets/lottie/cat_celebrate.json';
import catSleep from '../../assets/lottie/cat_sleep.json';

/**
 * AnimationRegistry maps the animation keys used in the app to their 
 * respective Lottie JSON data. This allows for central management 
 * and dynamic selection of animations.
 * 
 * NOTE: The following keys are now successfully migrated to specialized 
 * SVG components in LottiePlayer.tsx to decouple task visuals from cat characters:
 *  - cat_water     -> AnimatedWater.tsx
 *  - cat_meal      -> AnimatedMeal.tsx
 *  - cat_medicine  -> AnimatedMedicine.tsx
 * 
 * TODO: IMPROVE ASSETS - Complete the migration for the remaining categories:
 *  - cat_exercise
 *  - cat_bathroom
 */
export const animationRegistry = {
  cat_idle: catIdle,
  cat_water: loadingWater,
  cat_meal: catMeal,
  cat_exercise: catExercise,
  cat_bathroom: catBathroom,
  cat_medicine: catMedicine,
  cat_celebrate: catCelebrate,
  cat_sleep: catSleep,
} as const;

export type AnimationKey = keyof typeof animationRegistry;

/**
 * Metadata for each animation, used for playback control.
 */
export const animationMetadata: Record<AnimationKey, { loop: boolean; duration: number }> = {
  cat_idle:      { loop: true,  duration: 2.5 },
  cat_water:     { loop: false, duration: 1.8 },
  cat_meal:      { loop: false, duration: 2.0 },
  cat_exercise:  { loop: false, duration: 2.2 },
  cat_bathroom:  { loop: false, duration: 1.6 },
  cat_medicine:  { loop: false, duration: 2.0 },
  cat_celebrate: { loop: false, duration: 3.0 },
  cat_sleep:     { loop: true,  duration: 4.0 },
};
