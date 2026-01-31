import { useState } from 'react';
import Head from 'next/head';
import Header from '@components/Header';
import Footer from '@components/Footer';
import styles from '../styles/SmartShare.module.css';

export default function SmartShare() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [publishSuccess, setPublishSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hashtags: ''
  });

  const [platforms, setPlatforms] = useState({
    facebook: true,
    instagram: true
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
      setAnalysisResult(null);
      setPublishSuccess(false);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    try {
      // Convert file to base64 strip logic is handled by readAsDataURL but we might need just the base64 part
      const base64Data = preview.split(',')[1];
      const mimeType = file.type;

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Data,
          mimeType: mimeType
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        alert('Error analyzing image: ' + data.error);
        return;
      }

      setAnalysisResult(data);
      setFormData({
        title: data.title || '',
        description: data.description || '',
        hashtags: data.hashtags || ''
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          platforms,
          // In a real app, we would upload the file to a storage bucket and send the URL
          // For this prototype, we'll simulate it or send base64 if small enough
          image: preview.split(',')[1] 
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPublishSuccess(true);
      } else {
        alert('Publishing failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Publishing failed:', error);
      alert('Failed to publish.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Smart AI Social Share</title>
      </Head>

      <Header title="Smart AI Social Share" />

      <main>
        <div className={styles.uploadSection}>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            id="fileInput"
            style={{ display: 'none' }}
          />
          <label htmlFor="fileInput" style={{ cursor: 'pointer', width: '100%', display: 'block' }}>
            {preview ? (
              file.type.startsWith('video') ? (
                <video src={preview} controls className={styles.previewImage} />
              ) : (
                <img src={preview} alt="Preview" className={styles.previewImage} />
              )
            ) : (
              <div>
                <p>Click to upload a photo or video</p>
                <p style={{ fontSize: '0.8rem', color: '#718096' }}>JPG, PNG, MP4</p>
              </div>
            )}
          </label>
        </div>

        {preview && !analysisResult && (
          <button 
            className={styles.analyzeBtn} 
            onClick={handleAnalyze} 
            disabled={isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing with AI...' : 'Analyze & Generate Captions'}
          </button>
        )}

        {analysisResult && (
          <div className={styles.resultSection}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Generated Title</label>
              <input
                className={styles.input}
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Optimized Description</label>
              <textarea
                className={styles.textarea}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Hashtags</label>
              <input
                className={styles.input}
                value={formData.hashtags}
                onChange={(e) => setFormData({...formData, hashtags: e.target.value})}
              />
            </div>

            <div className={styles.platforms}>
              <label className={styles.platformCheckbox}>
                <input
                  type="checkbox"
                  checked={platforms.facebook}
                  onChange={(e) => setPlatforms({...platforms, facebook: e.target.checked})}
                />
                Facebook
              </label>
              <label className={styles.platformCheckbox}>
                <input
                  type="checkbox"
                  checked={platforms.instagram}
                  onChange={(e) => setPlatforms({...platforms, instagram: e.target.checked})}
                />
                Instagram
              </label>
            </div>

            <button 
              className={styles.publishBtn} 
              onClick={handlePublish} 
              disabled={isPublishing || publishSuccess}
            >
              {isPublishing ? 'Publishing...' : (publishSuccess ? 'Published Successfully!' : 'Post to Social Media')}
            </button>
            
            {publishSuccess && (
               <div className={styles.successMessage}>
                 Your content has been successfully scheduled/published to the selected platforms!
               </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
