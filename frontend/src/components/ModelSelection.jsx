

import React, { useState } from 'react';
import { Cpu, AlertCircle, Info, GitBranch, TrendingUp, TreeDeciduous, Layers, CircleDot, Users } from 'lucide-react';
import axios from 'axios';

const ModelSelection = ({ splitData, onTrainSuccess, trainingResults }) => {
  const [selectedModel, setSelectedModel] = useState('logistic_regression');
  const [isTraining, setIsTraining] = useState(false);
  const [error, setError] = useState(null);
  
  // Model parameters
  const [params, setParams] = useState({
    // Logistic Regression
    lrMaxIter: 1000,
    lrC: 1.0,
    // Decision Tree
    dtMaxDepth: '',
    dtMinSamples: 2,
    // Random Forest
    rfEstimators: 100,
    rfMaxDepth: '',
    // Gradient Boosting
    gbEstimators: 100,
    gbLearningRate: 0.1,
    // SVM
    svmC: 1.0,
    svmKernel: 'rbf',
    // KNN
    knnNeighbors: 5
  });

  const models = [
    {
      id: 'logistic_regression',
      name: 'Logistic Regression',
      description: 'Fast and interpretable linear classifier',
      icon: TrendingUp,
      color: '#3b82f6'
    },
    {
      id: 'decision_tree',
      name: 'Decision Tree',
      description: 'Easy to interpret tree-based model',
      icon: GitBranch,
      color: '#10b981'
    },
    {
      id: 'random_forest',
      name: 'Random Forest',
      description: 'Ensemble of trees, very accurate',
      icon: TreeDeciduous,
      color: '#059669'
    },
    {
      id: 'gradient_boosting',
      name: 'Gradient Boosting',
      description: 'Powerful boosted tree ensemble',
      icon: Layers,
      color: '#8b5cf6'
    },
    {
      id: 'svm',
      name: 'SVM',
      description: 'Effective for complex boundaries',
      icon: CircleDot,
      color: '#ec4899'
    },
    {
      id: 'knn',
      name: 'K-Nearest Neighbors',
      description: 'Simple distance-based classifier',
      icon: Users,
      color: '#f59e0b'
    }
  ];

  const updateParam = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleTrain = async () => {
    setError(null);
    setIsTraining(true);

    let modelParams = {};
    
    switch (selectedModel) {
      case 'logistic_regression':
        modelParams = { maxIter: parseInt(params.lrMaxIter), C: parseFloat(params.lrC) };
        break;
      case 'decision_tree':
        modelParams = { 
          maxDepth: params.dtMaxDepth ? parseInt(params.dtMaxDepth) : null, 
          minSamplesSplit: parseInt(params.dtMinSamples) 
        };
        break;
      case 'random_forest':
        modelParams = { 
          nEstimators: parseInt(params.rfEstimators),
          maxDepth: params.rfMaxDepth ? parseInt(params.rfMaxDepth) : null
        };
        break;
      case 'gradient_boosting':
        modelParams = { 
          nEstimators: parseInt(params.gbEstimators),
          learningRate: parseFloat(params.gbLearningRate)
        };
        break;
      case 'svm':
        modelParams = { 
          C: parseFloat(params.svmC),
          kernel: params.svmKernel
        };
        break;
      case 'knn':
        modelParams = { 
          nNeighbors: parseInt(params.knnNeighbors)
        };
        break;
      default:
        break;
    }

    try {
      const response = await axios.post('/api/train', {
        modelType: selectedModel,
        params: modelParams,
      });

      if (response.data.success) {
        onTrainSuccess(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Training failed. Please try again.');
    } finally {
      setIsTraining(false);
    }
  };

  const renderModelParams = () => {
    switch (selectedModel) {
      case 'logistic_regression':
        return (
          <>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.8rem' }}>Max Iterations</label>
              <input
                type="number"
                value={params.lrMaxIter}
                onChange={(e) => updateParam('lrMaxIter', e.target.value)}
                min="100"
                max="5000"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.8rem' }}>Regularization (C)</label>
              <input
                type="number"
                step="0.1"
                value={params.lrC}
                onChange={(e) => updateParam('lrC', e.target.value)}
                min="0.01"
                max="100"
              />
            </div>
          </>
        );

      case 'decision_tree':
        return (
          <>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.8rem' }}>Max Depth (empty = auto)</label>
              <input
                type="number"
                value={params.dtMaxDepth}
                onChange={(e) => updateParam('dtMaxDepth', e.target.value)}
                min="1"
                max="30"
                placeholder="Auto"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.8rem' }}>Min Samples Split</label>
              <input
                type="number"
                value={params.dtMinSamples}
                onChange={(e) => updateParam('dtMinSamples', e.target.value)}
                min="2"
                max="50"
              />
            </div>
          </>
        );

      case 'random_forest':
        return (
          <>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.8rem' }}>Number of Trees</label>
              <input
                type="number"
                value={params.rfEstimators}
                onChange={(e) => updateParam('rfEstimators', e.target.value)}
                min="10"
                max="500"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.8rem' }}>Max Depth (empty = auto)</label>
              <input
                type="number"
                value={params.rfMaxDepth}
                onChange={(e) => updateParam('rfMaxDepth', e.target.value)}
                min="1"
                max="30"
                placeholder="Auto"
              />
            </div>
          </>
        );

      case 'gradient_boosting':
        return (
          <>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.8rem' }}>Number of Estimators</label>
              <input
                type="number"
                value={params.gbEstimators}
                onChange={(e) => updateParam('gbEstimators', e.target.value)}
                min="10"
                max="500"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.8rem' }}>Learning Rate</label>
              <input
                type="number"
                step="0.01"
                value={params.gbLearningRate}
                onChange={(e) => updateParam('gbLearningRate', e.target.value)}
                min="0.01"
                max="1"
              />
            </div>
          </>
        );

      case 'svm':
        return (
          <>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.8rem' }}>Regularization (C)</label>
              <input
                type="number"
                step="0.1"
                value={params.svmC}
                onChange={(e) => updateParam('svmC', e.target.value)}
                min="0.01"
                max="100"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.8rem' }}>Kernel</label>
              <select
                value={params.svmKernel}
                onChange={(e) => updateParam('svmKernel', e.target.value)}
              >
                <option value="rbf">RBF (Radial Basis)</option>
                <option value="linear">Linear</option>
                <option value="poly">Polynomial</option>
              </select>
            </div>
          </>
        );

      case 'knn':
        return (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.8rem' }}>Number of Neighbors (K)</label>
            <input
              type="number"
              value={params.knnNeighbors}
              onChange={(e) => updateParam('knnNeighbors', e.target.value)}
              min="1"
              max="50"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const getModelTip = () => {
    switch (selectedModel) {
      case 'logistic_regression':
        return 'Great for binary classification. Fast and interpretable.';
      case 'decision_tree':
        return 'Easy to understand but may overfit. Try limiting depth.';
      case 'random_forest':
        return 'Usually gives best results. More trees = better but slower.';
      case 'gradient_boosting':
        return 'Very powerful but slower. Lower learning rate = better generalization.';
      case 'svm':
        return 'Works well with clear margins. RBF kernel is a good default.';
      case 'knn':
        return 'Simple and effective. Try odd values of K to avoid ties.';
      default:
        return '';
    }
  };

  if (!splitData) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-header-icon model">
            <Cpu size={22} />
          </div>
          <div>
            <h2>Model Selection</h2>
            <span>Choose and configure your ML model</span>
          </div>
        </div>
        <div className="card-content">
          <div className="status-message warning">
            <Info size={20} />
            <span>Please split your data first before selecting a model.</span>
          </div>
        </div>
      </div>
    );
  }

  const selectedModelInfo = models.find(m => m.id === selectedModel);

  return (
    <div className="card animate-fade-in">
      <div className="card-header">
        <div className="card-header-icon model">
          <Cpu size={22} />
        </div>
        <div>
          <h2>Model Selection</h2>
          <span>Choose and configure your ML model</span>
        </div>
      </div>
      <div className="card-content">
        {error && (
          <div className="status-message error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {trainingResults && (
          <div className="status-message success" style={{ marginBottom: '16px' }}>
            <span>✅ Model trained successfully! See results below.</span>
          </div>
        )}

        {/* Data Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ textAlign: 'center', padding: '12px', background: '#f0f9ff', borderRadius: '8px' }}>
            <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#2563eb', margin: 0 }}>
              {splitData.trainSize}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Training Samples</p>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: '#fdf4ff', borderRadius: '8px' }}>
            <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#a855f7', margin: 0 }}>
              {splitData.testSize}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Test Samples</p>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: '#f0fdf4', borderRadius: '8px' }}>
            <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#22c55e', margin: 0 }}>
              {splitData.numFeatures}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Features</p>
          </div>
        </div>

        {/* Model Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}>
          {models.map((model) => {
            const IconComponent = model.icon;
            const isSelected = selectedModel === model.id;
            return (
              <div
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                style={{
                  padding: '16px',
                  border: `2px solid ${isSelected ? model.color : '#e5e7eb'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: isSelected ? `${model.color}10` : 'white',
                  textAlign: 'center'
                }}
              >
                <IconComponent 
                  size={32} 
                  style={{ 
                    color: isSelected ? model.color : '#9ca3af',
                    marginBottom: '8px'
                  }} 
                />
                <h4 style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: '600', 
                  color: isSelected ? model.color : '#374151',
                  marginBottom: '4px'
                }}>
                  {model.name}
                </h4>
                <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: 0 }}>
                  {model.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Model Parameters */}
        <div style={{
          background: '#f9fafb',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <h4 style={{ 
            fontSize: '0.9rem', 
            fontWeight: '600', 
            color: '#374151', 
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ⚙️ {selectedModelInfo?.name} Parameters
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {renderModelParams()}
          </div>
        </div>

        {/* Model Tips */}
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '0.85rem',
          color: '#92400e'
        }}>
          <strong>💡 Tip:</strong> {getModelTip()}
        </div>

        <button 
          className="btn btn-primary btn-block"
          onClick={handleTrain}
          disabled={isTraining}
          style={{
            background: isTraining ? '#9ca3af' : `linear-gradient(135deg, ${selectedModelInfo?.color || '#667eea'}, #764ba2)`,
            fontSize: '1rem',
            padding: '14px 24px'
          }}
        >
          {isTraining ? (
            <>
              <span className="spinner"></span>
              Training {selectedModelInfo?.name}...
            </>
          ) : (
            <>
              <Cpu size={20} />
              Train {selectedModelInfo?.name}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ModelSelection;