import "./App.css";
import React, { useState } from "react";

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCmNpZGY573f24h2QLvVzuazhCzAFTxTmA",
  authDomain: "lachleitung.firebaseapp.com",
  projectId: "lachleitung",
  storageBucket: "lachleitung.appspot.com",
  messagingSenderId: "131959763768",
  appId: "1:131959763768:web:babcdff3665073e26047cd",
  measurementId: "G-Y83KGGRM2Q",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore = firebase.firestore();

function caesarCipher(text, shift) {
  return text
    .split("")
    .map((char) => {
      if (char.match(/[a-zA-Z]/)) {
        const code = char.charCodeAt(0);
        const isUpperCase = char === char.toUpperCase();
        const offset = isUpperCase ? 65 : 97;
        const encryptedCode = ((code - offset + shift) % 26) + offset;
        return String.fromCharCode(encryptedCode);
      } else {
        return char;
      }
    })
    .join("");
}

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Lachleitung</h1>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Mit Google anmelden
      </button>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Abmelden
      </button>
    )
  );
}

function ChatRoom() {
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;
    const encryptedText = caesarCipher(formValue, 3); // Beispielverschiebung um 3

    await messagesRef.add({
      text: encryptedText,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <form onSubmit={sendMessage}>
          <input
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            placeholder="Deine Nachricht..."
          />

          <button type="submit" disabled={!formValue}>
            Senden
          </button>
        </form>
      </main>
    </>
  );
}

function ChatMessage({ message }) {
  const { text, uid, photoURL } = message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <div className={`message ${messageClass}`}>
      <img
        src={photoURL || "https://via.placeholder.com/150"}
        alt="Profilbild"
      />
      <p>{caesarCipher(text, -3)}</p>
    </div>
  );
}

export default App;
