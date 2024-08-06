import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {getDatabase, ref, push, onValue} from 'firebase/database';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import {getAuth} from 'firebase/auth';

const ChatScreen = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [imageUri, setImageUri] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;
  const database = getDatabase();
  const storage = getStorage();

  useEffect(() => {
    const messagesRef = ref(database, '/messages');
    const unsubscribe = onValue(messagesRef, snapshot => {
      const messagesData = [];
      snapshot.forEach(childSnapshot => {
        messagesData.push({key: childSnapshot.key, ...childSnapshot.val()});
      });
      setMessages(messagesData);
    });

    return () => unsubscribe(); // Unsubscribe on unmount
  }, [database]);

  const handleSend = async () => {
    if (message.length > 0) {
      try {
        await push(ref(database, '/messages'), {
          text: message,
          createdAt: new Date().toISOString(),
          user: {
            id: user.uid,
            email: user.email,
          },
        });
        setMessage('');
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    }
  };

  const handleSelectImage = () => {
    launchImageLibrary({mediaType: 'photo'}, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('Image Picker Error', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        try {
          const source = response.assets[0];
          setImageUri(source.uri);

          // Upload image to Firebase Storage
          const imageRef = storageRef(
            storage,
            `images/${Date.now()}_${source.fileName}`,
          );
          const responseBlob = await fetch(source.uri);
          const blob = await responseBlob.blob();
          await uploadBytes(imageRef, blob);

          const imageUrl = await getDownloadURL(imageRef);

          // Save image URL to Firebase Database
          await push(ref(database, '/messages'), {
            imageUrl,
            createdAt: new Date().toISOString(),
            user: {
              id: user.uid,
              email: user.email,
            },
          });
          setImageUri(null);
        } catch (error) {
          Alert.alert('Upload Error', error.message);
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({item}) => (
          <View style={styles.messageContainer}>
            {item.imageUrl && (
              <Image source={{uri: item.imageUrl}} style={styles.image} />
            )}
            <Text style={styles.userEmail}>{item.user.email}</Text>
            <Text>{item.text}</Text>
          </View>
        )}
        keyExtractor={item => item.key} // Ensure unique key for each item
      />
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Type a message"
        style={styles.input}
      />
      <TouchableOpacity onPress={handleSelectImage} style={styles.button}>
        <Text style={styles.buttonText}>Select Image</Text>
      </TouchableOpacity>
      <Button title="Send" onPress={handleSend} />
      {imageUri && (
        <Image source={{uri: imageUri}} style={styles.previewImage} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  messageContainer: {
    marginBottom: 10,
  },
  userEmail: {
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    marginBottom: 5,
  },
  previewImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    marginVertical: 10,
  },
});

export default ChatScreen;
