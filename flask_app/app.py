from flask import Flask, render_template, request, jsonify
import mysql.connector
from mysql.connector import Error
from fetch import get_wind_data  # Import existing function to fetch and store data

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get-stored-data', methods=['POST'])
def get_stored_data():
    data = request.get_json()
    latitude = float(data['latitude'])
    longitude = float(data['longitude'])

    print(f"[DEBUG] Received Latitude: {latitude}, Longitude: {longitude}")

    try:
        # Establish connection to the database
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='root1234',
            database='wind_wave_direction'
        )
        cursor = connection.cursor(dictionary=True)

        # Attempt to find the location ID based on latitude and longitude
        cursor.execute('''SELECT location_id FROM locations
                          WHERE latitude = CAST(%s AS DECIMAL(10, 7))
                          AND longitude = CAST(%s AS DECIMAL(10, 7))''',
                       (latitude, longitude))
        location = cursor.fetchone()  # Fetch the first result

        # If the location is not found, fetch data from the API
        # If location is not found, fetch data from the API
        if not location:
            print("[DEBUG] Location not found. Fetching from API...")

            # Fetch data from API and store it
            result = get_wind_data(latitude, longitude)
            if not result:
                return jsonify({'success': False, 'message': 'Failed to fetch or store data from API.'})

            # After the data is inserted, commit the transaction to save the changes
            connection.commit()  # Ensure data is committed after insertion

            # Re-fetch the location ID after inserting new data
            cursor.execute('''SELECT location_id FROM locations
                            WHERE latitude = CAST(%s AS DECIMAL(10, 7))
                            AND longitude = CAST(%s AS DECIMAL(10, 7))''',
                        (latitude, longitude))
            location = cursor.fetchone()  # Fetch the newly inserted result


        # Handle the case where the location ID is still not found
        if not location:
            print("[ERROR] Location insertion or retrieval failed.")
            return jsonify({'success': False, 'message': 'Location insertion failed.'})

        # Extract the location ID
        location_id = location['location_id']
        print(f"[DEBUG] Found Location ID: {location_id}")

        # Fetch hourly wind data for the found location
        cursor.execute('''SELECT time, wind_wave_height
                          FROM hourly_wind_wave
                          WHERE location_id = %s
                          ORDER BY time ASC''', (location_id,))
        hourly_data = cursor.fetchall()

        # Fetch current wind data for the found location
        cursor.execute('''SELECT * FROM current_wind_wave
                          WHERE location_id = %s
                          ORDER BY time DESC LIMIT 1''', (location_id,))
        current_data = cursor.fetchone()

        # Check if the data is present
        if not hourly_data or not current_data:
            return jsonify({'success': False, 'message': 'No Wind Wave data found for this location.'})

        # Prepare response for the frontend
        response = {
            'success': True,
            'hourly': {
                'time': [row['time'].strftime('%Y-%m-%d %H:%M') for row in hourly_data],
                'wind_wave_height': [row['wind_wave_height'] for row in hourly_data]
            },
            'current': {
                'time': current_data['time'].strftime('%Y-%m-%d %H:%M'),
                'wind_wave_height': current_data['wind_wave_height'],
                'wind_wave_direction': current_data['wind_wave_direction'],
                'wind_wave_period': current_data['wind_wave_period'],
                'wind_wave_peak_period': current_data['wind_wave_peak_period']
            }
        }

    except Error as e:
        print(f"[ERROR] Database error: {e}")
        response = {'success': False, 'message': f'Database error: {str(e)}'}
    finally:
        # Ensure the database connection is closed
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()

    print(f"[DEBUG] Response: {response}")
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)