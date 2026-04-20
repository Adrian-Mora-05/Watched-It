import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet, AccessibilityInfo, findNodeHandle, ActivityIndicator, } from 'react-native';
import { File } from 'expo-file-system/next';
import * as ImageManipulator from 'expo-image-manipulator';
import { Entypo } from '@expo/vector-icons';

interface CameraModuleProps {
  onClose: () => void;
  onPhoto: (uri: string) => void;
}

export function CameraModule({ onClose, onPhoto }: CameraModuleProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [isTaking, setIsTaking] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const closeBtnRef = useRef<View>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (closeBtnRef.current) {
        const node = findNodeHandle(closeBtnRef.current);
        if (node) AccessibilityInfo.setAccessibilityFocus(node);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

    const takePhoto = async () => {
    if (!cameraRef.current || isTaking) return;
    setIsTaking(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: false,
        exif: false,
      });

      let uri = photo.uri;

      const file = new File(uri);
      const sizeKb = file.size / 1024;

      if (sizeKb > 150) {
        const ratio = Math.sqrt(150 / sizeKb);
        const result = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: Math.floor(photo.width * ratio) } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        uri = result.uri;
      }

      onPhoto(uri);
      onClose();
    } catch (e) {
      console.error('Failed to take photo', e);
    } finally {
      setIsTaking(false);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Se necesita acceso a la cámara
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Allow camera access"
        >
          <Text style={styles.permissionButtonText}>Permitir Cámara</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container} accessible={false}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        accessibilityElementsHidden={true}
        importantForAccessibility="no"
      />

      <View style={styles.overlay}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            ref={closeBtnRef as any}
            onPress={onClose}
            style={styles.iconButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Cerrar camara"
          >
            <Text style={styles.iconText} accessible={false}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom bar */}
        <View style={styles.bottomBar}>
          {/* Shutter — centered */}
          <TouchableOpacity
            onPress={takePhoto}
            disabled={isTaking}
            style={styles.shutter}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Tomar foto"
            accessibilityHint="Captura una foto con la cámara"
          >
            {isTaking
              ? <ActivityIndicator color="#000" />
              : <View style={styles.shutterInner} accessible={false} />
            }
          </TouchableOpacity>

          {/* Flip — bottom right corner */}
          <TouchableOpacity
            onPress={() => setFacing(f => f === 'front' ? 'back' : 'front')}
            style={[styles.iconButton, styles.flipButton]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${facing === 'front' ? 'back' : 'front'} camera`}
          >
            <Entypo name="cycle" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 40,
    paddingRight: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 80,
    position: 'relative',
  },
  iconButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  shutter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 6,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
  },
  flipButton: {
    position: 'absolute',
    right: 50,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#231709',
    gap: 16,
  },
  permissionText: {
    color: 'white',
    fontSize: 16,
  },
  permissionButton: {
    backgroundColor: '#9a3412',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});