'use client'

import { Box, Stack, Typography, Button, Modal, TextField, useMediaQuery, useTheme } from '@mui/material';
import { firestore, auth } from './firebase';
import { collection, doc, query, getDocs, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%', // Responsive width
  maxWidth: 500, // Maximum width for larger screens
  bgcolor: '#f5f5f5',
  border: '2px solid #8B4513', // Brown border
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

const listContainerStyle = {
  maxHeight: '400px', // Adjusted for responsiveness
  overflowY: 'auto',
};

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

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
  const [removeOpen, setRemoveOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');
  const [removeQuantity, setRemoveQuantity] = useState('');

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
    const itemQuantity = quantity || 1; // Default to 1 if quantity is not provided
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      await setDoc(docRef, { count: count + itemQuantity });
    } else {
      await setDoc(docRef, { count: itemQuantity });
    }
    await updatePantry(userId);
  };

  const removeItem = async (item, quantity) => {
    const userId = user.uid;
    const docRef = doc(collection(firestore, 'users', userId, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    const itemQuantity = quantity || 1; // Default to 1 if quantity is not provided
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      if (count <= itemQuantity) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { count: count - itemQuantity });
      }
    }
    await updatePantry(userId);
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
    } catch (error) {
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
      bgcolor="#e0f2f1" // Light green background
      p={2}
    >
      {!user ? (
        <Box width="100%" maxWidth={isMobile ? '90%' : '600px'}>
         
          <Typography
  variant={isMobile ? 'h4' : 'h2'}
  color={'#fff'}
  textAlign={'center'}
  sx={{ 
    backgroundColor: '#8B4513', // Brown background
    padding: 2, // Add some padding for better visibility
    borderRadius: 1 // Optional: add rounded corners
  }}
>
  Inventory App
</Typography>
         
          <TextField
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            fullWidth
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            fullWidth
          />
         <Box mt={2} display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2} width="100%">
  <Button
    variant="contained"
    color="success"
    onClick={handleSignUp}
    disabled={loading}
    sx={{ flex: 1 }} // Stretch to fill the available space
  >
    Sign Up
  </Button>
  <Button
    variant="contained"
    color="success"
    onClick={handleSignIn}
    disabled={loading}
    sx={{ flex: 1 }} // Stretch to fill the available space
  >
    Sign In
  </Button>
</Box>
{error && <Typography color="error" align="center" mt={2}>{error}</Typography>}

        </Box>
      ) : (
        <Box width="100%" maxWidth={isMobile ? '90%' : '800px'}>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button variant="contained" color="success" onClick={handleSignOut} disabled={loading}>
              Sign Out
            </Button>
          </Box>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={modalStyle}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Add Item
              </Typography>
              <Stack width="100%" direction={isMobile ? 'column' : 'row'} spacing={2}>
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
                  placeholder="1" // Show default value in placeholder
                />
                <Button
                  variant="contained"
                  color="success"
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
          <Modal
            open={removeOpen}
            onClose={() => setRemoveOpen(false)}
            aria-labelledby="modal-remove-title"
            aria-describedby="modal-remove-description"
          >
            <Box sx={modalStyle}>
              <Typography id="modal-remove-title" variant="h6" component="h2">
                Remove Quantity
              </Typography>
              <Stack width="100%" direction={isMobile ? 'column' : 'row'} spacing={2}>
                <TextField
                  id="outlined-remove-quantity"
                  label="Quantity"
                  variant="outlined"
                  type="number"
                  value={removeQuantity}
                  onChange={(e) => setRemoveQuantity(e.target.value)}
                  placeholder="1" // Show default value in placeholder
                />
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    removeItem(selectedItem, parseInt(removeQuantity));
                    setRemoveQuantity('');
                    setRemoveOpen(false);
                  }}
                >
                  Remove
                </Button>
              </Stack>
            </Box>
          </Modal>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography
  variant={isMobile ? 'h4' : 'h2'}
  color={'#fff'}
  textAlign={'center'}
  sx={{ 
    backgroundColor: '#8B4513', // Brown background
    padding: 2, // Add some padding for better visibility
    borderRadius: 1 // Optional: add rounded corners
  }}
>
  Inventory App
</Typography>
            <Button variant="contained" color="success" onClick={handleOpen}>
              Add
            </Button>
            <TextField
              label="Search"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              margin="normal"
              fullWidth={isMobile}
            />
           
          </Box>

          <Box
            border={'1px solid #8B4513'} // Brown border
            bgcolor="#f5f5f5" // Light grey background
            borderRadius={2}
            p={2}
          >
            <Stack
              width="100%"
              spacing={2}
              style={listContainerStyle}
            >
              {filteredPantry.map(({ name, count }) => (
                <Stack
                  key={name}
                  direction={isMobile ? 'column' : 'row'}
                  spacing={2}
                  justifyContent={'center'}
                  alignItems={'center'}
                >
                  <Box
                    width="100%"
                    minHeight={isMobile ? '120px' : '150px'} // Adjust height for mobile
                    display="flex"
                    flexDirection={isMobile ? 'column' : 'row'}
                    justifyContent="space-between"
                    alignItems="center"
                    bgcolor="#f5f5f5" // Light grey background
                    paddingX={2}
                    border={'1px solid #8B4513'} // Brown border
                  >
                    <Typography
                      variant={isMobile ? 'h6' : 'h4'}
                      color={'#333'}
                      textAlign={'center'}
                      sx={{ mb: 1 }}
                    >
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                    <Typography
                      variant={isMobile ? 'body2' : 'h6'}
                      color={'#333'}
                      textAlign={'center'}
                      sx={{ mb: 1 }}
                    >
                      Quantity: {count}
                    </Typography>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => {
                        setSelectedItem(name);
                        setRemoveOpen(true);
                      }}
                    >
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