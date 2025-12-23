

import React, { useState, useEffect } from 'react';
import { Settings, AlertCircle, CheckCircle, Info, Wand2, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

const Preprocessing = ({ uploadedData, onPreprocessSuccess, preprocessedData }) => {
  const [scalingMethod, setScalingMethod] = useState('standard');
  const [handleMissing, setHandleMissing] = useState('auto');
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [targetColumn, setTargetColumn] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoSelect, setAutoSelect] = useState(true);

  useEffect(() => {
    if (uploadedData && uploadedData.columnInfo) {
      const columns = uploadedData.columnInfo;
      let defaultTarget = '';
      
      const targetKeywords = ['target', 'label', 'class', 'y', 'output', 'result', 'species', 'category'];
      for (const keyword of targetKeywords) {
        const match = columns.find(c => c.name.toLowerCase().includes(keyword));
        if (match) {
          defaultTarget = match.name;
          break;
        }
      }
      
      if (!defaultTarget && columns.length > 0) {
        defaultTarget = columns[columns.length - 1].name;
      }
      
      setTargetColumn(defaultTarget);
      
      if (autoSelect) {
        const numericFeatures = columns
          .filter(c => c.isNumeric && c.name !== defaultTarget)
          .map(c => c.name);
        setSelectedFeatures(numericFeatures);
      }
    }
  }, [uploadedData, autoSelect]);

  const allColumns = uploadedData?.columnInfo || [];
  const numericColumns = allColumns.filter(col => col.isNumeric || col.type === 'categorical');

  const handleFeatureToggle = (columnName) => {
    setAutoSelect(false);
    setSelectedFeatures(prev => 
      prev.includes(columnName)
        ? prev.filter(c => c !== columnName)
        : [...prev, columnName]
    );
  };

  const selectAllUsable = () => {
    setAutoSelect(false);
    const usableCols = allColumns
      .filter(c => c.isUsable && c.name !== targetColumn)
      .map(c => c.name);
    setSelectedFeatures(usableCols);
  };

  const clearSelection = () => {
    setAutoSelect(false);
    setSelectedFeatures([]);
  };

  const handlePreprocess = async () => {
    setError(null);
    setIsProcessing(true);

    try {
      const response = await axios.post('/api/preprocess', {
        scalingMethod,
        handleMissing,
        selectedFeatures: autoSelect ? [] : selectedFeatures,
        targetColumn,
        autoSelect
      });

      if (response.data.success) {
        onPreprocessSuccess(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Preprocessing failed. Please check your data and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!uploadedData) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-header-icon preprocess">
            <Settings size={22} />
          </div>
          <div>
            <h2>Data Preprocessing</h2>
            <span>Configure data transformations</span>
          </div>
        </div>
        <div className="card-content">
          <div className="status-message warning">
            <Info size={20} />
            Please upload a dataset first to configure preprocessing options.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in">
      <div className="card-header">
        <div className="card-header-icon preprocess">
          <Settings size={22} />
        </div>
        <div>
          <h2>Data Preprocessing</h2>
          <span>Configure data transformations</span>
        </div>
      </div>
      <div className="card-content">
        {preprocessedData ? (
          <>
            <div className="status-message success">
              <CheckCircle size={20} />
              <span>Data preprocessed successfully!</span>
            </div>

            <div className="dataset-info">
              <div className="info-card rows">
                <h4>Rows</h4>
                <p>{preprocessedData.rowsAfterProcessing}</p>
                {preprocessedData.rowsRemoved > 0 && (
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    ({preprocessedData.rowsRemoved} removed)
                  </span>
                )}
              </div>
              <div className="info-card columns">
                <h4>Features</h4>
                <p>{preprocessedData.featuresCount}</p>
              </div>
              <div className="info-card file">
                <h4>Classes</h4>
                <p>{preprocessedData.numClasses}</p>
              </div>
            </div>

            {/* Scaling badge */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
              <span style={{
                padding: '6px 12px',
                background: '#e0e7ff',
                color: '#3730a3',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '500'
              }}>
                Scaling: {preprocessedData.scalingMethod === 'standard' ? 'Standard' : 
                         preprocessedData.scalingMethod === 'minmax' ? 'MinMax' : 
                         preprocessedData.scalingMethod === 'robust' ? 'Robust' : 'None'}
              </span>
              <span style={{
                padding: '6px 12px',
                background: preprocessedData.isBalanced ? '#d1fae5' : '#fef3c7',
                color: preprocessedData.isBalanced ? '#065f46' : '#92400e',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '500'
              }}>
                {preprocessedData.isBalanced ? 'Balanced Classes' : 'Imbalanced Classes'}
              </span>
            </div>

            {/* Class Distribution */}
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#374151', marginBottom: '12px' }}>
                Class Distribution
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Object.entries(preprocessedData.classDistribution).map(([key, value]) => (
                  <div key={key} style={{
                    padding: '8px 14px',
                    background: '#f3f4f6',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                  }}>
                    <span style={{ color: '#6b7280' }}>
                      {preprocessedData.classLabels?.[key] || `Class ${key}`}:
                    </span>
                    <strong style={{ marginLeft: '6px', color: '#1f2937' }}>{value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#374151', marginBottom: '8px' }}>
                Features Used ({preprocessedData.featuresUsed.length})
              </h4>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                maxHeight: '100px',
                overflowY: 'auto',
                padding: '8px',
                background: '#f9fafb',
                borderRadius: '8px'
              }}>
                {preprocessedData.featuresUsed.map((feature, idx) => (
                  <span key={idx} style={{
                    padding: '4px 10px',
                    background: '#e5e7eb',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    color: '#374151'
                  }}>
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {error && (
              <div className="status-message error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {/* Data Quality Summary */}
            {uploadedData.dataQuality && (
              <div style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '20px',
                border: '1px solid #e0e7ff'
              }}>
                <h4 style={{ fontSize: '0.9rem', color: '#374151', marginBottom: '10px' }}>
                  📊 Data Quality Summary
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#059669' }}>
                      {uploadedData.dataQuality.completeness}%
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Complete</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#2563eb' }}>
                      {uploadedData.dataQuality.numericColumns}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Numeric</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#7c3aed' }}>
                      {uploadedData.dataQuality.usableColumns}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Usable</p>
                  </div>
                </div>
              </div>
            )}

            {/* Target Column Selection */}
            <div className="form-group">
              <label>
                🎯 Target Column
                <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 'normal', marginLeft: '8px' }}>
                  (What you want to predict)
                </span>
              </label>
              <select 
                value={targetColumn} 
                onChange={(e) => {
                  setTargetColumn(e.target.value);
                  if (autoSelect) {
                    const numericFeatures = allColumns
                      .filter(c => c.isNumeric && c.name !== e.target.value)
                      .map(c => c.name);
                    setSelectedFeatures(numericFeatures);
                  } else {
                    setSelectedFeatures(prev => prev.filter(f => f !== e.target.value));
                  }
                }}
              >
                <option value="">Select target column...</option>
                {allColumns.map(col => (
                  <option key={col.name} value={col.name}>
                    {col.name} ({col.type} - {col.uniqueCount} unique values)
                  </option>
                ))}
              </select>
            </div>

            {/* Auto-select toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: autoSelect ? '#ecfdf5' : '#f3f4f6',
              borderRadius: '10px',
              marginBottom: '16px',
              cursor: 'pointer',
              border: autoSelect ? '1px solid #a7f3d0' : '1px solid #e5e7eb'
            }} onClick={() => setAutoSelect(!autoSelect)}>
              <Wand2 size={20} style={{ color: autoSelect ? '#059669' : '#6b7280' }} />
              <div>
                <p style={{ fontWeight: '500', color: autoSelect ? '#065f46' : '#374151', margin: 0 }}>
                  Auto-select Features
                </p>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>
                  Automatically select all suitable numeric columns
                </p>
              </div>
              <input 
                type="checkbox" 
                checked={autoSelect}
                onChange={(e) => setAutoSelect(e.target.checked)}
                style={{ marginLeft: 'auto', width: '20px', height: '20px', accentColor: '#059669' }}
              />
            </div>

            {/* Manual Feature Selection (if not auto) */}
            {!autoSelect && (
              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>📋 Feature Columns ({selectedFeatures.length} selected)</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={selectAllUsable}
                      style={{ 
                        fontSize: '0.75rem',
                        padding: '4px 10px',
                        background: '#e0e7ff',
                        color: '#3730a3',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Select All
                    </button>
                    <button 
                      onClick={clearSelection}
                      style={{ 
                        fontSize: '0.75rem',
                        padding: '4px 10px',
                        background: '#fee2e2',
                        color: '#991b1b',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </label>
                <div className="checkbox-group">
                  {allColumns.filter(col => col.name !== targetColumn).map(col => (
                    <label 
                      key={col.name} 
                      className="checkbox-item"
                      style={{ opacity: col.isUsable ? 1 : 0.5 }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFeatures.includes(col.name)}
                        onChange={() => handleFeatureToggle(col.name)}
                      />
                      <div>
                        <span>{col.name}</span>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          color: '#9ca3af',
                          display: 'block'
                        }}>
                          {col.type}
                          {col.nullCount > 0 && ` • ${col.nullPercent}% null`}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Options Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '12px',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: '#374151',
                marginBottom: '16px'
              }}
            >
              {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              Advanced Options
            </button>

            {showAdvanced && (
              <div style={{
                background: '#f9fafb',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label>Scaling Method</label>
                  <select value={scalingMethod} onChange={(e) => setScalingMethod(e.target.value)}>
                    <option value="standard">Standard Scaler (Z-score normalization)</option>
                    <option value="minmax">MinMax Scaler (0-1 range)</option>
                    <option value="robust">Robust Scaler (handles outliers)</option>
                    <option value="none">No Scaling</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Handle Missing Values</label>
                  <select value={handleMissing} onChange={(e) => setHandleMissing(e.target.value)}>
                    <option value="auto">Auto (Smart handling)</option>
                    <option value="mean">Fill with Mean</option>
                    <option value="median">Fill with Median</option>
                    <option value="mode">Fill with Mode</option>
                    <option value="zero">Fill with Zero</option>
                    <option value="drop">Drop rows with missing values</option>
                  </select>
                </div>
              </div>
            )}

            <button 
              className="btn btn-primary btn-block"
              onClick={handlePreprocess}
              disabled={isProcessing || !targetColumn}
            >
              {isProcessing ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                <>
                  <Settings size={18} />
                  Apply Preprocessing
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Preprocessing;