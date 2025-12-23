
import React, { useState } from 'react';
import { Split, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const TrainTestSplit = ({ preprocessedData, onSplitSuccess, splitData }) => {
  const [splitRatio, setSplitRatio] = useState(0.8);
  const [randomState, setRandomState] = useState(42);
  const [isSplitting, setIsSplitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSplit = async () => {
    setError(null);
    setIsSplitting(true);

    try {
      const response = await axios.post('/api/split', {
        splitRatio: parseFloat(splitRatio),
        randomState: parseInt(randomState),
      });

      if (response.data.success) {
        onSplitSuccess(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to split data');
    } finally {
      setIsSplitting(false);
    }
  };

  if (!preprocessedData) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-header-icon split">
            <Split size={22} />
          </div>
          <div>
            <h2>Train-Test Split</h2>
            <span>Divide data for training and evaluation</span>
          </div>
        </div>
        <div className="card-content">
          <div className="status-message warning">
            <Info size={20} />
            Please preprocess your data first before splitting.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in">
      <div className="card-header">
        <div className="card-header-icon split">
          <Split size={22} />
        </div>
        <div>
          <h2>Train-Test Split</h2>
          <span>Divide data for training and evaluation</span>
        </div>
      </div>
      <div className="card-content">
        {splitData ? (
          <>
            <div className="status-message success">
              <CheckCircle size={20} />
              Data split successfully! Ready for training.
            </div>

            {/* Show warnings if any */}
            {splitData.warnings && splitData.warnings.length > 0 && (
              <div className="status-message warning" style={{ marginTop: '12px' }}>
                <AlertTriangle size={20} />
                <div>
                  {splitData.warnings.map((warning, idx) => (
                    <p key={idx} style={{ margin: idx > 0 ? '4px 0 0 0' : 0, fontSize: '0.875rem' }}>
                      {warning}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Stratification indicator */}
            {splitData.stratified !== undefined && (
              <div style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: splitData.stratified ? '#ecfdf5' : '#fef3c7',
                color: splitData.stratified ? '#059669' : '#92400e',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '500',
                marginTop: '12px'
              }}>
                {splitData.stratified ? (
                  <>
                    <CheckCircle size={14} />
                    Stratified Split
                  </>
                ) : (
                  <>
                    <Info size={14} />
                    Random Split
                  </>
                )}
              </div>
            )}

            <div className="split-info">
              <div className="split-card train">
                <h4>Training Set</h4>
                <div className="split-value">{splitData.trainSize}</div>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>
                  {Math.round(splitData.splitRatio * 100)}% of data
                </p>
              </div>
              <div className="split-card test">
                <h4>Test Set</h4>
                <div className="split-value">{splitData.testSize}</div>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>
                  {Math.round((1 - splitData.splitRatio) * 100)}% of data
                </p>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#374151', marginBottom: '12px' }}>
                Class Distribution
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#f0f9ff', padding: '12px', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>Training Set</p>
                  {Object.entries(splitData.trainDistribution).map(([key, value]) => (
                    <p key={key} style={{ fontSize: '0.875rem', margin: '2px 0' }}>
                      Class {key}: <strong>{value}</strong>
                    </p>
                  ))}
                </div>
                <div style={{ background: '#fdf2f8', padding: '12px', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>Test Set</p>
                  {Object.entries(splitData.testDistribution).map(([key, value]) => (
                    <p key={key} style={{ fontSize: '0.875rem', margin: '2px 0' }}>
                      Class {key}: <strong>{value}</strong>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {error && (
              <div className="status-message error">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {/* Show class distribution from preprocessing */}
            {preprocessedData.classDistribution && (
              <div style={{ 
                background: '#f0f9ff', 
                padding: '12px 16px', 
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <p style={{ fontSize: '0.85rem', color: '#1e40af', marginBottom: '8px', fontWeight: '500' }}>
                  📊 Class Distribution ({preprocessedData.numClasses} classes)
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {Object.entries(preprocessedData.classDistribution).map(([key, value]) => (
                    <span 
                      key={key} 
                      style={{ 
                        background: '#dbeafe', 
                        padding: '4px 10px', 
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        color: '#1e3a8a'
                      }}
                    >
                      Class {key}: {value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Split Ratio (Training Data %)</label>
              <select value={splitRatio} onChange={(e) => setSplitRatio(e.target.value)}>
                <option value={0.6}>60% Train - 40% Test</option>
                <option value={0.7}>70% Train - 30% Test</option>
                <option value={0.75}>75% Train - 25% Test</option>
                <option value={0.8}>80% Train - 20% Test</option>
                <option value={0.85}>85% Train - 15% Test</option>
                <option value={0.9}>90% Train - 10% Test</option>
              </select>
            </div>

            <div className="form-group">
              <label>Random State (for reproducibility)</label>
              <input
                type="number"
                value={randomState}
                onChange={(e) => setRandomState(e.target.value)}
                min="0"
                max="9999"
              />
            </div>

            <div style={{ 
              background: '#f0f9ff', 
              padding: '12px 16px', 
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '0.85rem',
              color: '#1e40af'
            }}>
              <strong>💡 Tips:</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                <li>80-20 split is commonly used for most datasets</li>
                <li>Use 70-30 for smaller datasets (&lt;1000 samples)</li>
                <li>Same random state ensures reproducible results</li>
              </ul>
            </div>

            <button 
              className="btn btn-success btn-block"
              onClick={handleSplit}
              disabled={isSplitting}
            >
              {isSplitting ? (
                <>
                  <span className="spinner"></span>
                  Splitting...
                </>
              ) : (
                <>
                  <Split size={18} />
                  Split Data
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TrainTestSplit;