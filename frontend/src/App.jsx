import { useEffect, useState } from "react";

function App() {
  const [socket, setSocket] = useState(null);

  const [peerId, setPeerId] = useState(
    localStorage.getItem("peerId") || ""
  );

  const [registered, setRegistered] = useState(false);

  const [targetPeer, setTargetPeer] = useState("");

  const [message, setMessage] = useState("");

  const [received, setReceived] = useState([]);

  useEffect(() => {
    const ws = new WebSocket(
      "wss://YOUR-BACKEND-URL.onrender.com"
    );

    ws.onopen = () => {
      console.log("Connected to server");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.error) {
        alert(data.error);
        return;
      }

      if (data.payload) {
        setReceived((prev) => [
          ...prev,
          `${data.from}: ${data.payload}`,
        ]);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected");
    };

    setSocket(ws);

    return () => ws.close();
  }, []);

  const registerPeer = () => {
    if (!socket) {
      alert("Socket not connected");
      return;
    }

    if (!peerId.trim()) {
      alert("Enter Peer ID");
      return;
    }

    socket.send(
      JSON.stringify({
        type: "register",
        peerId,
      })
    );

    localStorage.setItem("peerId", peerId);

    setRegistered(true);
  };

  const sendMessage = () => {
    if (!registered) {
      alert("Register first");
      return;
    }

    if (!targetPeer.trim()) {
      alert("Enter target peer");
      return;
    }

    if (!message.trim()) {
      alert("Enter message");
      return;
    }

    socket.send(
      JSON.stringify({
        type: "relay",
        from: peerId,
        to: targetPeer,
        payload: message,
      })
    );

    setMessage("");
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "600px",
        margin: "auto",
      }}
    >
      <h1>Distributed Routing Server</h1>

      <hr />

      <h3>Choose Your Peer ID</h3>

      <input
        type="text"
        placeholder="Enter Peer ID"
        value={peerId}
        onChange={(e) => setPeerId(e.target.value)}
      />

      <button
        onClick={registerPeer}
        style={{ marginLeft: "10px" }}
      >
        Register
      </button>

      <p>
        Status:
        {registered
          ? " ✅ Registered"
          : " ❌ Not Registered"}
      </p>

      <hr />

      <h3>Send Message</h3>

      <input
        type="text"
        placeholder="Target Peer ID"
        value={targetPeer}
        onChange={(e) =>
          setTargetPeer(e.target.value)
        }
      />

      <br />
      <br />

      <input
        type="text"
        placeholder="Enter Message"
        value={message}
        onChange={(e) =>
          setMessage(e.target.value)
        }
      />

      <button
        onClick={sendMessage}
        style={{ marginLeft: "10px" }}
      >
        Send
      </button>

      <hr />

      <h3>Received Messages</h3>

      {received.length === 0 ? (
        <p>No messages yet</p>
      ) : (
        received.map((msg, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              padding: "8px",
              marginBottom: "5px",
            }}
          >
            {msg}
          </div>
        ))
      )}
    </div>
  );
}

export default App;