import pandas as pd
import plotly.graph_objects as go
import plotly.io as pio
from flask import Flask, request, jsonify
import time  # Import time for sleep between retries
from gemini import call_gemini
app = Flask(__name__)
from flask_cors import CORS
import numpy as np
# Add this line to enable CORS for all routes
CORS(app)

# Define the maximum number of retries in case of error
MAX_RETRIES = 3

@app.route('/generate', methods=['POST'])
def generate():
    print("here")
    retry_count = 0
    while retry_count < MAX_RETRIES:
        # Get the user query from the frontend
        query = request.json.get('query')
        print(f"Received query: {query}")
        
        # Call Gemini API to get Python code for the query
        response = call_gemini(query)
        generated_code = response
        print(f"Generated code from Gemini: {generated_code}")
        
        try:
            # Prepare the execution environment for the generated code
            exec_locals = {
                'pd': pd,
                'np': np,
                'go': go,
                'pio': pio
            }

            # Execute the generated code to process the query and generate the graph
            exec(generated_code, {}, exec_locals)
            print("Executed generated code.")

            # Check if the 'query_answer' contains the figure (graph)
            if 'query_answer' in exec_locals:
                query_answer = exec_locals['query_answer']

                # Convert the figure to JSON
                if isinstance(query_answer.get('2'), go.Figure):
                    query_answer['2'] = pio.to_json(query_answer['2'])

                return jsonify(query_answer)
            else:
                # Return an error message if no figure is created
                return jsonify({
                    'result': 'Code executed but no figure created.',
                    'graph': None,
                    'code': generated_code
                })
        
        except Exception as e:
            print(f"Error on attempt {retry_count + 1}: {str(e)}")
            print(e)
            # Increment retry count
            retry_count += 1

            # If retries are left, wait for a while and retry
            if retry_count < MAX_RETRIES:
                print("Retrying...")
                time.sleep(2)  # Wait for 2 seconds before retrying
            else:
                # After maximum retries, return the error message
                return jsonify({'error': str(e)})


if __name__ == '__main__':
    app.run(debug=True)