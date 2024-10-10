import requests
import mysql.connector
from mysql.connector import Error
from datetime import datetime

# Define the latitude and longitude
latitude = 54.544587
longitude = 10.227487

def fetch_data(url):
    """Fetch data from the API."""
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to retrieve data: {response.status_code}")
        return None

def create_database_connection():
    """Create a database connection."""
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='root1234',
            database='wind_wave_direction'
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def create_table(cursor):
    """Create the WindWaveData table if it doesn't exist."""
    create_table_query = '''
    CREATE TABLE IF NOT EXISTS WindWaveData (
        id INT AUTO_INCREMENT PRIMARY KEY,
        timestamp DATETIME,
        wind_wave_height FLOAT,
        wind_wave_direction FLOAT,
        wind_wave_period FLOAT,
        wind_wave_peak_period FLOAT,
        latitude FLOAT NOT NULL,
        longitude FLOAT NOT NULL
    );
    '''
    cursor.execute(create_table_query)

def insert_data(cursor, data):
    """Insert data into the WindWaveData table."""
    hourly_data = data.get('hourly', {})
    timestamps = hourly_data.get('time', [])
    wind_wave_heights = hourly_data.get('wind_wave_height', [])
    wind_wave_directions = hourly_data.get('wind_wave_direction', [])
    wind_wave_periods = hourly_data.get('wind_wave_period', [])
    wind_wave_peak_periods = hourly_data.get('wind_wave_peak_period', [])

    # Check if all lists have the same length
    if len(timestamps) == len(wind_wave_heights) == len(wind_wave_directions) == len(wind_wave_periods) == len(wind_wave_peak_periods):
        for i in range(len(timestamps)):
            timestamp = datetime.strptime(timestamps[i], '%Y-%m-%dT%H:%M')  # Adjusted format
            wind_wave_height = wind_wave_heights[i]
            wind_wave_direction = wind_wave_directions[i]
            wind_wave_period = wind_wave_periods[i]
            wind_wave_peak_period = wind_wave_peak_periods[i] if wind_wave_peak_periods[i] is not None else 0.0  # Default to 0.0 if None

            # Prepare and execute the insert query
            insert_query = '''
            INSERT INTO WindWaveData (timestamp, wind_wave_height, wind_wave_direction, wind_wave_period, wind_wave_peak_period, latitude, longitude)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            '''
            cursor.execute(insert_query, (timestamp, wind_wave_height, wind_wave_direction, wind_wave_period, wind_wave_peak_period, latitude, longitude))
    else:
        print("Error: Data lists have different lengths.")

def main():
    # Step 1: Fetch data from the API
    url = f'https://barmmdrr.com/connect/gmarine_api?latitude={latitude}&longitude={longitude}&hourly=wind_wave_height,wind_wave_direction,wind_wave_period,wind_wave_peak_period'
    data = fetch_data(url)
    
    if data:
        # Step 2: Connect to the database
        connection = create_database_connection()
        if connection:
            try:
                cursor = connection.cursor()
                
                # Step 3: Create table if not exists
                create_table(cursor)

                # Step 4: Insert data into the table
                insert_data(cursor, data)

                # Step 5: Commit changes
                connection.commit()
            finally:
                cursor.close()
                connection.close()

if __name__ == "__main__":
    main()