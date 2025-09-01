// Application state
let app = {
    currentTab: 'prediction',
    modelData: null,
    charts: {}
};

// Model data and coefficients (simplified SVM implementation)
const MODEL_DATA = {
    // Selected 15 most important features
    selectedFeatures: [
        "worst concave points", "worst perimeter", "mean concave points", 
        "worst radius", "mean perimeter", "worst area", "mean radius", 
        "mean area", "mean concavity", "worst concavity", "mean compactness", 
        "worst compactness", "radius error", "perimeter error", "area error"
    ],
    
    // Feature mapping to full feature set (indices)
    featureMapping: {
        "mean radius": 0,
        "mean perimeter": 2, 
        "mean area": 3,
        "mean compactness": 5,
        "mean concavity": 6,
        "mean concave points": 7,
        "radius error": 10,
        "perimeter error": 12,
        "area error": 13,
        "worst radius": 20,
        "worst perimeter": 22,
        "worst area": 23,
        "worst compactness": 25,
        "worst concavity": 26,
        "worst concave points": 27
    },

    // Simplified SVM coefficients (example - in real implementation would use actual trained model)
    svmCoefficients: [
        -0.5, 0.8, -0.3, 0.9, 0.7, 1.2, 0.6, 1.1, -0.4, 1.0, -0.2, 0.8, -0.1, 0.5, 0.3
    ],
    
    svmIntercept: -0.1,
    
    // Default values (median values)
    defaultValues: {
        "mean radius": 13.4,
        "mean perimeter": 86.2,
        "mean area": 551.1,
        "mean compactness": 0.093,
        "mean concavity": 0.061,
        "mean concave points": 0.033,
        "radius error": 0.27,
        "perimeter error": 2.0,
        "area error": 25.4,
        "worst radius": 15.6,
        "worst perimeter": 104.1,
        "worst area": 782.7,
        "worst compactness": 0.18,
        "worst concavity": 0.20,
        "worst concave points": 0.081
    },

    // Scaler parameters from the provided data
    scalerMean: [14.127292358968682, 19.289649473684193, 91.96903349429551, 654.8891053166825, 0.09636044080604553, 0.10434096638958688, 0.0887993179012838, 0.04891916650875892, 0.18116160013264424, 0.06279760669616017, 5.481273374697838, 0.4051719558916609, 40.33707788283653, 16.269189808537773, 0.1622566333170516, 0.6656322052951604, 0.7209807104066863, 0.26510968435936675, 0.4601353380606898, 0.11890165354616887, 25.677223107688883, 17.331336477987413, 158.79987949026186, 880.5831273374698, 0.1323685871766167, 0.2542650875892263, 0.27218637161719015, 0.11460622407226239, 0.29007898473084896, 0.0839458870319846],
    
    scalerScale: [3.524048794329847, 4.301036062196316, 24.298981080811827, 351.9141266516488, 0.01406413083405829, 0.05681821318206104, 0.09697284924780092, 0.03880267003948915, 0.027414282117655986, 0.01808416073314745, 2.305891578853577, 1.1737853853540134, 54.18626247633808, 8.09767721658862, 0.05053362537036968, 0.38704072030473836, 0.6482408950992926, 0.20607524596540066, 0.2389067223779778, 0.01842674421263715, 4.833242426977738, 6.146257943926989, 65.73578887946013, 569.3569919879808, 0.022832429207467826, 0.15734155872421943, 0.20877637436470764, 0.06573234398327629, 0.1618084468555166, 0.018060743469158736]
};

// Performance data
const PERFORMANCE_DATA = {
    models: ['SVM', 'Neural Network', 'Ensemble Voting', 'Logistic Regression', 'XGBoost', 'Random Forest'],
    accuracies: [97.37, 97.37, 96.49, 95.61, 95.61, 94.74]
};

// Feature importance data
const FEATURE_IMPORTANCE = {
    features: ['Worst Perimeter', 'Mean Concave Points', 'Worst Radius', 'Mean Perimeter', 'Worst Area', 
               'Mean Radius', 'Mean Area', 'Worst Concave Points', 'Mean Concavity', 'Worst Concavity'],
    importance: [0.164, 0.132, 0.118, 0.095, 0.087, 0.081, 0.074, 0.069, 0.058, 0.052]
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupTabNavigation();
    setupFormHandlers();
    setupSliderUpdates();
    initializeCharts();
    setDefaultValues();
}

// Tab navigation
function setupTabNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Update active states
            navTabs.forEach(t => t.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            
            app.currentTab = tabId;
            
            // Render charts when tabs are activated
            if (tabId === 'model-info') {
                setTimeout(() => renderPerformanceChart(), 100);
            } else if (tabId === 'feature-analysis') {
                setTimeout(() => renderFeatureChart(), 100);
            }
        });
    });
}

// Form handlers
function setupFormHandlers() {
    const form = document.getElementById('predictionForm');
    const resetBtn = document.getElementById('resetBtn');
    
    form.addEventListener('submit', handlePrediction);
    resetBtn.addEventListener('click', setDefaultValues);
}

// Slider updates
function setupSliderUpdates() {
    const sliders = document.querySelectorAll('.form-range');
    
    sliders.forEach(slider => {
        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            const display = e.target.parentNode.querySelector('.value-display');
            const name = e.target.getAttribute('name');
            
            // Format display value
            let displayValue;
            if (name.includes('radius') || name.includes('perimeter') || name.includes('error')) {
                displayValue = `${value.toFixed(1)} mm`;
            } else if (name.includes('area')) {
                displayValue = `${value.toFixed(1)} mm²`;
            } else {
                displayValue = value.toFixed(3);
            }
            
            display.textContent = displayValue;
            
            // Update range indicator color based on value
            updateRangeIndicator(slider, value);
        });
    });
}

function updateRangeIndicator(slider, value) {
    const indicator = slider.parentNode.parentNode.querySelector('.range-indicator span');
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const range = max - min;
    const percent = (value - min) / range;
    
    // Color coding: green (low), yellow (medium), red (high)
    if (percent < 0.33) {
        indicator.style.color = 'var(--color-success)';
    } else if (percent < 0.66) {
        indicator.style.color = 'var(--color-warning)';
    } else {
        indicator.style.color = 'var(--color-error)';
    }
}

// Set default values
function setDefaultValues() {
    const sliders = document.querySelectorAll('.form-range');
    
    sliders.forEach(slider => {
        const name = slider.getAttribute('name');
        const defaultValue = MODEL_DATA.defaultValues[name];
        
        if (defaultValue !== undefined) {
            slider.value = defaultValue;
            
            // Trigger input event to update display
            const event = new Event('input', { bubbles: true });
            slider.dispatchEvent(event);
        }
    });
}

// Prediction handling
async function handlePrediction(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.predict-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.loading-spinner');
    
    // Show loading state
    btnText.classList.add('hidden');
    spinner.classList.remove('hidden');
    submitBtn.disabled = true;
    
    try {
        // Collect form data
        const formData = collectFormData();
        
        // Simulate prediction delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Make prediction
        const prediction = makePrediction(formData);
        
        // Display results
        displayResults(prediction);
        
    } catch (error) {
        console.error('Prediction error:', error);
        showError('An error occurred during prediction. Please try again.');
    } finally {
        // Reset button state
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');
        submitBtn.disabled = false;
    }
}

function collectFormData() {
    const formData = {};
    const sliders = document.querySelectorAll('.form-range');
    
    sliders.forEach(slider => {
        const name = slider.getAttribute('name');
        formData[name] = parseFloat(slider.value);
    });
    
    return formData;
}

function makePrediction(formData) {
    // Prepare feature vector (30 features, we only have 15)
    const fullFeatureVector = new Array(30).fill(0);
    
    // Map our 15 features to the full 30-feature vector
    Object.keys(formData).forEach(featureName => {
        const index = MODEL_DATA.featureMapping[featureName];
        if (index !== undefined) {
            fullFeatureVector[index] = formData[featureName];
        }
    });
    
    // Apply scaling
    const scaledFeatures = fullFeatureVector.map((value, index) => {
        return (value - MODEL_DATA.scalerMean[index]) / MODEL_DATA.scalerScale[index];
    });
    
    // Extract only the selected features for prediction
    const selectedScaledFeatures = MODEL_DATA.selectedFeatures.map(featureName => {
        const index = MODEL_DATA.featureMapping[featureName];
        return scaledFeatures[index];
    });
    
    // Simple linear SVM prediction (dot product + intercept)
    let decisionValue = MODEL_DATA.svmIntercept;
    selectedScaledFeatures.forEach((feature, index) => {
        decisionValue += feature * MODEL_DATA.svmCoefficients[index];
    });
    
    // Convert to probability using sigmoid function
    const probability = 1 / (1 + Math.exp(-decisionValue));
    
    // Determine prediction
    const isMalignant = probability > 0.5;
    const confidence = isMalignant ? probability : (1 - probability);
    
    return {
        prediction: isMalignant ? 'MALIGNANT' : 'BENIGN',
        confidence: confidence * 100,
        malignantProb: probability * 100,
        benignProb: (1 - probability) * 100,
        riskLevel: getRiskLevel(confidence * 100),
        recommendations: getRecommendations(isMalignant, confidence * 100)
    };
}

function getRiskLevel(confidence) {
    if (confidence >= 80) {
        return 'Low';
    } else if (confidence >= 60) {
        return 'Medium';
    } else {
        return 'High';
    }
}

function getRecommendations(isMalignant, confidence) {
    if (isMalignant) {
        return {
            icon: '⚠️',
            text: [
                '🚨 Immediate medical consultation recommended.',
                '🔬 Further diagnostic tests may be required.',
                '👩‍⚕️ Discuss treatment options with oncologist.',
                '📋 Consider seeking a second medical opinion.'
            ]
        };
    } else {
        if (confidence >= 80) {
            return {
                icon: '✅',
                text: [
                    '✅ Results suggest benign characteristics.',
                    '📋 Continue regular monitoring and follow-up.',
                    '👩‍⚕️ Consult with healthcare provider for comprehensive evaluation.',
                    '🌟 Maintain healthy lifestyle practices.'
                ]
            };
        } else {
            return {
                icon: '⚠️',
                text: [
                    '⚠️ Results are inconclusive - further evaluation needed.',
                    '🔬 Additional imaging or biopsy may be recommended.',
                    '👩‍⚕️ Schedule follow-up appointment with specialist.',
                    '📋 Monitor for any changes in symptoms.'
                ]
            };
        }
    }
}

function displayResults(prediction) {
    const resultsContainer = document.getElementById('resultsContainer');
    const resultBadge = document.getElementById('resultBadge');
    const confidenceText = document.getElementById('confidenceText');
    const confidenceFill = document.getElementById('confidenceFill');
    const riskLevel = document.getElementById('riskLevel');
    const benignProb = document.getElementById('benignProb');
    const malignantProb = document.getElementById('malignantProb');
    const recommendationsText = document.getElementById('recommendationsText');
    
    // Show results container
    resultsContainer.classList.remove('hidden');
    
    // Update result badge
    resultBadge.textContent = prediction.prediction;
    resultBadge.className = 'result-badge ' + (prediction.prediction === 'BENIGN' ? 'benign' : 'malignant');
    
    // Update confidence
    confidenceText.textContent = `${prediction.confidence.toFixed(1)}%`;
    confidenceFill.style.width = `${prediction.confidence}%`;
    
    // Update risk level
    riskLevel.textContent = `${prediction.riskLevel} Risk`;
    riskLevel.className = 'risk-level ' + prediction.riskLevel.toLowerCase();
    
    // Update probabilities
    benignProb.textContent = `${prediction.benignProb.toFixed(1)}%`;
    malignantProb.textContent = `${prediction.malignantProb.toFixed(1)}%`;
    
    // Update recommendations
    recommendationsText.innerHTML = prediction.recommendations.text
        .map(text => `<p>${text}</p>`)
        .join('');
    
    // Smooth scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showError(message) {
    alert(message); // In a real app, you'd show a proper error modal
}

// Chart initialization
function initializeCharts() {
    // Charts will be rendered when tabs are activated
    app.charts = {};
}

function renderPerformanceChart() {
    if (app.charts.performance) {
        app.charts.performance.destroy();
    }
    
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;
    
    app.charts.performance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: PERFORMANCE_DATA.models,
            datasets: [{
                label: 'Accuracy (%)',
                data: PERFORMANCE_DATA.accuracies,
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545'],
                borderColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                title: {
                    display: true,
                    text: 'Cancer Prediction Model Performance Comparison',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Accuracy (%)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Models'
                    }
                }
            }
        }
    });
}

function renderFeatureChart() {
    if (app.charts.features) {
        app.charts.features.destroy();
    }
    
    const ctx = document.getElementById('featureChart');
    if (!ctx) return;
    
    app.charts.features = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: FEATURE_IMPORTANCE.features,
            datasets: [{
                label: 'Importance Score',
                data: FEATURE_IMPORTANCE.importance,
                backgroundColor: '#1FB8CD',
                borderColor: '#1FB8CD',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                title: {
                    display: true,
                    text: 'Top 10 Most Important Features for Cancer Prediction',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Importance Score'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Features'
                    }
                }
            }
        }
    });
}

// Utility functions
function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

function formatNumber(num, decimals = 2) {
    return Number(num).toFixed(decimals);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        makePrediction,
        collectFormData,
        getRiskLevel,
        getRecommendations
    };
}