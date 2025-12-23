// import React, { useState, useRef } from 'react';
// import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
// import axios from 'axios';

// const FileUpload = ({ onUploadSuccess, uploadedData }) => {
//   const [isDragging, setIsDragging] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const [error, setError] = useState(null);
//   const [activeTab, setActiveTab] = useState('info');
//   const fileInputRef = useRef(null);

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const handleDragLeave = (e) => {
//     e.preventDefault();
//     setIsDragging(false);
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const files = e.dataTransfer.files;
//     if (files.length > 0) {
//       handleFile(files[0]);
//     }
//   };

//   const handleFileSelect = (e) => {
//     const files = e.target.files;
//     if (files.length > 0) {
//       handleFile(files[0]);
//     }
//   };

//   const handleFile = async (file) => {
//     setError(null);
//     setIsUploading(true);

//     const formData = new FormData();
//     formData.append('file', file);

//     try {
//       const response = await axios.post('/api/upload', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       if (response.data.success) {
//         onUploadSuccess(response.data);
//       }
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to upload file');
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   return (
//     <div className="card animate-fade-in">
//       <div className="card-header">
//         <div className="card-header-icon upload">
//           <Upload size={22} />
//         </div>
//         <div>
//           <h2>Upload Dataset</h2>
//           <span>Upload a CSV or Excel file to get started</span>
//         </div>
//       </div>
//       <div className="card-content">
//         {!uploadedData ? (
//           <>
//             <div
//               className={`upload-zone ${isDragging ? 'dragging' : ''}`}
//               onDragOver={handleDragOver}
//               onDragLeave={handleDragLeave}
//               onDrop={handleDrop}
//               onClick={() => fileInputRef.current?.click()}
//             >
//               <FileSpreadsheet className="upload-icon" size={64} />
//               <h3>
//                 {isUploading ? 'Uploading...' : 'Drag & drop your file here'}
//               </h3>
//               <p>or click to browse (CSV, XLSX, XLS)</p>
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 accept=".csv,.xlsx,.xls"
//                 onChange={handleFileSelect}
//               />
//             </div>
//             {error && (
//               <div className="status-message error" style={{ marginTop: '16px' }}>
//                 <AlertCircle size={20} />
//                 {error}
//               </div>
//             )}
//           </>
//         ) : (
//           <>
//             <div className="status-message success">
//               <CheckCircle size={20} />
//               File uploaded successfully: {uploadedData.filename}
//             </div>

//             <div className="dataset-info">
//               <div className="info-card rows">
//                 <h4>Rows</h4>
//                 <p>{uploadedData.rows.toLocaleString()}</p>
//               </div>
//               <div className="info-card columns">
//                 <h4>Columns</h4>
//                 <p>{uploadedData.columns}</p>
//               </div>
//               <div className="info-card file">
//                 <h4>File</h4>
//                 <p style={{ fontSize: '0.9rem' }}>{uploadedData.filename.split('.').pop().toUpperCase()}</p>
//               </div>
//             </div>

//             <div className="tabs">
//               <button 
//                 className={`tab ${activeTab === 'info' ? 'active' : ''}`}
//                 onClick={() => setActiveTab('info')}
//               >
//                 Column Info
//               </button>
//               <button 
//                 className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
//                 onClick={() => setActiveTab('preview')}
//               >
//                 Data Preview
//               </button>
//             </div>

//             {activeTab === 'info' && (
//               <div className="data-preview">
//                 <table className="column-info-table">
//                   <thead>
//                     <tr>
//                       <th>Column Name</th>
//                       <th>Type</th>
//                       <th>Null Count</th>
//                       <th>Unique Values</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {uploadedData.columnInfo.map((col, idx) => (
//                       <tr key={idx}>
//                         <td><strong>{col.name}</strong></td>
//                         <td>{col.type}</td>
//                         <td>{col.nullCount}</td>
//                         <td>{col.uniqueCount}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}

//             {activeTab === 'preview' && (
//               <div className="data-preview">
//                 <table className="data-table">
//                   <thead>
//                     <tr>
//                       {Object.keys(uploadedData.sampleData[0] || {}).map((key) => (
//                         <th key={key}>{key}</th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {uploadedData.sampleData.map((row, idx) => (
//                       <tr key={idx}>
//                         {Object.values(row).map((val, i) => (
//                           <td key={i}>{val !== null ? String(val) : 'null'}</td>
//                         ))}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default FileUpload;


import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Database, Columns, Rows, PieChart } from 'lucide-react';
import axios from 'axios';

const FileUpload = ({ onUploadSuccess, uploadedData }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file) => {
    setError(null);
    setIsUploading(true);

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size too large. Maximum size is 50MB.');
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000 // 60 second timeout
      });

      if (response.data.success) {
        onUploadSuccess(response.data);
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Upload timed out. Please try a smaller file.');
      } else {
        setError(err.response?.data?.error || 'Failed to upload file. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'numeric':
      case 'numeric_string':
        return { bg: '#dbeafe', color: '#1d4ed8' };
      case 'categorical':
      case 'categorical_numeric':
        return { bg: '#fce7f3', color: '#be185d' };
      case 'text':
        return { bg: '#fef3c7', color: '#b45309' };
      case 'datetime':
        return { bg: '#d1fae5', color: '#047857' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  return (
    <div className="card animate-fade-in">
      <div className="card-header">
        <div className="card-header-icon upload">
          <Upload size={22} />
        </div>
        <div>
          <h2>Upload Dataset</h2>
          <span>Upload a CSV or Excel file to get started</span>
        </div>
      </div>
      <div className="card-content">
        {!uploadedData ? (
          <>
            <div
              className={`upload-zone ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <div style={{ textAlign: 'center' }}>
                  <div className="spinner" style={{ 
                    width: '48px', 
                    height: '48px', 
                    margin: '0 auto 16px',
                    borderWidth: '4px',
                    borderColor: 'rgba(102, 126, 234, 0.2)',
                    borderTopColor: '#667eea'
                  }}></div>
                  <h3>Uploading...</h3>
                  <p>Please wait while we process your file</p>
                </div>
              ) : (
                <>
                  <FileSpreadsheet className="upload-icon" size={64} />
                  <h3>Drag & drop your file here</h3>
                  <p>or click to browse</p>
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    justifyContent: 'center',
                    marginTop: '16px'
                  }}>
                    <span style={{
                      padding: '4px 12px',
                      background: '#e0e7ff',
                      color: '#3730a3',
                      borderRadius: '12px',
                      fontSize: '0.8rem'
                    }}>CSV</span>
                    <span style={{
                      padding: '4px 12px',
                      background: '#d1fae5',
                      color: '#065f46',
                      borderRadius: '12px',
                      fontSize: '0.8rem'
                    }}>XLSX</span>
                    <span style={{
                      padding: '4px 12px',
                      background: '#fef3c7',
                      color: '#92400e',
                      borderRadius: '12px',
                      fontSize: '0.8rem'
                    }}>XLS</span>
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </div>
            {error && (
              <div className="status-message error" style={{ marginTop: '16px' }}>
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="status-message success">
              <CheckCircle size={20} />
              <span>File uploaded successfully: <strong>{uploadedData.filename}</strong></span>
            </div>

            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              marginTop: '16px',
              marginBottom: '20px'
            }}>
              <div style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #dbeafe, #e0e7ff)',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <Rows size={24} style={{ color: '#3b82f6', marginBottom: '8px' }} />
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af', margin: 0 }}>
                  {uploadedData.rows.toLocaleString()}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Rows</p>
              </div>
              <div style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #fce7f3, #fae8ff)',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <Columns size={24} style={{ color: '#db2777', marginBottom: '8px' }} />
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#9d174d', margin: 0 }}>
                  {uploadedData.columns}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Columns</p>
              </div>
              <div style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <Database size={24} style={{ color: '#059669', marginBottom: '8px' }} />
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#047857', margin: 0 }}>
                  {uploadedData.dataQuality?.completeness || 0}%
                </p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Complete</p>
              </div>
              <div style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <PieChart size={24} style={{ color: '#d97706', marginBottom: '8px' }} />
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#b45309', margin: 0 }}>
                  {uploadedData.dataQuality?.usableColumns || 0}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Usable Cols</p>
              </div>
            </div>

            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                Column Info
              </button>
              <button 
                className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
                onClick={() => setActiveTab('preview')}
              >
                Data Preview
              </button>
            </div>

            {activeTab === 'info' && (
              <div className="data-preview" style={{ maxHeight: '350px' }}>
                <table className="column-info-table">
                  <thead>
                    <tr>
                      <th>Column Name</th>
                      <th>Type</th>
                      <th>Missing</th>
                      <th>Unique</th>
                      <th>Sample</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedData.columnInfo.map((col, idx) => {
                      const typeStyle = getTypeColor(col.type);
                      return (
                        <tr key={idx}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ 
                                width: '8px', 
                                height: '8px', 
                                borderRadius: '50%',
                                background: col.isUsable ? '#22c55e' : '#ef4444'
                              }}></span>
                              <strong>{col.name}</strong>
                            </div>
                          </td>
                          <td>
                            <span style={{
                              padding: '2px 8px',
                              background: typeStyle.bg,
                              color: typeStyle.color,
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}>
                              {col.type}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              color: col.nullCount > 0 ? '#dc2626' : '#16a34a',
                              fontWeight: col.nullCount > 0 ? '600' : 'normal'
                            }}>
                              {col.nullPercent}%
                            </span>
                          </td>
                          <td>{col.uniqueCount}</td>
                          <td style={{ 
                            maxWidth: '150px', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: '0.8rem',
                            color: '#6b7280'
                          }}>
                            {col.sampleValues?.slice(0, 2).join(', ')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="data-preview" style={{ maxHeight: '350px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      {Object.keys(uploadedData.sampleData[0] || {}).map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedData.sampleData.map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((val, i) => (
                          <td key={i} style={{
                            maxWidth: '150px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {val !== null && val !== undefined ? String(val) : 
                              <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>null</span>
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Legend */}
            <div style={{
              display: 'flex',
              gap: '16px',
              marginTop: '16px',
              flexWrap: 'wrap',
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></span>
                Usable for ML
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
                Not usable
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ padding: '1px 6px', background: '#dbeafe', borderRadius: '4px' }}>numeric</span>
                Number columns
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ padding: '1px 6px', background: '#fce7f3', borderRadius: '4px' }}>categorical</span>
                Category columns
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;