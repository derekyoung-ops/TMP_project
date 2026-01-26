import { useRef, useState } from 'react';
import { Avatar, Grid, Stack, IconButton } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const AvatarPicker = ({ value, onChange }) => {
  const [preview, setPreview] = useState(
    value ? URL.createObjectURL(value) : null
  );

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Avatar click → file picker
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  // File selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    onChange(file);
  };

  // Camera icon → webcam
  const handleCameraClick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    streamRef.current = stream;
    videoRef.current.srcObject = stream;
    videoRef.current.play();
  };

  // Capture webcam photo
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], 'avatar.png', { type: 'image/png' });
      setPreview(URL.createObjectURL(file));
      onChange(file);
    });

    streamRef.current.getTracks().forEach(t => t.stop());
  };

  return (
    <>
      <Grid sx={{ display: 'flex', justifyContent: 'center' }}>
        <Stack alignItems="center" spacing={1}>
          <Avatar
            src={preview}
            onClick={handleAvatarClick}
            sx={{ width: 140, height: 140, cursor: 'pointer' }}
          />

          <input
            ref={fileInputRef}
            hidden
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />

          <IconButton onClick={handleCameraClick}>
            <PhotoCameraIcon />
          </IconButton>
        </Stack>
      </Grid>

      <video
        ref={videoRef}
        onClick={capturePhoto}
        style={{
          display: streamRef.current ? 'block' : 'none',
          width: 300,
          margin: '16px auto',
          cursor: 'pointer',
        }}
      />
    </>
  );
};

export default AvatarPicker;