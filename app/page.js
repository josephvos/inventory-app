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
  sx={{ 
    background: 'linear-gradient(135deg, #8c857b 10%, #92836b 100%), radial-gradient(circle at 20% 20%, #ffffff30, transparent), radial-gradient(circle at 80% 80%, #ffffff30, transparent)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    p: 2
  }}
>


  
  

      {!user ? (
        <Box width="100%" maxWidth={isMobile ? '90%' : '600px'}
        sx={{
          border: '2px solid #000000', // Adjust the thickness and color of the border
          borderRadius: '8px', // Optional: add rounded corners to the border
          padding: 2, // Optional: add some padding inside the box
          backgroundColor: '#816e4d'
        }}>
        
         
         <Typography
  variant={isMobile ? 'h4' : 'h2'}
  color={'#ffffff'}
  textAlign={'center'}
  sx={{ 
    background: '#197b19',

    padding: '20px 30px', // Increased padding for better visibility
    borderRadius: '12px', // More rounded corners
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)', // Larger shadow for more depth
    fontWeight: 'bold',
    marginBottom: '24px', // More space below the component
    fontFamily: 'Comic Sans MS, sans-serif',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)', // Subtle text shadow
   
  }}
>
  The Vos Inventory Manager
</Typography>

         
<TextField
  label="Email"
  variant="outlined"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  margin="normal"
  fullWidth
  sx={{
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#ffffff', // Background color for the input field
      '&:hover fieldset': {
        borderColor: '#107f33', // Border color on hover
      },
      '&.Mui-focused fieldset': {
        borderColor: '#42b883', // Border color when focused
      },
    },
    '& .MuiInputLabel-root': {
      backgroundColor: 'transparent', // Ensure the label's background is transparent
    },
  }}
/>
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#ffffff', // Background color for the input field
                '&:hover fieldset': {
                  borderColor: '#107f33', // Border color on hover
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#42b883', // Border color when focused
                },
              },
              '& .MuiInputLabel-root': {
                backgroundColor: 'transparent', // Ensure the label's background is transparent
              },
            }}
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
        <Box width="100%" maxWidth={isMobile ? '90%' : '800px'}
        sx={{
          border: '2px solid #000000', // Adjust the thickness and color of the border
          borderRadius: '8px', // Optional: add rounded corners to the border
          padding: 2, // Optional: add some padding inside the box
          backgroundColor: '#816e4d'
        }}>
          <Box display="flex" justifyContent="flex-end" mb={2}
          sx={{ 
      fontFamily: 'Comic Sans MS, cursive, sans-serif' // Apply Comic Sans font
    }}
    >
           
           <Typography
  variant={isMobile ? 'h4' : 'h2'}
  color={'#ffffff'}
  textAlign={'center'}
  sx={{ 
    background: '#197b19',

    padding: '20px 30px', // Increased padding for better visibility
    borderRadius: '12px', // More rounded corners
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)', // Larger shadow for more depth
    fontWeight: 'bold',
    marginBottom: '24px', // More space below the component
    fontFamily: 'Comic Sans MS, sans-serif',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)', // Subtle text shadow
   
  }}
>
  The Vos Inventory Manager
</Typography>
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
                  Add
                  
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
          <Button variant="contained" color="success" onClick={handleSignOut} disabled={loading} sx={{ 
   
  }}>
              Sign Out
            </Button>
         
           
            <TextField
  label="Search"
  variant="outlined"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  margin="normal"
  fullWidth={isMobile}
  sx={{
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#ffffff', // White background for the input
      '& fieldset': {
        borderColor: '#ccc' // Optional: lighter border color for the input
      }
    },
    width: isMobile ? '100%' : '80%', // Adjust the width as needed
    maxWidth: '500px', // Set a max-width for larger screens if necessary
  }}
/>

<Button variant="contained" color="success" onClick={handleOpen}>
              ADD ITEM
            </Button>
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
                      Remove item
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