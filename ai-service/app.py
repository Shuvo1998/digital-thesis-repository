import spacy
from textblob import TextBlob
from flask import Flask, request, jsonify
from flask_cors import CORS
import language_tool_python
from difflib import SequenceMatcher

# Load the spaCy and TextBlob models
nlp = spacy.load("en_core_web_sm")

# Initialize LanguageTool for grammar checking
# This might download language data the first time it runs
try:
    grammar_tool = language_tool_python.LanguageTool('en-US')
except Exception as e:
    print(f"Error initializing LanguageTool: {e}")
    grammar_tool = None # Handle case where tool might not initialize

app = Flask(__name__)
CORS(app) # Enable CORS for your frontend

# Define the analysis endpoint (existing)
@app.route('/analyze', methods=['POST'])
def analyze_text():
    try:
        data = request.get_json()
        text = data.get('text', '')

        if not text:
            return jsonify({'error': 'No text provided for analysis.'}), 400

        # --- Keyword Extraction with spaCy ---
        doc = nlp(text)
        keywords = list(set([chunk.text.lower() for chunk in doc.noun_chunks]))

        # --- Summarization and Sentiment Analysis with TextBlob ---
        blob = TextBlob(text)
        summary_sentences = blob.sentences[:3] # Get first 3 sentences for summary
        summary = ' '.join([str(s) for s in summary_sentences])

        sentiment_score = blob.sentiment.polarity
        sentiment = 'Neutral'
        if sentiment_score > 0.1:
            sentiment = 'Positive'
        elif sentiment_score < -0.1:
            sentiment = 'Negative'

        return jsonify({
            'summary': summary,
            'keywords': keywords[:10],
            'sentiment': sentiment
        })

    except Exception as e:
        app.logger.error(f"Error in /analyze endpoint: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error during text analysis.'}), 500

# --- New: Editorial Assistant (Grammar Checker) Endpoint ---
@app.route('/check-grammar', methods=['POST'])
def check_grammar():
    try:
        data = request.get_json()
        text = data.get('text', '')

        if not text:
            return jsonify({'error': 'No text provided for grammar check.'}), 400

        if not grammar_tool:
            return jsonify({'error': 'Grammar checker not initialized. Please check server logs.'}), 500

        matches = grammar_tool.check(text)
        
        # Format grammar issues for easier consumption by frontend
        grammar_issues = []
        for match in matches:
            grammar_issues.append({
                'message': match.message,
                'replacements': match.replacements,
                'offset': match.offset,
                'length': match.errorLength, # Corrected here: errorLength with a capital 'L'
                'ruleId': match.ruleId,
                'context': text[max(0, match.offset - 20):match.offset + match.errorLength + 20] # Show context around the error
            })

        return jsonify({'issues': grammar_issues})

    except Exception as e:
        app.logger.error(f"Error in /check-grammar endpoint: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error during grammar check.'}), 500

# --- New: Plagiarism Scan (Conceptual) Endpoint ---
@app.route('/check-plagiarism', methods=['POST'])
def check_plagiarism():
    try:
        data = request.get_json()
        text_to_check = data.get('text', '')

        if not text_to_check:
            return jsonify({'error': 'No text provided for plagiarism check.'}), 400

        # --- CONCEPTUAL PLAGIARISM CHECK ---
        # In a real application, you would compare 'text_to_check' against:
        # 1. A database of existing theses/documents (your MongoDB collection)
        # 2. Public web content (requires web scraping or specialized APIs)
        # 3. Academic databases (requires subscriptions/APIs)

        # For this demo, we'll use a hardcoded "known text" to simulate a match.
        # This is NOT a real plagiarism checker.
        known_texts = [
            "The quick brown fox jumps over the lazy dog.",
            "Machine learning is a field of study that gives computers the ability to learn without being explicitly programmed. It is a subset of artificial intelligence.",
            "This thesis explores the application of various machine learning algorithms, including Support Vector Machines and neural networks, to analyze and predict climate patterns. By leveraging historical meteorological data, the study evaluates the performance and accuracy of these models in forecasting temperature fluctuations, precipitation, and extreme weather events. The findings provide insights into the efficacy of AI-driven approaches for environmental science and highlight the potential for improving long-term climate models.",
            "Another unrelated piece of text."
        ]

        highest_similarity = 0
        matched_source = "No significant match found in internal conceptual database."

        for i, known_text in enumerate(known_texts):
            # Using SequenceMatcher for simple similarity ratio (Jaccard-like for strings)
            # For real plagiarism, you'd use more robust algorithms and chunking.
            similarity = SequenceMatcher(None, text_to_check.lower(), known_text.lower()).ratio()
            
            if similarity > highest_similarity:
                highest_similarity = similarity
                if similarity > 0.8: # Arbitrary threshold for a "significant" match
                    matched_source = f"Conceptual internal source #{i+1} (Similarity: {highest_similarity:.2f})"
                
        # Determine plagiarism status based on a conceptual threshold
        plagiarism_status = "No Plagiarism Detected (Conceptual)"
        if highest_similarity > 0.7: # Another arbitrary threshold for potential plagiarism
            plagiarism_status = "Potential Plagiarism Detected (Conceptual)"
        if highest_similarity > 0.9:
            plagiarism_status = "High Plagiarism Risk (Conceptual)"

        return jsonify({
            'plagiarism_score': round(highest_similarity * 100, 2), # Percentage
            'status': plagiarism_status,
            'matched_source': matched_source,
            'note': 'This is a conceptual plagiarism check for demonstration purposes only. A real plagiarism checker requires a vast database and advanced algorithms.'
        })

    except Exception as e:
        app.logger.error(f"Error in /check-plagiarism endpoint: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error during plagiarism check.'}), 500


if __name__ == '__main__':
    # Run the Flask app on a different port than your Node.js app
    app.run(debug=True, port=5001)