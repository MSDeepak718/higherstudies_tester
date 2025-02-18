import requests
import io
import google.generativeai as genai
import pandas as pd
from pymongo import MongoClient


def generate_dataset_context_mongo() -> str:
    # Connect to MongoDB
    mongo_uri = "mongodb+srv://bhuvaneshg:deepakbhuvi@cluster0.e2m47pj.mongodb.net/HigherStudies?retryWrites=true&w=majority&appName=Cluster0"
    db_name = "HigherStudies"
    collection_name = "StudentData"
    client = MongoClient(mongo_uri)
    db = client[db_name]
    collection = db[collection_name]

    # Fetch data and convert to DataFrame
    data = list(collection.find())  # Retrieve all documents
    df = pd.DataFrame(data)

    # Check if DataFrame is empty
    if df.empty:
        return "No data available"

    # Handle non-hashable types in the dataset
    for column in df.columns:
        # Convert columns that have non-hashable types (dicts or lists) to strings
        if df[column].apply(lambda x: isinstance(x, (dict, list))).any():
            df[column] = df[column].apply(str)

    # Summarize dataset
    describe_data = df.describe(include='all').to_dict() if not df.empty else "No data available"
    
    # Get DataFrame info as a string
    info_buf = io.StringIO()
    df.info(buf=info_buf)
    info_str = info_buf.getvalue()

    # Create dataset context with summary
    dataset_context = f"""
    The dataset has the following columns: {list(df.columns)}.
    Sample data: {df.head(5).to_dict(orient='records')}.
    Statistical summary (describe): {describe_data}.
    Dataset info: {info_str}.
    Column data types: {df.dtypes.to_dict()}.
    Unique value counts per column: {df.nunique().to_dict()}.
    """
    print(dataset_context)  # Optional: For debugging purposes
    return dataset_context


def generate_prompt(query, dataset_context) -> str:
    # Generate a prompt for the Gemini API based on the query and dataset context
    prompt = f"""Generate a Python code that executes automatically based on the following requirements. Avoid any extra explanations about querying of data or unrelated details.

    Assumptions:

    The latest versions of Plotly, NumPy, Pandas, and PyMongo are installed.
    The dataset is stored in a MongoDB collection with the following details:
        mongo_uri = "mongodb+srv://bhuvaneshg:deepakbhuvi@cluster0.e2m47pj.mongodb.net/HigherStudies?retryWrites=true&w=majority&appName=Cluster0"
        db_name = "HigherStudies"
        collection_name = "StudentData"

    The dataset context is provided as {dataset_context}.
    The Python version being used is 3.12.
    Do not use something like iplot; use other tools from Pandas, NumPy, or Plotly.
    Task Instructions:

    Code Execution:
        Write Python code that performs operations based on the provided dataset context and the query: {query}.
        
        If the operation is a read operation (query contains "read", "fetch", or similar keywords):
            - The code should produce:
                - A visualization that is integral to answering the query and highlights key insights.
                - A detailed explanation in query_answer['1'] that complements the visualization with only details about quantitative data and not explaining querying data or other unrelated details.

        If the operation is a create, update, or delete operation (query contains "create", "update", "delete", or similar keywords):
            - The code should not perform the requested operation and it should produce that this operation is violated to perform via chatbot.

        If the query is a general or casual query (e.g., "hello", "hi", "bye", or similar):
            - The code should provide a response in query_answer['1'] that addresses the query in a friendly, conversational manner. The response should be in plain text and should be respectful, addressing the bot as "QuestBot".

    Explanation (query_answer['1']):
        Provide a clear, structured explanation in query_answer['1'] that:
            - Directly answers the query using the dataset, including computations like summing, aggregation, filtering, or statistical analysis as needed.
            - Provides context to the visualization by describing what it represents quantitatively without unwanted information about the query and how it is fetched.
            - Is formatted as a user-friendly string that non-experts can easily understand.
            - Is in plain text format in paragraph form.
        For general queries, provide an explanation that is friendly and engaging, as QuestBot is a conversational bot.

    Visualization (query_answer['2']):
        If the query is a read operation:
            - Use Plotly to create a chart that complements the explanation and directly answers the query. This chart must:
                - Be stored as a Plotly figure object in query_answer['2'].
                - Be well-formatted with a relevant chart type (e.g., bar chart for comparisons, line chart for trends, scatter plot for relationships etc.).
                - Include clear and appropriately scaled x-axis and y-axis labels, with a descriptive title.
                - If needed, include aggregated or processed data to enhance its relevance and clarity.

    Data Handling:
        Ensure that the dataset is processed in a way that:
            - Aligns with the query’s intent and dataset context.

    Output:
        - For read operations: The explanation in query_answer['1'] may include summaries, aggregations, or other calculations to address the query comprehensively. The visualization in query_answer['2'] serves as a visual representation that complements and enhances the explanation.
        - For create, update, or delete operations: The explanation in query_answer['1'] should be that the operation is violated to perform via chatbot.
        - For general queries: The explanation in query_answer['1'] should be a friendly and conversational response from QuestBot, providing an answer to casual questions or greetings.

    query_answer = {{
        '1': str,  # Explanatory string for the query result, including calculations, filtering, and reasoning or operation details or friendly response
        '2': 'Plotly figure object'   # Plotly figure object containing the generated visualization (only for read operations)
    }}

Ensure that the code adheres strictly to these instructions, producing outputs that are aligned with the query and dataset context, and that QuestBot responds conversationally to general queries.
"""



    print("Prompt generated")
    return prompt


def call_gemini(query):
    # Function to interact with Gemini API to generate content based on a query and dataset
    print("Gemini call initiated")
    genai.configure("AIzaSyAg9e0YBPIRJdEPcGclhvoM0-Uaw37qyNo")  # Set up Gemini API
    model = genai.GenerativeModel("gemini-1.5-flash")  # Initialize the Gemini model
    print("Model connected")

    # Generate dataset context
    dataset_context = generate_dataset_context_mongo()
    print("Dataset context generated")

    # Generate the prompt for the query
    prompt = generate_prompt(query=query, dataset_context=dataset_context)

    # Request content generation from the model
    response = model.generate_content(prompt)
    print("Response received")

    # Extract the response text and clean it up
    text = response.text
    text = text.lstrip()  # Remove leading whitespace
    print("Type of string:", type(text))

    # Clean the Python code from response if wrapped in markdown
    if text.startswith("```python"):
        text = text.replace("```python", "").replace("```", "")  # Clean up any remaining backticks

    print("Generated code:", text)
    return text  # Return the generated code as a string
