// prediction.js - Handles the prediction form submission and results display
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("prediction-form");
  const resultContainer = document.getElementById("result-container");
  const resultDiv = document.getElementById("result");
  const recommendationsDiv = document.getElementById("recommendations");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Show loading state
    resultDiv.innerHTML = "<p>Analyzing your data...</p>";
    resultContainer.style.display = "block";

    // Collect form data
    const formData = {
      age: document.getElementById("age").value,
      gender: document.getElementById("gender").value,
      heart_rate: document.getElementById("heart_rate").value,
      systolic_bp: document.getElementById("systolic_bp").value,
      diastolic_bp: document.getElementById("diastolic_bp").value,
      blood_sugar: document.getElementById("blood_sugar").value,
      ck_mb: document.getElementById("ck_mb").value,
      troponin: document.getElementById("troponin").value,
    };

    // Send to server for prediction
    fetch("/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          resultDiv.innerHTML = `<p class="alert-danger">Error: ${data.error}</p>`;
          return;
        }

        const riskLevel = data.risk_level;
        const probability = (data.probability * 100).toFixed(1);
        const prediction = data.prediction;

        if (prediction == 1 || riskLevel === "high") {
          resultDiv.className = "result high-risk";
          resultDiv.innerHTML = `
            <h3>High Risk Detected</h3>
            <p>Our model predicts a <strong>${probability}%</strong> probability of heart attack risk.</p>
            <p><strong>${
              data.message || "Please seek immediate medical attention."
            }</strong></p>
          `;

          recommendationsDiv.innerHTML = `
            <div class="card alert-danger">
              <h4>Immediate Recommendations:</h4>
              <ol>
                <li>Call emergency services immediately</li>
                <li>Stop all activity and sit or lie down</li>
                <li>If prescribed, take nitroglycerin</li>
                <li>Chew and swallow an aspirin (unless allergic)</li>
                <li>Stay calm and wait for emergency responders</li>
              </ol>
            </div>
          `;
        } else {
          resultDiv.className = "result low-risk";
          resultDiv.innerHTML = `
            <h3>Low Risk Detected</h3>
            <p>Our model predicts a <strong>${probability}%</strong> probability of heart attack risk.</p>
            <p>${
              data.message ||
              "This suggests low current risk, but always consult with a healthcare provider for personal assessment."
            }</p>
          `;

          recommendationsDiv.innerHTML = `
            <div class="card">
              <h4>Preventive Recommendations:</h4>
              <ul>
                <li>Maintain regular check-ups with your doctor</li>
                <li>Follow a heart-healthy diet</li>
                <li>Engage in regular physical activity</li>
                <li>Manage stress levels</li>
                <li>Avoid smoking and limit alcohol consumption</li>
              </ul>
            </div>
          `;
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        resultDiv.innerHTML = `
          <p class="alert-danger">
            Error: ${error.message}<br>
            Please check your inputs and try again.
          </p>
        `;
      });
  });
});
