from flask import Flask, render_template, jsonify
import mysql.connector
from contextlib import closing

app = Flask(__name__)

def get_db_connection():
    """Establish a database connection."""
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='root1234',
        database='wind_wave_direction'
    )

@app.route('/')
def index():
    """Render the index page."""
    return render_template('index.html')

@app.route('/data')
def data():
    """Fetch data from the database and return as JSON."""
    # Define the query for fetching data based on latitude and longitude
    query = """
    SELECT * FROM windwavedata 
    WHERE latitude BETWEEN 54.544487 AND 54.544687 
    AND longitude BETWEEN 10.227387 AND 10.227587
    """
    
    # Use a context manager to handle the database connection
    with closing(get_db_connection()) as connection:
        with closing(connection.cursor(dictionary=True)) as cursor:
            cursor.execute(query)
            results = cursor.fetchall()
    
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)