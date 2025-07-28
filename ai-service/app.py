import spacy
from textblob import TextBlob
from flask import Flask, request, jsonify
from flask_cors import CORS
import language_tool_python
from difflib import SequenceMatcher
# New imports for semantic search
import faiss
from sentence_transformers import SentenceTransformer
import numpy as np
import os
import json
# New import for MongoDB
from pymongo import MongoClient
from bson.objectid import ObjectId

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

# --- New MongoDB Setup ---
MONGO_URI = "mongodb://localhost:27017/" # Your MongoDB connection string
DB_NAME = "digi-thesis_DB" # Corrected: Your database name from the screenshot
COLLECTION_NAME = "theses" # The collection where your theses are stored

client = None
db = None

try:
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    print("Connected to MongoDB successfully.")
except Exception as e:
    print(f"Could not connect to MongoDB: {e}")

# --- AI Search Setup ---
# The model that will convert text to vectors.
search_model = SentenceTransformer('all-MiniLM-L6-v2')
faiss_index = None
thesis_data = [] # Stores metadata like titles, authors, etc.

# Helper function to create and save the FAISS index
def create_and_save_index(documents, metadata_list):
    print("Creating and saving FAISS index...")
    # Generate embeddings for all documents
    embeddings = search_model.encode(documents)
    
    # Ensure embeddings are in float32 format for FAISS
    embeddings = np.array(embeddings).astype('float32')
    
    # The dimensionality of the vectors
    d = embeddings.shape[1]
    
    # Create a FAISS index (IndexFlatL2 is a simple, brute-force index)
    index = faiss.IndexFlatL2(d)
    
    # Add the embeddings to the index
    index.add(embeddings)
    
    # Save the index to a file
    faiss.write_index(index, "thesis_index.faiss")
    
    # Save the corresponding metadata (titles, etc.) to a file
    with open("thesis_metadata.json", "w") as f:
        json.dump(metadata_list, f)
        
    print("FAISS index created and saved successfully.")
    return index

# Helper function to load the FAISS index from a file
def load_index():
    global faiss_index, thesis_data
    if os.path.exists("thesis_index.faiss") and os.path.exists("thesis_metadata.json"):
        print("Loading FAISS index from file...")
        faiss_index = faiss.read_index("thesis_index.faiss")
        with open("thesis_metadata.json", "r") as f:
            thesis_data = json.load(f)
        print("FAISS index loaded.")
        return True
    else:
        print("No existing FAISS index found. Running initial data ingestion.")
        return False

# This is the new function to fetch data from MongoDB
def fetch_data_from_db():
    if db is None:
        print("MongoDB connection not available. Cannot fetch data.")
        return [], []

    print("Fetching documents from MongoDB...")
    documents = []
    metadata_list = []
    
    try:
        # Fetch all documents from the theses collection
        theses_collection = db[COLLECTION_NAME]
        
        # --- NEW DEBUGGING PRINTS ---
        print(f"DEBUG: Checking collection: {theses_collection.full_name}")
        total_docs = theses_collection.count_documents({})
        print(f"DEBUG: Found {total_docs} documents in the collection.")
        if total_docs == 0:
            print("DEBUG: No documents found, returning empty lists.")
            return [], []

        db_documents = theses_collection.find({}, {'abstract': 1, 'title': 1, 'authorName': 1})
        
        for doc in db_documents:
            # We'll use the abstract for embedding to keep it concise.
            # You could also use the full_text if you have enough memory.
            if 'abstract' in doc and doc['abstract']:
                documents.append(doc['abstract'])
                metadata_list.append({
                    'id': str(doc['_id']), # Convert ObjectId to string for JSON serialization
                    'title': doc.get('title', 'No Title'),
                    'author': doc.get('authorName', 'Unknown Author') # Corrected: fetch authorName from the document
                })
        print(f"Fetched {len(documents)} documents from MongoDB.")
        return documents, metadata_list
    except Exception as e:
        print(f"Error fetching data from MongoDB: {e}")
        return [], []


# This is the updated function to build the initial index using data from the DB
def initial_data_ingestion():
    global faiss_index, thesis_data
    
    # Fetch data from MongoDB instead of using dummy data
    documents, metadata_list = fetch_data_from_db()

    if not documents:
        print("No documents found in the database. Cannot build index.")
        return
        
    faiss_index = create_and_save_index(documents, metadata_list)
    thesis_data = metadata_list

# Call this function to build the index on server startup if it doesn't exist
if not load_index():
    initial_data_ingestion()

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

# --- Editorial Assistant (Grammar Checker) Endpoint ---
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

# --- Plagiarism Scan (Conceptual) Endpoint ---
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

# --- New: AI-Powered Semantic Search Endpoint ---
@app.route('/semantic-search', methods=['POST'])
def semantic_search():
    try:
        data = request.get_json()
        query = data.get('query', '')
        top_k = data.get('top_k', 5) # Number of results to return

        if not query:
            return jsonify({'error': 'No query provided.'}), 400
        
        if faiss_index is None:
              return jsonify({'error': 'Search index not initialized. Please check server logs.'}), 500

        # Encode the user's query using the same model
        query_embedding = search_model.encode([query])
        
        # Ensure the query embedding is in float32 format
        query_embedding = np.array(query_embedding).astype('float32')

        # Perform the search on the FAISS index
        # For IndexFlatL2, lower distance means higher similarity
        distances, indices = faiss_index.search(query_embedding, top_k)
        
        # Format the results
        search_results = []
        for i, idx in enumerate(indices[0]):
            # The FAISS index returns the index of the document in your `thesis_data` list
            document_metadata = thesis_data[idx]
            search_results.append({
                'id': str(document_metadata['id']), # Ensure ID is string for consistency
                'title': document_metadata['title'],
                'author': document_metadata['author'],
                'relevance_score': float(distances[0][i]) # L2 distance, lower is better
            })
            
        # Sort by relevance score (lowest distance first)
        search_results.sort(key=lambda x: x['relevance_score'])

        return jsonify({'results': search_results})

    except Exception as e:
        app.logger.error(f"Error in /semantic-search endpoint: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error during semantic search.'}), 500


if __name__ == '__main__':
    # Run the Flask app on a different port than your Node.js app
    app.run(debug=True, port=5002)