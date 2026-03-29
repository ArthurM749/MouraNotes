import { useState } from 'react';
import { supabase } from '../supabase';
import './ImageUploader.css';

export default function ImageUploader({ onImageUploaded, currentImage }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview]     = useState(currentImage || '');
  const [error, setError]         = useState('');

  async function uploadImage(file) {
    try {
      setUploading(true);
      setError('');

      if (!file.type.startsWith('image/')) {
        throw new Error('Por favor, selecione uma imagem');
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('Imagem muito grande. Máximo 5MB');
      }

      const fileExt  = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      setPreview(urlData.publicUrl);
      onImageUploaded(urlData.publicUrl);

    } catch (err) {
      console.error('Erro no upload:', err);
      setError(err.message || 'Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    uploadImage(file);
  }

  function handleRemove() {
    setPreview('');
    onImageUploaded('');
    setError('');
  }

  return (
    <div className="image-uploader">

      {!preview ? (
        <div className="upload-area">
          {/*
            style={{ display: 'none' }} garante que o input nativo nunca
            apareça, independentemente de qualquer CSS global que conflite.
          */}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            id="image-upload"
            style={{ display: 'none' }}
          />
          <label htmlFor="image-upload" className="upload-button">
            {uploading ? (
              <>
                <span className="loading-spinner" />
                Fazendo upload...
              </>
            ) : (
              <>📷 Escolher Imagem</>
            )}
          </label>
          <p className="upload-hint">PNG, JPG ou WebP • Máximo 5MB</p>
        </div>
      ) : (
        <div className="image-preview-container">
          <img src={preview} alt="Preview" className="image-preview" />
          <div className="image-actions">
            <label htmlFor="image-change" className="change-btn">
              🔄 Trocar
            </label>
            {/* Mesmo fix aqui — input do "Trocar" também deve ficar oculto */}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              id="image-change"
              style={{ display: 'none' }}
            />
            <button onClick={handleRemove} className="remove-btn" type="button">
              🗑️ Remover
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="upload-error">⚠️ {error}</div>
      )}
    </div>
  );
}