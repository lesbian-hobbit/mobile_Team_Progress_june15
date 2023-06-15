import React, { useState, useEffect } from "react";
import { View, 
         Text, 
         StyleSheet, 
         TouchableOpacity, 
         TextInput,
         ImageBackground } from "react-native";
import {
  collection,
  query,
  where,
  onSnapshot,
  writeBatch,
  runTransaction ,
  doc,
  getDoc
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const Dashboard = ({ route, navigation }) => {
  const [balance, setBalance] = useState(5000); // Initial balance
  const [email, setEmail] = useState();
  //const [fullname, setFullname] = useState();
  const [uids, setUid] = useState();
  const [userInfo, setUserInfo] = useState([]);

  const [uid2, setUid2] = useState();
  const [amount, setAmount] = useState();
  // Get a new write batch
  
  const transferFunds = async () => {
    const sfDocRef = doc(db, "users", uid2);
    try {
      await runTransaction(db, async (transaction) => {
        const sfDoc = await transaction.get(sfDocRef);
        if (!sfDoc.exists()) {
          throw "Document does not exist!";
        }
        const newWallet = sfDoc.data().wallet + Number(amount);
        transaction.update(sfDocRef, { wallet: newWallet });
      });
      alert('Transaction Successfully Sent!')
    } catch (e) {
      console.log("Transaction failed: ", e);
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        setUid(uid);
        setEmail(user.email);

        const getWallet = async() => {
          const docRef = doc(db, "users", uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
            const data = docSnap.data();
            setUserInfo(data);
          } else {
            // docSnap.data() will be undefined in this case
            console.log("No such document!");
          }
        }
        getWallet();
      } else {
        navigation.navigate("Login");
      }
    });
  }, []);
  const handleTransferFunds = () => {
    // Implement your logic for transferring funds here
    // This is just a placeholder example
    setBalance(balance - 100);
  };

  const handleSignOut = () =>{
    signOut(auth).then(() => {
      navigation.navigate('Login');
    }).catch((error) => {
      // An error happened.
    });
  }
  return (
    <View  style={{flex: 1,
      justifyContent: "center",
      }}>
      <ImageBackground source={require('../assets/background.jpg')} resizeMode="cover" style={styles.image}>
      <View style={styles.welcome}>
      <Text style={styles.welcomeText}>Welcome, {email}</Text>
      <Text style={styles.balanceText}>Current Balance</Text>
      <Text style={styles.amountText}>$ {userInfo.wallet}</Text>
      </View>
      
      <View style={styles.balanceContainer}>
       
        
      </View>
      <TextInput
        style={styles.input}
        placeholder="uid"
        value={uid2}
        onChangeText={setUid2}
      />
      <TextInput
        style={styles.input}
        placeholder="amount"
        value={amount}
        onChangeText={setAmount}
      />
      
      <TouchableOpacity
        style={styles.transferButton}
        onPress={transferFunds}
      >
        <Text style={styles.transferButtonText}>Send Funds</Text>
      </TouchableOpacity>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  welcome:{
    justifyContent: 'center',
    alignItems:'center',
    flexDirection: 'column'
    
  },
  balanceContainer: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "black",
    borderWidth: 2,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 15,
    margin: 10,
    fontFamily: 'Arial',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  balanceText: {
    margin:10,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  image:{
    flex: 1,
    justifyContent: 'center'
  },
  amountText: {
    fontSize: 18,
  },
  transferButton: {
    marginHorizontal: 80,
    backgroundColor: "black",
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  transferButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default Dashboard;
