'use client'

import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material';
import { firestore, auth } from './firebase';
import { collection, doc, query, getDocs, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function Home() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        updatePantry(user.uid);
      } else {
        setUser(null);
        setPantry([]);
      }
    });
  }, []);

  const updatePantry = async (userId) => {
    const snapshot = query(collection(firestore, 'users', userId, 'pantry'));
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach((doc) => {
      pantryList.push({ name: doc.id, ...doc.data() });
    });
    setPantry(pantryList);
  };

  const addItem = async (item, quantity) => {
    const userId = user.uid;
    const docRef = doc(collection(firestore, 'users', userId, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      await setDoc(docRef, { count: count + quantity });
    } else {
      await setDoc(docRef, { count: quantity });
    }
    await updatePantry(userId);
  };

  const removeItem = async (item) => {
    const userId = user.uid;
    const docRef = doc(collection(firestore, 'users', userId, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      if (count === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { count: count - 1 });
      }
    }
    await updatePantry(userId);
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Attempting to sign up...');
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('Sign up successful');
    } catch (error) {
      console.error('Error signing up:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Attempting to sign in...');
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful');
    } catch (error) {
      console.error('Error signing in:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Attempting to sign out...');
      await signOut(auth);
      console.log('Sign out successful');
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPantry = pantry.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection={'column'}
      gap={2}
    >
      {!user ? (
        <Box>
          <TextField
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
          />
          <Button variant="contained" onClick={handleSignUp} disabled={loading}>
            Sign Up
          </Button>
          <Button variant="contained" onClick={handleSignIn} disabled={loading}>
            Sign In
          </Button>
          {error && <Typography color="error">{error}</Typography>}
        </Box>
      ) : (
        <Box>
          <Button variant="contained" onClick={handleSignOut} disabled={loading}>
            Sign Out
          </Button>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Add Item
              </Typography>
              <Stack width="100%" direction={'row'} spacing={2}>
                <TextField
                  id="outlined-basic"
                  label="Item"
                  variant="outlined"
                  fullWidth
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
                <TextField
                  id="outlined-quantity"
                  label="Quantity"
                  variant="outlined"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                <Button
                  variant="outlined"
                  onClick={() => {
                    addItem(itemName, parseInt(quantity));
                    setItemName('');
                    setQuantity('');
                    handleClose();
                  }}
                >
                  ADD
                </Button>
              </Stack>
            </Box>
          </Modal>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Button variant="contained" onClick={handleOpen}>
              Add
            </Button>
            <TextField
              label="Search"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              margin="normal"
            />
          </Box>
          <Box border={'1px solid #333'}>
            <Box
              width="800px"
              height="100px"
              bgcolor="#ADD8E6"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
                Pantry Items
              </Typography>
            </Box>
            <Stack width="800px" height="500px" spacing={2} overflow={'auto'}>
              {filteredPantry.map(({ name, count }) => (
                <Stack
                  key={name}
                  direction="row"
                  spacing={2}
                  justifyContent={'center'}
                  alignContent={'space-between'}
                >
                  <Box
                    key={name}
                    width="100%"
                    minHeight="150px"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    bgcolor="#f0f0f0"
                    paddingX={5}
                  >
                    <Typography
                      variant={'h3'}
                      color={'#333'}
                      textAlign={'center'}
                    >
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                    <Typography
                      variant={'h3'}
                      color={'#333'}
                      textAlign={'center'}
                    >
                      Quantity: {count}
                    </Typography>
                    <Button variant="contained" onClick={() => removeItem(name)}>
                      Remove
                    </Button>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Box>
      )}
    </Box>
  );
}
