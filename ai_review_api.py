import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load env variables
load_dotenv()

# Configure API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Use FREE Gemini model
model = genai.GenerativeModel("gemini-1.5-flash")


# -----------------------------
# 1. Generate Review
# -----------------------------
def generate_review(product_name, features):
    prompt = f"""
    Write a detailed, human-like product review.

    Product: {product_name}
    Features: {features}

    Include:
    - Pros and cons
    - Realistic tone
    - Final verdict
    """

    response = model.generate_content(prompt)
    return response.text


# -----------------------------
# 2. Analyze Review
# -----------------------------
def analyze_review(review_text):
    prompt = f"""
    Analyze the following review and return:

    1. Sentiment (Positive, Negative, Neutral)
    2. Key strengths
    3. Key weaknesses
    4. Rating out of 10

    Review:
    {review_text}
    """

    response = model.generate_content(prompt)
    return response.text


# -----------------------------
# 3. Pipeline Runner
# -----------------------------
def review_pipeline(product_name, features):
    print("\n--- Generating Review ---\n")
    review = generate_review(product_name, features)
    print(review)

    print("\n--- Analyzing Review ---\n")
    analysis = analyze_review(review)
    print(analysis)

    return review, analysis


# -----------------------------
# Example Run
# -----------------------------
if __name__ == "__main__":
    product = "iPhone 15"
    features = "Great camera, fast performance, expensive, good battery"

    review_pipeline(product, features)