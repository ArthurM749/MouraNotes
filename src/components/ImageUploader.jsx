import { useState } from 'react';
import { supabase } from '../supabase';
import './ImageUploader.css';

export default function ImageUploader({ onImageUploaded, currentImage }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || '');
  const [error, setError] = useState('');

  async function uploadImage(file) {
    try {
      setUploading(true);
      setError('');

      // Validar arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Por favor, selecione uma imagem');
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('Imagem muito grande. Máximo 5MB');
      }

      // Gerar nome único
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      // Upload para Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      
      setPreview(publicUrl);
      onImageUploaded(publicUrl);

    } catch (error) {
      console.error('Erro no upload:', error);
      setError(error.message || 'Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Mostrar preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Fazer upload
    uploadImage(file);
  }

  function handleRemove() {
    setPreview('');
    onImageUploaded('');
    setError('');
  }

  return (
    <div className="image-uploader">
      <label className="upload-label">
        Imagem de Capa
      </label>

      {!preview ? (
        <div className="upload-area">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="file-input"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="upload-button">
            {uploading ? (
              <>
                <span className="loading-spinner"></span>
                Fazendo upload...
              </>
            ) : (
              <>
                📷 Escolher Imagem
              </>
            )}
          </label>
          <p className="upload-hint">
            PNG, JPG ou WebP • Máximo 5MB
          </p>
        </div>
      ) : (
        <div className="image-preview-container">
          <img 
            src={preview} 
            alt="Preview" 
            className="image-preview"
          />
          <div className="image-actions">
            <label htmlFor="image-change" className="change-btn">
              🔄 Trocar
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="file-input"
              id="image-change"
            />
            <button 
              onClick={handleRemove}
              className="remove-btn"
              type="button"
            >
              🗑️ Remover
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="upload-error">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}