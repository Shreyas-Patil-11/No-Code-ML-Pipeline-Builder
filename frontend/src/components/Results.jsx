

import React, { useState } from 'react';
import { 
  BarChart, Info, CheckCircle, Award, Target, Zap, TrendingUp, 
  Eye, Activity, PieChart, Layers, ArrowUpRight, ArrowDownRight,
  AlertTriangle, BookOpen
} from 'lucide-react';

const Results = ({ trainingResults }) => {
  const [activeViz, setActiveViz] = useState('confusion');

  if (!trainingResults) {
    return (
      <div className="card full-width">
        <div className="card-header">
          <div className="card-header-icon results">
            <BarChart size={22} />
          </div>
          <div>
            <h2>Training Results</h2>
            <span>View model performance metrics and visualizations</span>
          </div>
        </div>
        <div className="card-content">
          <div className="status-message info">
            <Info size={20} />
            <span>Train a model to see results and performance metrics here.</span>
          </div>
        </div>
      </div>
    );
  }

  const { 
    metrics, 
    confusionMatrixImage, 
    featureImportanceImage, 
    coefficientsImage, 
    modelType,
    modelDisplayName,
    numClasses,
    trainSamples,
    testSamples,
    numFeatures,
    classLabels,
    featureImportance,
    coefficients
  } = trainingResults;

  const getAccuracyStatus = (accuracy) => {
    if (accuracy >= 0.9) return { label: 'Excellent', color: '#059669', bg: '#ecfdf5', icon: '🏆' };
    if (accuracy >= 0.8) return { label: 'Good', color: '#2563eb', bg: '#eff6ff', icon: '👍' };
    if (accuracy >= 0.7) return { label: 'Fair', color: '#d97706', bg: '#fffbeb', icon: '📊' };
    return { label: 'Needs Work', color: '#dc2626', bg: '#fef2f2', icon: '🔧' };
  };

  const getScoreStatus = (score) => {
    if (score >= 0.9) return { color: '#059669', bg: '#ecfdf5', label: 'Excellent' };
    if (score >= 0.8) return { color: '#2563eb', bg: '#eff6ff', label: 'Good' };
    if (score >= 0.7) return { color: '#d97706', bg: '#fffbeb', label: 'Fair' };
    if (score >= 0.5) return { color: '#ea580c', bg: '#fff7ed', label: 'Moderate' };
    return { color: '#dc2626', bg: '#fef2f2', label: 'Low' };
  };

  const accuracyStatus = getAccuracyStatus(metrics.testAccuracy);
  const overfitDiff = metrics.trainAccuracy - metrics.testAccuracy;
  const isOverfitting = overfitDiff > 0.1;
  const isUnderfitting = metrics.trainAccuracy < 0.6;

  const formatPercent = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="card full-width animate-fade-in">
      {/* Header */}
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div className="card-header-icon results">
          <BarChart size={22} />
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h2>Training Results</h2>
          <span>{modelDisplayName || modelType}</span>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          padding: '8px 16px',
          background: accuracyStatus.bg, 
          color: accuracyStatus.color,
          borderRadius: '24px',
          fontWeight: '600',
          fontSize: '0.9rem'
        }}>
          <span>{accuracyStatus.icon}</span>
          <span>{accuracyStatus.label}</span>
        </div>
      </div>
      
      <div className="card-content" style={{ padding: '24px' }}>
        {/* Success Message */}
        <div className="status-message success" style={{ marginBottom: '24px' }}>
          <CheckCircle size={20} />
          <div>
            <strong>Model trained successfully!</strong>
            <span style={{ marginLeft: '8px', opacity: 0.9 }}>
              Achieved {formatPercent(metrics.testAccuracy)} test accuracy
            </span>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #667eea15, #764ba215)',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid #667eea30'
          }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#667eea', margin: 0 }}>
              {trainSamples}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '4px 0 0 0' }}>Train Samples</p>
          </div>
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #8b5cf615, #a855f715)',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid #8b5cf630'
          }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8b5cf6', margin: 0 }}>
              {testSamples}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '4px 0 0 0' }}>Test Samples</p>
          </div>
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #10b98115, #05966915)',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid #10b98130'
          }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981', margin: 0 }}>
              {numFeatures}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '4px 0 0 0' }}>Features</p>
          </div>
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #f59e0b15, #d9770615)',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid #f59e0b30'
          }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b', margin: 0 }}>
              {numClasses}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '4px 0 0 0' }}>Classes</p>
          </div>
        </div>

        {/* Main Accuracy Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {/* Test Accuracy */}
          <div style={{
            background: 'linear-gradient(135deg, #059669, #10b981)',
            borderRadius: '16px',
            padding: '24px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '100px',
              height: '100px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%'
            }}></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Target size={20} />
                <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>Test Accuracy</span>
              </div>
              <div style={{ fontSize: '3rem', fontWeight: '700', lineHeight: 1 }}>
                {formatPercent(metrics.testAccuracy)}
              </div>
              <div style={{ marginTop: '12px', fontSize: '0.85rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
                {metrics.testAccuracy >= metrics.trainAccuracy ? (
                  <><ArrowUpRight size={16} /> Good generalization</>
                ) : (
                  <><ArrowDownRight size={16} /> {overfitDiff > 0.1 ? 'Some overfitting' : 'Slight variance'}</>
                )}
              </div>
            </div>
          </div>

          {/* Train Accuracy */}
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
            borderRadius: '16px',
            padding: '24px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '100px',
              height: '100px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%'
            }}></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <TrendingUp size={20} />
                <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>Train Accuracy</span>
              </div>
              <div style={{ fontSize: '3rem', fontWeight: '700', lineHeight: 1 }}>
                {formatPercent(metrics.trainAccuracy)}
              </div>
              <div style={{ marginTop: '12px', fontSize: '0.85rem', opacity: 0.9 }}>
                Model fit on training data
              </div>
            </div>
          </div>
        </div>

        {/* All Metrics Section Title */}
        <h3 style={{ 
          fontSize: '1.1rem', 
          fontWeight: '600', 
          color: '#1f2937', 
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Activity size={20} />
          Detailed Performance Metrics
        </h3>

        {/* Metrics Cards with Scores */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Test Accuracy Card */}
          <div style={{
            background: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '16px',
            padding: '20px',
            borderLeft: '5px solid #10b981',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: '#10b98115',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Target size={22} style={{ color: '#10b981' }} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>Test Accuracy</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Overall correctness</p>
                </div>
              </div>
              <span style={{
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: '600',
                background: getScoreStatus(metrics.testAccuracy).bg,
                color: getScoreStatus(metrics.testAccuracy).color
              }}>
                {getScoreStatus(metrics.testAccuracy).label}
              </span>
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: '700', color: '#10b981', marginBottom: '8px' }}>
              {formatPercent(metrics.testAccuracy)}
            </div>
            <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(metrics.testAccuracy || 0) * 100}%`,
                background: 'linear-gradient(90deg, #10b981, #34d399)',
                borderRadius: '4px',
                transition: 'width 0.8s ease'
              }}></div>
            </div>
          </div>

          {/* Train Accuracy Card */}
          <div style={{
            background: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '16px',
            padding: '20px',
            borderLeft: '5px solid #3b82f6',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: '#3b82f615',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TrendingUp size={22} style={{ color: '#3b82f6' }} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>Train Accuracy</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Fit on training data</p>
                </div>
              </div>
              <span style={{
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: '600',
                background: getScoreStatus(metrics.trainAccuracy).bg,
                color: getScoreStatus(metrics.trainAccuracy).color
              }}>
                {getScoreStatus(metrics.trainAccuracy).label}
              </span>
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: '700', color: '#3b82f6', marginBottom: '8px' }}>
              {formatPercent(metrics.trainAccuracy)}
            </div>
            <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(metrics.trainAccuracy || 0) * 100}%`,
                background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                borderRadius: '4px',
                transition: 'width 0.8s ease'
              }}></div>
            </div>
          </div>

          {/* Precision Card */}
          <div style={{
            background: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '16px',
            padding: '20px',
            borderLeft: '5px solid #8b5cf6',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: '#8b5cf615',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Award size={22} style={{ color: '#8b5cf6' }} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>Precision</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Positive predictions correct</p>
                </div>
              </div>
              <span style={{
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: '600',
                background: getScoreStatus(metrics.precision).bg,
                color: getScoreStatus(metrics.precision).color
              }}>
                {getScoreStatus(metrics.precision).label}
              </span>
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: '700', color: '#8b5cf6', marginBottom: '8px' }}>
              {formatPercent(metrics.precision)}
            </div>
            <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(metrics.precision || 0) * 100}%`,
                background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
                borderRadius: '4px',
                transition: 'width 0.8s ease'
              }}></div>
            </div>
          </div>

          {/* Recall Card */}
          <div style={{
            background: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '16px',
            padding: '20px',
            borderLeft: '5px solid #f59e0b',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: '#f59e0b15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Eye size={22} style={{ color: '#f59e0b' }} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>Recall</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Actual positives found</p>
                </div>
              </div>
              <span style={{
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: '600',
                background: getScoreStatus(metrics.recall).bg,
                color: getScoreStatus(metrics.recall).color
              }}>
                {getScoreStatus(metrics.recall).label}
              </span>
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: '700', color: '#f59e0b', marginBottom: '8px' }}>
              {formatPercent(metrics.recall)}
            </div>
            <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(metrics.recall || 0) * 100}%`,
                background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                borderRadius: '4px',
                transition: 'width 0.8s ease'
              }}></div>
            </div>
          </div>

          {/* F1 Score Card */}
          <div style={{
            background: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '16px',
            padding: '20px',
            borderLeft: '5px solid #ec4899',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: '#ec489915',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Zap size={22} style={{ color: '#ec4899' }} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>F1 Score</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Precision & Recall balance</p>
                </div>
              </div>
              <span style={{
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: '600',
                background: getScoreStatus(metrics.f1Score).bg,
                color: getScoreStatus(metrics.f1Score).color
              }}>
                {getScoreStatus(metrics.f1Score).label}
              </span>
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: '700', color: '#ec4899', marginBottom: '8px' }}>
              {formatPercent(metrics.f1Score)}
            </div>
            <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(metrics.f1Score || 0) * 100}%`,
                background: 'linear-gradient(90deg, #ec4899, #f472b6)',
                borderRadius: '4px',
                transition: 'width 0.8s ease'
              }}></div>
            </div>
          </div>

          {/* Cross-Validation Card */}
          {metrics.cvMean !== null && metrics.cvMean !== undefined && (
            <div style={{
              background: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '16px',
              padding: '20px',
              borderLeft: '5px solid #06b6d4',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: '#06b6d415',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Layers size={22} style={{ color: '#06b6d4' }} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>CV Score</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Cross-validation mean</p>
                  </div>
                </div>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  background: getScoreStatus(metrics.cvMean).bg,
                  color: getScoreStatus(metrics.cvMean).color
                }}>
                  {getScoreStatus(metrics.cvMean).label}
                </span>
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: '700', color: '#06b6d4', marginBottom: '4px' }}>
                {formatPercent(metrics.cvMean)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                ± {metrics.cvStd ? (metrics.cvStd * 100).toFixed(1) : 0}% standard deviation
              </div>
              <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden', marginTop: '8px' }}>
                <div style={{
                  height: '100%',
                  width: `${(metrics.cvMean || 0) * 100}%`,
                  background: 'linear-gradient(90deg, #06b6d4, #22d3ee)',
                  borderRadius: '4px',
                  transition: 'width 0.8s ease'
                }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Metrics Comparison Bar Chart */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h4 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            color: '#374151', 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <BarChart size={18} />
            Metrics Comparison Chart
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Test Accuracy', value: metrics.testAccuracy, color: '#10b981', icon: '🎯' },
              { label: 'Train Accuracy', value: metrics.trainAccuracy, color: '#3b82f6', icon: '📈' },
              { label: 'Precision', value: metrics.precision, color: '#8b5cf6', icon: '🏆' },
              { label: 'Recall', value: metrics.recall, color: '#f59e0b', icon: '👁️' },
              { label: 'F1 Score', value: metrics.f1Score, color: '#ec4899', icon: '⚡' }
            ].map((metric, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.1rem' }}>{metric.icon}</span>
                <span style={{ 
                  width: '110px', 
                  fontSize: '0.85rem', 
                  color: '#374151',
                  fontWeight: '500'
                }}>
                  {metric.label}
                </span>
                <div style={{ 
                  flex: 1, 
                  height: '32px', 
                  background: '#e5e7eb', 
                  borderRadius: '8px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(metric.value || 0) * 100}%`,
                    background: `linear-gradient(90deg, ${metric.color}, ${metric.color}aa)`,
                    borderRadius: '8px',
                    transition: 'width 0.8s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '10px',
                    minWidth: '60px'
                  }}>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      fontWeight: '700', 
                      color: 'white',
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}>
                      {formatPercent(metric.value)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warnings */}
        {(isOverfitting || isUnderfitting) && (
          <div style={{
            background: isOverfitting ? '#fef3c7' : '#fee2e2',
            border: `1px solid ${isOverfitting ? '#fde68a' : '#fecaca'}`,
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px'
          }}>
            <AlertTriangle size={24} style={{ color: isOverfitting ? '#d97706' : '#dc2626', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: isOverfitting ? '#92400e' : '#991b1b' }}>
                {isOverfitting ? '⚠️ Possible Overfitting Detected' : '📉 Model May Be Underfitting'}
              </h4>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: isOverfitting ? '#a16207' : '#b91c1c', lineHeight: 1.5 }}>
                {isOverfitting 
                  ? `Training accuracy (${formatPercent(metrics.trainAccuracy)}) is significantly higher than test accuracy (${formatPercent(metrics.testAccuracy)}). Consider reducing model complexity, adding regularization, or getting more training data.`
                  : `Training accuracy is low (${formatPercent(metrics.trainAccuracy)}). Consider using a more complex model, adding more features, or checking data quality.`
                }
              </p>
            </div>
          </div>
        )}

        {/* Metrics Explanation with Scores */}
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid #e0e7ff'
        }}>
          <h4 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            color: '#374151', 
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <BookOpen size={18} />
            Understanding Your Metrics (with Scores)
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {/* Accuracy Explanation */}
            <div style={{ 
              background: 'white', 
              padding: '16px', 
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={18} style={{ color: '#10b981' }} />
                  <strong style={{ color: '#10b981', fontSize: '0.95rem' }}>Accuracy</strong>
                </div>
                <span style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: '700', 
                  color: '#10b981',
                  background: '#10b98115',
                  padding: '4px 12px',
                  borderRadius: '8px'
                }}>
                  {formatPercent(metrics.testAccuracy)}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.5 }}>
                Overall correctness of predictions. {formatPercent(metrics.testAccuracy)} of all predictions were correct.
              </p>
            </div>

            {/* Precision Explanation */}
            <div style={{ 
              background: 'white', 
              padding: '16px', 
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} style={{ color: '#8b5cf6' }} />
                  <strong style={{ color: '#8b5cf6', fontSize: '0.95rem' }}>Precision</strong>
                </div>
                <span style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: '700', 
                  color: '#8b5cf6',
                  background: '#8b5cf615',
                  padding: '4px 12px',
                  borderRadius: '8px'
                }}>
                  {formatPercent(metrics.precision)}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.5 }}>
                How many positive predictions were actually correct. {formatPercent(metrics.precision)} of positive predictions were right.
              </p>
            </div>

            {/* Recall Explanation */}
            <div style={{ 
              background: 'white', 
              padding: '16px', 
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Eye size={18} style={{ color: '#f59e0b' }} />
                  <strong style={{ color: '#f59e0b', fontSize: '0.95rem' }}>Recall</strong>
                </div>
                <span style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: '700', 
                  color: '#f59e0b',
                  background: '#f59e0b15',
                  padding: '4px 12px',
                  borderRadius: '8px'
                }}>
                  {formatPercent(metrics.recall)}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.5 }}>
                How many actual positives were correctly identified. Found {formatPercent(metrics.recall)} of all positive cases.
              </p>
            </div>

            {/* F1 Score Explanation */}
            <div style={{ 
              background: 'white', 
              padding: '16px', 
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={18} style={{ color: '#ec4899' }} />
                  <strong style={{ color: '#ec4899', fontSize: '0.95rem' }}>F1 Score</strong>
                </div>
                <span style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: '700', 
                  color: '#ec4899',
                  background: '#ec489915',
                  padding: '4px 12px',
                  borderRadius: '8px'
                }}>
                  {formatPercent(metrics.f1Score)}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.5 }}>
                Harmonic mean of precision and recall. A balanced score of {formatPercent(metrics.f1Score)} considering both metrics.
              </p>
            </div>
          </div>
        </div>

        {/* Visualizations Section */}
        <h3 style={{ 
          fontSize: '1.1rem', 
          fontWeight: '600', 
          color: '#1f2937', 
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <PieChart size={20} />
          Visualizations
        </h3>

        {/* Visualization Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '6px',
          background: '#f3f4f6',
          borderRadius: '14px',
          marginBottom: '16px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setActiveViz('confusion')}
            style={{
              flex: 1,
              minWidth: '140px',
              padding: '14px 18px',
              border: 'none',
              borderRadius: '10px',
              background: activeViz === 'confusion' ? 'white' : 'transparent',
              boxShadow: activeViz === 'confusion' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              color: activeViz === 'confusion' ? '#4f46e5' : '#6b7280',
              fontWeight: activeViz === 'confusion' ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.9rem'
            }}
          >
            <span>📊</span>
            Confusion Matrix
          </button>
          
          {featureImportanceImage && (
            <button
              onClick={() => setActiveViz('importance')}
              style={{
                flex: 1,
                minWidth: '140px',
                padding: '14px 18px',
                border: 'none',
                borderRadius: '10px',
                background: activeViz === 'importance' ? 'white' : 'transparent',
                boxShadow: activeViz === 'importance' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                color: activeViz === 'importance' ? '#4f46e5' : '#6b7280',
                fontWeight: activeViz === 'importance' ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.9rem'
              }}
            >
              <span>📈</span>
              Feature Importance
            </button>
          )}
          
          {coefficientsImage && (
            <button
              onClick={() => setActiveViz('coefficients')}
              style={{
                flex: 1,
                minWidth: '140px',
                padding: '14px 18px',
                border: 'none',
                borderRadius: '10px',
                background: activeViz === 'coefficients' ? 'white' : 'transparent',
                boxShadow: activeViz === 'coefficients' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                color: activeViz === 'coefficients' ? '#4f46e5' : '#6b7280',
                fontWeight: activeViz === 'coefficients' ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.9rem'
              }}
            >
              <span>📉</span>
              Coefficients
            </button>
          )}
        </div>

        {/* Visualization Content */}
        <div style={{
          background: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          {activeViz === 'confusion' && (
            <div style={{ padding: '24px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: confusionMatrixImage ? 'minmax(300px, 1.2fr) 1fr' : '1fr',
                gap: '24px',
                alignItems: 'start'
              }}>
                {confusionMatrixImage && (
                  <div style={{
                    background: '#f9fafb',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <img 
                      src={`data:image/png;base64,${confusionMatrixImage}`}
                      alt="Confusion Matrix"
                      style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                    />
                  </div>
                )}
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                    📊 What is a Confusion Matrix?
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.6, marginBottom: '16px' }}>
                    The confusion matrix shows how many predictions were correct or incorrect for each class.
                  </p>
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', marginBottom: '16px' }}>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#6b7280' }}>
                      <li style={{ marginBottom: '8px' }}>
                        <strong style={{ color: '#059669' }}>Diagonal cells:</strong> Correct predictions ✅
                      </li>
                      <li style={{ marginBottom: '8px' }}>
                        <strong style={{ color: '#dc2626' }}>Off-diagonal cells:</strong> Misclassifications ❌
                      </li>
                      <li>
                        <strong>Rows:</strong> Actual classes | <strong>Columns:</strong> Predicted
                      </li>
                    </ul>
                  </div>
                  
                  {classLabels && classLabels.length > 0 && (
                    <div>
                      <h5 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
                        🏷️ Class Labels:
                      </h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {classLabels.map((label, idx) => (
                          <span key={idx} style={{
                            padding: '6px 14px',
                            background: '#e0e7ff',
                            color: '#3730a3',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: '500'
                          }}>
                            {idx}: {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeViz === 'importance' && featureImportanceImage && (
            <div style={{ padding: '24px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(300px, 1.2fr) 1fr',
                gap: '24px',
                alignItems: 'start'
              }}>
                <div style={{
                  background: '#f9fafb',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={`data:image/png;base64,${featureImportanceImage}`}
                    alt="Feature Importance"
                    style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                    📈 Feature Importance
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.6, marginBottom: '16px' }}>
                    Shows which features have the most impact on predictions.
                  </p>
                  
                  {featureImportance && (
                    <div>
                      <h5 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
                        🔝 Top Features:
                      </h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {Object.entries(featureImportance)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 5)
                          .map(([name, value], idx) => (
                            <div key={idx} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '10px 14px',
                              background: idx === 0 ? '#ecfdf5' : '#f3f4f6',
                              borderRadius: '8px',
                              border: idx === 0 ? '1px solid #a7f3d0' : 'none'
                            }}>
                              <span style={{ 
                                color: '#374151', 
                                fontWeight: idx === 0 ? '600' : '500',
                                fontSize: '0.9rem'
                              }}>
                                {idx === 0 && '🥇 '}{name}
                              </span>
                              <span style={{ 
                                color: '#059669', 
                                fontWeight: '700',
                                fontSize: '0.9rem'
                              }}>
                                {(value * 100).toFixed(1)}%
                              </span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeViz === 'coefficients' && coefficientsImage && (
            <div style={{ padding: '24px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(300px, 1.2fr) 1fr',
                gap: '24px',
                alignItems: 'start'
              }}>
                <div style={{
                  background: '#f9fafb',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={`data:image/png;base64,${coefficientsImage}`}
                    alt="Coefficients"
                    style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                  />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                    📉 Model Coefficients
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.6, marginBottom: '16px' }}>
                    Coefficients show direction and strength of each feature's influence.
                  </p>
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', marginBottom: '16px' }}>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#6b7280' }}>
                      <li style={{ marginBottom: '8px' }}>
                        <span style={{ color: '#22c55e', fontWeight: '600' }}>🟢 Positive:</span> Increases prediction
                      </li>
                      <li style={{ marginBottom: '8px' }}>
                        <span style={{ color: '#ef4444', fontWeight: '600' }}>🔴 Negative:</span> Decreases prediction
                      </li>
                      <li>
                        <strong>Magnitude:</strong> Strength of effect
                      </li>
                    </ul>
                  </div>
                  
                  {coefficients && (
                    <div>
                      <h5 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
                        📊 Top Coefficients:
                      </h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                        {Object.entries(coefficients)
                          .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
                          .slice(0, 5)
                          .map(([name, value], idx) => (
                            <div key={idx} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '10px 14px',
                              background: value >= 0 ? '#f0fdf4' : '#fef2f2',
                              borderRadius: '8px',
                              border: `1px solid ${value >= 0 ? '#bbf7d0' : '#fecaca'}`
                            }}>
                              <span style={{ color: '#374151', fontWeight: '500', fontSize: '0.9rem' }}>
                                {name}
                              </span>
                              <span style={{ 
                                color: value >= 0 ? '#16a34a' : '#dc2626', 
                                fontWeight: '700',
                                fontSize: '0.9rem'
                              }}>
                                {value >= 0 ? '+' : ''}{value.toFixed(3)}
                              </span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Final Summary */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b, #334155)',
          borderRadius: '20px',
          padding: '28px',
          marginTop: '28px',
          color: 'white'
        }}>
          <h4 style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600', 
            marginBottom: '20px', 
            opacity: 0.95,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📋 Model Summary
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '20px'
          }}>
            <div>
              <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.6, margin: 0 }}>
                Model Type
              </p>
              <p style={{ fontSize: '1.05rem', fontWeight: '600', margin: '6px 0 0 0' }}>
                {modelDisplayName || modelType}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.6, margin: 0 }}>
                Test Accuracy
              </p>
              <p style={{ fontSize: '1.05rem', fontWeight: '700', margin: '6px 0 0 0', color: '#4ade80' }}>
                {formatPercent(metrics.testAccuracy)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.6, margin: 0 }}>
                Precision
              </p>
              <p style={{ fontSize: '1.05rem', fontWeight: '700', margin: '6px 0 0 0', color: '#a78bfa' }}>
                {formatPercent(metrics.precision)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.6, margin: 0 }}>
                Recall
              </p>
              <p style={{ fontSize: '1.05rem', fontWeight: '700', margin: '6px 0 0 0', color: '#fbbf24' }}>
                {formatPercent(metrics.recall)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.6, margin: 0 }}>
                F1 Score
              </p>
              <p style={{ fontSize: '1.05rem', fontWeight: '700', margin: '6px 0 0 0', color: '#f472b6' }}>
                {formatPercent(metrics.f1Score)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.6, margin: 0 }}>
                Status
              </p>
              <p style={{ fontSize: '1.05rem', fontWeight: '600', margin: '6px 0 0 0' }}>
                {accuracyStatus.icon} {accuracyStatus.label}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;