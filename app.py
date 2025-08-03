
from flask import Flask, render_template, request, jsonify
import pandas as pd
import joblib
import os

app = Flask(__name__)


try:
    model = joblib.load('./models/model.pkl')
    scaler = joblib.load('./models/scaler.pkl')
except Exception as e:
    raise RuntimeError(f"error in uploading model and scaler: {str(e)}")


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/symptoms')
def symptoms():
    return render_template('symptoms.html')

@app.route('/emergency')
def emergency():
    return render_template('emergency.html')

@app.route('/prediction')
def prediction():
    return render_template('prediction.html')

@app.route('/predict', methods=['POST'])

def predict():
    try:
        data = request.get_json()
        print("Received data:", data)

        input_data = {
            'Age': float(data['age']),
            'Gender': float(data['gender']),
            'Heart rate': float(data['heart_rate']),
            'Systolic blood pressure': float(data['systolic_bp']),
            'Diastolic blood pressure': float(data['diastolic_bp']),
            'Blood sugar': float(data['blood_sugar']),
            'CK-MB': float(data['ck_mb']),
            'Troponin': float(data['troponin'])
        }

        features_order = [
            'Age', 'Gender', 'Heart rate',
            'Systolic blood pressure', 'Diastolic blood pressure',
            'Blood sugar', 'CK-MB', 'Troponin'
        ]
        
        input_df = pd.DataFrame([input_data], columns=features_order)
        scaled_data = scaler.transform(input_df)
        print("Scaled data:", scaled_data)

        # Get prediction (modified to handle string outputs)
        prediction_output = model.predict(scaled_data)[0]
        
        # Handle both string and numeric predictions
        if isinstance(prediction_output, str):
            prediction = 1 if prediction_output.lower() in ['positive', 'yes', '1'] else 0
        else:
            prediction = int(prediction_output)

        # Get probability (handle cases where predict_proba might not exist)
        try:
            probability = model.predict_proba(scaled_data)[0][1]
        except AttributeError:
            probability = 0.8 if prediction == 1 else 0.2

        response = {
            'prediction': prediction,
            'probability': float(probability),
            'risk_level': 'high' if prediction == 1 else 'low',
            'message': 'High risk detected! Seek medical attention' if prediction == 1 else 'Low risk detected'
        }

        return jsonify(response)

    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': str(e)}), 500

#handle the error
@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(error):
    return render_template('500.html'), 500

if __name__ == '__main__':
    # تشغيل التطبيق
    app.run(host='0.0.0.0', port=5000, debug=True)