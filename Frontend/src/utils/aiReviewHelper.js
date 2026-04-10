/**
 * aiReviewHelper.js
 * Contains helper functions to rotate AI typing suggestions and other front-end AI logic.
 */

const suggestionsForHighRating = [
  "💡 Try highlighting what you loved most!",
  "✨ Mention the discount you received!",
  "🤔 How did the product feel in your hands?",
  "📝 Details about the delivery speed are always helpful."
];

const suggestionsForLowRating = [
  "💡 What could be improved?",
  "✨ Let the seller know what didn't meet your expectations.",
  "🤔 Were there any issues with the packaging?",
  "📝 Constructive feedback helps everyone grow!"
];

/**
 * Returns an array of contextual suggestions based on the rating.
 */
export const getContextualSuggestions = (rating) => {
  if (rating >= 4) {
    return suggestionsForHighRating;
  }
  return suggestionsForLowRating;
};

/**
 * Gets a fun emoji based on the star rating out of 5.
 */
export const getEmojiForRating = (rating) => {
  switch (Math.floor(rating)) {
    case 5: return "😍";
    case 4: return "🔥";
    case 3: return "🙂";
    case 2: return "😐";
    case 1: return "😕";
    default: return "✨";
  }
};
