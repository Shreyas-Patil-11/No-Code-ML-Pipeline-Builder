import React, { useState } from 'react';
import axios from 'axios';
import { RefreshCw, Sparkles } from 'lucide-react';
import StepIndicator from './components/StepIndicator';
import PipelineFlow from './components/PipelineFlow';
import FileUpload from './components/FileUpload';
import Preprocessing from './components/Preprocessing';
import TrainTestSplit from './components/TrainTestSplit';
import ModelSelection from './components/ModelSelection';
import Results from './components/Results';
import './App.css';

function App() {
  // State for each step
  const [uploadedData, setUploadedData] = useState(null);
  const [preprocessedData, setPreprocessedData] = useState(null);
  const [splitData, setSplitData] = useState(null);
  const [trainingResults, setTrainingResults] = useState(null);

  // Track completed steps
  const getCompletedSteps = () => {
    const steps = [];
    if (uploadedData) steps.push(1);
    if (preprocessedData) steps.push(2);
    if (splitData) steps.push(3);
    if (trainingResults) steps.push(4, 5);
    return steps;
  };

  // Get current step
  const getCurrentStep = () => {
    if (trainingResults) return 5;
    if (splitData) return 4;
    if (preprocessedData) return 3;
    if (uploadedData) return 2;
    return 1;
  };

  // Handlers for each step
  const handleUploadSuccess = (data) => {
    setUploadedData(data);
    // Reset downstream steps
    setPreprocessedData(null);
    setSplitData(null);
    setTrainingResults(null);
  };

  const handlePreprocessSuccess = (data) => {
    setPreprocessedData(data);
    // Reset downstream steps
    setSplitData(null);
    setTrainingResults(null);
  };

  const handleSplitSuccess = (data) => {
    setSplitData(data);
    // Reset downstream steps
    setTrainingResults(null);
  };

  const handleTrainSuccess = (data) => {
    setTrainingResults(data);
  };

  // Reset everything
  const handleReset = async () => {
    try {
      await axios.post('/api/reset');
      setUploadedData(null);
      setPreprocessedData(null);
      setSplitData(null);
      setTrainingResults(null);
    } catch (err) {
      console.error('Reset failed:', err);
    }
  };

  const completedSteps = getCompletedSteps();
  const currentStep = getCurrentStep();

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <h1>
          <Sparkles style={{ display: 'inline', marginRight: '12px' }} />
          ML Pipeline Builder
        </h1>
        <p>Build machine learning workflows without writing any code</p>
      </header>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />

      {/* Pipeline Flow Visualization */}
      <PipelineFlow completedSteps={completedSteps} currentStep={currentStep} />

      {/* Main Content */}
      <div className="main-content">
        {/* Left Column */}
        <div>
          <FileUpload 
            onUploadSuccess={handleUploadSuccess} 
            uploadedData={uploadedData}
          />
          <div style={{ marginTop: '20px' }}>
            <TrainTestSplit 
              preprocessedData={preprocessedData}
              onSplitSuccess={handleSplitSuccess}
              splitData={splitData}
            />
          </div>
        </div>

        {/* Right Column */}
        <div>
          <Preprocessing 
            uploadedData={uploadedData}
            onPreprocessSuccess={handlePreprocessSuccess}
            preprocessedData={preprocessedData}
          />
          <div style={{ marginTop: '20px' }}>
            <ModelSelection 
              splitData={splitData}
              onTrainSuccess={handleTrainSuccess}
              trainingResults={trainingResults}
            />
          </div>
        </div>

        {/* Results - Full Width */}
        <Results trainingResults={trainingResults} />
      </div>

      {/* Reset Button */}
      {uploadedData && (
        <button 
          className="btn btn-danger reset-button"
          onClick={handleReset}
        >
          <RefreshCw size={18} />
          Reset Pipeline
        </button>
      )}
    </div>
  );
}

export default App;