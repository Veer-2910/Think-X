import { useState } from 'react';
import { Upload, Download, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import Card from './Card';
import Button from './Button';

const CSVUploadCard = ({ 
  title, 
  description, 
  uploadEndpoint, 
  templateUrl,
  onUploadSuccess,
  icon: Icon = FileText 
}) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setError(null);
        setResult(null);
      } else {
        setError('Please upload a CSV file');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError(null);
        setResult(null);
      } else {
        setError('Please upload a CSV file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadEndpoint(formData);

      setResult(response.data);
      setFile(null);
      
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    if (templateUrl) {
      const link = document.createElement('a');
      link.href = templateUrl;
      link.download = templateUrl.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary-100 rounded-lg">
          <Icon className="text-primary" size={24} />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
          <p className="text-sm text-secondary-600 mb-4">{description}</p>

          {/* Drag & Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary-50'
                : 'border-secondary-300 hover:border-primary-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto mb-3 text-secondary-400" size={32} />
            
            {file ? (
              <div className="flex items-center justify-center gap-2 text-sm">
                <FileText size={16} className="text-primary" />
                <span className="font-medium text-slate-900">{file.name}</span>
                <button
                  onClick={() => setFile(null)}
                  className="text-red-600 hover:text-red-700 ml-2"
                >
                  <XCircle size={16} />
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-secondary-600 mb-2">
                  Drag & drop your CSV file here, or
                </p>
                <label className="inline-block">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <span className="text-primary hover:text-primary-600 font-medium cursor-pointer">
                    browse files
                  </span>
                </label>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-2" />
                  Upload CSV
                </>
              )}
            </Button>

            {templateUrl && (
              <Button
                variant="outline"
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Template
              </Button>
            )}
          </div>

          {/* Success Result */}
          {result && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">Upload Successful!</p>
                  <div className="mt-2 text-sm text-green-700 space-y-1">
                    <p>✓ Imported: <strong>{result.imported}</strong> records</p>
                    <p>✓ Total: {result.total} records</p>
                    {result.errors > 0 && (
                      <p className="text-amber-700">⚠ Errors: {result.errors} records</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Upload Failed</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CSVUploadCard;
