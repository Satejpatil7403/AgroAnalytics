import { useState } from 'react';
import api from '../utils/api';
import './CSVUpload.css';

const CSVUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (selectedFile) => {
        setError('');
        setSuccess('');

        if (!selectedFile.name.endsWith('.csv')) {
            setError('Please select a CSV file');
            return;
        }

        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        setUploading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/api/farmers/upload-csv', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setSuccess(`Successfully uploaded ${response.data.records_created} farmer records!`);
            setFile(null);

            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (err) {
            console.error('CSV Upload Error:', err);
            console.error('Error Response:', err.response);

            let errorMsg = 'Upload failed';

            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                if (typeof detail === 'string') {
                    errorMsg = detail;
                } else if (detail.message) {
                    errorMsg = detail.message;
                    if (detail.errors && detail.errors.length > 0) {
                        errorMsg += '\n\nValidation Errors:\n' + detail.errors.join('\n');
                    }
                }
            } else if (err.message) {
                errorMsg = err.message;
            }

            setError(errorMsg);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm('Are you sure you want to delete ALL CSV data you uploaded? This action cannot be undone.')) {
            return;
        }

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            console.log('Deleting all CSV data...');
            const response = await api.delete('/api/farmers/delete-all-csv');
            console.log('Delete response:', response.data);

            const deletedCount = response.data.records_deleted || 0;
            setSuccess(`Successfully deleted ${deletedCount} record${deletedCount !== 1 ? 's' : ''}!`);

            // Refresh the data list immediately and force reload
            if (onUploadSuccess) {
                console.log('Calling onUploadSuccess to refresh data...');
                onUploadSuccess();

                // Force a complete page reload after a short delay to ensure clean state
                setTimeout(() => {
                    console.log('Forcing page reload to ensure clean state...');
                    window.location.reload();
                }, 1000);
            }
        } catch (err) {
            console.error('Delete All Error:', err);
            console.error('Error Response:', err.response);
            console.error('Error Response Data:', err.response?.data);
            console.error('Error Status:', err.response?.status);

            let errorMsg = 'Failed to delete CSV data';

            // Check for specific error types
            if (err.response?.status === 403) {
                errorMsg = 'Permission denied: Only officers can delete CSV data';
            } else if (err.response?.status === 401) {
                errorMsg = 'Authentication required: Please log in again';
            } else if (err.response?.data?.detail) {
                errorMsg = typeof err.response.data.detail === 'string'
                    ? err.response.data.detail
                    : JSON.stringify(err.response.data.detail);
            } else if (err.message) {
                errorMsg = `Error: ${err.message}`;
            }

            setError(errorMsg);
            alert(`Delete failed: ${errorMsg}\n\nPlease check the browser console (F12) for more details.`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="csv-upload-container glass-card">
            <h3>📁 Upload CSV File</h3>
            <p className="upload-description">
                Upload a CSV file with farmer data. Required columns: farmer_name, village_name, crop_type, area_acres, yield_kg, latitude, longitude
            </p>

            <div
                className={`upload-dropzone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="csv-file"
                    accept=".csv"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                    style={{ display: 'none' }}
                />

                <label htmlFor="csv-file" className="upload-label">
                    {file ? (
                        <>
                            <span className="file-icon">📄</span>
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">({(file.size / 1024).toFixed(2)} KB)</span>
                        </>
                    ) : (
                        <>
                            <span className="upload-icon">☁️</span>
                            <span className="upload-text">
                                Drag & drop your CSV file here or <strong>click to browse</strong>
                            </span>
                        </>
                    )}
                </label>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    {success}
                </div>
            )}

            <div className="upload-actions">
                {file && (
                    <button
                        onClick={() => setFile(null)}
                        className="btn btn-secondary"
                        disabled={uploading}
                    >
                        Clear
                    </button>
                )}
                <button
                    onClick={handleUpload}
                    className="btn btn-primary"
                    disabled={!file || uploading}
                >
                    {uploading ? 'Uploading...' : 'Upload CSV'}
                </button>
            </div>

            <div className="upload-actions" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                <button
                    onClick={handleDeleteAll}
                    className="btn btn-danger"
                    disabled={uploading}
                    style={{ width: '100%' }}
                >
                    🗑️ Delete All CSV Data
                </button>
            </div>
        </div>
    );
};

export default CSVUpload;
