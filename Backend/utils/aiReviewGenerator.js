/**
 * aiReviewGenerator.js
 * 
 * Provides smart backend templates to mimic an AI API generation for product reviews.
 * Adjusts tone based on the rating.
 */

const enthusiasticPrefixes = [
  "Absolutely amazing product! 😍",
  "Wow, just wow! 🚀",
  "I am completely blown away by this! 🔥",
  "Hands down one of the best purchases I've ever made. 💯"
];

const positivePrefixes = [
  "Great product with solid performance.",
  "Really happy with the purchase.",
  "This is a high-quality item, very dependable.",
  "Solid experience overall, definitely met my expectations. 👍"
];

const constructivePrefixes = [
  "It's a decent product, and with the value offered, it's definitely worth considering.",
  "A good start, but there's room for a bit more refinement.",
  "I see the potential here! With a few tweaks it could be flawless.",
  "Solid foundation, but the experience could be slightly better."
];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const generateReviewText = ({ rating, productName, discount, category }) => {
  const numRating = Number(rating);
  let baseTone = "";
  
  if (numRating >= 5) {
    baseTone = getRandomElement(enthusiasticPrefixes);
    baseTone += ` The quality of this ${category ? category.toLowerCase() : 'item'} exceeded my expectations.`;
  } else if (numRating === 4) {
    baseTone = getRandomElement(positivePrefixes);
    baseTone += ` The pricing was impressive and it gets the job done well.`;
  } else {
    baseTone = getRandomElement(constructivePrefixes);
    baseTone += ` I hope NexaMart takes the feedback to make it even better.`;
  }

  // Inject product name dynamically if provided
  if (productName) {
    const shortName = productName.split(' ')[0]; // use first word for personal feel
    baseTone += ` The ${shortName} fits perfectly into my routine.`;
  }

  // Inject discount highlight
  if (discount && Number(discount) > 0) {
    if (numRating >= 4) {
      baseTone += ` Plus, grabbing it at a ${discount}% discount made it an absolute steal!`;
    } else {
      baseTone += ` The ${discount}% discount made it a very fair deal overall.`;
    }
  }

  // Conclusion
  if (numRating >= 4) {
    baseTone += ` Thank you NexaMart for such an incredible experience! ✨`;
  } else {
    baseTone += ` NexaMart makes the shopping experience smooth, so I'm still a happy customer. 😊`;
  }

  return baseTone;
};
