import catIdle from '../../assets/lottie/cat_idle.json';
import catWater from '../../assets/lottie/cat_water.json';
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
 * TODO: IMPROVE ASSETS - Show only the task category animation (e.g. water drop, food).
 * There is no need for the cat to be baked into these animations. 
 * This allows the user's selected character (Mochi, Sora, Kuro) to be 
 * rendered independently.
 */
export const animationRegistry = {
  cat_idle: catIdle,
  cat_water: catWater,
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
